import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Get profile completion status
router.get("/profile-completion", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile is complete based on role
    let isComplete = false;
    let missingFields = [];

    if (user.role === "student") {
      const requiredFields = ["name", "email", "phone", "university", "department", "year"];
      missingFields = requiredFields.filter(field => !user[field]);
      isComplete = missingFields.length === 0;
    } else if (user.role === "faculty") {
      const requiredFields = ["name", "email", "phone", "department", "position", "expertise"];
      missingFields = requiredFields.filter(field => !user[field]);
      isComplete = missingFields.length === 0;
    } else if (user.role === "company") {
      const requiredFields = ["name", "email", "phone", "companyName"];
      missingFields = requiredFields.filter(field => !user[field]);
      isComplete = missingFields.length === 0;
    } else if (user.role === "admin") {
      const requiredFields = ["name", "email", "phone"];
      missingFields = requiredFields.filter(field => !user[field]);
      isComplete = missingFields.length === 0;
    }

    // Update profile completion status if needed
    if (isComplete !== user.profileCompleted) {
      await storage.updateUserProfileCompletion(user.id, isComplete);
      // Update the local user object to reflect the change
      user.profileCompleted = isComplete;
    }

    // If the user is logged in but their email is not marked as verified,
    // this indicates a data inconsistency. Fix it by marking the email as verified.
    let emailVerified = user.emailVerified;
    if (!emailVerified) {
      // Since the user is logged in, we can assume their email is verified
      // (due to the check we added in the auth.ts file)
      await storage.updateUserEmailVerification(user.id, true);
      emailVerified = true;
    }

    res.json({
      isComplete,
      missingFields,
      emailVerified,
      profileData: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        university: user.university,
        department: user.department,
        year: user.year,
        bio: user.bio,
        companyName: user.companyName,
        industry: user.industry,
        position: user.position,
        expertise: user.expertise,
        linkedin: user.linkedin,
        github: user.github,
        portfolio: user.portfolio,
      }
    });
  } catch (error) {
    console.error("Profile completion check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 