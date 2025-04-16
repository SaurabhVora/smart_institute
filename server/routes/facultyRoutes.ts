import { Router } from "express";
import { storage } from "../storage";
import { handleMulterErrors, upload } from "./middleware";
import { z } from "zod";
import { saveFacultyDocumentFile, getDocumentFileUrl, deleteDocumentFile } from "../services/document-storage";
import fs from "fs";
import path from "path";

const router = Router();

// Upload faculty document
router.post("/documents", handleMulterErrors(upload.single("file")), async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty") return res.sendStatus(403);
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Save the file to storage (local or S3)
    const fileKey = await saveFacultyDocumentFile(
      req.file.path,
      req.file.originalname
    );

    // Create the faculty document
    const document = await storage.createFacultyDocument({
      facultyId: req.user.id,
      title,
      description,
      filePath: fileKey, // Store the file key instead of the local path
    });

    res.json(document);
  } catch (error) {
    // Clean up the temporary file if there's an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Faculty document creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get faculty documents
router.get("/documents", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    // Get all faculty documents - in a real app, you'd want to filter by faculty ID
    const documents = await storage.getFacultyDocuments();
    
    // Filter documents for the current faculty user if they're not an admin
    const filteredDocuments = req.user.role === "admin" 
      ? documents 
      : documents.filter(doc => doc.facultyId === req.user.id);
      
    res.json(filteredDocuments);
  } catch (error) {
    console.error("Get faculty documents error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Download faculty document
router.get("/documents/:id/download", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const documentId = parseInt(req.params.id);
    
    // Find the document in the list of all faculty documents
    const documents = await storage.getFacultyDocuments();
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user is authorized to download this document
    if (document.facultyId !== req.user.id && req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.sendStatus(403);
    }

    // Get the file URL
    const fileUrl = await getDocumentFileUrl(document.filePath);
    
    // For S3 storage, redirect to the signed URL
    if (process.env.STORAGE_TYPE === 's3') {
      return res.redirect(fileUrl);
    }
    
    // For local storage, send the file as an attachment
    const filename = path.basename(document.filePath);
    res.download(document.filePath, filename);
  } catch (error) {
    console.error("Faculty document download error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete faculty document
router.delete("/documents/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") {
    return res.sendStatus(403);
  }

  try {
    const documentId = parseInt(req.params.id);
    
    // Find the document in the list of all faculty documents
    const documents = await storage.getFacultyDocuments();
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user is authorized to delete this document
    if (document.facultyId !== req.user.id && req.user.role !== "admin") {
      return res.sendStatus(403);
    }

    // Delete the file from storage
    await deleteDocumentFile(document.filePath);

    // Delete the document from the database
    await storage.deleteFacultyDocument(documentId, document.facultyId);
    res.sendStatus(204);
  } catch (error) {
    console.error("Delete faculty document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 