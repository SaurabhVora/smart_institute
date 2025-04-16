import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Search,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentWithStudentName } from "@shared/schema";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch all documents for faculty review
  const { data: documents, isLoading } = useQuery<DocumentWithStudentName[]>({
    queryKey: ["/api/documents/faculty-review"],
  });

  // Redirect if not faculty
  useEffect(() => {
    if (user && user.role !== "faculty") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (!user || user.role !== "faculty") {
    return null;
  }

  // Filter documents based on search term and filters
  const filteredDocuments = documents?.filter((doc) => {
    // Status filter
    if (statusFilter !== "all" && doc.status !== statusFilter) {
      return false;
    }

    // Type filter
    if (typeFilter !== "all" && doc.type !== typeFilter) {
      return false;
    }

    // Search term (search in filename)
    if (searchTerm && !doc.filename.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Rejected</Badge>;
      case "under_review":
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Under Review</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Submitted</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 hover:bg-gray-500/30">{status}</Badge>;
    }
  };

  // Helper function to get document type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "offer_letter":
        return <Badge className="bg-purple-500/20 text-purple-500 hover:bg-purple-500/30">Offer Letter</Badge>;
      case "monthly_report":
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Monthly Report</Badge>;
      case "attendance":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Attendance</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 hover:bg-gray-500/30">{type}</Badge>;
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Document Reviews</h1>
              <p className="text-gray-400">Manage and review student documents</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="text-gray-300 border-gray-700 hover:bg-gray-800/50 hover:text-white"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Reset Filters
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-gray-300 border-gray-700 hover:bg-gray-800/50 hover:text-white"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    View Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1E293B] border-gray-700">
                  <DropdownMenuItem 
                    className="text-gray-200 hover:text-white focus:text-white hover:bg-blue-600/10 cursor-pointer"
                    onClick={() => setStatusFilter("under_review")}
                  >
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Show Pending Only</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-200 hover:text-white focus:text-white hover:bg-blue-600/10 cursor-pointer"
                    onClick={() => setStatusFilter("submitted")}
                  >
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Show Submitted Only</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-200 hover:text-white focus:text-white hover:bg-blue-600/10 cursor-pointer"
                    onClick={() => setStatusFilter("approved")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Show Approved Only</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-200 hover:text-white focus:text-white hover:bg-blue-600/10 cursor-pointer"
                    onClick={() => setStatusFilter("rejected")}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    <span>Show Rejected Only</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="bg-[#0F1A2D] border-gray-800 mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/30 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-800/30 border-gray-700 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-gray-700">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-gray-800/30 border-gray-700 text-white">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-gray-700">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="offer_letter">Offer Letter</SelectItem>
                      <SelectItem value="monthly_report">Monthly Report</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card className="bg-[#0F1A2D] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Documents</CardTitle>
              <CardDescription>
                {filteredDocuments?.length || 0} documents found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-400">Loading documents...</span>
                </div>
              ) : filteredDocuments && filteredDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">Document</TableHead>
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Student</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id} className="border-gray-800 hover:bg-gray-800/30">
                          <TableCell className="font-medium text-white">
                            {doc.filename}
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(doc.type)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc.status)}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {format(new Date(doc.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {doc.studentName || doc.userId}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                asChild
                              >
                                <Link href={`/document-review/${doc.id}`}>
                                  Review
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                                asChild
                              >
                                <a href={`/api/documents/${doc.id}/download`} download>
                                  Download
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Documents Found</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your filters or search term to find what you're looking for."
                      : "There are no documents available for review at this time."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
} 