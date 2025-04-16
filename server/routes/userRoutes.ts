import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Get user by ID
router.get("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const userId = parseInt(req.params.id);
    
    // Check if the user is authorized to view this user
    if (userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.sendStatus(403);
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive information
    delete user.password;
    
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user
router.patch("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const userId = parseInt(req.params.id);
    
    // Check if the user is authorized to update this user
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.sendStatus(403);
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract and validate the user data based on role
    const userData: any = {};
    
    // Common fields for all roles
    if (req.body.name) userData.name = req.body.name;
    if (req.body.email) userData.email = req.body.email;
    if (req.body.phone) userData.phone = req.body.phone;
    if (req.body.bio) userData.bio = req.body.bio;
    
    // Role-specific fields
    if (user.role === "student") {
      if (req.body.university) userData.university = req.body.university;
      if (req.body.department) userData.department = req.body.department;
      if (req.body.year) userData.year = req.body.year;
      if (req.body.enrollmentNumber) userData.enrollmentNumber = req.body.enrollmentNumber;
    } else if (user.role === "faculty") {
      if (req.body.department) userData.department = req.body.department;
      if (req.body.position) userData.position = req.body.position;
      if (req.body.expertise) userData.expertise = req.body.expertise;
    } else if (user.role === "company") {
      if (req.body.companyName) userData.companyName = req.body.companyName;
      if (req.body.industry) userData.industry = req.body.industry;
    }

    // Social links for all roles
    if (req.body.linkedin !== undefined) userData.linkedin = req.body.linkedin;
    if (req.body.github !== undefined) userData.github = req.body.github;
    if (req.body.portfolio !== undefined) userData.portfolio = req.body.portfolio;

    // Check if profile is complete by combining existing user data with new data
    let profileCompleted = true;
    
    if (user.role === "student") {
      const updatedUser = { ...user, ...userData };
      profileCompleted = !!(
        updatedUser.name && 
        updatedUser.email && 
        updatedUser.phone && 
        updatedUser.university && 
        updatedUser.department && 
        updatedUser.year &&
        updatedUser.enrollmentNumber
      );
    } else if (user.role === "faculty") {
      const updatedUser = { ...user, ...userData };
      profileCompleted = !!(
        updatedUser.name && 
        updatedUser.email && 
        updatedUser.phone && 
        updatedUser.department && 
        updatedUser.position && 
        updatedUser.expertise
      );
    } else if (user.role === "company") {
      const updatedUser = { ...user, ...userData };
      profileCompleted = !!(
        updatedUser.name && 
        updatedUser.email && 
        updatedUser.phone && 
        updatedUser.companyName
      );
    }
    
    userData.profileCompleted = profileCompleted;

    // Update the user
    const updatedUser = await storage.updateUser(userId, userData);
    
    // Remove sensitive information
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 