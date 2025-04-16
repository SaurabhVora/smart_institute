import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, or, inArray, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  documents, 
  facultyAllocations, 
  facultyDocuments, 
  documentFeedback, 
  techSessions,
  sessionRegistrations,
  type User, 
  type InsertUser, 
  type Document, 
  type FacultyAllocation, 
  type FacultyDocument, 
  type DocumentFeedback, 
  type TechSession, 
  type SessionRegistration
} from "../shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Define missing type interfaces
type DocumentStatistics = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<string, number>;
};

type FacultyWorkload = {
  facultyId: number;
  name: string;
  pendingReviews: number;
  totalReviewed: number;
  activeStudents: number;
};

type StudentProgress = {
  studentId: number;
  name: string;
  documentsSubmitted: number;
  documentsApproved: number;
  lastSubmission?: Date;
};

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, userData: Partial<User>): Promise<User>;
  updateUserEmailVerification(userId: number, verified: boolean): Promise<User>;
  updateUserProfileCompletion(userId: number, completed: boolean): Promise<User>;

  // Document operations
  createDocument(doc: { userId: number; type: string; filePath: string; filename: string; status?: string; companyName?: string; internshipDomain?: string }): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  getDocumentsForFacultyReview(): Promise<Document[]>;
  updateDocumentStatus(docId: number, status: "draft" | "submitted" | "under_review" | "approved" | "rejected"): Promise<Document>;

  // Faculty allocation operations
  createAllocation(allocation: { facultyId: number; studentId: number }): Promise<FacultyAllocation>;
  getAllocations(userId: number, role: string): Promise<FacultyAllocation[]>;

  // Session store
  sessionStore: session.Store;

  // Analytics methods
  getDocumentStatistics(): Promise<DocumentStatistics>;
  getFacultyWorkload(): Promise<FacultyWorkload[]>;
  getStudentProgress(): Promise<StudentProgress[]>;

  // Document feedback operations
  createDocumentFeedback(feedback: { documentId: number; facultyId: number; feedback: string; rating?: number }): Promise<DocumentFeedback>;
  getDocumentFeedback(documentId: number): Promise<DocumentFeedback[]>;
  getFacultyForStudent(studentId: number): Promise<User | undefined>;
  getDocumentsByCategory(userId: number, category: string): Promise<Document[]>;

  // Tech session operations
  createTechSession(session: { 
    title: string; 
    description: string; 
    date: Date; 
    startTime: string; 
    endTime: string; 
    location: string; 
    facultyId: number;
    virtualMeetingLink?: string;
    capacity?: number;
    category?: string;
  }): Promise<TechSession>;
  
  getTechSession(id: number): Promise<TechSession | undefined>;
  getTechSessions(filters?: { status?: string; category?: string }): Promise<TechSession[]>;
  getTechSessionsByFaculty(facultyId: number): Promise<TechSession[]>;
  updateTechSession(id: number, data: Partial<TechSession>): Promise<TechSession>;
  deleteTechSession(id: number): Promise<void>;
  
  // Session registration operations
  registerForSession(sessionId: number, studentId: number): Promise<SessionRegistration>;
  cancelRegistration(sessionId: number, studentId: number): Promise<void>;
  getSessionRegistrations(sessionId: number): Promise<SessionRegistration[]>;
  getStudentRegistrations(studentId: number): Promise<SessionRegistration[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createDocument(doc: { userId: number; type: string; filePath: string; filename: string; status?: string; companyName?: string; internshipDomain?: string }): Promise<Document> {
    const documentValues = {
      userId: doc.userId,
      type: doc.type as "offer_letter" | "monthly_report" | "attendance",
      filePath: doc.filePath,
      filename: doc.filename,
      status: (doc.status || "draft") as "draft" | "submitted" | "under_review" | "approved" | "rejected",
      companyName: doc.companyName || null,
      internshipDomain: doc.internshipDomain || null,
    };
    
    const result = await db
      .insert(documents)
      .values(documentValues)
      .returning();
    return result[0];
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);
    return result[0];
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId));
  }

  async getDocumentsForFacultyReview(): Promise<Document[]> {
    return db.select()
      .from(documents)
      .where(
        or(
          eq(documents.status, "submitted"),
          eq(documents.status, "under_review")
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  async updateDocumentStatus(docId: number, status: "draft" | "submitted" | "under_review" | "approved" | "rejected"): Promise<Document> {
    const result = await db
      .update(documents)
      .set({ status })
      .where(eq(documents.id, docId))
      .returning();
    return result[0];
  }

  async createAllocation(allocation: { facultyId: number; studentId: number }): Promise<FacultyAllocation> {
    const result = await db
      .insert(facultyAllocations)
      .values(allocation)
      .returning();
    return result[0];
  }

  async getAllocations(userId: number, role: string): Promise<FacultyAllocation[]> {
    if (role === "faculty") {
      return db
        .select()
        .from(facultyAllocations)
        .where(eq(facultyAllocations.facultyId, userId));
    } else if (role === "student") {
      return db
        .select()
        .from(facultyAllocations)
        .where(eq(facultyAllocations.studentId, userId));
    }
    return [];
  }

  async getDocumentStatistics(): Promise<DocumentStatistics> {
    const allDocs = await db.select().from(documents);

    const stats: DocumentStatistics = {
      total: allDocs.length,
      pending: allDocs.filter(d => d.status === "submitted" || d.status === "under_review").length,
      approved: allDocs.filter(d => d.status === "approved").length,
      rejected: allDocs.filter(d => d.status === "rejected").length,
      byType: {}
    };

    for (const doc of allDocs) {
      if (doc.type) {
        stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
      }
    }

    return stats;
  }

  async getFacultyWorkload(): Promise<FacultyWorkload[]> {
    const facultyUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "faculty"));

    const workloads: FacultyWorkload[] = [];

    for (const faculty of facultyUsers) {
      const allocations = await db
        .select()
        .from(facultyAllocations)
        .where(eq(facultyAllocations.facultyId, faculty.id));

      const studentIds = allocations.map(a => a.studentId);

      const pendingDocs = await db
        .select()
        .from(documents)
        .where(
          and(
            inArray(documents.userId, studentIds),
            or(
              eq(documents.status, "submitted"),
              eq(documents.status, "under_review")
            )
          )
        );

      const reviewedDocs = await db
        .select()
        .from(documents)
        .where(
          and(
            inArray(documents.userId, studentIds),
            or(
              eq(documents.status, "approved"),
              eq(documents.status, "rejected")
            )
          )
        );

      workloads.push({
        facultyId: faculty.id,
        name: faculty.name,
        pendingReviews: pendingDocs.length,
        totalReviewed: reviewedDocs.length,
        activeStudents: allocations.filter(a => a.status === "active").length
      });
    }

    return workloads;
  }

  async getStudentProgress(): Promise<StudentProgress[]> {
    const studentUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "student"));

    const progress: StudentProgress[] = [];

    for (const student of studentUsers) {
      const docs = await db
        .select()
        .from(documents)
        .where(eq(documents.userId, student.id))
        .orderBy(desc(documents.createdAt));

      progress.push({
        studentId: student.id,
        name: student.name,
        documentsSubmitted: docs.length,
        documentsApproved: docs.filter(d => d.status === "approved").length,
        lastSubmission: docs[0]?.createdAt || undefined
      });
    }

    return progress;
  }

  async createFacultyDocument(doc: { facultyId: number; title: string; description?: string; filePath: string }): Promise<FacultyDocument> {
    const result = await db
      .insert(facultyDocuments)
      .values(doc)
      .returning();
    return result[0];
  }

  async getFacultyDocuments(): Promise<FacultyDocument[]> {
    return db.select().from(facultyDocuments);
  }

  async deleteFacultyDocument(id: number, facultyId: number): Promise<void> {
    await db
      .delete(facultyDocuments)
      .where(
        and(
          eq(facultyDocuments.id, id),
          eq(facultyDocuments.facultyId, facultyId)
        )
      );
  }

  async updateUserEmailVerification(userId: number, verified: boolean): Promise<User> {
    const result = await db
      .update(users)
      .set({ emailVerified: verified })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserProfileCompletion(userId: number, completed: boolean): Promise<User> {
    const result = await db
      .update(users)
      .set({ profileCompleted: completed })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async createDocumentFeedback(feedbackData: { documentId: number; facultyId: number; feedback: string; rating?: number }): Promise<DocumentFeedback> {
    const result = await db
      .insert(documentFeedback)
      .values({
        ...feedbackData,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getDocumentFeedback(documentId: number): Promise<DocumentFeedback[]> {
    return db
      .select()
      .from(documentFeedback)
      .where(eq(documentFeedback.documentId, documentId))
      .orderBy(desc(documentFeedback.createdAt));
  }

  async getFacultyForStudent(studentId: number): Promise<User | undefined> {
    const allocation = await db
      .select()
      .from(facultyAllocations)
      .where(eq(facultyAllocations.studentId, studentId))
      .limit(1);

    if (!allocation[0]) return undefined;

    const faculty = await this.getUser(allocation[0].facultyId);
    return faculty;
  }

  async getDocumentsByCategory(userId: number, category: string): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.type, category as "offer_letter" | "monthly_report" | "attendance")
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  // Tech session methods
  async createTechSession(session: { 
    title: string; 
    description: string; 
    date: Date; 
    startTime: string; 
    endTime: string; 
    location: string; 
    facultyId: number;
    virtualMeetingLink?: string;
    capacity?: number;
    category?: string;
  }): Promise<TechSession> {
    const techSessionValues = {
      title: session.title,
      description: session.description,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      facultyId: session.facultyId,
      virtualMeetingLink: session.virtualMeetingLink || null,
      capacity: session.capacity || 30,
      category: (session.category || "other") as "web" | "ai" | "cloud" | "mobile" | "security" | "other",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled"
    };
    
    const result = await db.insert(techSessions)
      .values(techSessionValues)
      .returning();
    
    return result[0];
  }
  
  async getTechSession(id: number): Promise<TechSession | undefined> {
    const result = await db.select()
      .from(techSessions)
      .where(eq(techSessions.id, id))
      .limit(1);
      
    return result[0];
  }
  
  async getTechSessions(filters?: { status?: string; category?: string }): Promise<TechSession[]> {
    // Build conditions array
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(
        techSessions.status, 
        filters.status as "upcoming" | "ongoing" | "completed" | "cancelled"
      ));
    }
    
    if (filters?.category) {
      conditions.push(eq(
        techSessions.category, 
        filters.category as "web" | "ai" | "cloud" | "mobile" | "security" | "other"
      ));
    }
    
    // Apply all conditions at once
    const query = conditions.length > 0
      ? db.select().from(techSessions).where(and(...conditions))
      : db.select().from(techSessions);
    
    const result = await query.orderBy(desc(techSessions.date));
    return result as TechSession[];
  }
  
  async getTechSessionsByFaculty(facultyId: number): Promise<TechSession[]> {
    return await db.select()
      .from(techSessions)
      .where(eq(techSessions.facultyId, facultyId))
      .orderBy(desc(techSessions.date));
  }
  
  async updateTechSession(id: number, data: Partial<TechSession>): Promise<TechSession> {
    const result = await db.update(techSessions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(techSessions.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteTechSession(id: number): Promise<void> {
    // Delete all registrations first
    await db.delete(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, id));
      
    // Then delete the session
    await db.delete(techSessions)
      .where(eq(techSessions.id, id));
  }
  
  // Session registration methods
  async registerForSession(sessionId: number, studentId: number): Promise<SessionRegistration> {
    const result = await db.insert(sessionRegistrations)
      .values({
        sessionId,
        studentId,
        registeredAt: new Date(),
      })
      .returning();
      
    return result[0];
  }
  
  async cancelRegistration(sessionId: number, studentId: number): Promise<void> {
    await db.delete(sessionRegistrations)
      .where(
        and(
          eq(sessionRegistrations.sessionId, sessionId),
          eq(sessionRegistrations.studentId, studentId)
        )
      );
  }
  
  async getSessionRegistrations(sessionId: number): Promise<SessionRegistration[]> {
    return await db.select()
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, sessionId));
  }
  
  async getStudentRegistrations(studentId: number): Promise<SessionRegistration[]> {
    return await db.select()
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.studentId, studentId));
  }
}

export const storage = new DatabaseStorage();