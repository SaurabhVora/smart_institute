import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TechSession, SessionRegistration } from "@shared/schema";
import { useToast } from "./use-toast";

// Get all tech sessions
export function useTechSessions(filters?: { status?: string; category?: string }) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.category) queryParams.append("category", filters.category);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  return useQuery<TechSession[]>({
    queryKey: [`/api/tech-sessions${queryString}`],
  });
}

// Get tech sessions created by the faculty
export function useFacultyTechSessions() {
  return useQuery<TechSession[]>({
    queryKey: ["/api/tech-sessions/my-sessions"],
  });
}

// Get a specific tech session by ID
export function useTechSession(id?: string) {
  return useQuery({
    queryKey: ['tech-session', id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/tech-sessions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tech session');
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!id,
  });
}

// Create a new tech session
export function useCreateTechSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      virtualMeetingLink?: string;
      capacity?: number;
      category?: string;
    }) => {
      const res = await apiRequest("POST", "/api/tech-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tech-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tech-sessions/my-sessions"] });
      toast({
        title: "Session Created",
        description: "Your tech session has been created successfully! 🎉",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create tech session: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Update a tech session
export function useUpdateTechSession(id: number | string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: Partial<TechSession>) => {
      const res = await apiRequest("PUT", `/api/tech-sessions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tech-sessions/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tech-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tech-sessions/my-sessions"] });
      toast({
        title: "Success",
        description: "Tech session updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update tech session: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Delete a tech session
export function useDeleteTechSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number | string) => {
      await apiRequest("DELETE", `/api/tech-sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tech-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tech-sessions/my-sessions"] });
      toast({
        title: "Success",
        description: "Tech session deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete tech session: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Register for a tech session
export function useRegisterForSession(sessionId: number | string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tech-sessions/${sessionId}/register`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tech-sessions/${sessionId}`] });
      toast({
        title: "Registration Confirmed",
        description: "You've successfully registered for the tech session! 📚",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to register for tech session: ${error.message}`,
        variant: "destructive"
      });
    },
  });
}

// Cancel registration for a tech session
export function useCancelRegistration(sessionId: number | string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tech-sessions/${sessionId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tech-sessions/${sessionId}`] });
      toast({
        title: "Registration Cancelled",
        description: "You've cancelled your registration for this session.",
        variant: "info"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to cancel registration: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Get registrations for a tech session
export function useSessionRegistrations(sessionId: number | string) {
  return useQuery<(SessionRegistration & {
    studentName?: string;
    studentEmail?: string;
    studentDepartment?: string;
    studentYear?: string;
  })[]>({
    queryKey: [`/api/tech-sessions/${sessionId}/registrations`],
    enabled: !!sessionId,
  });
} 