import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { db } from "../db";
import { techSessions, sessionRegistrations, users } from "../../shared/schema";
import { eq, and, desc, gt, lt } from "drizzle-orm";

const router = Router();

// Create a new tech session (faculty only)
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const { title, description, date, startTime, endTime, location, virtualMeetingLink, capacity, category } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !startTime || !endTime || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Create the tech session
    const session = await db.insert(techSessions).values({
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      location,
      virtualMeetingLink: virtualMeetingLink || null,
      capacity: capacity || 30,
      category: category || "other",
      facultyId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    res.status(201).json(session[0]);
  } catch (error) {
    console.error("Tech session creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all tech sessions
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    // Get query parameters
    const status = req.query.status as string;
    const category = req.query.category as string;
    
    // Build query
    let query = db.select({
      ...techSessions,
      facultyName: users.name,
    })
    .from(techSessions)
    .leftJoin(users, eq(techSessions.facultyId, users.id))
    .orderBy(desc(techSessions.date));
    
    // Apply filters if provided
    if (status) {
      query = query.where(eq(techSessions.status, status));
    }
    
    if (category) {
      query = query.where(eq(techSessions.category, category));
    }
    
    const sessions = await query;
    
    res.json(sessions);
  } catch (error) {
    console.error("Get tech sessions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get tech sessions created by the faculty
router.get("/my-sessions", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const sessions = await db.select()
      .from(techSessions)
      .where(eq(techSessions.facultyId, req.user.id))
      .orderBy(desc(techSessions.date));
    
    res.json(sessions);
  } catch (error) {
    console.error("Get faculty tech sessions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a specific tech session by ID
router.get("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const sessionId = parseInt(req.params.id);
    
    // Get the session with faculty details
    const [session] = await db.select({
      ...techSessions,
      facultyName: users.name,
      facultyDepartment: users.department,
      facultyExpertise: users.expertise,
    })
    .from(techSessions)
    .leftJoin(users, eq(techSessions.facultyId, users.id))
    .where(eq(techSessions.id, sessionId))
    .limit(1);
    
    if (!session) {
      return res.status(404).json({ message: "Tech session not found" });
    }
    
    // Get registration count
    const registrations = await db.select()
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, sessionId));
    
    const sessionWithRegistrations = {
      ...session,
      registeredCount: registrations.length,
      isRegistered: registrations.some(reg => reg.studentId === req.user.id),
      // Only include the list of registrations for faculty who created the session
      registrations: (req.user.id === session.facultyId || req.user.role === "admin") 
        ? registrations 
        : undefined
    };
    
    res.json(sessionWithRegistrations);
  } catch (error) {
    console.error("Get tech session error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a tech session (faculty who created it only)
router.put("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const sessionId = parseInt(req.params.id);
    
    // Get the session
    const [session] = await db.select()
      .from(techSessions)
      .where(eq(techSessions.id, sessionId))
      .limit(1);
    
    if (!session) {
      return res.status(404).json({ message: "Tech session not found" });
    }
    
    // Check if the user is authorized to update this session
    if (session.facultyId !== req.user.id && req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    // Update the session
    const { title, description, date, startTime, endTime, location, virtualMeetingLink, capacity, category, status } = req.body;
    
    const updatedSession = await db.update(techSessions)
      .set({
        title: title || session.title,
        description: description || session.description,
        date: date ? new Date(date) : session.date,
        startTime: startTime || session.startTime,
        endTime: endTime || session.endTime,
        location: location || session.location,
        virtualMeetingLink: virtualMeetingLink !== undefined ? virtualMeetingLink : session.virtualMeetingLink,
        capacity: capacity || session.capacity,
        category: category || session.category,
        status: status || session.status,
        updatedAt: new Date(),
      })
      .where(eq(techSessions.id, sessionId))
      .returning();
    
    res.json(updatedSession[0]);
  } catch (error) {
    console.error("Update tech session error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a tech session (faculty who created it only)
router.delete("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const sessionId = parseInt(req.params.id);
    
    // Get the session
    const [session] = await db.select()
      .from(techSessions)
      .where(eq(techSessions.id, sessionId))
      .limit(1);
    
    if (!session) {
      return res.status(404).json({ message: "Tech session not found" });
    }
    
    // Check if the user is authorized to delete this session
    if (session.facultyId !== req.user.id && req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    // Delete all registrations for this session
    await db.delete(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, sessionId));
    
    // Delete the session
    await db.delete(techSessions)
      .where(eq(techSessions.id, sessionId));
    
    res.sendStatus(204);
  } catch (error) {
    console.error("Delete tech session error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register for a tech session (students only)
router.post("/:id/register", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "student") return res.sendStatus(403);

  try {
    const sessionId = parseInt(req.params.id);
    
    // Get the session
    const [session] = await db.select()
      .from(techSessions)
      .where(eq(techSessions.id, sessionId))
      .limit(1);
    
    if (!session) {
      return res.status(404).json({ message: "Tech session not found" });
    }
    
    // Check if the session is upcoming
    if (session.status !== "upcoming") {
      return res.status(400).json({ message: "Cannot register for a session that is not upcoming" });
    }
    
    // Check if the user is already registered
    const existingRegistration = await db.select()
      .from(sessionRegistrations)
      .where(
        and(
          eq(sessionRegistrations.sessionId, sessionId),
          eq(sessionRegistrations.studentId, req.user.id)
        )
      )
      .limit(1);
    
    if (existingRegistration.length > 0) {
      return res.status(400).json({ message: "You are already registered for this session" });
    }
    
    // Check if the session is at capacity
    const registrations = await db.select()
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, sessionId));
    
    if (registrations.length >= session.capacity) {
      return res.status(400).json({ message: "This session is at capacity" });
    }
    
    // Register the user
    const registration = await db.insert(sessionRegistrations)
      .values({
        sessionId,
        studentId: req.user.id,
        registeredAt: new Date(),
      })
      .returning();
    
    res.status(201).json(registration[0]);
  } catch (error) {
    console.error("Session registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cancel registration for a tech session (students only)
router.delete("/:id/register", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "student") return res.sendStatus(403);

  try {
    const sessionId = parseInt(req.params.id);
    
    // Delete the registration
    await db.delete(sessionRegistrations)
      .where(
        and(
          eq(sessionRegistrations.sessionId, sessionId),
          eq(sessionRegistrations.studentId, req.user.id)
        )
      );
    
    res.sendStatus(204);
  } catch (error) {
    console.error("Cancel registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get registrations for a tech session (faculty who created it only)
router.get("/:id/registrations", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const sessionId = parseInt(req.params.id);
    
    // Get the session
    const [session] = await db.select()
      .from(techSessions)
      .where(eq(techSessions.id, sessionId))
      .limit(1);
    
    if (!session) {
      return res.status(404).json({ message: "Tech session not found" });
    }
    
    // Check if the user is authorized to view registrations
    if (session.facultyId !== req.user.id && req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    // Get registrations with student details
    const registrations = await db.select({
      ...sessionRegistrations,
      studentName: users.name,
      studentEmail: users.email,
      studentDepartment: users.department,
      studentYear: users.year,
    })
    .from(sessionRegistrations)
    .leftJoin(users, eq(sessionRegistrations.studentId, users.id))
    .where(eq(sessionRegistrations.sessionId, sessionId));
    
    res.json(registrations);
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 