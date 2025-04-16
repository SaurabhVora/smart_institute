import { Internship, InternshipFilters, InternshipApplication } from '@/types/internship';

const API_BASE_URL = '/api/internships';

export class InternshipService {
  static async getInternships(filters: Partial<InternshipFilters> = {}): Promise<{ internships: Internship[], total: number }> {
    try {
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
      if (filters.category && filters.category !== 'All Categories') queryParams.append('category', filters.category);
      if (filters.type && filters.type !== 'All Types') queryParams.append('type', filters.type);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const response = await fetch(`${API_BASE_URL}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching internships: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  }

  static async getInternshipById(id: number): Promise<Internship> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching internship: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching internship with id ${id}:`, error);
      throw error;
    }
  }

  static async createInternship(internshipData: Omit<Internship, 'id' | 'logo'>): Promise<Internship> {
    try {
      // Ensure skills is an array if it's a string
      const data = {
        ...internshipData,
        skills: Array.isArray(internshipData.skills) 
          ? internshipData.skills 
          : typeof internshipData.skills === 'string'
            ? (internshipData.skills as string).split(',').map((s: string) => s.trim())
            : [],
        // Ensure deadline is always a string
        deadline: String(internshipData.deadline)
      };
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Error creating internship: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  }

  static async updateInternship(id: number, internshipData: Partial<Internship>): Promise<Internship> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(internshipData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Error updating internship: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating internship with id ${id}:`, error);
      throw error;
    }
  }

  static async deleteInternship(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Error deleting internship: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting internship with id ${id}:`, error);
      throw error;
    }
  }

  // APPLICATION METHODS

  static async getStudentApplications(): Promise<InternshipApplication[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/student`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching applications: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching student applications:', error);
      throw error;
    }
  }

  static async getInternshipApplications(internshipId: number): Promise<InternshipApplication[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/${internshipId}/applications`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching internship applications: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching applications for internship ${internshipId}:`, error);
      throw error;
    }
  }

  static async getApplicationById(applicationId: number): Promise<InternshipApplication> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching application: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching application with id ${applicationId}:`, error);
      throw error;
    }
  }

  static async applyForInternship(internshipId: number, applicationData: FormData): Promise<InternshipApplication> {
    try {
      console.log('InternshipService - Applying for internship:', internshipId);
      
      // Log FormData contents
      console.log('InternshipService - FormData entries:');
      // Using Array.from to convert iterator to array for compatibility
      Array.from(applicationData.entries()).forEach(pair => {
        const [key, value] = pair;
        if (key === 'resume') {
          console.log('InternshipService - File:', key, value instanceof File ? 
            `${(value as File).name} (${(value as File).size} bytes)` : 
            'Not a file');
        } else {
          console.log('InternshipService - Data:', key, value);
        }
      });
      
      // Use FormData to send both application data and resume file
      const response = await fetch(`${API_BASE_URL}/${internshipId}/apply`, {
        method: 'POST',
        body: applicationData,
        credentials: 'include',
      });
      
      console.log('InternshipService - Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Error applying for internship: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('InternshipService - Error data:', errorData);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If not JSON, use text
          const textError = await response.text();
          console.log('InternshipService - Error text:', textError);
          errorMessage = textError || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('InternshipService - Success response:', result);
      return result;
    } catch (error) {
      console.error('InternshipService - Error applying for internship:', error);
      throw error;
    }
  }

  static async withdrawApplication(applicationId: number): Promise<InternshipApplication> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'withdrawn' }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error withdrawing application: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error withdrawing application with id ${applicationId}:`, error);
      throw error;
    }
  }

  static async updateApplicationStatus(
    applicationId: number, 
    status: 'accepted' | 'rejected', 
    feedback?: string
  ): Promise<InternshipApplication> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, feedback }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error updating application status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating status for application ${applicationId}:`, error);
      throw error;
    }
  }

  static async deleteApplication(applicationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting application: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting application with id ${applicationId}:`, error);
      throw error;
    }
  }

  static async getFacultyInternships(filters: Partial<InternshipFilters> = {}): Promise<{ internships: Internship[], total: number }> {
    try {
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
      if (filters.category && filters.category !== 'All Categories') queryParams.append('category', filters.category);
      if (filters.type && filters.type !== 'All Types') queryParams.append('type', filters.type);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const response = await fetch(`${API_BASE_URL}/faculty/my-internships?${queryParams}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching faculty internships: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching faculty internships:', error);
      throw error;
    }
  }
} 