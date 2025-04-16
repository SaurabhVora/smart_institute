import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Get student's mentor (faculty)
router.get("/mentor", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "student") return res.sendStatus(403);

  try {
    // Get the student's faculty allocation
    const allocations = await storage.getAllocations(req.user.id, "student");
    
    if (!allocations || allocations.length === 0) {
      return res.json({ mentor: null });
    }
    
    // Get the faculty user
    const faculty = await storage.getUser(allocations[0].facultyId);
    
    if (!faculty) {
      return res.json({ mentor: null });
    }
    
    // Remove sensitive information
    delete faculty.password;
    
    res.json({ mentor: faculty });
  } catch (error) {
    console.error("Get student mentor error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 