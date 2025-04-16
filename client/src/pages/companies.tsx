import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { InternshipFilterBar } from "@/components/internships/InternshipFilters";
import { useInternships } from "@/hooks/use-internships";
import { Internship } from "@/types/internship";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Categories for filtering
const categories = [
  "All Categories",
  "Web Development",
  "Data Science",
  "Design",
  "Mobile Development",
  "DevOps",
  "Cybersecurity",
  "Product Management"
];

// Types for filtering
const types = ["All Types", "Full-time", "Part-time"];

export default function InternshipsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    internships, 
    filters, 
    isLoading, 
    error, 
    updateFilters, 
    resetFilters,
    applyForInternship,
    stats 
  } = useInternships();
  
  const [isHoveredId, setIsHoveredId] = useState<number | null>(null);

  const handleApply = async (internshipId: number, applicationData: any) => {
    try {
      console.log('Companies page - Applying for internship ID:', internshipId);
      console.log('Companies page - Application data:', applicationData);
      
      await applyForInternship(internshipId, applicationData);
      
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted. You can track its status in your applications page.",
      });
    } catch (error) {
      console.error('Companies page - Application error:', error);
      toast({
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Internship Opportunities</h1>
              <p className="text-gray-400">
                Discover and apply for internships that match your skills and interests.
              </p>
            </div>
            
            {user?.role === "student" && (
              <Link href="/student-applications">
                <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">
                  <FileText className="mr-2 h-4 w-4" />
                  View My Applications
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-[#1E293B] rounded-lg p-4 border border-gray-700"
            >
              <p className="text-gray-400 text-sm">Total Opportunities</p>
              <p className="text-2xl font-bold text-white">{stats.totalOpportunities}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-[#1E293B] rounded-lg p-4 border border-gray-700"
            >
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-white">{stats.totalCategories}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-[#1E293B] rounded-lg p-4 border border-gray-700"
            >
              <p className="text-gray-400 text-sm">Last Updated</p>
              <p className="text-2xl font-bold text-white">
                {stats.lastUpdated.toLocaleDateString()}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <InternshipFilterBar
            filters={filters}
            categories={categories}
            types={types}
            onFiltersChange={updateFilters}
          />
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex items-center"
        >
          <div className="h-px flex-grow bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
          <div className="px-4 text-gray-300 font-medium">
            Found <span className="text-blue-400">{internships.length}</span> internship opportunities
          </div>
          <div className="h-px flex-grow bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading internships...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-500/10 text-red-400 p-4 rounded-lg max-w-md mx-auto">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Internship Listings */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {internships.map((internship, index) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                isHovered={isHoveredId === internship.id}
                onHoverStart={() => setIsHoveredId(internship.id)}
                onHoverEnd={() => setIsHoveredId(null)}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && internships.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="bg-gradient-to-br from-[#1E293B] to-[#162032] rounded-xl p-8 max-w-md mx-auto border border-gray-800/50 shadow-lg backdrop-blur-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Search size={36} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">No internships found</h3>
              <p className="text-gray-400 mb-6">
                We couldn't find any internships matching your search criteria. Try adjusting your filters or search query.
              </p>
              <Button 
                variant="outline" 
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-6 py-2"
                onClick={resetFilters}
              >
                <div className="flex items-center">
                  Clear Filters
                  <div className="ml-2 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs">×</span>
                  </div>
                </div>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
} 