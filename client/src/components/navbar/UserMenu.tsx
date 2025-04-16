import { Link } from "wouter";
import { motion } from "framer-motion";
import { User, LogIn, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  user: any;
  onLogout: () => void;
};

// Button animation variants
const buttonVariants = {
  initial: { opacity: 0, y: -10 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + (i * 0.1),
      duration: 0.5,
      ease: "easeOut"
    },
  }),
  hover: { 
    scale: 1.05,
    y: -2,
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
    transition: { 
      type: "spring", 
      stiffness: 400,
      damping: 10
    } 
  },
  tap: { 
    scale: 0.95,
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
  },
};

export function UserMenu({ user, onLogout }: UserMenuProps) {
  if (user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex items-center space-x-4"
      >
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-sm text-gray-300 hidden md:inline-block"
        >
          Welcome, {user.name}
        </motion.span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Button variant="ghost" size="icon" className="text-white relative">
                <User className="h-5 w-5" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-0 bg-blue-500/20 rounded-full -z-10"
                />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#1E293B] border border-white/10 text-white">
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer hover:bg-blue-600/20 focus:bg-blue-600/20">
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer hover:bg-blue-600/20 focus:bg-blue-600/20">
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem 
              className="text-red-400 hover:text-red-300 cursor-pointer hover:bg-red-600/20 focus:bg-red-600/20"
              onClick={onLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link href="/login">
        <motion.div
          custom={0}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          className="relative"
        >
          <Button 
            variant="outline"
            className="text-white border-blue-500/30 hover:border-blue-500/50 relative overflow-hidden group shadow-md shadow-blue-500/10"
          >
            <span className="relative z-10 flex items-center">
              <LogIn className="w-4 h-4 mr-1.5 text-blue-400 group-hover:text-white transition-colors" />
              Login Now
              <motion.span
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 0 }}
                whileHover={{ x: 3, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.span>
            </span>
            <motion.span 
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.5, opacity: 0.3 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-md bg-blue-400 z-0"
            />
          </Button>
          <motion.span
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 rounded-md blur-md bg-blue-400/30 -z-10"
          />
        </motion.div>
      </Link>
      <Link href="/register">
        <motion.div
          custom={1}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          className="relative"
        >
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group shadow-md shadow-blue-500/20"
          >
            <span className="relative z-10 flex items-center">
              Register Now
              <motion.span
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 0 }}
                whileHover={{ x: 3, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.span>
            </span>
            <motion.span 
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.5, opacity: 0.3 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-md bg-white z-0"
            />
          </Button>
          <motion.span
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 rounded-md blur-md bg-blue-500/30 -z-10"
          />
        </motion.div>
      </Link>
    </div>
  );
} 