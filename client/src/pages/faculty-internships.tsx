import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { FacultyInternshipManager } from "@/components/internships/FacultyInternshipManager";
import { useToast } from "@/hooks/use-toast";
import { useInternships } from "@/hooks/use-internships";
import { Redirect } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function FacultyInternshipsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    internships, 
    isLoading, 
    error,
    createInternship,
    deleteInternship,
    updateInternship,
    getInternshipApplications,
    updateApplicationStatus
  } = useInternships();

  // Only faculty and admin can access this page
  if (user && user.role !== "faculty" && user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const handleCreateInternship = async (data: any) => {
    try {
      // This will be replaced with actual API call in the backend implementation
      await createInternship(data);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleUpdateInternship = async (id: number, data: any) => {
    try {
      await updateInternship(id, data);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleDeleteInternship = async (id: number) => {
    try {
      // This will be replaced with actual API call in the backend implementation
      await deleteInternship(id);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleGetApplications = async (internshipId: number) => {
    try {
      const applications = await getInternshipApplications(internshipId);
      return applications;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: number,
    status: 'accepted' | 'rejected',
    feedback?: string
  ) => {
    try {
      await updateApplicationStatus(applicationId, status, feedback);
      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6 text-white">Manage Your Internships</h1>
        
        <Alert className="mb-4 bg-blue-900/20 border-blue-700 text-blue-200">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertTitle>Faculty View</AlertTitle>
          <AlertDescription>
            You are viewing internships that you created. Faculty members can only manage their own internships.
          </AlertDescription>
        </Alert>
        
        <FacultyInternshipManager
          internships={internships}
          isLoading={isLoading}
          error={error}
          onCreateInternship={handleCreateInternship}
          onUpdateInternship={handleUpdateInternship}
          onDeleteInternship={handleDeleteInternship}
          onGetApplications={handleGetApplications}
          onUpdateApplicationStatus={handleUpdateApplicationStatus}
        />
      </div>
    </Layout>
  );
} 