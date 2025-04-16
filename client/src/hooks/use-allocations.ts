import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

type Student = {
  id: number;
  name: string;
  email: string | null;
};

type FacultyWorkload = {
  facultyId: number;
  name: string;
  studentCount: number;
};

type Allocation = {
  id: number;
  facultyId: number;
  studentId: number;
  status: string;
  student?: {
    id: number;
    name: string;
    email: string | null;
    department: string | null;
  } | null;
};

type AllocationResult = {
  success: boolean;
  message: string;
  allocation?: Allocation;
  result?: {
    success: number;
    failed: number;
  };
};

/**
 * Hook to get all allocations for the current user
 */
export function useAllocations() {
  return useQuery<Allocation[]>({
    queryKey: ["/api/allocations"],
  });
}

/**
 * Hook to get all unallocated students
 */
export function useUnallocatedStudents() {
  return useQuery<Student[]>({
    queryKey: ["/api/allocations/unallocated-students"],
  });
}

/**
 * Hook to get faculty workloads
 */
export function useFacultyWorkloads() {
  return useQuery<FacultyWorkload[]>({
    queryKey: ["/api/allocations/faculty-workloads"],
  });
}

/**
 * Hook to create a manual allocation
 */
export function useCreateAllocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ facultyId, studentId }: { facultyId: number; studentId: number }) => {
      const res = await fetch("/api/allocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ facultyId, studentId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create allocation");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/unallocated-students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/faculty-workloads"] });
      toast({
        title: "Success",
        description: "Student allocated successfully",
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

/**
 * Hook to auto-allocate a student
 */
export function useAutoAllocateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (studentId: number) => {
      const res = await fetch(`/api/allocations/auto-allocate/${studentId}`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to auto-allocate student");
      }

      return res.json() as Promise<AllocationResult>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/unallocated-students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/faculty-workloads"] });
      toast({
        title: "Student Allocated",
        description: data.message || "Student auto-allocated successfully",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Allocation Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });
}

/**
 * Hook to bulk auto-allocate all unallocated students
 */
export function useBulkAutoAllocate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/allocations/bulk-allocate", {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to bulk auto-allocate students");
      }

      return res.json() as Promise<AllocationResult>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/unallocated-students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/faculty-workloads"] });
      toast({
        title: "Students Allocated",
        description: data.message || "Students auto-allocated successfully",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk Allocation Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });
} 