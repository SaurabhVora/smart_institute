import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useFacultyMentor } from "@/hooks/use-documents";
import { UserIcon, MailIcon, PhoneIcon, GraduationCapIcon, BriefcaseIcon } from "lucide-react";
import { Button } from "./ui/button";

export function FacultyMentorCard() {
  const { data: mentor, isLoading, error } = useFacultyMentor();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl flex items-center">Faculty Mentor</CardTitle>
          <CardDescription className="text-gray-400">Your assigned faculty guide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-700 h-16 w-16 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl flex items-center">Faculty Mentor</CardTitle>
          <CardDescription className="text-gray-400">Your assigned faculty guide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-red-900/20 p-3 rounded-full mb-3">
              <UserIcon className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="font-medium text-white">Error Loading Mentor</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              We couldn't load your mentor information
            </p>
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mentor) {
    return (
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl flex items-center">Faculty Mentor</CardTitle>
          <CardDescription className="text-gray-400">Your assigned faculty guide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-blue-900/20 p-3 rounded-full mb-3">
              <UserIcon className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="font-medium text-white">No Mentor Assigned Yet</h3>
            <p className="text-sm text-gray-400 mt-1">
              A faculty mentor will be assigned to you soon
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get initials for avatar
  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'NA';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-xl flex items-center">Faculty Mentor</CardTitle>
        <CardDescription className="text-gray-400">Your assigned faculty guide</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center sm:items-start gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-600">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`} alt={mentor.name} />
              <AvatarFallback className="bg-blue-900 text-blue-100">
                {mentor && mentor.name ? getInitials(mentor.name) : 'NA'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-medium text-white">{mentor.name || 'No Name'}</h3>
              {mentor.position && (
                <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                  {mentor.position}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-3 text-sm w-full bg-gray-800/40 rounded-lg p-4 mt-2">
            {mentor.department && (
              <div className="flex items-center gap-2 text-gray-300">
                <GraduationCapIcon className="h-4 w-4 text-blue-400" />
                <span>{mentor.department}</span>
              </div>
            )}
            
            {mentor.expertise && (
              <div className="flex items-center gap-2 text-gray-300">
                <BriefcaseIcon className="h-4 w-4 text-blue-400" />
                <span>{mentor.expertise}</span>
              </div>
            )}
            
            {mentor.email && (
              <div className="flex items-center gap-2 text-gray-300">
                <MailIcon className="h-4 w-4 text-blue-400" />
                <a href={`mailto:${mentor.email}`} className="hover:text-blue-300 transition-colors">
                  {mentor.email}
                </a>
              </div>
            )}
            
            {mentor.phone && (
              <div className="flex items-center gap-2 text-gray-300">
                <PhoneIcon className="h-4 w-4 text-blue-400" />
                <a href={`tel:${mentor.phone}`} className="hover:text-blue-300 transition-colors">
                  {mentor.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 