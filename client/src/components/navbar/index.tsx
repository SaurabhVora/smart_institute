import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Home, Info, Building2, LayoutDashboard, Laptop, ChevronRight, X, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NavItem } from "./types";
import { navbarVariants } from "./animations";
import { NavLogo } from "./NavLogo"; // Fixed casing to match file name
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  
  // Check if current location is home page
  const isHomePage = location === "/";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 200,
      },
    }),
    hover: { 
      scale: 1.05, 
      color: "#ffffff", 
      y: -2,
      transition: { type: "spring", stiffness: 300 } 
    },
    tap: { scale: 0.95 },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1,
      }
    },
    exit: { 
      opacity: 0, 
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      }
    }
  };

  const mobileNavItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: { opacity: 0, x: 20 }
  };

  // Handle restricted items click for non-logged in users
  const handleRestrictedItemClick = (e: React.MouseEvent, itemName: string) => {
    if ((itemName === "Tech Sessions" || itemName === "Internships") && !user) {
      e.preventDefault();
      setLocation("/login");
    }
  };

  // Create navigation items array
  const navItems: NavItem[] = [
    ...(isHomePage ? [] : [{ name: "Home", path: "/", icon: <Home size={16} /> }]),
    { name: "About", path: "/about", icon: <Info size={16} /> },
    { name: "Internships", path: user ? "/companies" : "#", icon: <Building2 size={16} /> },
    ...(user ? [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={16} /> },
    ] : []),
    { name: "Tech Sessions", path: user ? "/tech-sessions" : "#", icon: <Laptop size={16} /> },
  ];

  return (
    <motion.nav 
      initial="initial"
      animate="animate"
      variants={navbarVariants}
      className={`${
        scrolled 
          ? "bg-[#0F172A]/80 backdrop-blur-md shadow-lg border-b border-white/5" 
          : "bg-[#0F172A] border-b border-white/10"
      } sticky top-0 z-50 transition-all duration-300`}
    >
      {/* Decorative top border */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"
      />
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLogo />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center ml-10 space-x-8">
              {navItems.map((item, i) => (
                <Link key={item.name} href={item.path}>
                  <motion.div 
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    variants={navItemVariants}
                    className={`text-gray-300 hover:text-white cursor-pointer relative group flex items-center ${!user && item.name === "Tech Sessions" ? "relative" : ""}`}
                    onHoverStart={() => setActiveHover(item.name)}
                    onHoverEnd={() => setActiveHover(null)}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleRestrictedItemClick(e, item.name);
                    }}
                  >
                    <motion.span 
                      animate={{ 
                        y: activeHover === item.name ? -2 : 0,
                        color: activeHover === item.name ? "#ffffff" : "#CBD5E1"
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="text-blue-400"
                      >
                        {item.icon}
                      </motion.span>
                      {item.name}
                      {!user && (item.name === "Tech Sessions" || item.name === "Internships") && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="ml-1 text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-sm"
                        >
                          Login Required
                        </motion.span>
                      )}
                    </motion.span>
                    <motion.span 
                      initial={{ width: 0, opacity: 0 }}
                      whileHover={{ width: "100%", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
                    />
                    {activeHover === item.name && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/5 rounded-md -z-10"
                        layoutId="navHighlight"
                      />
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <UserMenu user={user} onLogout={handleLogout} />
            
            {/* Mobile menu button */}
            <motion.div 
              className="lg:hidden ml-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 relative"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-0 bg-blue-500/20 rounded-full -z-10"
                />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="exit"
            variants={mobileMenuVariants}
            className="lg:hidden fixed inset-0 top-16 bg-gradient-to-b from-[#0F172A]/95 to-[#1E293B]/95 backdrop-blur-md z-40 flex flex-col p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-10 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-20 left-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl -z-10"
            />
            
            <div className="flex flex-col space-y-2 mt-4">
              {navItems.map((item, i) => (
                <Link key={item.name} href={item.path}>
                  <motion.div
                    variants={mobileNavItemVariants}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleRestrictedItemClick(e, item.name);
                    }}
                    whileHover={{ 
                      x: 5, 
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                    className="p-4 border-b border-white/10 rounded-md flex items-center justify-between group"
                  >
                    <span className="text-white text-lg flex items-center">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3"
                      >
                        {item.icon}
                      </motion.span>
                      {item.name}
                      {!user && (item.name === "Tech Sessions" || item.name === "Internships") && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="ml-2 text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-sm"
                        >
                          Login Required
                        </motion.span>
                      )}
                    </span>
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 0.5 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={18} />
                    </motion.div>
                  </motion.div>
                </Link>
              ))}
              
              {!user && (
                <div className="flex flex-col space-y-3 mt-6 pt-4 border-t border-white/10">
                  <Link href="/login">
                    <motion.div
                      variants={mobileNavItemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative"
                    >
                      <Button variant="outline" className="w-full text-white border-blue-500/30 hover:border-blue-500/50 flex items-center justify-center gap-2">
                        <LogIn size={18} />
                        Login Now
                        <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 blur-md bg-blue-400/20 -z-10 rounded-md"
                      />
                    </motion.div>
                  </Link>
                  <Link href="/register">
                    <motion.div
                      variants={mobileNavItemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
                        Register Now
                        <ChevronRight size={18} />
                      </Button>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 blur-md bg-blue-500/20 -z-10 rounded-md"
                      />
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 