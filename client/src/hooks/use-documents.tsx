import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { useToast } from "./use-toast";

// Type for document feedback
export type DocumentFeedback = {
  id: number;
  documentId: number;
  facultyId: number;
  feedback: string;
  rating?: number;
  createdAt: string;
  faculty?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
};

// Type for faculty mentor
export type FacultyMentor = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  expertise?: string;
};

// Hook to fetch all documents
export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      return response.json();
    },
  });
}

// Hook to fetch documents by category
export function useDocumentsByCategory(category: string) {
  return useQuery<Document[]>({
    queryKey: ["/api/documents/category", category],
    queryFn: async () => {
      const response = await fetch(`/api/documents/category/${category}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} documents`);
      }
      return response.json();
    },
    enabled: !!category,
  });
}

// Hook to fetch document feedback
export function useDocumentFeedback(documentId: number | undefined) {
  return useQuery<DocumentFeedback[]>({
    queryKey: ["/api/documents/feedback", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID is required");
      
      const response = await fetch(`/api/documents/${documentId}/feedback`);
      if (!response.ok) {
        throw new Error("Failed to fetch document feedback");
      }
      return response.json();
    },
    enabled: !!documentId,
  });
}

// Hook to add document feedback (for faculty)
export function useAddDocumentFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      feedback, 
      rating 
    }: { 
      documentId: number; 
      feedback: string; 
      rating?: number 
    }) => {
      const response = await fetch(`/api/documents/${documentId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback, rating }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add feedback");
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/feedback", variables.documentId] });
      toast({
        title: "Feedback Added",
        description: "Your feedback has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook to fetch faculty mentor information
export function useFacultyMentor() {
  return useQuery<FacultyMentor>({
    queryKey: ["/api/student/mentor"],
    queryFn: async () => {
      const response = await fetch("/api/student/mentor");
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch mentor information");
      }
      const data = await response.json();
      return data.mentor; // Extract the mentor object from the response
    },
  });
}

// Hook to get a single document by ID
export function useDocument(documentId: number | undefined) {
  return useQuery({
    queryKey: [`/api/documents/${documentId}`],
    queryFn: async () => {
      if (!documentId) return null;
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      return response.json();
    },
    enabled: !!documentId,
    refetchInterval: 5000, // Refetch every 5 seconds to get latest status
  });
}

// Hook to update document status (for faculty and admin)
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      status,
      feedback
    }: { 
      documentId: number; 
      status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
      feedback?: string;
    }) => {
      const response = await fetch(`/api/documents/${documentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, feedback }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update document status");
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate all document-related queries to ensure UI is updated everywhere
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/category"] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${variables.documentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/faculty-review"] });
      
      // Force a refetch of all document queries
      queryClient.refetchQueries({ queryKey: ["/api/documents"] });
      
      const statusText = variables.status.replace('_', ' ');
      toast({
        title: "Status Updated",
        description: `Document status changed to ${statusText}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
} 