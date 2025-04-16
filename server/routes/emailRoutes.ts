import { Router } from "express";
import { storage } from "../storage";
import { verifyEmail, resendVerificationEmail } from '../services/email-verification';
import { sendTestEmail } from '../services/email';
import { z } from "zod";

const router = Router();

// Check if email exists
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    // For security reasons, don't reveal if the email exists
    // Just return a generic message
    res.json({ message: "Email check completed" });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify email with token
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify the email
    const result = await verifyEmail(token);
    
    if (result.success) {
      res.json({ 
        verified: true, 
        message: "Email verified successfully",
        userId: result.userId
      });
    } else {
      res.status(400).json({ 
        verified: false, 
        message: result.message || "Email verification failed" 
      });
    }
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    
    // Check if email is null
    if (!user.email) {
      return res.status(400).json({ message: "User has no email address" });
    }
    
    // Resend verification email
    const result = await resendVerificationEmail(user.id, user.email);
    
    if (result.success) {
      res.json({ message: "Verification email sent" });
    } else {
      res.status(500).json({ message: result.message || "Failed to send verification email" });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Resend verification email (public endpoint)
router.post("/resend-verification-public", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    // For security reasons, don't reveal if the email exists
    // Just return a generic message
    if (!user) {
      return res.json({ message: "If your email is registered, a verification email will be sent" });
    }
    
    // Check if email is already verified
    if (user.emailVerified) {
      return res.json({ message: "If your email is registered, a verification email will be sent" });
    }
    
    // Check if email is null (shouldn't happen, but just in case)
    if (!user.email) {
      return res.json({ message: "If your email is registered, a verification email will be sent" });
    }
    
    // Resend verification email
    const result = await resendVerificationEmail(user.id, user.email);
    
    // Always return the same message for security
    res.json({ message: "If your email is registered, a verification email will be sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Test email sending (admin only)
router.post("/test-email", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    if (req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Send test email
    const success = await sendTestEmail(email);
    
    if (success) {
      res.json({ message: "Test email sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send test email" });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 