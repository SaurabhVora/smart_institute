import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useTechSession, useSessionRegistrations, useUpdateTechSession, useDeleteTechSession } from "@/hooks/use-tech-sessions";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, ArrowLeft, Mail, GraduationCap, School, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TechSessionDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: session, isLoading: isSessionLoading } = useTechSession(id);
  const { data: registrations, isLoading: isRegistrationsLoading } = useSessionRegistrations(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const deleteSession = useDeleteTechSession();
  const [activeTab, setActiveTab] = useState("details");

  const handleDelete = () => {
    deleteSession.mutate(id, {
      onSuccess: () => {
        setLocation("/tech-sessions");
      }
    });
  };

  const handleBack = () => {
    setLocation("/tech-sessions");
  };

  if (isSessionLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="mr-2 text-gray-400 hover:text-white hover:bg-blue-600/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
            <p className="text-gray-400 mb-6">The tech session you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tech Sessions
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if the current user is the faculty who created this session
  const isOwner = user?.id === session.facultyId;

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="mr-2 text-gray-400 hover:text-white hover:bg-blue-600/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Tech Session Details</h1>
        </div>

        {isOwner && (
          <div className="flex justify-end mb-6 gap-2">
            <Button 
              variant="outline" 
              className="border-blue-800 text-blue-400 hover:bg-blue-900/20"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Session
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-800 text-red-400 hover:bg-red-900/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0F172A] border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Tech Session</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to delete this tech session? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {isOwner && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-[#0F172A] border border-gray-800">
              <TabsTrigger value="details" className="data-[state=active]:bg-blue-600">
                Session Details
              </TabsTrigger>
              <TabsTrigger value="registrations" className="data-[state=active]:bg-blue-600">
                Registrations ({registrations?.length || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl text-white">{session.title}</CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        Created by {session.facultyName || "Faculty"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                        {session.category === "web" && "Web Development"}
                        {session.category === "ai" && "AI & Machine Learning"}
                        {session.category === "cloud" && "Cloud Computing"}
                        {session.category === "mobile" && "Mobile Development"}
                        {session.category === "security" && "Cybersecurity"}
                        {session.category === "other" && "Other"}
                      </Badge>
                      <Badge variant="outline" className={
                        session.status === "upcoming" ? "bg-green-900/30 text-green-300 border-green-800" :
                        session.status === "ongoing" ? "bg-blue-900/30 text-blue-300 border-blue-800" :
                        session.status === "completed" ? "bg-gray-900/30 text-gray-300 border-gray-800" :
                        "bg-red-900/30 text-red-300 border-red-800"
                      }>
                        {session.status === "upcoming" && "Upcoming"}
                        {session.status === "ongoing" && "Ongoing"}
                        {session.status === "completed" && "Completed"}
                        {session.status === "cancelled" && "Cancelled"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-800/40 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                      <p className="text-gray-300">{session.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/40 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-white mb-3">Date & Time</h3>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-300">
                            <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                            <span>{format(new Date(session.date), 'EEEE, MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Clock className="h-5 w-5 mr-3 text-blue-400" />
                            <span>{session.startTime} - {session.endTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/40 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-white mb-3">Location</h3>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-300">
                            <MapPin className="h-5 w-5 mr-3 text-blue-400" />
                            <span>{session.location}</span>
                          </div>
                          {session.virtualMeetingLink && (
                            <div className="flex items-center text-gray-300">
                              <a 
                                href={session.virtualMeetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline flex items-center"
                              >
                                <span>Join Virtual Meeting</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/40 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-3">Registration</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-300">
                          <Users className="h-5 w-5 mr-3 text-blue-400" />
                          <span>{session.registeredCount || 0} / {session.capacity} registered</span>
                        </div>
                        <Badge variant={session.registeredCount >= session.capacity ? "destructive" : "outline"} 
                              className={session.registeredCount >= session.capacity 
                                ? "bg-red-900/30 text-red-300 border-red-800" 
                                : "bg-green-900/30 text-green-300 border-green-800"}>
                          {session.registeredCount >= session.capacity ? "Full" : "Open"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="registrations">
              <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Registered Students</CardTitle>
                  <CardDescription className="text-gray-400">
                    {registrations?.length || 0} students registered for this session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRegistrationsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Loading registrations...</p>
                    </div>
                  ) : registrations?.length === 0 ? (
                    <div className="text-center py-8 bg-gray-800/40 rounded-lg">
                      <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium text-gray-300">No Registrations Yet</h3>
                      <p className="text-gray-400 mt-2">No students have registered for this session yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-800/40">
                          <TableRow>
                            <TableHead className="text-gray-300">Student</TableHead>
                            <TableHead className="text-gray-300">Email</TableHead>
                            <TableHead className="text-gray-300">Department</TableHead>
                            <TableHead className="text-gray-300">Year</TableHead>
                            <TableHead className="text-gray-300">Registered On</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations?.map((registration) => (
                            <TableRow key={registration.id} className="border-gray-800">
                              <TableCell className="font-medium text-white">
                                {registration.studentName || "Unknown Student"}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {registration.studentEmail ? (
                                  <a href={`mailto:${registration.studentEmail}`} className="text-blue-400 hover:underline flex items-center">
                                    <Mail className="h-4 w-4 mr-1" />
                                    {registration.studentEmail}
                                  </a>
                                ) : "No email provided"}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {registration.studentDepartment || "Not specified"}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {registration.studentYear || "Not specified"}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {registration.createdAt ? format(new Date(registration.createdAt), 'MMM d, yyyy') : "Unknown"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!isOwner && (
          <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl mb-6">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl text-white">{session.title}</CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    Created by {session.facultyName || "Faculty"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                    {session.category === "web" && "Web Development"}
                    {session.category === "ai" && "AI & Machine Learning"}
                    {session.category === "cloud" && "Cloud Computing"}
                    {session.category === "mobile" && "Mobile Development"}
                    {session.category === "security" && "Cybersecurity"}
                    {session.category === "other" && "Other"}
                  </Badge>
                  <Badge variant="outline" className={
                    session.status === "upcoming" ? "bg-green-900/30 text-green-300 border-green-800" :
                    session.status === "ongoing" ? "bg-blue-900/30 text-blue-300 border-blue-800" :
                    session.status === "completed" ? "bg-gray-900/30 text-gray-300 border-gray-800" :
                    "bg-red-900/30 text-red-300 border-red-800"
                  }>
                    {session.status === "upcoming" && "Upcoming"}
                    {session.status === "ongoing" && "Ongoing"}
                    {session.status === "completed" && "Completed"}
                    {session.status === "cancelled" && "Cancelled"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                  <p className="text-gray-300">{session.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/40 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Date & Time</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                        <span>{format(new Date(session.date), 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="h-5 w-5 mr-3 text-blue-400" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/40 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Location</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-5 w-5 mr-3 text-blue-400" />
                        <span>{session.location}</span>
                      </div>
                      {session.virtualMeetingLink && (
                        <div className="flex items-center text-gray-300">
                          <a 
                            href={session.virtualMeetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center"
                          >
                            <span>Join Virtual Meeting</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Registration</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-300">
                      <Users className="h-5 w-5 mr-3 text-blue-400" />
                      <span>{session.registeredCount || 0} / {session.capacity} registered</span>
                    </div>
                    <Badge variant={session.registeredCount >= session.capacity ? "destructive" : "outline"} 
                          className={session.registeredCount >= session.capacity 
                            ? "bg-red-900/30 text-red-300 border-red-800" 
                            : "bg-green-900/30 text-green-300 border-green-800"}>
                      {session.registeredCount >= session.capacity ? "Full" : "Open"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <EditSessionDialog 
            isOpen={isEditDialogOpen} 
            onClose={() => setIsEditDialogOpen(false)} 
            session={session}
            sessionId={id}
          />
        )}
      </div>
    </Layout>
  );
}

function EditSessionDialog({ isOpen, onClose, session, sessionId }: { 
  isOpen: boolean; 
  onClose: () => void; 
  session: any;
  sessionId: string;
}) {
  const { toast } = useToast();
  const updateSession = useUpdateTechSession(sessionId);
  
  const [formData, setFormData] = useState({
    title: session.title,
    description: session.description,
    date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
    startTime: session.startTime || '',
    endTime: session.endTime || '',
    location: session.location || '',
    virtualMeetingLink: session.virtualMeetingLink || '',
    capacity: session.capacity || 30,
    category: session.category || 'other',
    status: session.status || 'upcoming'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSession.mutate(formData, {
      onSuccess: () => {
        onClose();
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F172A] border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Tech Session</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the details of your tech session.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white">Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select name="category" value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-[#1E293B] border-gray-800 text-white hover:bg-[#1E293B]/80 transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-gray-800 text-white">
                  <SelectItem value="web" className="hover:bg-blue-600/20">Web Development</SelectItem>
                  <SelectItem value="ai" className="hover:bg-blue-600/20">AI & Machine Learning</SelectItem>
                  <SelectItem value="cloud" className="hover:bg-blue-600/20">Cloud Computing</SelectItem>
                  <SelectItem value="mobile" className="hover:bg-blue-600/20">Mobile Development</SelectItem>
                  <SelectItem value="security" className="hover:bg-blue-600/20">Cybersecurity</SelectItem>
                  <SelectItem value="other" className="hover:bg-blue-600/20">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-white">Start Time</Label>
              <Input 
                id="startTime" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-white">End Time</Label>
              <Input 
                id="endTime" 
                name="endTime" 
                value={formData.endTime} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Location</Label>
              <Input 
                id="location" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-white">Capacity</Label>
              <Input 
                id="capacity" 
                name="capacity" 
                type="number" 
                min="1"
                value={formData.capacity} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="virtualMeetingLink" className="text-white">Virtual Meeting Link (Optional)</Label>
              <Input 
                id="virtualMeetingLink" 
                name="virtualMeetingLink" 
                value={formData.virtualMeetingLink} 
                onChange={handleChange} 
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 