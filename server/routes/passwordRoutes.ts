import { Router } from "express";
import { storage } from "../storage";
import { createPasswordResetToken, verifyPasswordResetToken, resetPassword } from '../services/password-reset';
import { z } from "zod";

const router = Router();

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return res.json({ message: "If your email is registered, you will receive a password reset link" });
    }

    // Create password reset token
    const success = await createPasswordResetToken(user.id, email);
    
    if (success) {
      res.json({ message: "Password reset email sent" });
    } else {
      res.status(500).json({ message: "Failed to send password reset email" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset password with token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    
    // Reset the password
    const result = await resetPassword(token, password);
    
    if (result.success) {
      res.json({ message: "Password reset successful" });
    } else {
      res.status(400).json({ message: result.message || "Password reset failed" });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify reset token
router.get("/reset-password/:token/verify", async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify the token
    const result = await verifyPasswordResetToken(token);
    
    if (result.valid) {
      res.json({ valid: true });
    } else {
      res.status(400).json({ valid: false, message: result.message });
    }
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 