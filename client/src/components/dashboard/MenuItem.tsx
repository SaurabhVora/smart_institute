import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MenuItemProps } from "./types";

export function MenuItem({ href, icon: Icon, children }: MenuItemProps) {
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
} 