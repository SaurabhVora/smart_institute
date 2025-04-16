import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Loader2, Camera, CheckCircle, User, Mail, Phone, Building2, GraduationCap, BookOpen, Briefcase, FileText, Github, Linkedin, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout";
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { ProfileSkeleton } from "@/components/ui/skeleton";

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Other"
] as const;

const STUDY_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

const INDUSTRIES = [
  "Technology",
  "Manufacturing",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Other"
] as const;

// Define user type
interface User {
  id: number;
  username: string;
  role: "admin" | "faculty" | "student" | "company";
  name: string;
  email: string | null;
  emailVerified: boolean | null;
  phone: string | null;
  university: string | null;
  department: string | null;
  year: string | null;
  enrollmentNumber: string | null;
  bio: string | null;
  companyName: string | null;
  industry: string | null;
  position: string | null;
  expertise: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  profileCompleted: boolean | null;
}

// Profile Picture Upload Component
const ProfilePictureUpload = ({ currentImage, onImageUpload }: { currentImage?: string; onImageUpload: (file: File) => void }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`relative group cursor-pointer rounded-full ${
          isDragging ? 'ring-2 ring-blue-500' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Avatar className="h-32 w-32">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt="Profile" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-blue-600 text-2xl">
              {currentImage ? "..." : "?"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-8 w-8 text-white" />
        </div>
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-sm text-gray-400">
        Click or drag to upload profile picture
      </p>
    </div>
  );
};

// Profile Completion Indicator
const ProfileCompletion = ({ progress }: { progress: number }) => {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Profile Completion</span>
        <span className="text-sm font-medium text-white">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-green-500"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Profile Complete!</span>
        </motion.div>
      )}
    </div>
  );
};

// Define the base profile schema type
const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  github: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Please enter a valid URL").optional().or(z.literal(""))
});

// Define the student profile schema type
const studentProfileSchema = baseProfileSchema.extend({
  university: z.string().min(2, "University name is required"),
  department: z.string().min(1, "Please select a department"),
  year: z.string().min(1, "Please select your year of study"),
  enrollmentNumber: z.string().min(1, "Enrollment number is required"),
  bio: z.string().optional()
});

// Define the faculty profile schema type
const facultyProfileSchema = baseProfileSchema.extend({
  department: z.string().min(1, "Please select a department"),
  position: z.string().min(2, "Position is required"),
  expertise: z.string().min(2, "Area of expertise is required"),
  bio: z.string().optional()
});

// Define the company profile schema type
const companyProfileSchema = baseProfileSchema.extend({
  companyName: z.string().min(2, "Company name is required"),
  industry: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  bio: z.string().optional()
});

// Create the profile schema based on user role
const createProfileSchema = (role: string) => {
  switch (role) {
    case "student":
      return studentProfileSchema;
    case "faculty":
      return facultyProfileSchema;
    case "company":
      return companyProfileSchema;
    default:
      return baseProfileSchema;
  }
};

// Social Links Section Component
const SocialLinks = ({ control }: { control: any }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="linkedin"
        render={({ field }) => (
          <FormItem>
            <Label className="text-gray-300 flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-400" />
              LinkedIn Profile
            </Label>
            <FormControl>
              <Input 
                className="bg-[#1E293B] border-gray-800 text-white" 
                placeholder="https://linkedin.com/in/username"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="github"
        render={({ field }) => (
          <FormItem>
            <Label className="text-gray-300 flex items-center gap-2">
              <Github className="h-4 w-4 text-blue-400" />
              GitHub Profile
            </Label>
            <FormControl>
              <Input 
                className="bg-[#1E293B] border-gray-800 text-white" 
                placeholder="https://github.com/username"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="portfolio"
        render={({ field }) => (
          <FormItem>
            <Label className="text-gray-300 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-400" />
              Portfolio Website
            </Label>
            <FormControl>
              <Input 
                className="bg-[#1E293B] border-gray-800 text-white" 
                placeholder="https://yourportfolio.com"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

// Main profile page component
export default function ProfilePage() {
  const auth = useAuth();
  const user = auth.user as User | null;
  const updateUser = (updatedUser: User) => {
    auth.updateUser({...updatedUser, password: ''} as any);
  };
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = (data: ProfileFormData): number => {
    const totalFields = Object.keys(data).length;
    const filledFields = Object.values(data).filter(value => value && value !== "").length;
    return Math.round((filledFields / totalFields) * 100);
  };

  // Create form schema based on user role
  const profileSchema = createProfileSchema(user?.role || "student");
  type ProfileFormData = z.infer<typeof profileSchema>;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      linkedin: user?.linkedin || "",
      github: user?.github || "",
      portfolio: user?.portfolio || "",
      ...(user?.role === "student" && {
        university: user?.university || "",
        department: user?.department || "",
        year: user?.year || "",
        enrollmentNumber: user?.enrollmentNumber || "",
        bio: user?.bio || "",
      }),
      ...(user?.role === "faculty" && {
        department: user?.department || "",
        position: user?.position || "",
        expertise: user?.expertise || "",
        bio: user?.bio || "",
      }),
      ...(user?.role === "company" && {
        companyName: user?.companyName || "",
        industry: user?.industry || "",
        position: user?.position || "",
        bio: user?.bio || "",
      }),
    } as ProfileFormData,
  });

  // Handle profile image upload
  const handleImageUpload = async (file: File) => {
    // TODO: Implement image upload logic
    setProfileImage(URL.createObjectURL(file));
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update the user data in the auth context
      const updatedUser = await response.json();
      updateUser(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "success"
      });
      
      // Invalidate the profile-completion query to force a refresh
      queryClient.invalidateQueries({ queryKey: ["/api/profile-completion"] });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { data: profileData, isLoading: profileDataLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      return response.json();
    },
  });

  // Render skeleton loaders during loading
  if (profileDataLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        <div className="container mx-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>
            <div className="bg-[#1E293B] rounded-lg p-6">
              <ProfileSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="bg-[#0F172A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfilePictureUpload
                  currentImage={profileImage || undefined}
                  onImageUpload={handleImageUpload}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#0F172A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-300 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-400" />
                          Full Name
                        </Label>
                        <FormControl>
                          <Input
                            className="bg-[#1E293B] border-gray-800 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-400" />
                          Email
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-[#1E293B] border-gray-800 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-400" />
                          Phone
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-[#1E293B] border-gray-800 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user?.role === "student" && (
                    <>
                      <FormField
                        control={form.control}
                        name={"university" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-400" />
                              University
                            </Label>
                            <FormControl>
                              <Input
                                className="bg-[#1E293B] border-gray-800 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={"department" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-400" />
                              Department
                            </Label>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#1E293B] border-gray-800 text-white">
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="computer">Computer Engineering</SelectItem>
                                <SelectItem value="electronics">Electronics Engineering</SelectItem>
                                <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                                <SelectItem value="civil">Civil Engineering</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={"year" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-400" />
                              Year of Study
                            </Label>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#1E293B] border-gray-800 text-white">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={"enrollmentNumber" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-400" />
                              Enrollment Number
                            </Label>
                            <FormControl>
                              <Input
                                className="bg-[#1E293B] border-gray-800 text-white"
                                placeholder="e.g. 2021CS1234"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {user?.role === "faculty" && (
                    <>
                      <FormField
                        control={form.control}
                        name={"position" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-blue-400" />
                              Position
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-[#1E293B] border-gray-800 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={"expertise" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-400" />
                              Area of Expertise
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-[#1E293B] border-gray-800 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {user?.role === "company" && (
                    <>
                      <FormField
                        control={form.control}
                        name={"companyName" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-400" />
                              Company Name
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-[#1E293B] border-gray-800 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={"industry" as keyof ProfileFormData}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-gray-300 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-400" />
                              Industry
                            </Label>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-[#1E293B] border-gray-800 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Social Links</h3>
                  <SocialLinks control={form.control} />
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </Layout>
  );
} 