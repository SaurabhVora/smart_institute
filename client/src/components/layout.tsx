import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Home,
  ChartLine,
  User,
  Briefcase,
  ClipboardCheck,
  LayoutDashboard,
  Presentation,
  BookOpen,
  UserPlus,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Menu item component
const MenuItem = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <motion.div
        className={cn(
          "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg",
          isActive 
            ? "bg-blue-600 text-white" 
            : "text-gray-200 hover:text-white"
        )}
        whileHover={{ 
          backgroundColor: isActive ? "rgb(37, 99, 235)" : "rgba(37, 99, 235, 0.1)",
          x: 4,
          transition: { duration: 0.2, ease: "easeInOut" }
        }}
        initial={{ 
          backgroundColor: isActive ? "rgb(37, 99, 235)" : "rgba(0, 0, 0, 0)" 
        }}
        animate={{ 
          backgroundColor: isActive ? "rgb(37, 99, 235)" : "rgba(0, 0, 0, 0)",
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </motion.div>
    </Link>
  );
};

// User profile component
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
      <DropdownMenuContent className="w-56 bg-[#1E293B] border-gray-700" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user.name}</p>
            <p className="text-xs leading-none text-gray-400">{user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <Link href="/profile">
          <DropdownMenuItem className="text-gray-200 hover:text-white focus:text-white hover:bg-blue-600/10 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="text-gray-200 hover:text-white focus:text-white hover:bg-blue-600/10">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          className="text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/10 cursor-pointer"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Main layout component
export default function Layout({ children }: { children: ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  const menuItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ...(user?.role !== "faculty" ? [{ href: "/documents", icon: FileText, label: "Documents" }] : []),
    ...(user?.role === "faculty" ? [{ href: "/allocations", icon: UserPlus, label: "Student Allocations" }] : []),
    { href: "/companies", icon: Briefcase, label: "Internships" },
    { href: "/tech-sessions", icon: Presentation, label: "Tech Sessions" },
    { href: "/resources", icon: BookOpen, label: "Resources" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#0F172A]">
      {/* Sticky Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 h-screen w-64 bg-[#1E293B] border-r border-gray-700 overflow-y-auto"
      >
        <div className="p-6">
          <Link href="/">
            <motion.div 
              className="text-xl font-bold text-white flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="w-2 h-2 bg-blue-500 rounded-full mr-2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <span>
                Smart<span className="text-blue-500">Institute</span>
              </span>
            </motion.div>
          </Link>
          
          <motion.nav 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-1"
          >
            {menuItems.map((item) => (
              <MenuItem key={item.href} href={item.href} icon={item.icon}>
                {item.label}
              </MenuItem>
            ))}
            
            {user?.role === "faculty" && (
              <>
                <MenuItem href="/reviews" icon={ClipboardCheck}>Document Review</MenuItem>
                <MenuItem href="/faculty-internships" icon={Briefcase}>Manage Internships</MenuItem>
              </>
            )}
            {user?.role === "student" && (
              <>
                <MenuItem href="/progress" icon={ChartLine}>Progress</MenuItem>
                <MenuItem href="/student-applications" icon={FileText}>My Applications</MenuItem>
              </>
            )}
            {user?.role === "company" && (
              <>
                {/* Removed Job Positions and Manage Interns menu items */}
              </>
            )}
            <MenuItem href="/settings" icon={Settings}>Settings</MenuItem>
          </motion.nav>
        </div>
      </motion.aside>

      {/* Main Content Area with Fixed Header */}
      <div className="flex-1 ml-64 flex flex-col"> {/* Added flex-col to ensure proper stacking */}
        {/* Sticky Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 right-0 left-64 z-20 bg-[#1E293B] border-b border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-semibold text-white">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-400">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              {user && <UserProfile user={user} onLogout={handleLogout} />}
            </motion.div>
          </div>
        </motion.header>

        {/* Scrollable Content Area */}
        <main className="bg-[#0F172A] pt-[115px] min-h-screen p-6 pb-20 overflow-y-auto"> {/* Reduced top padding from 120px to 100px */}
          {children}
        </main>
      </div>
    </div>
  );
}