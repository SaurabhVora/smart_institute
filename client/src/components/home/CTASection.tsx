import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, Layout, FileCheck, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function CTASection() {
  const { user } = useAuth();
  
  return (
    <section className="py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 0.1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute bottom-20 right-[10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl z-0"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 text-center relative z-10"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {user ? "Welcome Back!" : "Ready to Get Started?"}
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto mt-4 mb-6"></div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/90 mb-8 text-lg"
          >
            {user ? (
              `Continue ${user.role === 'student' ? 'exploring educational resources' : 
                user.role === 'faculty' ? 'student mentoring' : 
                'tech session program'}`
            ) : (
              "Join our platform today and take the first step towards enhancing your educational journey"
            )}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {user ? (
              <>
                <Link href="/dashboard">
                  <motion.button 
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      Go to Dashboard
                      <Layout className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                </Link>
                
                <Link href="/documents">
                  <motion.button 
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden bg-transparent text-white px-8 py-3 rounded-lg font-semibold border border-white/20 hover:border-white/40 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      View Documents
                      <FileCheck className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <motion.button 
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      Register Now
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                </Link>
                
                <Link href="/login">
                  <motion.button 
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden bg-transparent text-white px-8 py-3 rounded-lg font-semibold border border-white/20 hover:border-white/40 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Login
                      <LogIn className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>
          
          {/* Role-specific links */}
          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 text-white/60 text-sm"
            >
              <p>Choose your role:</p>
              <div className="flex justify-center gap-6 mt-2">
                <Link href="/register?role=student">
                  <a className="text-blue-400 hover:text-blue-300 transition-colors">Student</a>
                </Link>
                <Link href="/register?role=faculty">
                  <a className="text-blue-400 hover:text-blue-300 transition-colors">Faculty</a>
                </Link>
                <Link href="/register?role=company">
                  <a className="text-blue-400 hover:text-blue-300 transition-colors">Company</a>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
} 