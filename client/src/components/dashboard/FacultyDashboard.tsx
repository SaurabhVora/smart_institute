import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, Laptop, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCompletion } from "@/components/profile-completion";
import { FacultyDashboardProps } from "./types";
import { formatDate } from "./utils";

export function FacultyDashboard({ documents, allocations }: FacultyDashboardProps) {
  // Get the most recent documents for the activity feed
  const recentDocuments = documents ? 
    [...documents].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 5) : 
    [];

  return (
    <div className="space-y-6">
      <ProfileCompletion />
      
      <Card className="bg-[#0F1A2D] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-lg font-medium text-white">Assigned Students</h3>
              <p className="text-sm text-gray-400 mt-1">{allocations?.length || 0}</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-lg font-medium text-white">Pending Reviews</h3>
              <p className="text-sm text-gray-400 mt-1">
                {documents?.filter(d => d.status === "under_review").length || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-lg font-medium text-white">Completed Resources</h3>
              <p className="text-sm text-gray-400 mt-1">
                {documents?.filter(d => d.status === "approved" || d.status === "rejected").length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities Section */}
      <Card className="bg-[#0F1A2D] border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Recent Activities</CardTitle>
          <Link href="/reviews">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-gray-800 text-blue-400 hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 transition-all duration-200 group flex items-center gap-2"
            >
              View All
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentDocuments.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center p-3 bg-gray-800/30 rounded-lg">
                  {doc.status === "approved" && <CheckCircle className="h-4 w-4 text-green-500 mr-3" />}
                  {doc.status === "rejected" && <XCircle className="h-4 w-4 text-red-500 mr-3" />}
                  {doc.status === "under_review" && <Clock className="h-4 w-4 text-yellow-500 mr-3" />}
                  {doc.status === "submitted" && <FileText className="h-4 w-4 text-blue-500 mr-3" />}
                  {doc.status === "draft" && <FileText className="h-4 w-4 text-gray-500 mr-3" />}
                  
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <p className="text-sm text-white">{doc.type?.replace('_', ' ') || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <Link href={`/document-review/${doc.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
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
                Create and manage technical sessions for students. Schedule new sessions and track attendance.
              </p>
              <Link href="/tech-sessions">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Laptop className="mr-2 h-4 w-4" />
                  Manage Tech Sessions
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

      {/* Student Allocation Card */}
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-emerald-500/20 p-4 rounded-full">
              <Users className="h-12 w-12 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Student Allocation</h2>
              <p className="text-gray-300 mb-4">
                View and manage your allocated students. Track their progress and provide guidance for their projects.
              </p>
              <Link href="/allocations">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Users className="mr-2 h-4 w-4" />
                  View Allocations
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Review Card */}
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-amber-500/20 p-4 rounded-full">
              <FileText className="h-12 w-12 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Document Review</h2>
              <p className="text-gray-300 mb-4">
                Review and provide feedback on student documents. Track submission status and manage approvals.
              </p>
              <Link href="/document-review">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <FileText className="mr-2 h-4 w-4" />
                  Review Documents
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 