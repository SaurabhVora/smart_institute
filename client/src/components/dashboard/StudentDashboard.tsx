import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileText, FileArchive, Laptop, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ProfileCompletion } from "@/components/profile-completion";
import { FacultyMentorCard } from "@/components/faculty-mentor-card";
import { StudentDashboardProps } from "./types";
import { formatDate } from "./utils";

export function StudentDashboard({ documents }: StudentDashboardProps) {
  const { toast } = useToast();
  
  const handleDownload = async (documentId: number) => {
    try {
      toast({
        title: "Downloading...",
        description: "Your document is being prepared for download.",
      });
      
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

  // Get the most recent 3 documents
  const recentDocuments = documents ? 
    [...documents].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 3) : 
    [];

  return (
    <div className="space-y-6">
      <ProfileCompletion key="profile-completion" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                My Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-4">
                <div className="bg-gray-800/40 rounded-xl p-6 w-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-2">Documents Submitted</h3>
                    <div className="text-3xl font-bold text-blue-400">{documents?.length || 0}</div>
                    <p className="text-sm text-gray-400 mt-2">
                      {documents?.filter(d => d.status === "approved").length || 0} approved
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Documents Section */}
          {recentDocuments.length > 0 && (
            <Card className="mt-6 bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-400" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="bg-gray-800/40 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">
                          {doc.filename}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <span className="capitalize">{doc.type?.replace(/_/g, ' ') || 'Unknown'}</span>
                          <span>•</span>
                          <span>{formatDate(doc.createdAt)}</span>
                          <span>•</span>
                          <span className="capitalize">{doc.status?.replace(/_/g, ' ') || 'Unknown'}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        onClick={() => handleDownload(doc.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Link href="/documents">
                      <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                        View All Documents
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <FacultyMentorCard />
        </div>
      </div>

      {/* Document Management Card */}
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-blue-500/20 p-4 rounded-full">
              <FileText className="h-12 w-12 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Document Management</h2>
              <p className="text-gray-300 mb-4">
                All document-related features have been moved to the Documents section. 
                Click the button below to manage your documents.
              </p>
              <Link href="/documents">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FileArchive className="mr-2 h-4 w-4" />
                  Go to Documents
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Sessions Card */}
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-purple-500/20 p-4 rounded-full">
              <Laptop className="h-12 w-12 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Tech Sessions</h2>
              <p className="text-gray-300 mb-4">
                Explore technical sessions, workshops, and seminars hosted by faculty members. Register for upcoming sessions.
              </p>
              <Link href="/tech-sessions">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Laptop className="mr-2 h-4 w-4" />
                  Browse Tech Sessions
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Card */}
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-indigo-500/20 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Resources</h2>
              <p className="text-gray-300 mb-4">
                Share educational resources and learning materials with students. Manage and organize study materials.
              </p>
              <Link href="/resources">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Resources
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 