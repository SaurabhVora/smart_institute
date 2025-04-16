import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertDocumentSchema } from "../../shared/schema";
import { handleMulterErrors, upload } from "./middleware";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { saveDocumentFile, getDocumentFileUrl, deleteDocumentFile } from "../services/document-storage";
import fs from "fs";
import path from "path";

const router = Router();

// Create a new document
router.post("/", handleMulterErrors(upload.single("file")), async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    // Save the file to storage (local or S3)
    const fileKey = await saveDocumentFile(
      req.file.path, 
      req.body.type, 
      req.file.originalname
    );

    // Extract and validate the document data
    const documentData = {
      type: req.body.type,
      filePath: fileKey, // Store the file key instead of the local path
      filename: req.file.originalname,
      status: "draft",
      companyName: req.body.companyName || undefined,
      internshipDomain: req.body.internshipDomain || undefined,
    };

    // Validate the data against our schema
    const validatedData = insertDocumentSchema.parse(documentData);

    // Create the document
    const document = await storage.createDocument({
      userId: req.user.id,
      type: validatedData.type,
      filePath: validatedData.filePath,
      filename: validatedData.filename,
      status: validatedData.status || "draft",
      companyName: validatedData.companyName || undefined,
      internshipDomain: validatedData.internshipDomain || undefined,
    });

    res.json(document);
  } catch (error) {
    // Clean up the temporary file if there's an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error("Document creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// View a document
router.get("/:id/view", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin" && req.user.role !== "faculty") {
    return res.sendStatus(403);
  }

  try {
    // Get the document
    const document = await storage.getDocument(parseInt(req.params.id));
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Get the file URL
    const fileUrl = await getDocumentFileUrl(document.filePath);
    
    // For S3 storage, redirect to the signed URL
    if (process.env.STORAGE_TYPE === 's3') {
      return res.redirect(fileUrl);
    }
    
    // For local storage, send the file
    res.sendFile(document.filePath, { root: process.cwd() });
  } catch (error) {
    console.error("Document view error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Download a document
router.get("/:id/download", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    // Get the document
    const documentId = parseInt(req.params.id);
    
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user is authorized to download this document
    if (document.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.sendStatus(403);
    }

    // Get the file URL
    try {
      const fileUrl = await getDocumentFileUrl(document.filePath);
      
      // For S3 storage, redirect to the signed URL
      if (process.env.STORAGE_TYPE === 's3') {
        // Set headers to help with download and avoid CORS issues
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Don't set Content-Disposition here as it will be overridden by the redirect
        // The S3 pre-signed URL already includes the Content-Disposition header
        
        return res.redirect(302, fileUrl);
      }
      
      // For local storage, send the file as an attachment
      return res.download(document.filePath, document.filename);
    } catch (urlError) {
      console.error(`Error generating file URL:`, urlError);
      return res.status(500).json({ 
        message: "Failed to generate download URL", 
        error: urlError instanceof Error ? urlError.message : String(urlError)
      });
    }
  } catch (error) {
    console.error("Document download error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Get all documents
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const documents = await storage.getDocumentsByUser(req.user.id);
    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all documents for faculty review
router.get("/faculty-review", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  // Only faculty and admin can access this route
  if (req.user.role !== "faculty" && req.user.role !== "admin") {
    return res.sendStatus(403);
  }

  try {
    const documents = await storage.getDocumentsForFacultyReview();
    
    // Get user information for each document
    const documentsWithUserInfo = await Promise.all(
      documents.map(async (doc) => {
        const user = await storage.getUser(doc.userId);
        return {
          ...doc,
          studentName: user ? user.name : "Unknown Student",
        };
      })
    );
    
    res.json(documentsWithUserInfo);
  } catch (error) {
    console.error("Get faculty review documents error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update document status
router.patch("/:id/status", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Validate status
    if (!["draft", "submitted", "under_review", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const documentId = parseInt(req.params.id);
    const document = await storage.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check permissions based on role and status change
    if (req.user.role === "student") {
      // Students can only submit their own documents and only change from draft to submitted
      if (document.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own documents" });
      }
      
      if (status !== "submitted") {
        return res.status(403).json({ message: "Students can only submit documents" });
      }
      
      if (document.status !== "draft" && document.status !== null) {
        return res.status(400).json({ message: "Only draft documents can be submitted" });
      }
    } else if (req.user.role !== "admin" && req.user.role !== "faculty") {
      // Other roles (like company) cannot update document status
      return res.status(403).json({ message: "You don't have permission to update document status" });
    }

    // Update the document status
    const updatedDocument = await storage.updateDocumentStatus(documentId, status);
    res.json(updatedDocument);
  } catch (error) {
    console.error("Update document status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get documents by category
router.get("/category/:category", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Validate category
    if (!["offer_letter", "monthly_report", "attendance"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const documents = await storage.getDocumentsByCategory(req.user.id, category);
    res.json(documents);
  } catch (error) {
    console.error("Get documents by category error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get document feedback
router.get("/:documentId/feedback", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const documentId = parseInt(req.params.documentId);
    const document = await storage.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user is authorized to view this feedback
    if (document.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.sendStatus(403);
    }

    const feedback = await storage.getDocumentFeedback(documentId);
    res.json(feedback);
  } catch (error) {
    console.error("Get document feedback error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a single document by ID
router.get("/:id([0-9]+)", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const documentId = parseInt(req.params.id);
    const document = await storage.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user is authorized to view this document
    if (document.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.sendStatus(403);
    }

    res.json(document);
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add document feedback
router.post("/:documentId/feedback", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const documentId = parseInt(req.params.documentId);
    const document = await storage.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user is authorized to view this feedback
    if (document.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.sendStatus(403);
    }

    const feedback = await storage.getDocumentFeedback(documentId);
    res.json(feedback);
  } catch (error) {
    console.error("Get document feedback error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 