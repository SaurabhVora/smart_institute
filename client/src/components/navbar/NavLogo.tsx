import { Link } from "wouter";
import { motion } from "framer-motion";
import { logoVariants } from "./animations";

export function NavLogo() {
  return (
    <Link href="/">
      <motion.div 
        variants={logoVariants}
        whileHover="hover"
        className="text-xl font-bold text-white cursor-pointer flex items-center relative"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0.8],
            scale: [0, 1, 0.9],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 1.5, 
            delay: 0.3,
            times: [0, 0.4, 0.6, 0.8, 1]
          }}
          className="w-3 h-3 bg-blue-500 rounded-full mr-2 relative"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-0 bg-blue-400 rounded-full -z-10 blur-sm"
          />
        </motion.div>
        <span className="relative">
          Smart<span className="text-blue-400">Institute</span>
          <motion.div 
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
            className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500"
          />
        </span>
      </motion.div>
    </Link>
  );
} 