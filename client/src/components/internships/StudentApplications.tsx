import { useState } from "react";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Search,
  Filter,
  Loader2,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  BadgeCheck,
  Ban,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { InternshipApplication, ApplicationStatus } from "@/types/internship";
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
import { useToast } from "@/hooks/use-toast";

interface StudentApplicationsProps {
  applications: InternshipApplication[];
  isLoading: boolean;
  error: string | null;
  onWithdrawApplication: (id: number) => Promise<void>;
}

export function StudentApplications({
  applications,
  isLoading,
  error,
  onWithdrawApplication,
}: StudentApplicationsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<number | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Filter applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.internship 
        ? (
            app.internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.internship.company.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true;
      
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  const handleWithdrawClick = (id: number) => {
    setApplicationToWithdraw(id);
    setWithdrawDialogOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    if (applicationToWithdraw === null) return;
    
    setIsWithdrawing(true);
    try {
      await onWithdrawApplication(applicationToWithdraw);
      toast({
        title: "Application withdrawn",
        description: "Your application has been successfully withdrawn",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
      setWithdrawDialogOpen(false);
      setApplicationToWithdraw(null);
    }
  };

  // Helper function to render status badge
  const renderStatusBadge = (status: ApplicationStatus) => {
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
      case "withdrawn":
        return (
          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
            <Ban className="h-3 w-3 mr-1" />
            Withdrawn
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="bg-[#1E293B] border-gray-700 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-white text-xl">My Applications</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#162032] border-gray-700 text-white w-full sm:w-[200px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === "all" ? "All Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1E293B] border-gray-700 text-white">
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-blue-500/20" : ""}
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("pending")}
                  className={statusFilter === "pending" ? "bg-blue-500/20" : ""}
                >
                  <Clock className="h-4 w-4 mr-2 text-amber-400" />
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("accepted")}
                  className={statusFilter === "accepted" ? "bg-blue-500/20" : ""}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                  Accepted
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("rejected")}
                  className={statusFilter === "rejected" ? "bg-blue-500/20" : ""}
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-400" />
                  Rejected
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter("withdrawn")}
                  className={statusFilter === "withdrawn" ? "bg-blue-500/20" : ""}
                >
                  <Ban className="h-4 w-4 mr-2 text-gray-400" />
                  Withdrawn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-gray-400">Loading your applications...</p>
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

          {/* Empty State */}
          {!isLoading && !error && filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-[#162032] rounded-lg p-6 max-w-md mx-auto border border-gray-700">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
                <p className="text-gray-400 mb-4">
                  {applications.length === 0 
                    ? "You haven't applied to any internships yet" 
                    : "No applications match your search criteria"}
                </p>
                {applications.length > 0 && searchQuery && (
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
          )}

          {/* Applications List */}
          {!isLoading && !error && filteredApplications.length > 0 && (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`
                      bg-[#162032] border-gray-700 hover:border-blue-500/30 transition-colors
                      ${application.status === 'accepted' ? 'border-l-4 border-l-green-500' : ''}
                      ${application.status === 'rejected' ? 'border-l-4 border-l-red-500' : ''}
                      ${application.status === 'pending' ? 'border-l-4 border-l-amber-500' : ''}
                      ${application.status === 'withdrawn' ? 'border-l-4 border-l-gray-500' : ''}
                    `}
                  >
                    <CardContent className="p-4">
                      {application.internship ? (
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Logo */}
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-700">
                            <img 
                              src={application.internship.logo} 
                              alt={application.internship.company} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className="text-lg font-medium text-white">{application.internship.title}</h3>
                              <div className="flex items-center gap-2">
                                {renderStatusBadge(application.status)}
                                <Badge className={`
                                  ${application.internship.type === 'Full-time' 
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}
                                `}>
                                  {application.internship.type}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-400 text-sm mb-2">
                              <Building2 className="h-4 w-4 mr-1 text-gray-500" />
                              {application.internship.company}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-sm">
                              <div className="flex items-center text-gray-400">
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                {application.internship.location}
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                Applied: {application.appliedDate 
                                  ? format(new Date(application.appliedDate), "MMM d, yyyy") 
                                  : "Unknown date"}
                              </div>
                              <div className="flex items-center text-green-400">
                                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                                {application.internship.stipend}
                              </div>
                            </div>
                            
                            {/* Feedback section (if available) */}
                            {application.feedback && (
                              <div className="mt-2 p-3 bg-gray-800/50 rounded-md border border-gray-700">
                                <p className="text-sm text-gray-300 mb-1 font-medium">Feedback:</p>
                                <p className="text-sm text-gray-400">{application.feedback}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex md:flex-col gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => window.open(`/internships/${application.internshipId}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              onClick={() => window.open(`/api/internships/applications/${application.id}/resume`, '_blank')}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </Button>
                            
                            {application.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                onClick={() => handleWithdrawClick(application.id)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Withdraw
                              </Button>
                            )}
                            
                            {application.status === 'accepted' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              >
                                <BadgeCheck className="h-4 w-4 mr-2" />
                                Accepted
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                          <p>Internship details not available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <AlertDialogContent className="bg-[#1E293B] border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to withdraw this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawConfirm}
              disabled={isWithdrawing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 