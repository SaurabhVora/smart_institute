import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useDocuments, useDocumentsByCategory, useDocumentFeedback, useUpdateDocumentStatus, useAddDocumentFeedback, useDocument } from "@/hooks/use-documents";
import { Document } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/dashboard/file-upload";
import { Loader2, FileText, FolderOpen, Upload, Download, Eye, MessageSquare, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Layout from "@/components/layout";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Status badge component with appropriate colors
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusDetails = () => {
    switch (status) {
      case "draft":
        return { color: "bg-gray-500", text: "Draft" };
      case "submitted":
        return { color: "bg-blue-500", text: "Submitted" };
      case "under_review":
        return { color: "bg-yellow-500", text: "Under Review" };
      case "approved":
        return { color: "bg-green-500", text: "Approved" };
      case "rejected":
        return { color: "bg-red-500", text: "Rejected" };
      default:
        return { color: "bg-gray-500", text: "Unknown" };
    }
  };

  const { color, text } = getStatusDetails();

  return (
    <Badge className={`${color} hover:${color} text-white`}>
      {text}
    </Badge>
  );
};

// Document details dialog component
const DocumentDetailsDialog = ({ document, onClose }: { document: Document; onClose: () => void }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: feedbackList, isLoading: loadingFeedback } = useDocumentFeedback(document.id);
  const updateStatusMutation = useUpdateDocumentStatus();
  const addFeedbackMutation = useAddDocumentFeedback();
  const [newFeedback, setNewFeedback] = useState("");
  const [newRating, setNewRating] = useState<number>(5);
  const { toast } = useToast();
  
  // Fetch the latest document data using our enhanced hook
  const { data: latestDocument } = useDocument(document.id);
  
  // Use the latest document data if available
  const currentDocument = latestDocument || document;
  
  const canUpdateStatus = user?.role === "faculty";
  const currentStatus = currentDocument.status || "draft";
  
  const handleStatusUpdate = (newStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected') => {
    updateStatusMutation.mutate({
      documentId: currentDocument.id,
      status: newStatus,
      feedback: newFeedback.trim() ? newFeedback : undefined
    });
  };
  
  const handleAddFeedback = () => {
    if (!newFeedback.trim()) return;
    
    addFeedbackMutation.mutate({
      documentId: currentDocument.id,
      feedback: newFeedback,
      rating: newRating
    }, {
      onSuccess: () => {
        setNewFeedback("");
      }
    });
  };
  
  const handleDownloadInDialog = async (documentId: number) => {
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
  
  return (
    <Dialog open={!!document} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Document Details</DialogTitle>
          <DialogDescription className="text-gray-400">
            View document information and feedback
          </DialogDescription>
        </DialogHeader>
        
        {loadingFeedback ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-white">File Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">Filename:</span>
                <span className="text-white">{currentDocument.filename}</span>
                
                <span className="text-gray-400">Category:</span>
                <span className="text-white capitalize">{currentDocument.type.replace("_", " ")}</span>
                
                <span className="text-gray-400">Uploaded:</span>
                <span className="text-white">{new Date(currentDocument.createdAt).toLocaleString()}</span>
                
                <span className="text-gray-400">Status:</span>
                <StatusBadge status={currentDocument.status || "draft"} />
                
                {currentDocument.companyName && (
                  <>
                    <span className="text-gray-400">Company:</span>
                    <span className="text-white">{currentDocument.companyName}</span>
                  </>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 bg-blue-900/20 border-blue-800 hover:bg-blue-800/30 text-blue-400"
                onClick={() => handleDownloadInDialog(currentDocument.id)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download Document
              </Button>
            </div>
            
            {canUpdateStatus && (
              <div className="space-y-2">
                <h4 className="font-medium text-white">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['draft', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={currentStatus === status ? "default" : "outline"}
                      className={`
                        ${currentStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-gray-300 hover:text-white'}
                        capitalize
                      `}
                      onClick={() => handleStatusUpdate(status as any)}
                      disabled={updateStatusMutation.isPending || currentStatus === status}
                    >
                      {status.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium text-white">Feedback History</h4>
              {loadingFeedback && (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
              
              {feedbackList && feedbackList.length === 0 && (
                <p className="text-sm text-gray-400">No feedback available for this document</p>
              )}
              
              {feedbackList && feedbackList.length > 0 && (
                <div className="space-y-3">
                  {feedbackList.map((feedback) => (
                    <div key={feedback.id} className="rounded-md border border-gray-700 p-3 text-sm bg-gray-800/40">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-white">{feedback.faculty?.name || "Faculty"}</p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {feedback.rating && (
                          <Badge variant="outline" className="ml-auto border-blue-800 text-blue-400">
                            Rating: {feedback.rating}/5
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300">{feedback.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {user?.role === "faculty" && (
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <h4 className="font-medium text-white">Add Feedback</h4>
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Enter your feedback here..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Rating:</span>
                      <Select value={newRating.toString()} onValueChange={(val) => setNewRating(parseInt(val))}>
                        <SelectTrigger className="w-20 bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue placeholder="5" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-gray-700 text-white">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddFeedback}
                      disabled={addFeedbackMutation.isPending || !newFeedback.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {addFeedbackMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Feedback"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Document card component
const DocumentCard = ({ document }: { document: Document }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const updateStatusMutation = useUpdateDocumentStatus();
  
  const handleSubmit = () => {
    updateStatusMutation.mutate({
      documentId: document.id,
      status: "submitted"
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
  
  return (
    <>
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-white text-lg truncate">{document.filename}</CardTitle>
              <CardDescription className="text-gray-400">
                {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
              </CardDescription>
            </div>
            <StatusBadge status={document.status || "draft"} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-400">
              <FileText className="h-4 w-4 mr-2 text-blue-400" />
              <span className="capitalize">{document.type.replace("_", " ")}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-blue-900/20 border-blue-800 hover:bg-blue-800/30 text-blue-400"
                onClick={() => handleDownload(document.id)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-blue-900/20 border-blue-800 hover:bg-blue-800/30 text-blue-400"
                onClick={() => setShowDetails(true)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              {user?.role === "student" && (document.status === "draft" || !document.status) && (
                <Button 
                  size="sm" 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSubmit}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Submit
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showDetails && (
        <DocumentDetailsDialog 
          document={document} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </>
  );
};

// Category section component
const CategorySection = ({ title, description, category }: { title: string; description: string; category: string }) => {
  const { data: documents, isLoading, error } = useDocumentsByCategory(category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {documents && documents.length > 0 && (
          <Badge className="bg-blue-600">{documents.length}</Badge>
        )}
      </div>
      <p className="text-sm text-gray-400">{description}</p>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">
          Error loading documents
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-800/40 rounded-lg border border-gray-700">
          <FolderOpen className="h-12 w-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No documents in this category</p>
        </div>
      )}
    </div>
  );
};

// Main Documents Page
const DocumentsPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: allDocuments, isLoading } = useDocuments();

  // Auto-refresh documents every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/category"] });
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [queryClient]);

  useEffect(() => {
    if (user && !["student", "faculty", "admin"].includes(user.role)) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  // Render skeleton loaders during loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Documents</h1>
          
          {user && (user.role === "admin" || user.role === "faculty") && (
            <div className="mb-6">
              <Button 
                onClick={() => setIsAddDocumentDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Document
              </Button>
            </div>
          )}
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-[#1E293B] border-b border-gray-800 w-full justify-start mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#0F172A]">All</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-[#0F172A]">Pending</TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-[#0F172A]">Approved</TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-[#0F172A]">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <DocumentSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <DocumentSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="approved" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <DocumentSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <DocumentSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-8 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-blue-400" />
          Document Management
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-gray-800/50 border border-gray-700 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">All Documents</TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:bg-blue-600">By Category</TabsTrigger>
                <TabsTrigger value="status" className="data-[state=active]:bg-blue-600">By Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">All Documents</CardTitle>
                    <CardDescription>View and manage all your submitted documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : allDocuments && allDocuments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {allDocuments.map((doc) => (
                          <DocumentCard key={doc.id} document={doc} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-800/40 rounded-lg border border-gray-700">
                        <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No Documents Yet</h3>
                        <p className="text-gray-400 mb-4">You haven't uploaded any documents yet.</p>
                        <p className="text-gray-400">Use the upload form to submit your first document.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories" className="mt-0">
                <div className="space-y-8">
                  <CategorySection 
                    title="Offer Letters" 
                    description="Company offer letters and acceptance documents" 
                    category="offer_letter" 
                  />
                  <CategorySection 
                    title="Monthly Reports" 
                    description="Monthly progress and activity reports" 
                    category="monthly_report" 
                  />
                  <CategorySection 
                    title="Attendance Records" 
                    description="Daily or weekly attendance sheets" 
                    category="attendance" 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="status" className="mt-0">
                <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Documents by Status</CardTitle>
                    <CardDescription>View your documents organized by their current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : allDocuments && allDocuments.length > 0 ? (
                      <div className="space-y-8">
                        {["draft", "submitted", "under_review", "approved", "rejected"].map(status => {
                          const docsWithStatus = allDocuments.filter(doc => (doc.status || "draft") === status);
                          if (docsWithStatus.length === 0) return null;
                          
                          return (
                            <div key={status} className="space-y-4">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-white capitalize mr-2">
                                  {status.replace("_", " ")}
                                </h3>
                                <StatusBadge status={status} />
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {docsWithStatus.map(doc => (
                                  <DocumentCard key={doc.id} document={doc} />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-800/40 rounded-lg border border-gray-700">
                        <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No Documents Yet</h3>
                        <p className="text-gray-400">You haven't uploaded any documents yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-400" />
                  Upload Document
                </CardTitle>
                <CardDescription>Submit a new document for review</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentsPage; 