import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Plus, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFacultyTechSessions, useCreateTechSession, useDeleteTechSession, useUpdateTechSession } from "@/hooks/use-tech-sessions";
import { TechSession } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function FacultyTechSessions() {
  const { data: sessions, isLoading } = useFacultyTechSessions();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Filter sessions based on status
  const upcomingSessions = sessions?.filter(session => session.status === "upcoming") || [];
  const ongoingSessions = sessions?.filter(session => session.status === "ongoing") || [];
  const completedSessions = sessions?.filter(session => session.status === "completed") || [];
  const cancelledSessions = sessions?.filter(session => session.status === "cancelled") || [];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">My Tech Sessions</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400">Loading tech sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Tech Sessions</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Session
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-[#0F172A] border border-gray-800">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="data-[state=active]:bg-blue-600">
            Ongoing ({ongoingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600">
            Completed ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-blue-600">
            Cancelled ({cancelledSessions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <SessionsList sessions={upcomingSessions} />
        </TabsContent>
        
        <TabsContent value="ongoing">
          <SessionsList sessions={ongoingSessions} />
        </TabsContent>
        
        <TabsContent value="completed">
          <SessionsList sessions={completedSessions} />
        </TabsContent>
        
        <TabsContent value="cancelled">
          <SessionsList sessions={cancelledSessions} />
        </TabsContent>
      </Tabs>

      <CreateSessionDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
      />
    </div>
  );
}

function SessionsList({ sessions }: { sessions: TechSession[] }) {
  const deleteSession = useDeleteTechSession();
  const [editingSession, setEditingSession] = useState<TechSession | null>(null);
  
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-[#0F172A] rounded-lg border border-gray-800">
        <p className="text-gray-400">No sessions found</p>
      </div>
    );
  }
  
  const handleDelete = (id: string) => {
    deleteSession.mutate(id);
  };
  
  const handleViewDetails = (id: string) => {
    window.location.href = `/tech-session-details/${id}`;
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="bg-[#0F172A] border-gray-800 overflow-hidden h-full flex flex-col">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-white">{session.title}</CardTitle>
                <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                  {session.category === "web" && "Web Dev"}
                  {session.category === "ai" && "AI/ML"}
                  {session.category === "cloud" && "Cloud"}
                  {session.category === "mobile" && "Mobile"}
                  {session.category === "security" && "Security"}
                  {session.category === "other" && "Other"}
                </Badge>
              </div>
              <CardDescription className="text-gray-400 mt-1">
                {session.description.length > 100 
                  ? `${session.description.substring(0, 100)}...` 
                  : session.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                  <span>{format(new Date(session.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-blue-400" />
                  <span>{session.startTime} - {session.endTime}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Capacity: {session.capacity}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-800 pt-4 flex justify-between">
              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-800 text-blue-400 hover:bg-blue-900/20"
                  onClick={() => handleViewDetails(session.id)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-800 text-blue-400 hover:bg-blue-900/20"
                  onClick={() => setEditingSession(session)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-800 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
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
                        onClick={() => handleDelete(session.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {editingSession && (
        <EditSessionDialog 
          isOpen={!!editingSession} 
          onClose={() => setEditingSession(null)} 
          session={editingSession}
          sessionId={editingSession.id}
        />
      )}
    </>
  );
}

function CreateSessionDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    virtualMeetingLink: "",
    capacity: 30,
    category: "other",
  });
  
  const createSession = useCreateTechSession();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSession.mutate(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          location: "",
          virtualMeetingLink: "",
          capacity: 30,
          category: "other",
        });
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F172A] border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Tech Session</DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill in the details to create a new tech session or seminar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Web Development with React"
                className="bg-[#1E293B] border-gray-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange("category", value)}
              >
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
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a brief description of the tech session"
                className="bg-[#1E293B] border-gray-700 min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-[#1E293B] border-gray-700"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="bg-[#1E293B] border-gray-700"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="bg-[#1E293B] border-gray-700"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Room 301 or Virtual (Zoom)"
                className="bg-[#1E293B] border-gray-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                max="500"
                value={formData.capacity}
                onChange={handleChange}
                className="bg-[#1E293B] border-gray-700"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="virtualMeetingLink">Virtual Meeting Link (Optional)</Label>
              <Input
                id="virtualMeetingLink"
                name="virtualMeetingLink"
                value={formData.virtualMeetingLink}
                onChange={handleChange}
                placeholder="e.g., https://zoom.us/j/123456789"
                className="bg-[#1E293B] border-gray-700"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createSession.isPending}
            >
              {createSession.isPending ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    location: session.location,
    capacity: session.capacity,
    category: session.category,
    status: session.status,
    virtualMeetingLink: session.virtualMeetingLink || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSession.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Tech session updated successfully",
          variant: "default",
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to update tech session",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F172A] border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Tech Session</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the details of your tech session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="bg-[#1E293B] border-gray-700"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="bg-[#1E293B] border-gray-700 min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="bg-[#1E293B] border-gray-700"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="category">Category</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  name="startTime" 
                  type="time" 
                  value={formData.startTime} 
                  onChange={handleChange} 
                  className="bg-[#1E293B] border-gray-700"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  name="endTime" 
                  type="time" 
                  value={formData.endTime} 
                  onChange={handleChange} 
                  className="bg-[#1E293B] border-gray-700"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="bg-[#1E293B] border-gray-700"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input 
                  id="capacity" 
                  name="capacity" 
                  type="number" 
                  value={formData.capacity} 
                  onChange={handleChange} 
                  className="bg-[#1E293B] border-gray-700"
                  required
                  min={1}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-[#1E293B] border-gray-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-gray-700">
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="virtualMeetingLink">Virtual Meeting Link (Optional)</Label>
                <Input 
                  id="virtualMeetingLink" 
                  name="virtualMeetingLink" 
                  value={formData.virtualMeetingLink} 
                  onChange={handleChange} 
                  className="bg-[#1E293B] border-gray-700"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateSession.isLoading}
            >
              {updateSession.isLoading ? "Updating..." : "Update Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 