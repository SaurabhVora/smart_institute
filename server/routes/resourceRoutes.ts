import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { resources } from "../../shared/schema";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { handleMulterErrors, upload } from "./middleware";
import fs from "fs";
import path from "path";
import { storageService } from "../services/storage-service";

const router = Router();

// Get all resources
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    // Get all resources
    const resourcesList = await db.select().from(resources).orderBy(desc(resources.createdAt));
    
    // Get the creator information for each resource
    const resourcesWithCreator = await Promise.all(
      resourcesList.map(async (resource) => {
        const creator = await storage.getUser(resource.createdBy);
        return {
          ...resource,
          creatorName: creator ? creator.name : "Unknown",
          creatorRole: creator ? creator.role : "unknown",
        };
      })
    );
    
    res.json(resourcesWithCreator);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new resource
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin" && req.user.role !== "faculty" && req.user.role !== "company") {
    return res.sendStatus(403);
  }

  try {
    const { title, description, url, type } = req.body;
    
    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({ message: "Title, description, and type are required" });
    }
    
    // Validate type
    if (!["guideline", "link", "file"].includes(type)) {
      return res.status(400).json({ message: "Invalid resource type" });
    }
    
    // Create the resource
    const resource = await db.insert(resources).values({
      title,
      description,
      url: url || null,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id,
    }).returning();
    
    res.json(resource[0]);
  } catch (error) {
    console.error("Resource creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Upload a resource file
router.post("/upload", handleMulterErrors(upload.single("file")), async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin" && req.user.role !== "faculty" && req.user.role !== "company") {
    return res.sendStatus(403);
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, description } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      // Remove the uploaded file if validation fails
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Title and description are required" });
    }
    
    // Save file to storage service
    const fileKey = await storageService.saveFile(req.file.path, `resources/${Date.now()}-${req.file.originalname}`);
    
    // Create the resource with file key
    const resource = await db.insert(resources).values({
      title,
      description,
      url: fileKey, // Store the file key instead of the path
      type: "file",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id,
    }).returning();
    
    res.json(resource[0]);
  } catch (error) {
    // Clean up the file if there's an error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Resource upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Download a resource file
router.get("/download/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const resourceId = parseInt(req.params.id);
    
    // Get the resource
    const resource = await db.select().from(resources).where(eq(resources.id, resourceId)).limit(1);
    
    if (!resource || resource.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    const resourceItem = resource[0];
    
    // Check if it's a file type resource
    if (resourceItem.type !== "file" || !resourceItem.url) {
      return res.status(400).json({ message: "Resource is not a downloadable file" });
    }
    
    // Get the file URL from storage service
    const fileUrl = await storageService.getFileUrl(resourceItem.url);
    
    // For S3 storage, redirect to the signed URL
    if (process.env.STORAGE_TYPE === 's3') {
      return res.redirect(fileUrl);
    }
    
    // For local storage, stream the file
    const filePath = resourceItem.url;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    // Get the filename from the path
    const filename = path.basename(filePath);
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Resource download error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a resource
router.delete("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin" && req.user.role !== "faculty" && req.user.role !== "company") {
    return res.sendStatus(403);
  }

  try {
    const resourceId = parseInt(req.params.id);
    
    // Get the resource
    const resource = await db.select().from(resources).where(eq(resources.id, resourceId)).limit(1);
    
    if (!resource || resource.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    // Check if the user is authorized to delete this resource
    if (resource[0].createdBy !== req.user.id && req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    // If it's a file resource, delete the file using storage service
    if (resource[0].type === "file" && resource[0].url) {
      await storageService.deleteFile(resource[0].url);
    }
    
    // Delete the resource
    await db.delete(resources).where(eq(resources.id, resourceId));
    
    res.sendStatus(204);
  } catch (error) {
    console.error("Resource deletion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 