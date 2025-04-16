import { Express } from "express";
import documentRoutes from "./documentRoutes";
import facultyRoutes from "./facultyRoutes";
import userRoutes from "./userRoutes";
import allocationRoutes from "./allocationRoutes";
import resourceRoutes from "./resourceRoutes";
import authRoutes from "./authRoutes";
import passwordRoutes from "./passwordRoutes";
import emailRoutes from "./emailRoutes";
import profileRoutes from "./profileRoutes";
import studentRoutes from "./studentRoutes";
import techSessionRoutes from "./techSessionRoutes";
import internshipRoutes from "./internshipRoutes";

export function registerRoutes(app: Express): void {
  // Register all route modules with their respective prefixes
  app.use("/api/documents", documentRoutes);
  app.use("/api/faculty", facultyRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/allocations", allocationRoutes);
  app.use("/api/resources", resourceRoutes);
  app.use("/api/tech-sessions", techSessionRoutes);
  app.use("/api/internships", internshipRoutes);
  app.use("/api", authRoutes);
  app.use("/api", passwordRoutes);
  app.use("/api", emailRoutes);
  app.use("/api", profileRoutes);
  app.use("/api/student", studentRoutes);
} 