import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Briefcase, 
  GraduationCap 
} from "lucide-react";
import { Counter } from "./Counter";

const stats = [
  {
    icon: <Users className="h-8 w-8 text-blue-400" />,
    value: 5000,
    label: "Active Users",
    description: "Students, faculty, and industry partners",
    color: "from-blue-500/20 to-blue-600/20"
  },
  {
    icon: <FileText className="h-8 w-8 text-indigo-400" />,
    value: 25000,
    label: "Documents Processed",
    description: "Internship reports, offer letters, and certificates",
    color: "from-indigo-500/20 to-indigo-600/20"
  },
  {
    icon: <Briefcase className="h-8 w-8 text-purple-400" />,
    value: 1200,
    label: "Internships Completed",
    description: "Successful industry placements",
    color: "from-purple-500/20 to-purple-600/20"
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-sky-400" />,
    value: 350,
    label: "Technical Sessions",
    description: "Knowledge sharing workshops",
    color: "from-sky-500/20 to-sky-600/20"
  }
];

export function StatsSection() {
  return (
    <section className="py-16 bg-[#1E293B] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="bg-[#0F172A] p-6 rounded-xl border border-white/5 relative z-10 h-full flex flex-col">
                <div className="p-3 rounded-lg bg-white/5 w-fit mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  <Counter end={stat.value} />
                </h3>
                <p className="text-lg font-semibold text-white/90 mb-2">{stat.label}</p>
                <p className="text-white/60 text-sm mt-auto">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 