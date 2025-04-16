import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Building, Users, BookOpen, Award, Briefcase, Globe, Code } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E293B] text-white">
        {/* Hero Section Skeleton */}
        <section className="py-16 px-6 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
          <div className="max-w-5xl mx-auto text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <div className="h-1 w-20 bg-blue-600 mx-auto mb-6"></div>
            <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-2" />
            <Skeleton className="h-6 w-2/3 max-w-2xl mx-auto" />
          </div>
        </section>

        {/* Mission Section Skeleton */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#0F172A] border border-gray-800 rounded-lg p-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3 flex justify-center">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </div>
                <div className="md:w-2/3">
                  <Skeleton className="h-8 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section Skeleton */}
        <section className="py-16 px-6 bg-[#0F172A]/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-48 mx-auto mb-4" />
              <div className="h-1 w-16 bg-blue-600 mx-auto mb-6"></div>
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="bg-[#0F172A] border-gray-800 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section Skeleton */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-36 mx-auto mb-4" />
              <div className="h-1 w-16 bg-blue-600 mx-auto mb-6"></div>
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="text-center">
                  <Skeleton className="w-32 h-32 mx-auto rounded-full mb-4" />
                  <Skeleton className="h-6 w-48 mx-auto mb-1" />
                  <Skeleton className="h-4 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mx-auto mb-1" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] text-white">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About SmartInstitute</h1>
            <div className="h-1 w-20 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Bridging the gap between academia and industry through streamlined internship management
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0F172A] border border-gray-800 rounded-lg p-8 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 blur-xl"></div>
                  <GraduationCap className="relative h-32 w-32 text-blue-400" />
                </div>
              </div>
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-300 mb-4">
                  SmartInstitute is dedicated to transforming the educational experience for students, faculty, and companies. 
                  We provide a comprehensive platform that simplifies document management, facilitates communication, and 
                  ensures transparency throughout the internship process.
                </p>
                <p className="text-gray-300">
                  Our goal is to create meaningful connections between academic institutions and industry partners, 
                  helping students gain valuable real-world experience while companies discover fresh talent.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-[#0F172A]/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <div className="h-1 w-16 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Designed to make internship management seamless and efficient
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#0F172A] border-gray-800 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Document Management</h3>
                  </div>
                  <p className="text-gray-300">
                    Securely upload, store, and track all internship-related documents in one centralized location.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#0F172A] border-gray-800 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Faculty Mentorship</h3>
                  </div>
                  <p className="text-gray-300">
                    Connect students with faculty mentors who provide guidance, feedback, and support throughout the internship.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#0F172A] border-gray-800 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Building className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Company Integration</h3>
                  </div>
                  <p className="text-gray-300">
                    Allow companies to participate in the internship process, post opportunities, and review student progress.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#0F172A] border-gray-800 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Award className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Progress Tracking</h3>
                  </div>
                  <p className="text-gray-300">
                    Monitor internship milestones, document approvals, and overall student performance with intuitive dashboards.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#0F172A] border-gray-800 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Code className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Tech Sessions</h3>
                  </div>
                  <p className="text-gray-300">
                    Access technical workshops, seminars, and learning resources to enhance skills and knowledge.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 6 */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#0F172A] border-gray-800 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Globe className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Networking</h3>
                  </div>
                  <p className="text-gray-300">
                    Build professional connections between students, faculty, and industry professionals.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <div className="h-1 w-16 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A dedicated group of educators, developers, and industry experts
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Team Member 1 */}
            <motion.div variants={itemVariants} className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 flex items-center justify-center">
                <Briefcase className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Dr. Sarah Johnson</h3>
              <p className="text-blue-400 mb-2">Founder & Academic Director</p>
              <p className="text-gray-300 text-sm">
                With 15+ years in higher education, Dr. Johnson bridges academic theory with industry practice.
              </p>
            </motion.div>

            {/* Team Member 2 */}
            <motion.div variants={itemVariants} className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 flex items-center justify-center">
                <Code className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Michael Chen</h3>
              <p className="text-blue-400 mb-2">Lead Developer</p>
              <p className="text-gray-300 text-sm">
                A full-stack developer with expertise in creating educational technology platforms.
              </p>
            </motion.div>

            {/* Team Member 3 */}
            <motion.div variants={itemVariants} className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 flex items-center justify-center">
                <Building className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Robert Williams</h3>
              <p className="text-blue-400 mb-2">Industry Liaison</p>
              <p className="text-gray-300 text-sm">
                Former HR executive who helps connect students with the right companies for their career goals.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-[#0F172A]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
            <div className="h-1 w-16 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 mb-8">
              Have questions about SmartInstitute? We'd love to hear from you!
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
              <div className="bg-[#1E293B] border border-gray-800 rounded-lg p-6">
                <p className="text-blue-400 font-medium">Email</p>
                <p className="text-white">contact@smartinstitute.edu</p>
              </div>
              <div className="bg-[#1E293B] border border-gray-800 rounded-lg p-6">
                <p className="text-blue-400 font-medium">Phone</p>
                <p className="text-white">+1 (555) 123-4567</p>
              </div>
              <div className="bg-[#1E293B] border border-gray-800 rounded-lg p-6">
                <p className="text-blue-400 font-medium">Address</p>
                <p className="text-white">123 University Ave, Tech City</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 