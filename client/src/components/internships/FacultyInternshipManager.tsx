import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Loader2,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { InternshipCreationForm } from "./InternshipCreationForm";
import { Internship, InternshipApplication } from "@/types/internship";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extended type for applications with user data
interface ApplicationWithUser extends InternshipApplication {
  student?: {
    name: string;
    email: string;
  }
}

interface FacultyInternshipManagerProps {
  internships: Internship[];
  isLoading: boolean;
  error: string | null;
  onCreateInternship: (data: any) => Promise<void>;
  onDeleteInternship: (id: number) => Promise<void>;
  onUpdateInternship: (id: number, data: any) => Promise<void>;
  onGetApplications?: (internshipId: number) => Promise<ApplicationWithUser[]>;
  onUpdateApplicationStatus?: (applicationId: number, status: 'accepted' | 'rejected', feedback?: string) => Promise<void>;
}

export function FacultyInternshipManager({
  internships,
  isLoading,
  error,
  onCreateInternship,
  onDeleteInternship,
  onUpdateInternship,
  onGetApplications,
  onUpdateApplicationStatus,
}: FacultyInternshipManagerProps) {
  const { toast } = useToast();
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [internshipToEdit, setInternshipToEdit] = useState<Internship | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "deadline" | "title">("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApplicationsDialogOpen, setIsApplicationsDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [feedbackText, setFeedbackText] = useState('');
  const [applicationToUpdate, setApplicationToUpdate] = useState<number | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Filter and sort internships
  const filteredInternships = internships
    .filter(internship => 
      internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return b.id - a.id;
      } else if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  const handleCreateInternship = async (data: any) => {
    try {
      await onCreateInternship(data);
      setIsCreationModalOpen(false);
      toast({
        title: "Success",
        description: "Internship created successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create internship",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (internship: Internship) => {
    setInternshipToEdit(internship);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    if (!internshipToEdit) return;
    
    try {
      await onUpdateInternship(internshipToEdit.id, data);
      setIsEditModalOpen(false);
      setInternshipToEdit(null);
      toast({
        title: "Success",
        description: "Internship updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update internship",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setInternshipToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (internshipToDelete === null) return;
    
    setIsDeleting(true);
    try {
      await onDeleteInternship(internshipToDelete);
      toast({
        title: "Success",
        description: "Internship deleted successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete internship",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setInternshipToDelete(null);
    }
  };

  const handleViewApplications = async (internship: Internship) => {
    if (!onGetApplications) return;
    
    setSelectedInternship(internship);
    setIsApplicationsDialogOpen(true);
    setIsLoadingApplications(true);
    setApplicationError(null);
    
    try {
      const appData = await onGetApplications(internship.id);
      setApplications(appData);
    } catch (error) {
      setApplicationError('Failed to load applications');
      toast({
        title: "Error",
        description: "Could not load applications for this internship",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    if (!onUpdateApplicationStatus) return;
    
    setApplicationToUpdate(applicationId);
    setIsUpdatingStatus(true);
    
    try {
      await onUpdateApplicationStatus(applicationId, 'accepted', feedbackText || undefined);
      
      // Update the application in the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'accepted', feedback: feedbackText || app.feedback } 
            : app
        )
      );
      
      setFeedbackText('');
      toast({
        title: "Success",
        description: "Application accepted successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept application",
        variant: "destructive",
      });
    } finally {
      setApplicationToUpdate(null);
      setIsUpdatingStatus(false);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    if (!onUpdateApplicationStatus) return;
    
    setApplicationToUpdate(applicationId);
    setIsUpdatingStatus(true);
    
    try {
      await onUpdateApplicationStatus(applicationId, 'rejected', feedbackText || undefined);
      
      // Update the application in the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'rejected', feedback: feedbackText || app.feedback } 
            : app
        )
      );
      
      setFeedbackText('');
      toast({
        title: "Success",
        description: "Application rejected successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setApplicationToUpdate(null);
      setIsUpdatingStatus(false);
    }
  };

  // Filter applications based on status
  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  );

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="bg-[#1E293B] border-gray-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-xl">Manage Internships</CardTitle>
          <Button 
            onClick={() => setIsCreationModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search internships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#162032] border-gray-700 text-white"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1E293B] border-gray-700 text-white">
                <DropdownMenuItem 
                  onClick={() => setSortBy("newest")}
                  className={sortBy === "newest" ? "bg-blue-500/20" : ""}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("deadline")}
                  className={sortBy === "deadline" ? "bg-blue-500/20" : ""}
                >
                  Deadline (Soonest)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortBy("title")}
                  className={sortBy === "title" ? "bg-blue-500/20" : ""}
                >
                  Title (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-gray-400">Loading internships...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-500/10 text-red-400 p-4 rounded-lg max-w-md mx-auto">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Internship List */}
          {!isLoading && !error && (
            <>
              {filteredInternships.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-[#162032] rounded-lg p-6 max-w-md mx-auto border border-gray-700">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No internships found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery 
                        ? "No internships match your search criteria" 
                        : "You haven't created any internships yet"}
                    </p>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        className="border-gray-700 text-gray-300"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInternships.map((internship) => (
                    <Card 
                      key={internship.id} 
                      className="bg-[#162032] border-gray-700 hover:border-blue-500/30 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Logo */}
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-700">
                            <img 
                              src={internship.logo} 
                              alt={internship.company} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className="text-lg font-medium text-white">{internship.title}</h3>
                              <div className="flex items-center gap-2">
                                <Badge className={`
                                  ${internship.type === 'Full-time' 
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}
                                `}>
                                  {internship.type}
                                </Badge>
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  {internship.category}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-400 text-sm mb-2">
                              <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                              {internship.company}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-sm">
                              <div className="flex items-center text-gray-400">
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                {internship.location}
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                Due: {new Date(internship.deadline).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-green-400">
                                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                                {internship.stipend}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {internship.skills.slice(0, 4).map((skill) => (
                                <Badge 
                                  key={skill} 
                                  variant="outline" 
                                  className="bg-blue-500/10 text-blue-300 border-blue-500/20"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {internship.skills.length > 4 && (
                                <Badge variant="outline" className="bg-gray-500/10 text-gray-300 border-gray-500/20">
                                  +{internship.skills.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex md:flex-col gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => handleViewApplications(internship)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Applications
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              onClick={() => handleEditClick(internship)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDeleteClick(internship.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      <InternshipCreationForm
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onSubmit={handleCreateInternship}
      />

      {/* Edit Modal */}
      <InternshipCreationForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setInternshipToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        initialData={internshipToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1E293B] border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the internship
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Applications Dialog */}
      <Dialog open={isApplicationsDialogOpen} onOpenChange={setIsApplicationsDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-gray-700 text-white sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applications for {selectedInternship?.title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review and manage applications for this internship position
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-[#162032] border border-gray-700">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="accepted" 
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300"
                  onClick={() => setStatusFilter('accepted')}
                >
                  Accepted
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected" 
                  className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300"
                  onClick={() => setStatusFilter('rejected')}
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
              <div className="text-gray-400 text-sm">
                Total: {applications.length} applications
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {isLoadingApplications ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
                  <p className="text-gray-400">Loading applications...</p>
                </div>
              ) : applicationError ? (
                <div className="text-center py-8">
                  <div className="bg-red-500/10 text-red-400 p-4 rounded-lg max-w-md mx-auto">
                    <p>{applicationError}</p>
                  </div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-[#162032] rounded-lg p-6 max-w-md mx-auto border border-gray-700">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
                    <p className="text-gray-400">
                      {statusFilter === 'all' 
                        ? "No one has applied to this internship yet" 
                        : `No ${statusFilter} applications for this internship`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="bg-[#162032] border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-medium text-white">
                                  {application.student?.name || `Student ${application.studentId}`}
                                </h3>
                                {renderStatusBadge(application.status)}
                              </div>
                              <p className="text-gray-400 text-sm">
                                {application.student?.email || "No email available"}
                              </p>
                            </div>
                            <p className="text-sm text-gray-400">
                              Applied: {application.appliedDate 
                                ? new Date(application.appliedDate).toLocaleDateString() 
                                : "Unknown date"}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Phone</p>
                              <p className="text-white">{application.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Semester</p>
                              <p className="text-white">{application.semester}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Degree Program</p>
                              <p className="text-white">{application.degreeProgram}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Resume</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                onClick={() => window.open(`/api/internships/applications/${application.id}/resume`, '_blank')}
                              >
                                View Resume
                              </Button>
                            </div>
                          </div>

                          {application.coverLetter && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Cover Letter</p>
                              <p className="text-white bg-[#1E293B] p-3 rounded-md border border-gray-700 text-sm">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}

                          {application.feedback && (
                            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
                              <p className="text-sm text-gray-300 mb-1 font-medium">Your Feedback:</p>
                              <p className="text-sm text-gray-300">{application.feedback}</p>
                            </div>
                          )}

                          {application.status === 'pending' && (
                            <>
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Provide Feedback (Optional)</p>
                                <Textarea 
                                  placeholder="Enter feedback for the applicant..."
                                  className="bg-[#1E293B] border-gray-700 text-white min-h-[80px]"
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleRejectApplication(application.id)}
                                  disabled={isUpdatingStatus && applicationToUpdate === application.id}
                                >
                                  {isUpdatingStatus && applicationToUpdate === application.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Rejecting...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleAcceptApplication(application.id)}
                                  disabled={isUpdatingStatus && applicationToUpdate === application.id}
                                >
                                  {isUpdatingStatus && applicationToUpdate === application.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Accepting...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              {/* Same content as "all" tab but filtered for pending */}
            </TabsContent>
            
            <TabsContent value="accepted" className="mt-0">
              {/* Same content as "all" tab but filtered for accepted */}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-0">
              {/* Same content as "all" tab but filtered for rejected */}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setIsApplicationsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 