import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { BookOpen, FileText, Link as LinkIcon, Plus, Trash2, Loader2, Download, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ResourceSkeleton } from "@/components/ui/skeleton";

type Resource = {
  id: number;
  title: string;
  description: string;
  url?: string;
  type: "guideline" | "link" | "file";
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  creatorName?: string;
  creatorRole?: string;
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFileUpload, setIsFileUpload] = useState(false);
  
  const isFaculty = user?.role === "faculty";
  const isCompany = user?.role === "company";
  const isAdmin = user?.role === "admin";
  const canManageResources = isFaculty || isCompany || isAdmin;

  const { data: resources, isLoading } = useQuery({
    queryKey: ["/api/resources"],
    queryFn: async () => {
      const response = await fetch("/api/resources");
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      return response.json();
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete resource");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Resource deleted",
        description: "The resource has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete resource: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteResource = (resourceId: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(resourceId);
    }
  };

  const handleDownloadResource = async (resourceId: number) => {
    try {
      toast({
        title: "Downloading...",
        description: "Your resource is being prepared for download.",
      });
      
      // Open the download URL directly in a new tab
      // This bypasses any CORS issues by letting the browser handle the redirect
      window.open(`/api/resources/download/${resourceId}?t=${Date.now()}`, '_blank');
      
      toast({
        title: "Download initiated",
        description: "If the download doesn't start automatically, check your browser's popup settings.",
        variant: "default",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const guidelines = resources?.filter((r: Resource) => r.type === "guideline") || [];
  const links = resources?.filter((r: Resource) => r.type === "link") || [];
  const files = resources?.filter((r: Resource) => r.type === "file") || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Resources</h1>
          
          {user && (user.role === "admin" || user.role === "faculty" || user.role === "company") && (
            <div className="mb-6">
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Resource
              </Button>
            </div>
          )}
          
          <Tabs defaultValue="guidelines" className="w-full">
            <TabsList className="bg-[#1E293B] border-b border-gray-800 w-full justify-start mb-6">
              <TabsTrigger value="guidelines" className="data-[state=active]:bg-[#0F172A]">Guidelines</TabsTrigger>
              <TabsTrigger value="links" className="data-[state=active]:bg-[#0F172A]">Links</TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-[#0F172A]">Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guidelines" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <ResourceSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="links" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <ResourceSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <ResourceSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6"
      >
        {/* Header with gradient border */}
        <Card className="mb-6 bg-[#0F172A] border-gray-800 overflow-hidden">
          <motion.div 
            className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
          />
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  Resources
                </CardTitle>
                <CardDescription>
                  Access document guidelines and useful resources for your internship
                </CardDescription>
              </div>
              {canManageResources && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0F172A] border-gray-800 text-white">
                    <AddResourceForm 
                      onClose={() => setIsAddDialogOpen(false)} 
                      isFileUpload={isFileUpload}
                      setIsFileUpload={setIsFileUpload}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="guidelines" className="space-y-4">
          <TabsList className="bg-[#0F172A] border-gray-800">
            <TabsTrigger value="guidelines" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <FileText className="h-4 w-4" />
              Guidelines
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <LinkIcon className="h-4 w-4" />
              Useful Links
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <File className="h-4 w-4" />
              Files
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <TabsContent value="guidelines" className="space-y-4">
                {guidelines.length === 0 ? (
                  <Card className="bg-[#0F172A] border-gray-800">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-12 w-12 text-gray-500 mb-4" />
                      <p className="text-gray-400">No guidelines available yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  guidelines.map((guideline: Resource) => (
                    <Card key={guideline.id} className="bg-[#0F172A] border-gray-800">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-lg text-white">{guideline.title}</CardTitle>
                            <CardDescription>
                              Added by {guideline.creatorName} on{" "}
                              {new Date(guideline.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          {canManageResources && (guideline.createdBy === user?.id || isAdmin) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-950/50"
                              onClick={() => handleDeleteResource(guideline.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{guideline.description}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="links" className="space-y-4">
                {links.length === 0 ? (
                  <Card className="bg-[#0F172A] border-gray-800">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <LinkIcon className="h-12 w-12 text-gray-500 mb-4" />
                      <p className="text-gray-400">No useful links available yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  links.map((link: Resource) => (
                    <Card key={link.id} className="bg-[#0F172A] border-gray-800">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-lg text-white">{link.title}</CardTitle>
                            <CardDescription>
                              Added by {link.creatorName} on{" "}
                              {new Date(link.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          {canManageResources && (link.createdBy === user?.id || isAdmin) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-950/50"
                              onClick={() => handleDeleteResource(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 mb-3">{link.description}</p>
                        {link.url && (
                          <motion.a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400 flex items-center gap-2 w-fit"
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <LinkIcon className="h-4 w-4" />
                            Visit Resource
                          </motion.a>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                {files.length === 0 ? (
                  <Card className="bg-[#0F172A] border-gray-800">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <File className="h-12 w-12 text-gray-500 mb-4" />
                      <p className="text-gray-400">No files available yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  files.map((file: Resource) => (
                    <Card key={file.id} className="bg-[#0F172A] border-gray-800">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-lg text-white">{file.title}</CardTitle>
                            <CardDescription>
                              Added by {file.creatorName} on{" "}
                              {new Date(file.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-950/50"
                              onClick={() => handleDownloadResource(file.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {canManageResources && (file.createdBy === user?.id || isAdmin) && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-600 hover:bg-red-950/50"
                                onClick={() => handleDeleteResource(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{file.description}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </motion.div>
    </Layout>
  );
}

function AddResourceForm({ 
  onClose, 
  isFileUpload, 
  setIsFileUpload 
}: { 
  onClose: () => void; 
  isFileUpload: boolean;
  setIsFileUpload: (value: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"guideline" | "link" | "file">("guideline");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTypeChange = (value: string) => {
    setType(value as "guideline" | "link" | "file");
    setIsFileUpload(value === "file");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;

      if (isFileUpload && file) {
        // Handle file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);

        response = await fetch("/api/resources/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        // Handle regular resource creation
        response = await fetch("/api/resources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            url: type === "link" ? url : undefined,
            type,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create resource");
      }

      // Refresh resources list
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      
      toast({
        title: "Resource created",
        description: "The resource has been successfully created.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogDescription>
          Create a new resource to share with students and faculty.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Resource Type</Label>
          <Select 
            value={type} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="type" className="bg-[#1E293B] border-gray-700">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-gray-700">
              <SelectItem value="guideline">Guideline</SelectItem>
              <SelectItem value="link">External Link</SelectItem>
              <SelectItem value="file">Uploadable File</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#1E293B] border-gray-700"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#1E293B] border-gray-700 min-h-[100px]"
            required
          />
        </div>
        
        {type === "link" && (
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-[#1E293B] border-gray-700"
              required
            />
          </div>
        )}
        
        {type === "file" && (
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="bg-[#1E293B] border-gray-700"
                required
              />
            </div>
            {file && (
              <p className="text-sm text-gray-400">Selected: {file.name}</p>
            )}
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Resource"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
} 