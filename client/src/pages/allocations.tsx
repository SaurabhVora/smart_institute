import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { FacultyAllocations } from "@/components/dashboard/faculty-allocations";
import { motion } from "framer-motion";
import { UserPlus, Users, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { 
  useAllocations, 
  useUnallocatedStudents, 
  useFacultyWorkloads,
  useCreateAllocation,
  useAutoAllocateStudent,
  useBulkAutoAllocate
} from "@/hooks/use-allocations";
import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function AllocationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("allocated");

  // Redirect non-faculty users
  React.useEffect(() => {
    if (!authLoading && user && user.role !== "faculty") {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  // Queries
  const { data: allocations = [], isLoading: allocationsLoading } = useAllocations();
  const { data: unallocatedStudents = [], isLoading: studentsLoading } = useUnallocatedStudents();
  const { data: facultyWorkloads = [], isLoading: workloadsLoading } = useFacultyWorkloads();
  
  // Mutations
  const createAllocationMutation = useCreateAllocation();
  const autoAllocateStudentMutation = useAutoAllocateStudent();
  const bulkAutoAllocateMutation = useBulkAutoAllocate();

  // Get current faculty workload
  const currentFacultyWorkload = facultyWorkloads.find(f => f.facultyId === user?.id);
  const currentStudentCount = currentFacultyWorkload?.studentCount || 0;
  const isAtCapacity = currentStudentCount >= 10;

  // Handle auto allocation of a single student
  const handleAutoAllocate = async (studentId: number) => {
    try {
      await autoAllocateStudentMutation.mutateAsync(studentId);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  // Handle bulk auto allocation
  const handleBulkAutoAllocate = async () => {
    try {
      await bulkAutoAllocateMutation.mutateAsync();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  // Handle manual allocation
  const handleManualAllocate = async (studentId: number) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Faculty ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAllocationMutation.mutateAsync({
        facultyId: user.id,
        studentId,
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  // Show loading state or nothing if not faculty
  if (authLoading || !user || user.role !== "faculty") {
    return null;
  }

  const isLoading = allocationsLoading || studentsLoading || workloadsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Student Allocations</h1>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6"
      >
        {/* Header with gradient border */}
        <Card className="mb-6 bg-[#0F172A] border-gray-800 overflow-hidden">
          <motion.div 
            className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
          />
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-blue-500" />
                  Student Allocations
                </CardTitle>
                <CardDescription>
                  Manage student allocations and mentorship assignments
                </CardDescription>
              </div>
              {activeTab === "unallocated" && unallocatedStudents.length > 0 && (
                <Button 
                  onClick={handleBulkAutoAllocate}
                  disabled={bulkAutoAllocateMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-green-500/20 transition-all duration-200 flex items-center gap-2"
                >
                  {bulkAutoAllocateMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span>Auto-Allocate All Students</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="allocated" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0F172A] border-gray-800">
            <TabsTrigger value="allocated" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4" />
              My Students
            </TabsTrigger>
            <TabsTrigger value="unallocated" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <UserPlus className="h-4 w-4" />
              Unallocated Students
            </TabsTrigger>
            <TabsTrigger value="workload" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <RefreshCw className="h-4 w-4" />
              Faculty Workload
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* My Allocated Students Tab */}
              <TabsContent value="allocated" className="space-y-4">
                <Card className="bg-[#0F172A] border-gray-800">
                  <CardContent className="pt-6">
                    {allocations.length === 0 ? (
                      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-blue-500/20 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-blue-500/5">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">No students allocated</h3>
                          <p className="text-gray-400 max-w-md">
                            You don't have any students allocated to you yet. Go to the "Unallocated Students" tab to allocate students.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-6 border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                            onClick={() => setActiveTab("unallocated")}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            View Unallocated Students
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-blue-500/20 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">My Allocated Students</h3>
                                <p className="text-sm text-gray-400">Currently mentoring {allocations.length} student{allocations.length !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <Badge 
                              className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1"
                            >
                              {allocations.length}/10 Capacity
                            </Badge>
                          </div>
                        </div>
                        <div className="rounded-lg overflow-hidden border border-gray-800">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-800 bg-gray-900/50">
                                <TableHead className="text-gray-400 font-semibold select-none">Student Name</TableHead>
                                <TableHead className="text-gray-400 font-semibold select-none">Email</TableHead>
                                <TableHead className="text-gray-400 font-semibold select-none">Department</TableHead>
                                <TableHead className="text-gray-400 font-semibold select-none">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allocations.map((allocation) => (
                                <TableRow 
                                  key={allocation.id}
                                  className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                                >
                                  <TableCell className="font-medium text-white">
                                    {allocation.student?.name || `Student ${allocation.studentId}`}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {allocation.student?.email || `student${allocation.studentId}@example.com`}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {allocation.student?.department || "Not specified"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={`${
                                        allocation.status === 'active' 
                                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                      } hover:bg-opacity-20 transition-colors`}
                                    >
                                      {allocation.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Unallocated Students Tab */}
              <TabsContent value="unallocated" className="space-y-4">
                <Card className="bg-[#0F172A] border-gray-800">
                  <CardContent className="pt-6">
                    {unallocatedStudents.length === 0 ? (
                      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-green-500/20 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-green-500/5">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-pulse">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">All students allocated</h3>
                          <p className="text-gray-400 max-w-md">
                            All students have been successfully allocated to faculty mentors.
                            The allocation process is complete.
                          </p>
                          <div className="mt-6 flex items-center justify-center space-x-2">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <div 
                                key={i} 
                                className={`h-2 w-2 rounded-full bg-green-500 opacity-70 animate-pulse`}
                                style={{ animationDelay: `${i * 150}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : isAtCapacity ? (
                      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-amber-500/20 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-amber-500/5">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Maximum capacity reached</h3>
                          <p className="text-gray-400 max-w-md">
                            You have reached the maximum number of students (10) that can be allocated to you.
                            Please contact an administrator if you need to increase your capacity.
                          </p>
                          <div className="mt-6 w-full max-w-xs">
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                              <div className="bg-amber-500 h-2 rounded-full w-full"></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                              <span>0</span>
                              <span className="text-amber-500 font-medium">10/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-800">
                            <TableHead className="text-gray-400">Student Name</TableHead>
                            <TableHead className="text-gray-400">Email</TableHead>
                            <TableHead className="text-gray-400">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unallocatedStudents.map((student) => (
                            <TableRow 
                              key={student.id}
                              className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                            >
                              <TableCell className="font-medium text-white">{student.name}</TableCell>
                              <TableCell className="text-gray-300">{student.email}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
                                    size="sm"
                                    onClick={() => handleManualAllocate(student.id)}
                                    disabled={createAllocationMutation.isPending}
                                  >
                                    {createAllocationMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Allocating...
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Allocate to Me
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-indigo-500/20 transition-all duration-200"
                                    size="sm"
                                    onClick={() => handleAutoAllocate(student.id)}
                                    disabled={autoAllocateStudentMutation.isPending}
                                  >
                                    {autoAllocateStudentMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Auto-Allocating...
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Auto-Allocate
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Faculty Workload Tab */}
              <TabsContent value="workload" className="space-y-4">
                <Card className="bg-[#0F172A] border-gray-800">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-indigo-500/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                              <RefreshCw className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">Faculty Workload Distribution</h3>
                              <p className="text-sm text-gray-400">Overview of student allocations across faculty members</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-800">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-gray-800 bg-gray-900/50">
                              <TableHead className="text-gray-400 font-semibold">Faculty Name</TableHead>
                              <TableHead className="text-gray-400 font-semibold">Students Allocated</TableHead>
                              <TableHead className="text-gray-400 font-semibold w-1/3">Capacity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {facultyWorkloads.map((faculty) => (
                              <TableRow 
                                key={faculty.facultyId}
                                className={`border-b border-gray-800 hover:bg-gray-900/50 transition-colors ${
                                  faculty.facultyId === user?.id ? 'bg-blue-500/5' : ''
                                }`}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-white">{faculty.name}</span>
                                    {faculty.facultyId === user?.id && (
                                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-semibold text-white">{faculty.studentCount}</span>
                                    <span className="text-gray-500">/</span>
                                    <span className="text-gray-500">10</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <div className="w-full bg-gray-800 rounded-full h-2.5">
                                      <div 
                                        className={`h-2.5 rounded-full transition-all duration-500 ${
                                          faculty.studentCount >= 10 
                                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                            : faculty.studentCount >= 7 
                                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                              : 'bg-gradient-to-r from-green-500 to-green-600'
                                        }`}
                                        style={{ width: `${(faculty.studentCount / 10) * 100}%` }}
                                      />
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className={`${
                                        faculty.studentCount >= 10 
                                          ? 'text-red-400' 
                                          : faculty.studentCount >= 7 
                                            ? 'text-yellow-400'
                                            : 'text-green-400'
                                      }`}>
                                        {(faculty.studentCount / 10) * 100}% Capacity
                                      </span>
                                      <span className="text-gray-500">
                                        {faculty.studentCount >= 10 
                                          ? 'Full'
                                          : faculty.studentCount >= 7
                                            ? 'Near Capacity'
                                            : 'Available'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </motion.div>
    </Layout>
  );
} 