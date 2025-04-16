import { Router } from "express";
import { storage } from "../storage";
import passport from "passport";
import { studentSchema, facultySchema, companySchema, adminSchema } from "../../shared/schema";
import { hashPassword } from "../services/password";
import { createVerificationToken } from "../services/email-verification";

const router = Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password || !req.body.role || !req.body.name || !req.body.email) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(req.body.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Role-based validation
    let validationResult;
    try {
      switch (req.body.role) {
        case 'student':
          validationResult = studentSchema.safeParse(req.body);
          break;
        case 'faculty':
          validationResult = facultySchema.safeParse(req.body);
          break;
        case 'company':
          validationResult = companySchema.safeParse(req.body);
          break;
        case 'admin':
          validationResult = adminSchema.safeParse(req.body);
          break;
        default:
          return res.status(400).json({ message: "Invalid role" });
      }

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({ message: "Invalid data provided" });
    }

    // Hash password
    const hashedPassword = await hashPassword(req.body.password);
    
    // Create user
    const user = await storage.createUser({
      ...req.body,
      password: hashedPassword,
      emailVerified: false,
      profileCompleted: false
    });

    // Send verification email for company accounts or if email verification is required
    // But always auto-verify student accounts for testing
    if (req.body.role === 'company' || (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && req.body.role !== 'student')) {
      const verificationResult = await createVerificationToken(user.id, req.body.email);
      if (!verificationResult.success) {
        console.error("Failed to send verification email:", verificationResult.message);
      }
    } else {
      // Auto-verify student accounts and other accounts if not required
      await storage.updateUserEmailVerification(user.id, true);
    }

    // Log in the user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed after registration" });
      }
      return res.status(201).json({
        ...user,
        needsEmailVerification: req.body.role === 'company' || (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && req.body.role !== 'student')
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error during registration" });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || "Authentication failed" });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
  })(req, res, next);
});

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.sendStatus(200);
  });
});

// Get current user
router.get("/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  res.json(req.user);
});

export default router; 