import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { StudentApplications } from "@/components/internships/StudentApplications";
import { useToast } from "@/hooks/use-toast";
import { useInternships } from "@/hooks/use-internships";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function StudentApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    applications, 
    isLoadingApplications, 
    applicationError,
    withdrawApplication
  } = useInternships();

  // Only students can access this page
  if (user && user.role !== "student") {
    return <Redirect to="/dashboard" />;
  }

  const handleWithdrawApplication = async (id: number) => {
    try {
      await withdrawApplication(id);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Stats for the dashboard
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const acceptedCount = applications.filter(app => app.status === 'accepted').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-gray-400 mb-8">
            Track and manage all your internship applications in one place.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-2xl font-bold text-white">{applications.length}</p>
            </div>
          </div>
          
          <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>
          </div>
          
          <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Accepted</p>
              <p className="text-2xl font-bold text-white">{acceptedCount}</p>
            </div>
          </div>
          
          <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-4 flex items-center">
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mr-4">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StudentApplications
            applications={applications}
            isLoading={isLoadingApplications}
            error={applicationError}
            onWithdrawApplication={handleWithdrawApplication}
          />
        </motion.div>
      </div>
    </Layout>
  );
} 