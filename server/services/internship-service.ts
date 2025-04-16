import { db } from '../db';
import { internships, type Internship, type InsertInternship } from '../../shared/schema';
import { eq, and, or, like, inArray, desc, asc, sql } from 'drizzle-orm';

export interface InternshipFilters {
  type?: 'Full-time' | 'Part-time';
  category?: string;
  skills?: string[];
  search?: string;
  sortBy?: 'deadline' | 'stipend';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class InternshipService {
  async createInternship(data: InsertInternship, userId: number): Promise<Internship> {
    try {
      // Generate logo URL using UI Avatars API
      const logo = `https://ui-avatars.com/api/?name=${data.company.charAt(0)}&background=0D8ABC&color=fff`;
      
      // Ensure skills is an array
      const skills = Array.isArray(data.skills) ? data.skills : [];
      
      // Ensure deadline is a string and remove any timestamp formatting
      const deadline = String(data.deadline).trim();
      
      const [internship] = await db.insert(internships)
        .values({
          ...data,
          skills,
          logo,
          deadline,
          createdBy: userId,
        })
        .returning();
      
      return internship;
    } catch (error) {
      throw error;
    }
  }

  async getInternships(filters: InternshipFilters = {}): Promise<{ internships: Internship[]; total: number }> {
    const {
      type,
      category,
      skills,
      search,
      sortBy = 'deadline',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    // Build query conditions
    const conditions = [];
    if (type) conditions.push(eq(internships.type, type));
    if (category) conditions.push(eq(internships.category, category));
    if (skills?.length) conditions.push(inArray(internships.skills, skills));
    if (search) {
      conditions.push(
        or(
          like(internships.title, `%${search}%`),
          like(internships.company, `%${search}%`),
          like(internships.description, `%${search}%`)
        )
      );
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(internships)
      .where(and(...conditions));

    // Get paginated results
    const offset = (page - 1) * limit;
    const internshipsList = await db
      .select()
      .from(internships)
      .where(and(...conditions))
      .orderBy(sortOrder === 'desc' ? desc(internships[sortBy]) : asc(internships[sortBy]))
      .limit(limit)
      .offset(offset);

    return {
      internships: internshipsList,
      total: Number(count),
    };
  }

  async getInternship(id: number): Promise<Internship | null> {
    const [internship] = await db
      .select()
      .from(internships)
      .where(eq(internships.id, id))
      .limit(1);
    
    return internship || null;
  }

  async updateInternship(id: number, data: Partial<InsertInternship>): Promise<Internship | null> {
    const [internship] = await db
      .update(internships)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(internships.id, id))
      .returning();
    
    return internship || null;
  }

  async deleteInternship(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(internships)
      .where(eq(internships.id, id))
      .returning();
    
    return !!deleted;
  }

  async getInternshipsByFaculty(facultyId: number, filters: InternshipFilters = {}): Promise<{ internships: Internship[]; total: number }> {
    const {
      type,
      category,
      skills,
      search,
      sortBy = 'deadline',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    // Build query conditions
    const conditions = [eq(internships.createdBy, facultyId)]; // Always filter by faculty ID
    
    if (type) conditions.push(eq(internships.type, type));
    if (category) conditions.push(eq(internships.category, category));
    if (skills?.length) conditions.push(inArray(internships.skills, skills));
    if (search) {
      conditions.push(
        or(
          like(internships.title, `%${search}%`),
          like(internships.company, `%${search}%`),
          like(internships.description, `%${search}%`)
        )
      );
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(internships)
      .where(and(...conditions));

    // Get paginated results
    const offset = (page - 1) * limit;
    const internshipsList = await db
      .select()
      .from(internships)
      .where(and(...conditions))
      .orderBy(sortOrder === 'desc' ? desc(internships[sortBy]) : asc(internships[sortBy]))
      .limit(limit)
      .offset(offset);

    return {
      internships: internshipsList,
      total: Number(count),
    };
  }
}

// Export a singleton instance
export const internshipService = new InternshipService(); 