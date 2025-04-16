import { Link } from "wouter";
import { motion } from "framer-motion";
import { container, item, buttonHover, buttonTap } from "./animations";

export function HeroSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      {/* Enhanced animated background elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-20 right-[10%] w-72 h-72 bg-blue-500/30 rounded-full blur-3xl z-0"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
        className="absolute bottom-10 left-[15%] w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl z-0"
      />
      
      {/* Animated particles */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 z-0"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.3,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
              ],
              x: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
              ],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 border border-blue-500/20 rounded-full"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 border-2 border-indigo-500/20 rounded-full"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/10 rounded-full"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 relative"
          >
            <motion.h1 
              variants={item}
              className="text-5xl md:text-6xl font-bold mb-2 text-white relative z-10"
              style={{ 
                textShadow: "0 10px 30px rgba(0,0,0,0.5)" 
              }}
            >
              Connect <motion.span 
                initial={{ color: "#60A5FA" }}
                animate={{ color: ["#60A5FA", "#818CF8", "#60A5FA"] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                Academia
                <motion.div 
                  className="absolute -bottom-2 left-0 w-full h-1 bg-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </motion.span> & Industry
            </motion.h1>
            <motion.div 
              className="absolute -top-10 -left-10 w-20 h-20 border border-blue-500/20 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            />
            <motion.div 
              className="absolute -bottom-10 -right-10 w-20 h-20 border border-blue-500/20 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
          </motion.div>
          
          <motion.p 
            variants={item}
            className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            A unified platform connecting students, faculty, and companies for seamless internship management, document workflows, and knowledge sharing
          </motion.p>
          
          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <motion.button 
                whileHover={buttonHover}
                whileTap={buttonTap}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>
          
          {/* Role-based quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            <Link href="/student-resources">
              <a className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-white/70 hover:text-white transition-all border border-white/10">
                For Students
              </a>
            </Link>
            <Link href="/faculty-resources">
              <a className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-white/70 hover:text-white transition-all border border-white/10">
                For Faculty
              </a>
            </Link>
            <Link href="/company-resources">
              <a className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-white/70 hover:text-white transition-all border border-white/10">
                For Companies
              </a>
            </Link>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <motion.div 
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div 
                className="w-1 h-2 bg-white/60 rounded-full"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 