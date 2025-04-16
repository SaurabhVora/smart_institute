import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDocument, useUpdateDocumentStatus } from "@/hooks/use-documents";
import Layout from "@/components/layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  Send, 
  Star, 
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentWithStudentName } from "@shared/schema";

export default function DocumentReviewPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/document-review/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<string>("5");
  const [status, setStatus] = useState<string>("");
  const documentId = params?.id ? parseInt(params.id) : null;

  // Redirect if not faculty
  useEffect(() => {
    if (user && user.role !== "faculty") {
      setLocation("/dashboard");
      toast({
        title: "Access Denied",
        description: "Only faculty members can access the document review page.",
        variant: "destructive"
      });
    }
  }, [user, setLocation, toast]);

  // Fetch document details using the enhanced hook
  const { data: document, isLoading: isLoadingDocument } = useDocument(documentId);

  // Fetch student details if studentName is not available
  const { data: student } = useQuery({
    queryKey: [`/api/users/${document?.userId}`],
    enabled: !!document?.userId && !document?.studentName
  });

  // Fetch existing feedback
  const { data: existingFeedback } = useQuery({
    queryKey: [`/api/documents/${documentId}/feedback`],
    enabled: !!documentId && user?.role === "faculty"
  });

  // Update document status mutation
  const updateStatusMutation = useUpdateDocumentStatus();

  // Set initial status from document
  useEffect(() => {
    if (document?.status) {
      setStatus(document.status);
    }
  }, [document]);

  const handleStatusUpdate = () => {
    if (!status) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive"
      });
      return;
    }
    
    updateStatusMutation.mutate({
      documentId: documentId!,
      status: status as any,
      feedback: feedback.trim() ? feedback : undefined
    });
  };

  const handleDownload = async (documentId: number) => {
    try {
      toast({
        title: "Downloading...",
        description: "Your document is being prepared for download.",
      });
      
      // Open the download URL directly in a new tab
      // This bypasses any CORS issues by letting the browser handle the redirect
      window.open(`/api/documents/${documentId}/download?t=${Date.now()}`, '_blank');
      
      toast({
        title: "Download initiated",
        description: "If the download doesn't start automatically, check your browser's popup settings.",
        variant: "default",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== "faculty") {
    return null;
  }

  if (isLoadingDocument) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-400">Loading document...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="p-6">
          <Card className="bg-[#0F1A2D] border-gray-800">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-white mb-2">Document Not Found</h2>
                <p className="text-gray-400 mb-6">
                  The document you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => setLocation("/dashboard")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Helper function to get status icon
  const getStatusIcon = (docStatus: string) => {
    switch (docStatus) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "under_review":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper function to get status text color
  const getStatusColor = (docStatus: string) => {
    switch (docStatus) {
      case "approved":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "under_review":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-4"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-white">Document Review</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Info */}
            <div className="lg:col-span-2">
              <Card className="bg-[#0F1A2D] border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-400" />
                        {document.type.replace('_', ' ')}
                      </CardTitle>
                      <CardDescription>
                        Submitted on {format(new Date(document.createdAt), "PPP")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(document.status)}
                      <span className={`ml-2 ${getStatusColor(document.status)}`}>
                        {document.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Document Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-800/30 rounded-lg">
                          <p className="text-sm text-gray-400">Filename</p>
                          <p className="text-white">{document.filename}</p>
                        </div>
                        <div className="p-3 bg-gray-800/30 rounded-lg">
                          <p className="text-sm text-gray-400">Version</p>
                          <p className="text-white">{document.version}</p>
                        </div>
                        {document.companyName && (
                          <div className="p-3 bg-gray-800/30 rounded-lg">
                            <p className="text-sm text-gray-400">Company</p>
                            <p className="text-white">{document.companyName}</p>
                          </div>
                        )}
                        {document.internshipDomain && (
                          <div className="p-3 bg-gray-800/30 rounded-lg">
                            <p className="text-sm text-gray-400">Domain</p>
                            <p className="text-white">{document.internshipDomain}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleDownload(document.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Document
                      </Button>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-white mb-4">Review Actions</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status" className="text-white mb-2 block">
                            Update Status
                          </Label>
                          <Select 
                            value={status} 
                            onValueChange={setStatus}
                          >
                            <SelectTrigger id="status" className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-end">
                          <Button 
                            onClick={handleStatusUpdate}
                            disabled={updateStatusMutation.isPending || status === document.status}
                            className="w-full"
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Update Status'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Info */}
            <div>
              <Card className="bg-[#0F1A2D] border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {document?.studentName ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="text-white">{document.studentName}</p>
                      </div>
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <p className="text-sm text-gray-400">Student ID</p>
                        <p className="text-white">{document.userId}</p>
                      </div>
                    </div>
                  ) : student ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="text-white">{student.name}</p>
                      </div>
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white">{student.email}</p>
                      </div>
                      {student.university && (
                        <div className="p-3 bg-gray-800/30 rounded-lg">
                          <p className="text-sm text-gray-400">University</p>
                          <p className="text-white">{student.university}</p>
                        </div>
                      )}
                      {student.department && (
                        <div className="p-3 bg-gray-800/30 rounded-lg">
                          <p className="text-sm text-gray-400">Department</p>
                          <p className="text-white">{student.department}</p>
                        </div>
                      )}
                      {student.year && (
                        <div className="p-3 bg-gray-800/30 rounded-lg">
                          <p className="text-sm text-gray-400">Year</p>
                          <p className="text-white">{student.year}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">Loading student information...</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#0F1A2D] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Document Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button asChild className="w-full">
                    <a href={`/api/documents/${document.id}/view`} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      View Document
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mt-6">
            <Card className="bg-[#0F1A2D] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Feedback</CardTitle>
                <CardDescription>
                  Provide feedback on this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="add-feedback">
                  <TabsList className="bg-gray-800">
                    <TabsTrigger value="add-feedback">Add Feedback</TabsTrigger>
                    <TabsTrigger value="previous-feedback">Previous Feedback</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="add-feedback" className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="feedback" className="text-white mb-2 block">
                          Your Feedback
                        </Label>
                        <Textarea
                          id="feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Enter your feedback for the student"
                          className="min-h-32"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <Label htmlFor="rating" className="text-white mb-2 block">
                            Rating
                          </Label>
                          <Select 
                            value={rating} 
                            onValueChange={setRating}
                          >
                            <SelectTrigger id="rating">
                              <SelectValue placeholder="Rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Poor</SelectItem>
                              <SelectItem value="2">2 - Fair</SelectItem>
                              <SelectItem value="3">3 - Good</SelectItem>
                              <SelectItem value="4">4 - Very Good</SelectItem>
                              <SelectItem value="5">5 - Excellent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="md:col-span-3 flex items-end">
                          <Button 
                            onClick={() => handleStatusUpdate()}
                            disabled={updateStatusMutation.isPending || !feedback}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Feedback
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="previous-feedback" className="pt-4">
                    {existingFeedback && existingFeedback.length > 0 ? (
                      <div className="space-y-4">
                        {existingFeedback.map((item: any) => (
                          <div key={item.id} className="p-4 bg-gray-800/30 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-white font-medium">Feedback from {item.facultyName || "Faculty"}</p>
                                <p className="text-sm text-gray-400">
                                  {format(new Date(item.createdAt), "PPP")}
                                </p>
                              </div>
                              <div className="flex items-center">
                                {Array.from({ length: item.rating || 0 }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                ))}
                                {Array.from({ length: 5 - (item.rating || 0) }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-gray-600" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{item.feedback}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-8">No feedback has been provided yet.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 