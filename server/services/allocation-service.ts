import { db } from "../db";
import { documents, facultyAllocations, users } from "../../shared/schema";
import { eq, and, inArray, or, count, sql } from "drizzle-orm";
import { FacultyAllocation } from "../../shared/schema";

// Maximum number of students a faculty can supervise
const MAX_STUDENTS_PER_FACULTY = 10;

/**
 * Service for handling automatic faculty allocation based on priority rules
 */
export class AllocationService {
  /**
   * Automatically allocate a student to a faculty based on priority rules:
   * 1. Same faculty's internship
   * 2. Same company/internship domain as other students
   * 3. Faculty with fewest students
   */
  async allocateStudent(studentId: number): Promise<FacultyAllocation | null> {
    // First check if student is already allocated
    const existingAllocation = await db
      .select()
      .from(facultyAllocations)
      .where(eq(facultyAllocations.studentId, studentId));

    if (existingAllocation.length > 0) {
      return existingAllocation[0];
    }

    // Get student's offer letter to check company and internship domain
    const offerLetter = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, studentId),
          eq(documents.type, "offer_letter"),
          eq(documents.status, "approved")
        )
      );

    // Priority 1: Check if student is doing internship under a faculty
    if (offerLetter.length > 0 && offerLetter[0].companyName) {
      // Find faculty members who work at the same company
      const facultyAtCompany = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, "faculty"),
            eq(users.companyName, offerLetter[0].companyName)
          )
        );

      if (facultyAtCompany.length > 0) {
        // Check if any of these faculty members have capacity
        for (const faculty of facultyAtCompany) {
          const facultyStudentCount = await this.getFacultyStudentCount(faculty.id);
          if (facultyStudentCount < MAX_STUDENTS_PER_FACULTY) {
            return this.createAllocation(faculty.id, studentId);
          }
        }
      }
    }

    // Priority 2: Check if other students from same company are allocated to a faculty
    if (offerLetter.length > 0 && offerLetter[0].companyName) {
      // Find other students with the same company
      const studentsFromSameCompany = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.type, "offer_letter"),
            eq(documents.status, "approved"),
            eq(documents.companyName, offerLetter[0].companyName),
            sql`${documents.userId} != ${studentId}`
          )
        );

      if (studentsFromSameCompany.length > 0) {
        // Get their faculty allocations
        const studentIds = studentsFromSameCompany.map(doc => doc.userId);
        const allocations = await db
          .select()
          .from(facultyAllocations)
          .where(inArray(facultyAllocations.studentId, studentIds));

        if (allocations.length > 0) {
          // Group by faculty and count students
          const facultyCounts = new Map<number, number>();
          for (const allocation of allocations) {
            const count = facultyCounts.get(allocation.facultyId) || 0;
            facultyCounts.set(allocation.facultyId, count + 1);
          }

          // Find faculty with capacity
          for (const [facultyId, count] of facultyCounts.entries()) {
            const totalCount = await this.getFacultyStudentCount(facultyId);
            if (totalCount < MAX_STUDENTS_PER_FACULTY) {
              return this.createAllocation(facultyId, studentId);
            }
          }
        }
      }
    }

    // Priority 3: Assign to faculty with fewest students
    const facultyWorkloads = await this.getFacultyWorkloads();
    
    // Sort by number of students (ascending)
    facultyWorkloads.sort((a, b) => a.studentCount - b.studentCount);
    
    // Find first faculty with capacity
    for (const faculty of facultyWorkloads) {
      if (faculty.studentCount < MAX_STUDENTS_PER_FACULTY) {
        return this.createAllocation(faculty.facultyId, studentId);
      }
    }

    // No faculty with capacity found
    return null;
  }

  /**
   * Get the number of students allocated to a faculty
   */
  async getFacultyStudentCount(facultyId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(facultyAllocations)
      .where(
        and(
          eq(facultyAllocations.facultyId, facultyId),
          eq(facultyAllocations.status, "active")
        )
      );
    
    return result[0]?.count || 0;
  }

  /**
   * Get workload information for all faculty members
   */
  async getFacultyWorkloads(): Promise<{ facultyId: number; name: string; studentCount: number }[]> {
    const facultyMembers = await db
      .select()
      .from(users)
      .where(eq(users.role, "faculty"));
    
    const workloads = [];
    
    for (const faculty of facultyMembers) {
      const studentCount = await this.getFacultyStudentCount(faculty.id);
      workloads.push({
        facultyId: faculty.id,
        name: faculty.name,
        studentCount
      });
    }
    
    return workloads;
  }

  /**
   * Create a new faculty-student allocation
   */
  private async createAllocation(facultyId: number, studentId: number): Promise<FacultyAllocation> {
    const result = await db
      .insert(facultyAllocations)
      .values({
        facultyId,
        studentId,
        status: "active"
      })
      .returning();
    
    return result[0];
  }

  /**
   * Get all students eligible for allocation (not yet allocated)
   */
  async getUnallocatedStudents(): Promise<{ id: number; name: string; email: string | null }[]> {
    // Get all student users
    const students = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(eq(users.role, "student"));
    
    // Get all allocated students
    const allocatedStudents = await db
      .select({
        studentId: facultyAllocations.studentId
      })
      .from(facultyAllocations);
    
    const allocatedIds = new Set(allocatedStudents.map(a => a.studentId));
    
    // Filter out already allocated students
    return students.filter(student => !allocatedIds.has(student.id));
  }

  /**
   * Bulk allocate all unallocated students
   */
  async bulkAllocateStudents(): Promise<{ success: number; failed: number }> {
    const unallocatedStudents = await this.getUnallocatedStudents();
    let success = 0;
    let failed = 0;
    
    for (const student of unallocatedStudents) {
      const allocation = await this.allocateStudent(student.id);
      if (allocation) {
        success++;
      } else {
        failed++;
      }
    }
    
    return { success, failed };
  }
}

// Export a singleton instance
export const allocationService = new AllocationService(); 