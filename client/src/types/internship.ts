import { ReactNode } from "react";

export type InternshipType = 'Full-time' | 'Part-time';

export type InternshipCategory = 
  | 'Web Development'
  | 'Mobile Development'
  | 'Data Science'
  | 'Machine Learning'
  | 'Cloud Computing'
  | 'Cybersecurity'
  | 'UI/UX Design'
  | 'DevOps'
  | 'Blockchain'
  | 'Other';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  stipend: string;
  deadline: string;
  skills: string[];
  description: string;
  logo: string;
  type: InternshipType;
  category: InternshipCategory;
}

export interface InternshipApplication {
  degreeProgram: ReactNode;
  phone: ReactNode;
  semester: ReactNode;
  id: number;
  internshipId: number;
  studentId: number;
  status: ApplicationStatus;
  appliedDate: string;
  updatedDate: string;
  resume: string;
  coverLetter?: string;
  feedback?: string;
  internship?: Internship; // For joined data
}

export interface InternshipFilters {
  searchQuery: string;
  category: string;
  type: string;
  sortBy: string;
  page: number;
  limit: number;
}

export interface InternshipStats {
  totalOpportunities: number;
  totalCategories: number;
  lastUpdated: Date;
} 