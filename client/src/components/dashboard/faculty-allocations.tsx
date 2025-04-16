import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, UserPlus, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  useAllocations, 
  useUnallocatedStudents, 
  useFacultyWorkloads,
  useCreateAllocation,
  useAutoAllocateStudent,
  useBulkAutoAllocate
} from "@/hooks/use-allocations";

export function FacultyAllocations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("allocated");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  
  // Queries
  const { data: allocations = [] } = useAllocations();
  const { data: unallocatedStudents = [] } = useUnallocatedStudents();
  const { data: facultyWorkloads = [] } = useFacultyWorkloads();
  
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Student Allocations</CardTitle>
        <CardDescription>
          Manage student allocations and mentorship assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="allocated" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="allocated">
                <Users className="mr-2 h-4 w-4" />
                My Students
              </TabsTrigger>
              <TabsTrigger value="unallocated">
                <UserPlus className="mr-2 h-4 w-4" />
                Unallocated Students
              </TabsTrigger>
              <TabsTrigger value="workload">
                <RefreshCw className="mr-2 h-4 w-4" />
                Faculty Workload
              </TabsTrigger>
            </TabsList>

            {activeTab === "unallocated" && unallocatedStudents.length > 0 && (
              <Button 
                onClick={handleBulkAutoAllocate}
                disabled={bulkAutoAllocateMutation.isPending}
              >
                {bulkAutoAllocateMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Auto-Allocate All
                  </>
                )}
              </Button>
            )}
          </div>

          {/* My Allocated Students Tab */}
          <TabsContent value="allocated">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">Student {allocation.studentId}</TableCell>
                      <TableCell>student{allocation.studentId}@example.com</TableCell>
                      <TableCell>
                        <Badge variant="outline">{allocation.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Unallocated Students Tab */}
          <TabsContent value="unallocated">
            {unallocatedStudents.length === 0 ? (
              <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-green-500/20 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-green-500/5">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
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
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unallocatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManualAllocate(student.id)}
                            disabled={createAllocationMutation.isPending}
                          >
                            Allocate to Me
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAutoAllocate(student.id)}
                            disabled={autoAllocateStudentMutation.isPending}
                          >
                            Auto-Allocate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Faculty Workload Tab */}
          <TabsContent value="workload">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Students Allocated</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyWorkloads.map((faculty) => (
                  <TableRow key={faculty.facultyId}>
                    <TableCell className="font-medium">
                      {faculty.name}
                      {faculty.facultyId === user?.id && " (You)"}
                    </TableCell>
                    <TableCell>{faculty.studentCount}</TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className={`h-2.5 rounded-full ${
                            faculty.studentCount >= 10 
                              ? 'bg-red-600' 
                              : faculty.studentCount >= 7 
                                ? 'bg-yellow-400' 
                                : 'bg-green-600'
                          }`} 
                          style={{ width: `${(faculty.studentCount / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {faculty.studentCount}/10 students
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {currentStudentCount}/10 students allocated to you
        </div>
      </CardFooter>
    </Card>
  );
} 