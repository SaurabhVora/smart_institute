import { useState } from "react";
import { useTechSessions, useRegisterForSession } from "@/hooks/use-tech-sessions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ExternalLink, Filter, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentTechSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  
  const { data: sessions, isLoading, error } = useTechSessions({
    status: activeTab as "upcoming" | "ongoing" | "completed" | "cancelled",
    category: selectedCategory as any,
    search: searchQuery,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Tech Sessions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gradient-to-b from-gray-900 to-[#0F172A] border-gray-800 overflow-hidden rounded-xl shadow-xl">
              <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Sessions</h2>
        <p className="text-gray-400 mb-6">Failed to load tech sessions. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const filteredSessions = sessions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Tech Sessions</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sessions..."
              className="pl-10 bg-gray-900 border-gray-700 text-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
            <SelectTrigger className="bg-[#1E293B] border-gray-800 text-white w-full sm:w-48 hover:bg-blue-600/20 transition-colors">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F172A] border-gray-800 text-white">
              <SelectItem value="all" className="focus:bg-blue-600/20 hover:bg-[#1E293B] cursor-pointer">All Categories</SelectItem>
              <SelectItem value="web" className="focus:bg-blue-600/20 hover:bg-[#1E293B] cursor-pointer">Web Development</SelectItem>
              <SelectItem value="ai" className="focus:bg-blue-600/20 hover:bg-[#1E293B] cursor-pointer">AI & Machine Learning</SelectItem>
              <SelectItem value="cloud" className="focus:bg-blue-600/20 hover:bg-[#1E293B] cursor-pointer">Cloud Computing</SelectItem>
              <SelectItem value="mobile" className="focus:bg-blue-600/20 hover:bg-[#1E293B] cursor-pointer">Mobile Development</SelectItem>
              <SelectItem value="security" className="focus:bg-blue-600/20 hover:bg-[#1E293B] cursor-pointer">Cybersecurity</SelectItem>
              <SelectItem value="other" className="focus:bg-blue-600/20 hover:bg-[#1E293B] cursor-pointer">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800 w-full justify-start overflow-x-auto">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="data-[state=active]:bg-blue-600">
            Ongoing
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
          <Filter className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-300">No Sessions Found</h3>
          <p className="text-gray-400 mt-2 mb-6">No tech sessions match your current filters.</p>
          {(searchQuery || selectedCategory) && (
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <TechSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

function TechSessionCard({ session }: { session: any }) {
  const { user } = useAuth();
  const registerMutation = useRegisterForSession(session.id);
  const { toast } = useToast();
  
  const handleRegister = () => {
    toast({
      title: "Registering...",
      description: "Processing your registration request",
    });
    registerMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "You have successfully registered for this tech session.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Registration failed",
          description: error.message || "Failed to register for this session. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleViewDetails = (id: string) => {
    window.location.href = `/tech-session-details/${id}`;
  };
  
  return (
    <Card className="bg-gradient-to-b from-gray-900 to-[#0F172A] border-gray-800 overflow-hidden h-full flex flex-col rounded-xl shadow-xl transition-all duration-300 hover:shadow-blue-900/20 hover:shadow-2xl hover:border-gray-700 transform hover:-translate-y-1">
      <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold text-white">{session.title}</CardTitle>
          <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800 px-3 py-1 text-sm font-medium">
            {session.category === "web" && "Web Dev"}
            {session.category === "ai" && "AI/ML"}
            {session.category === "cloud" && "Cloud"}
            {session.category === "mobile" && "Mobile"}
            {session.category === "security" && "Security"}
            {session.category === "other" && "Other"}
          </Badge>
        </div>
        <CardDescription className="text-gray-400 mt-3 text-base">
          {session.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="space-y-4 text-sm">
          <div className="flex items-center text-gray-300">
            <Calendar className="h-5 w-5 mr-3 text-blue-400" />
            <span className="text-base">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Clock className="h-5 w-5 mr-3 text-blue-400" />
            <span className="text-base">{session.startTime} - {session.endTime}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <MapPin className="h-5 w-5 mr-3 text-blue-400" />
            <span className="text-base">{session.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-6">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-300">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              <span className="text-base">{session.registered} / {session.capacity} registered</span>
            </div>
            <Badge variant={session.registered >= session.capacity ? "destructive" : "outline"} 
                  className={session.registered >= session.capacity 
                    ? "bg-red-900/30 text-red-300 border-red-800" 
                    : "bg-green-900/30 text-green-300 border-green-800"}>
              {session.registered >= session.capacity ? "Full" : "Open"}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              className={`w-full py-6 text-lg font-medium ${
                session.registered >= session.capacity 
                  ? "bg-gray-700 text-gray-300 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
              }`}
              disabled={session.registered >= session.capacity || session.isRegistered}
              onClick={handleRegister}
            >
              {session.isRegistered 
                ? "Already Registered" 
                : session.registered >= session.capacity 
                  ? "Session Full" 
                  : "Apply Now"}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-blue-800 text-blue-400 hover:bg-blue-900/20"
              onClick={() => handleViewDetails(session.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            {session.virtualMeetingLink && (
              <Button 
                variant="outline" 
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => window.open(session.virtualMeetingLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Virtual Session
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 