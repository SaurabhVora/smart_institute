import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  Presentation, 
  ClipboardCheck, 
  BookOpen, 
  Shield 
} from "lucide-react";
import { container, item, cardHover } from "./animations";

const features = [
  {
    icon: <FileText className="h-6 w-6 text-blue-400" />,
    title: "Document Management",
    description: "Streamlined document submission, review, and approval workflows for internship-related paperwork",
    color: "from-blue-500/10 to-blue-600/10",
    borderColor: "border-blue-500/20",
    iconBg: "bg-blue-500/10"
  },
  {
    icon: <Users className="h-6 w-6 text-indigo-400" />,
    title: "Faculty-Student Allocation",
    description: "Intelligent matching of faculty mentors with students based on specialization and interests",
    color: "from-indigo-500/10 to-indigo-600/10",
    borderColor: "border-indigo-500/20",
    iconBg: "bg-indigo-500/10"
  },
  {
    icon: <Presentation className="h-6 w-6 text-purple-400" />,
    title: "Technical Sessions",
    description: "Organize and manage knowledge-sharing sessions with registration and attendance tracking",
    color: "from-purple-500/10 to-purple-600/10",
    borderColor: "border-purple-500/20",
    iconBg: "bg-purple-500/10"
  },
  {
    icon: <ClipboardCheck className="h-6 w-6 text-sky-400" />,
    title: "Progress Tracking",
    description: "Monitor student internship progress with detailed analytics and reporting tools",
    color: "from-sky-500/10 to-sky-600/10",
    borderColor: "border-sky-500/20",
    iconBg: "bg-sky-500/10"
  },
  {
    icon: <BookOpen className="h-6 w-6 text-teal-400" />,
    title: "Resource Sharing",
    description: "Centralized repository for educational materials, guidelines, and best practices",
    color: "from-teal-500/10 to-teal-600/10",
    borderColor: "border-teal-500/20",
    iconBg: "bg-teal-500/10"
  },
  {
    icon: <Shield className="h-6 w-6 text-emerald-400" />,
    title: "Role-Based Access",
    description: "Secure, role-specific dashboards and permissions for students, faculty, and companies",
    color: "from-emerald-500/10 to-emerald-600/10",
    borderColor: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comprehensive Platform Features
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Our platform offers a complete suite of tools to streamline the collaboration between educational institutions and industry partners
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={cardHover}
              className={`bg-[#1E293B] rounded-xl p-6 border ${feature.borderColor} relative group overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`p-3 rounded-lg ${feature.iconBg} w-fit mb-4`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white/90 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-white/70 group-hover:text-white/80 transition-colors">
                  {feature.description}
                </p>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 border-t-0 border-l-0 border-r-2 border-b-2 border-white/5 rounded-bl-3xl"></div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Feature highlight - Document workflow visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 bg-[#1E293B] rounded-xl p-8 border border-white/10"
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-3">Document Workflow</h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              See how documents flow through our system from submission to approval
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 z-0"></div>
            
            {/* Step 1 */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#0F172A] rounded-lg p-5 border border-white/10 w-full md:w-1/4 relative z-10"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl font-bold text-blue-400">1</span>
              </div>
              <h4 className="text-lg font-semibold text-white text-center mb-2">Submission</h4>
              <p className="text-white/70 text-center text-sm">
                Students upload documents through the secure portal
              </p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#0F172A] rounded-lg p-5 border border-white/10 w-full md:w-1/4 relative z-10"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl font-bold text-indigo-400">2</span>
              </div>
              <h4 className="text-lg font-semibold text-white text-center mb-2">Review</h4>
              <p className="text-white/70 text-center text-sm">
                Faculty mentors review and provide detailed feedback
              </p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-[#0F172A] rounded-lg p-5 border border-white/10 w-full md:w-1/4 relative z-10"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl font-bold text-purple-400">3</span>
              </div>
              <h4 className="text-lg font-semibold text-white text-center mb-2">Approval</h4>
              <p className="text-white/70 text-center text-sm">
                Documents are approved and stored securely in the system
              </p>
            </motion.div>
            
            {/* Step 4 */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-[#0F172A] rounded-lg p-5 border border-white/10 w-full md:w-1/4 relative z-10"
            >
              <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl font-bold text-sky-400">4</span>
              </div>
              <h4 className="text-lg font-semibold text-white text-center mb-2">Verification</h4>
              <p className="text-white/70 text-center text-sm">
                Companies can verify document authenticity when needed
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 