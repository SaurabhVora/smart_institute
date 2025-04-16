import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    content: "The Industry Link Portal has transformed how we manage internships. The document workflow is intuitive, and the feedback system has improved communication between students and faculty.",
    author: "Dr. Priya Sharma",
    role: "Faculty Mentor, Computer Science",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PS",
    rating: 5
  },
  {
    content: "As a student, I found the platform incredibly helpful for tracking my internship progress. The technical sessions have also been valuable for expanding my knowledge beyond classroom learning.",
    author: "Rahul Patel",
    role: "Final Year Student, Engineering",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RP",
    rating: 5
  },
  {
    content: "From a company perspective, the portal has streamlined our internship program. We can easily verify documents and track student progress, making the entire process more efficient.",
    author: "Ananya Desai",
    role: "HR Manager, TechSolutions Inc.",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AD",
    rating: 4
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#1E293B] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 0.1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-20 left-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-3xl z-0"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Users Say
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Hear from students, faculty, and industry partners who use our platform
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#0F172A] p-6 rounded-xl border border-white/5 relative group"
            >
              {/* Quote mark */}
              <div className="absolute top-4 right-4 text-4xl text-white/5 font-serif">"</div>
              
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`} 
                    fill={i < testimonial.rating ? 'currentColor' : 'none'} 
                  />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-white/80 mb-6 relative z-10">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-white/10">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-medium">{testimonial.author}</h4>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </motion.div>
          ))}
        </div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center">
            <span>View more testimonials</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
} 