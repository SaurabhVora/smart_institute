import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "faculty", "student", "company"] }).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false),
  phone: text("phone"),
  university: text("university"),
  department: text("department"),
  year: text("year"),
  enrollmentNumber: text("enrollment_number"),
  bio: text("bio"),
  companyName: text("company_name"),
  industry: text("industry"),
  position: text("position"),
  expertise: text("expertise"),
  profileCompleted: boolean("profile_completed").default(false),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type", { 
    enum: ["offer_letter", "monthly_report", "attendance"] 
  }).notNull(),
  status: text("status", { 
    enum: ["draft", "submitted", "under_review", "approved", "rejected"] 
  }).default("draft"),
  filePath: text("file_path").notNull(),
  filename: text("filename").notNull(),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  companyName: text("company_name"),
  internshipDomain: text("internship_domain"),
});

export const facultyAllocations = pgTable("faculty_allocations", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => users.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  status: text("status", { 
    enum: ["active", "completed"] 
  }).default("active"),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url"),
  type: text("type", { enum: ["guideline", "link", "file"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
});

export const techSessions = pgTable("tech_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location").notNull(),
  virtualMeetingLink: text("virtual_meeting_link"),
  capacity: integer("capacity").default(30),
  category: text("category", { 
    enum: ["web", "ai", "cloud", "mobile", "security", "other"] 
  }).default("other"),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: text("status", { 
    enum: ["upcoming", "ongoing", "completed", "cancelled"] 
  }).default("upcoming"),
});

export const sessionRegistrations = pgTable("session_registrations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => techSessions.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  attended: boolean("attended").default(false),
  feedback: text("feedback"),
  rating: integer("rating"),
});

export const facultyDocuments = pgTable("faculty_documents", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentFeedback = pgTable("document_feedback", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .references(() => documents.id),
  facultyId: integer("faculty_id")
    .notNull()
    .references(() => users.id),
  feedback: text("feedback").notNull(),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  duration: text("duration").notNull(),
  stipend: text("stipend").notNull(),
  deadline: text("deadline").notNull(),
  skills: text("skills").array().notNull(),
  description: text("description").notNull(),
  logo: text("logo").notNull(),
  type: text("type", { enum: ["Full-time", "Part-time"] }).notNull(),
  category: text("category", { 
    enum: ["Web Development", "Mobile Development", "Data Science", "Machine Learning", "Cloud Computing", "Cybersecurity", "UI/UX Design", "DevOps", "Blockchain", "Other"] 
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
});

// Internship applications table
export const internshipApplications = pgTable("internship_applications", {
  id: serial("id").primaryKey(),
  internshipId: integer("internship_id")
    .notNull()
    .references(() => internships.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  status: text("status", { 
    enum: ["pending", "accepted", "rejected", "withdrawn"] 
  }).default("pending").notNull(),
  phone: text("phone").notNull(),
  semester: text("semester").notNull(),
  degreeProgram: text("degree_program").notNull(),
  resumePath: text("resume_path").notNull(),
  coverLetter: text("cover_letter"),
  feedback: text("feedback"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  phone: true,
  university: true,
  department: true,
  year: true,
  enrollmentNumber: true,
  companyName: true,
  industry: true,
  position: true,
  expertise: true,
});

// Role-specific validation schemas
export const studentSchema = insertUserSchema.pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  phone: true,
  university: true,
  department: true,
  year: true,
  enrollmentNumber: true,
}).refine(data => data.role === 'student', {
  message: "Role must be 'student'",
  path: ["role"]
});

export const facultySchema = insertUserSchema.pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  phone: true,
  department: true,
  position: true,
  expertise: true,
}).refine(data => data.role === 'faculty', {
  message: "Role must be 'faculty'",
  path: ["role"]
});

export const companySchema = insertUserSchema.pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  phone: true,
  companyName: true,
  industry: true,
}).refine(data => data.role === 'company', {
  message: "Role must be 'company'",
  path: ["role"]
});

export const adminSchema = insertUserSchema.pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  phone: true,
}).refine(data => data.role === 'admin', {
  message: "Role must be 'admin'",
  path: ["role"]
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  type: true,
  filePath: true,
  filename: true,
  status: true,
  companyName: true,
  internshipDomain: true,
});

// Add internship insert schema
export const insertInternshipSchema = createInsertSchema(internships)
  .pick({
    title: true,
    company: true,
    location: true,
    duration: true,
    stipend: true,
    deadline: true,
    skills: true,
    description: true,
    type: true,
    category: true,
  })
  .extend({
    deadline: z.string().min(1, "Deadline is required").transform(val => String(val).trim()),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
  });

// Add internship application insert schema
export const insertInternshipApplicationSchema = createInsertSchema(internshipApplications)
  .pick({
    internshipId: true,
    phone: true,
    semester: true,
    degreeProgram: true,
    coverLetter: true,
  })
  .omit({ 
    resumePath: true 
  })
  .extend({
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    semester: z.string().min(1, "Semester is required"),
    degreeProgram: z.string().min(1, "Degree program is required"),
    internshipId: z.preprocess(
      // Convert to number if needed
      (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
      z.number().positive("Internship ID must be provided")
    ),
  });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type StudentUser = z.infer<typeof studentSchema>;
export type FacultyUser = z.infer<typeof facultySchema>;
export type CompanyUser = z.infer<typeof companySchema>;
export type AdminUser = z.infer<typeof adminSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type DocumentWithStudentName = Document & { studentName?: string };
export type FacultyAllocation = typeof facultyAllocations.$inferSelect;
export type FacultyDocument = typeof facultyDocuments.$inferSelect;
export type DocumentFeedback = typeof documentFeedback.$inferSelect;
export type TechSession = typeof techSessions.$inferSelect;
export type SessionRegistration = typeof sessionRegistrations.$inferSelect;
export type Internship = typeof internships.$inferSelect;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type InternshipApplication = typeof internshipApplications.$inferSelect;
export type InsertInternshipApplication = z.infer<typeof insertInternshipApplicationSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  facultyAllocations: many(facultyAllocations),
  techSessions: many(techSessions),
  sessionRegistrations: many(sessionRegistrations),
  facultyDocuments: many(facultyDocuments),
  documentFeedback: many(documentFeedback),
  internships: many(internships),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  feedback: many(documentFeedback),
}));

export const documentFeedbackRelations = relations(documentFeedback, ({ one }) => ({
  document: one(documents, {
    fields: [documentFeedback.documentId],
    references: [documents.id],
  }),
  faculty: one(users, {
    fields: [documentFeedback.facultyId],
    references: [users.id],
  }),
}));

export const facultyAllocationsRelations = relations(facultyAllocations, ({ one }) => ({
  faculty: one(users, {
    fields: [facultyAllocations.facultyId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [facultyAllocations.studentId],
    references: [users.id],
  }),
}));

export const techSessionsRelations = relations(techSessions, ({ one, many }) => ({
  faculty: one(users, {
    fields: [techSessions.facultyId],
    references: [users.id],
  }),
  registrations: many(sessionRegistrations),
}));

export const sessionRegistrationsRelations = relations(sessionRegistrations, ({ one }) => ({
  session: one(techSessions, {
    fields: [sessionRegistrations.sessionId],
    references: [techSessions.id],
  }),
  student: one(users, {
    fields: [sessionRegistrations.studentId],
    references: [users.id],
  }),
}));

export const facultyDocumentsRelations = relations(facultyDocuments, ({ one }) => ({
  faculty: one(users, {
    fields: [facultyDocuments.facultyId],
    references: [users.id],
  }),
}));

export const internshipsRelations = relations(internships, ({ one, many }) => ({
  creator: one(users, {
    fields: [internships.createdBy],
    references: [users.id],
  }),
  applications: many(internshipApplications),
}));

export const internshipApplicationsRelations = relations(internshipApplications, ({ one }) => ({
  internship: one(internships, {
    fields: [internshipApplications.internshipId],
    references: [internships.id],
  }),
  student: one(users, {
    fields: [internshipApplications.studentId],
    references: [users.id],
  }),
}));