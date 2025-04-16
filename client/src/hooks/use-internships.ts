import { useState, useCallback, useMemo, useEffect } from 'react';
import { Internship, InternshipFilters, InternshipApplication, ApplicationStatus } from '@/types/internship';
import { InternshipService } from '@/services/internship.service';
import { useAuth } from './use-auth';
import { useToast } from '@/hooks/use-toast';

const defaultFilters: InternshipFilters = {
  searchQuery: '',
  category: 'All Categories',
  type: 'All Types',
  sortBy: 'deadline'
};

export function useInternships() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<InternshipFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  // State for internships
  const [internships, setInternships] = useState<Internship[]>([]);
  const [totalInternships, setTotalInternships] = useState(0);

  // Fetch internships whenever filters change
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let result;
        
        // Use different endpoints based on user role
        if (user?.role === 'faculty') {
          // Faculty users only get their own internships
          console.log('useInternships - Fetching faculty-specific internships');
          result = await InternshipService.getFacultyInternships(filters);
        } else {
          // Students and others get all public internships
          console.log('useInternships - Fetching all internships');
          result = await InternshipService.getInternships(filters);
        }
        
        setInternships(result.internships);
        setTotalInternships(result.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch internships');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to fetch internships',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternships();
  }, [filters, toast, user?.role]);

  // Fetch student applications if user is a student
  useEffect(() => {
    const fetchStudentApplications = async () => {
      if (!user || user.role !== 'student') return;
      
      try {
        console.log('useInternships - Fetching applications for student:', user.id);
        setIsLoadingApplications(true);
        setApplicationError(null);
        
        const studentApplications = await InternshipService.getStudentApplications();
        console.log('useInternships - Fetched applications:', studentApplications);
        setApplications(studentApplications);
      } catch (err) {
        console.error('useInternships - Error fetching applications:', err);
        setApplicationError(err instanceof Error ? err.message : 'Failed to fetch applications');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to fetch applications',
          variant: "destructive",
        });
      } finally {
        setIsLoadingApplications(false);
      }
    };

    fetchStudentApplications();
  }, [user, toast]);

  const updateFilters = useCallback((newFilters: Partial<InternshipFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Apply for an internship
  const applyForInternship = useCallback(async (internshipId: number, applicationData: any) => {
    if (!user) {
      setError('You must be logged in to apply');
      return Promise.reject('You must be logged in to apply');
    }
    
    try {
      console.log('useInternships - Applying with ID:', internshipId);
      console.log('useInternships - Application data:', applicationData);
      
      setIsLoading(true);
      setError(null);
      
      // Prepare FormData with application details and resume file
      const formData = new FormData();
      
      // Add all field data to FormData
      Object.keys(applicationData).forEach(key => {
        if (key === 'resume') {
          // Add the resume file
          if (applicationData.resume instanceof File) {
            console.log('useInternships - Adding resume file:', applicationData.resume.name);
            formData.append('resume', applicationData.resume);
          } else {
            console.log('useInternships - No valid resume file found in application data');
          }
        } else {
          // Add other fields
          console.log(`useInternships - Adding field ${key}:`, applicationData[key]);
          formData.append(key, applicationData[key]);
        }
      });
      
      // Add internship ID to form data
      formData.append('internshipId', internshipId.toString());
      console.log('useInternships - Added internshipId to form data:', internshipId);
      
      // Submit the application
      const newApplication = await InternshipService.applyForInternship(internshipId, formData);
      console.log('useInternships - Application response:', newApplication);
      
      // Add the application to the state with internship details
      const internship = internships.find(i => i.id === internshipId);
      if (internship) {
        setApplications(prev => [...prev, {
          ...newApplication,
          internship
        }]);
        console.log('useInternships - Updated applications state');
      } else {
        console.log('useInternships - Could not find internship with ID:', internshipId);
      }
      
      return Promise.resolve(newApplication);
    } catch (err) {
      console.error('useInternships - Application error:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply for internship');
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [internships, user]);

  // Withdraw an application
  const withdrawApplication = useCallback(async (applicationId: number) => {
    try {
      setIsLoadingApplications(true);
      setApplicationError(null);
      
      const updatedApplication = await InternshipService.withdrawApplication(applicationId);
      
      // Update the application in state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? updatedApplication : app
        )
      );
      
      return Promise.resolve();
    } catch (err) {
      setApplicationError(err instanceof Error ? err.message : 'Failed to withdraw application');
      return Promise.reject(err);
    } finally {
      setIsLoadingApplications(false);
    }
  }, []);
  
  // Get applications for a specific internship (for faculty)
  const getInternshipApplications = useCallback(async (internshipId: number) => {
    if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
      return Promise.reject('Unauthorized');
    }
    
    try {
      setIsLoadingApplications(true);
      setApplicationError(null);
      
      const internshipApplications = await InternshipService.getInternshipApplications(internshipId);
      return Promise.resolve(internshipApplications);
    } catch (err) {
      setApplicationError(err instanceof Error ? err.message : 'Failed to fetch applications');
      return Promise.reject(err);
    } finally {
      setIsLoadingApplications(false);
    }
  }, [user]);
  
  // Update application status (for faculty)
  const updateApplicationStatus = useCallback(async (
    applicationId: number, 
    status: 'accepted' | 'rejected',
    feedback?: string
  ) => {
    if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
      return Promise.reject('Unauthorized');
    }
    
    try {
      setIsLoadingApplications(true);
      setApplicationError(null);
      
      const updatedApplication = await InternshipService.updateApplicationStatus(
        applicationId, 
        status, 
        feedback
      );
      
      return Promise.resolve(updatedApplication);
    } catch (err) {
      setApplicationError(err instanceof Error ? err.message : 'Failed to update application');
      return Promise.reject(err);
    } finally {
      setIsLoadingApplications(false);
    }
  }, [user]);

  // Create a new internship
  const createInternship = useCallback(async (internshipData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newInternship = await InternshipService.createInternship(internshipData);
      
      setInternships(prev => [...prev, newInternship]);
      toast({
        title: "Success",
        description: "Internship created successfully",
      });
      
      return Promise.resolve(newInternship);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create internship';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update internship
  const updateInternship = useCallback(async (id: number, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedInternship = await InternshipService.updateInternship(id, data);
      setInternships(prev => prev.map(internship => 
        internship.id === id ? updatedInternship : internship
      ));
      toast({
        title: "Success",
        description: "Internship updated successfully",
      });
      return updatedInternship;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update internship';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Delete an internship
  const deleteInternship = useCallback(async (internshipId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await InternshipService.deleteInternship(internshipId);
      
      setInternships(prev => prev.filter(internship => internship.id !== internshipId));
      toast({
        title: "Success",
        description: "Internship deleted successfully",
      });
      
      return Promise.resolve();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete internship';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Calculate statistics for display
  const stats = useMemo(() => {
    const categories = new Set(internships.map(i => i.category));
    
    return {
      totalOpportunities: internships.length,
      totalCategories: categories.size,
      lastUpdated: new Date(),
    };
  }, [internships]);

  return {
    // Internship data and operations
    internships,
    totalInternships,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    createInternship,
    updateInternship,
    deleteInternship,
    stats,
    
    // Application data and operations
    applications,
    isLoadingApplications,
    applicationError,
    applyForInternship,
    withdrawApplication,
    getInternshipApplications,
    updateApplicationStatus,
  };
} 