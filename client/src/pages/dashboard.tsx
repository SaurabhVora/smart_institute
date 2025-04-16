import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Document, FacultyAllocation, DocumentWithStudentName } from "@shared/schema";
import { FileUpload } from "@/components/dashboard/file-upload";
import { DocumentStatus } from "@/components/dashboard/document-status";
import { StudentInfo } from "@/components/dashboard/student-info";
import { FacultyOverview } from "@/components/dashboard/faculty-overview";
import { FacultyDocuments } from "@/components/dashboard/faculty-documents";
import { ProfileCompletion } from "@/components/profile-completion";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Home,
  FileArchive,
  ChartLine,
  User,
  ChevronDown,
  Plus,
  Building,
  Briefcase,
  ClipboardCheck,
  BookOpen,
  ChartBar,
  Upload,
  FolderOpen,
  Laptop,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  Send,
  Clock,
  Presentation,
  Download,
  UserPlus,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentCategory } from "@/components/document-category";
import { FacultyMentorCard } from "@/components/faculty-mentor-card";
import { useState } from "react";
import Layout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton, ProfileSkeleton } from "@/components/ui/skeleton";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FacultyDashboard } from "@/components/dashboard/FacultyDashboard";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";

// Helper function to safely format dates
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "Date unknown";
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return isValid(date) ? format(date, "MMM d, h:mm a") : "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};

// Quick action buttons based on user role
const QuickActions = ({ role }: { role: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {role === "student" && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Upload Document
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> View Reports
              </Button>
            </>
          )}
          {role === "faculty" && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> View Students
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Review Documents
              </Button>
            </>
          )}
          {role === "admin" && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Manage Users
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MenuItem = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => {
  const [location] = useLocation();
  const isActive = location === href;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        className={`flex items-center gap-3 px-3 py-2.5 text-gray-300 rounded-lg transition-all duration-200 group relative ${
          isActive ? 'bg-blue-500/10 text-white' : 'hover:bg-gray-800/30 hover:text-white'
        }`}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.span
          animate={{ 
            color: isActive ? "#3b82f6" : (isHovered ? "#60a5fa" : "#94a3b8"),
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          <Icon className="h-5 w-5" />
        </motion.span>
        
        <motion.span 
          className="font-medium relative z-10"
          animate={{ 
            color: isActive ? "#ffffff" : (isHovered ? "#ffffff" : "#cbd5e1")
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
        
        {isActive && (
          <motion.div
            className="absolute left-0 w-1 h-full bg-blue-500 rounded-r-full"
            layoutId="activeIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        
        {/* Hover background effect */}
        {isHovered && !isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/5 rounded-md -z-0"
          />
        )}
        
        {/* Active background effect */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-blue-500/10 rounded-md -z-0"
          />
        )}
      </motion.div>
    </Link>
  );
};

const UserProfile = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#0F1A2D] border-gray-800" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user.name}</p>
            <p className="text-xs leading-none text-gray-400">{user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        <Link href="/profile">
          <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white focus:bg-gray-800 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white focus:bg-gray-800">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem 
          className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-gray-800 cursor-pointer"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Placeholder StudentStats component
const StudentStats = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Student statistics will be displayed here.</p>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { data: documents } = useQuery<Document[] | DocumentWithStudentName[]>({ 
    queryKey: [user?.role === "faculty" ? "/api/documents/faculty-review" : "/api/documents"]
  });
  
  const { data: allocations } = useQuery<FacultyAllocation[]>({
    queryKey: ["/api/allocations"],
    enabled: !!user
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
  });

  if (!user) return null;

  // Render skeleton loaders during loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Profile */}
            <div className="md:col-span-1">
              <ProfileSkeleton />
            </div>
            
            {/* Right column - Dashboard content */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
              
              {/* Profile completion card */}
              <div className="mb-6 bg-[#1E293B] rounded-lg p-4">
                <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-full bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-32 bg-blue-700 rounded animate-pulse"></div>
              </div>
              
              {/* Dashboard items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <DashboardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
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
        {user.role === "student" && <StudentDashboard documents={documents as Document[]} />}
        {user.role === "faculty" && <FacultyDashboard documents={documents as DocumentWithStudentName[]} allocations={allocations} />}
        {user.role === "company" && <CompanyDashboard documents={documents as Document[]} />}
      </motion.div>
    </Layout>
  );
}