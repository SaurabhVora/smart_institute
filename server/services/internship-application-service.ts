import { db } from '../db';
import { internshipApplications, users, internships, type InternshipApplication, type InsertInternshipApplication } from '../../shared/schema';
import { eq, and, or, desc, asc } from 'drizzle-orm';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import { UPLOADS_DIR, ensureUploadDirs } from '../utils/file-utils';
import { createStorageService } from './storage-service';

// Create a storage service based on the environment configuration
const storageService = createStorageService();

export class InternshipApplicationService {
  async createApplication(
    data: any,  // Use the correct type from schema
    studentId: number, 
    resumeFile: Express.Multer.File
  ): Promise<any> {  // Return the correct type
    try {
      console.log('Creating application for student:', studentId);
      console.log('Application data:', data);
      console.log('Resume file:', {
        originalname: resumeFile.originalname,
        mimetype: resumeFile.mimetype,
        size: resumeFile.size
      });
      
      // Get original filename from the upload
      const originalFilename = resumeFile.originalname;
      console.log('Original filename:', originalFilename);
      
      // Store the file with its original name to ensure it's preserved
      const timestamp = Date.now();
      // Use original filename directly, just prefix with timestamp and sanitize any path separators
      const safeFilename = originalFilename.replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `${timestamp}-${safeFilename}`;
      const fileKey = `resumes/${filename}`;
      
      console.log('Saving resume to storage with key:', fileKey);
      
      // Save file using storage service (S3 or local)
      const resumePath = await storageService.saveFile(fileKey, resumeFile.buffer, resumeFile.mimetype);
      
      // Insert application into database
      const [application] = await db.insert(internshipApplications)
        .values({
          ...data,
          studentId,
          resumePath, // This will be either an S3 key or a local path
          status: 'pending',
        })
        .returning();
      
      console.log('Application inserted into database:', application);
      
      return application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async getStudentApplications(studentId: number): Promise<Array<InternshipApplication & { internship?: any }>> {
    try {
      // Get applications with internship details for a student
      const applications = await db
        .select({
          application: internshipApplications,
          internship: internships,
        })
        .from(internshipApplications)
        .leftJoin(internships, eq(internshipApplications.internshipId, internships.id))
        .where(eq(internshipApplications.studentId, studentId))
        .orderBy(desc(internshipApplications.appliedAt));
      
      // Format the result to match the expected structure
      return applications.map(({ application, internship }) => ({
        ...application,
        internship,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getApplicationById(id: number): Promise<any | null> {
    try {
      // Get application with internship and student details
      const [result] = await db
        .select({
          application: internshipApplications,
          internship: internships,
          student: users,
        })
        .from(internshipApplications)
        .leftJoin(internships, eq(internshipApplications.internshipId, internships.id))
        .leftJoin(users, eq(internshipApplications.studentId, users.id))
        .where(eq(internshipApplications.id, id))
        .limit(1);
      
      if (!result) return null;
      
      // Format result with mapped fields
      const studentData = result.student ? { ...result.student } : undefined;
      if (studentData) {
        delete (studentData as any).password;
      }
      
      return {
        ...result.application,
        appliedDate: result.application.appliedAt, // Map appliedAt to appliedDate for frontend
        updatedDate: result.application.updatedAt, // Map updatedAt to updatedDate for frontend
        internship: result.internship,
        student: studentData,
      };
    } catch (error) {
      throw error;
    }
  }

  async getApplicationsForInternship(internshipId: number): Promise<any[]> {
    try {
      // Get all applications for an internship with student details
      const applications = await db
        .select({
          application: internshipApplications,
          student: users,
        })
        .from(internshipApplications)
        .leftJoin(users, eq(internshipApplications.studentId, users.id))
        .where(eq(internshipApplications.internshipId, internshipId))
        .orderBy(desc(internshipApplications.appliedAt));
      
      // Format the result and remove sensitive student data
      return applications.map(({ application, student }) => {
        const studentData = student ? { ...student } : undefined;
        if (studentData) {
          delete (studentData as any).password;
        }
        
        // Map backend field names to frontend field names
        return {
          ...application,
          appliedDate: application.appliedAt, // Map appliedAt to appliedDate for frontend
          updatedDate: application.updatedAt, // Map updatedAt to updatedDate for frontend
          student: studentData,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async updateApplicationStatus(id: number, status: 'pending' | 'accepted' | 'rejected' | 'withdrawn', feedback?: string): Promise<InternshipApplication | null> {
    try {
      const [application] = await db
        .update(internshipApplications)
        .set({
          status,
          feedback: feedback || undefined,
          updatedAt: new Date(),
        })
        .where(eq(internshipApplications.id, id))
        .returning();
      
      return application || null;
    } catch (error) {
      throw error;
    }
  }

  async getResumeUrl(resumePath: string): Promise<string> {
    try {
      console.log('Getting URL for resume path:', resumePath);
      
      // If the path starts with /uploads, it's a local storage path from an older record
      // Convert it to the format expected by the storage service
      if (resumePath.startsWith('/uploads/')) {
        // For local storage, keep as is
        // For S3, extract just the filename portion
        if (process.env.STORAGE_TYPE === 's3') {
          const filename = resumePath.split('/').pop();
          resumePath = `resumes/${filename}`;
          console.log('Converted old path to S3 key:', resumePath);
        }
      }
      
      return await storageService.getFileUrl(resumePath);
    } catch (error) {
      console.error('Error getting resume URL:', error);
      throw error;
    }
  }

  async deleteApplication(id: number): Promise<boolean> {
    try {
      // Get the application to find the resume path
      const [application] = await db
        .select()
        .from(internshipApplications)
        .where(eq(internshipApplications.id, id))
        .limit(1);
      
      if (!application) return false;
      
      // Delete the resume file if it exists
      if (application.resumePath) {
        try {
          await storageService.deleteFile(application.resumePath);
        } catch (error) {
          console.error('Error deleting resume file:', error);
          // Continue with deleting the application even if file deletion fails
        }
      }
      
      // Delete the application from the database
      const [deleted] = await db
        .delete(internshipApplications)
        .where(eq(internshipApplications.id, id))
        .returning();
      
      return !!deleted;
    } catch (error) {
      throw error;
    }
  }
}

// Export a singleton instance
export const internshipApplicationService = new InternshipApplicationService(); 