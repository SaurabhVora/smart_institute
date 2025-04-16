import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Calendar, Briefcase, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Internship } from "@/types/internship";
import { InternshipApplicationForm } from "./InternshipApplicationForm";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useInternships } from "@/hooks/use-internships";

interface InternshipCardProps {
  internship: Internship;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onApply: (internshipId: number, applicationData: any) => Promise<void>;
}

export function InternshipCard({ 
  internship, 
  isHovered, 
  onHoverStart, 
  onHoverEnd,
  onApply 
}: InternshipCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { applyForInternship } = useInternships();

  const handleApplyClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for internships",
        variant: "destructive",
      });
      return;
    }
    
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmit = async (data: any) => {
    try {
      console.log('InternshipCard - Application data:', data);
      console.log('InternshipCard - Internship ID:', internship.id);
      
      // Call the parent onApply function
      await onApply(internship.id, data);
      
      toast({
        title: "Application submitted",
        description: `You have successfully applied for ${internship.title} at ${internship.company}`,
      });
      
      // Close the modal
      setIsApplicationModalOpen(false);
    } catch (error) {
      console.error('InternshipCard - Application submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      >
        <Card className={`bg-gradient-to-br from-[#1E293B] to-[#162032] border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col rounded-xl overflow-hidden shadow-lg ${isHovered ? 'shadow-blue-500/10' : ''}`}>
          <CardContent className="p-0 flex-grow">
            {/* Card Header with gradient background */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-80"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-md overflow-hidden mr-4 flex-shrink-0 shadow-md border border-white/10">
                      <img src={internship.logo} alt={internship.company} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{internship.title}</h3>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Building2 size={14} className="mr-1" />
                        {internship.company}
                      </div>
                    </div>
                  </div>
                  <Badge className={`
                    ${internship.type === 'Full-time' 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}
                    shadow-sm
                  `}>
                    {internship.type}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Card Body */}
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-300">
                <div className="flex items-center mb-2 hover:text-blue-300 transition-colors duration-200">
                  <MapPin size={14} className="mr-2 text-gray-400" />
                  {internship.location}
                </div>
                <div className="flex items-center mb-2 hover:text-blue-300 transition-colors duration-200">
                  <Calendar size={14} className="mr-2 text-gray-400" />
                  Duration: {internship.duration}
                </div>
                <div className="flex items-center mb-2 hover:text-blue-300 transition-colors duration-200">
                  <Briefcase size={14} className="mr-2 text-gray-400" />
                  Stipend: <span className="text-green-400 ml-1 font-medium">{internship.stipend}</span>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-3 hover:text-gray-300 transition-colors duration-200">
                {internship.description}
              </p>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map(skill => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20 transition-colors duration-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto flex justify-between items-center">
                <div className="text-sm text-red-400">
                  <span className="font-medium">Apply by:</span> {new Date(internship.deadline).toLocaleDateString()}
                </div>
                <Button 
                  className={`
                    relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
                    text-white shadow-md hover:shadow-blue-500/20 transition-all duration-300
                  `}
                  onClick={handleApplyClick}
                >
                  <span className="relative z-10 flex items-center">
                    Apply Now
                    <ExternalLink size={14} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <InternshipApplicationForm
        internship={internship}
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSubmit={handleApplicationSubmit}
      />
    </>
  );
} 