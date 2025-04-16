import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Internship } from "@/types/internship";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Define the form schema
const applicationSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  semester: z.string().min(1, "Semester is required"),
  degreeProgram: z.string().min(1, "Degree program is required"),
  coverLetter: z.string().optional(),
  resume: z.instanceof(File, { message: "Resume is required" }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface InternshipApplicationFormProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormValues) => void;
}

export function InternshipApplicationForm({
  internship,
  isOpen,
  onClose,
  onSubmit,
}: InternshipApplicationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      phone: "",
      semester: "",
      degreeProgram: "",
      coverLetter: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Resume file must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(fileType || '')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
      form.setValue("resume", file);
    }
  };

  const handleSubmit = async (data: ApplicationFormValues) => {
    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create application data with user info from auth
      const applicationData = {
        ...data,
        resume: resumeFile,
        // We don't need to send these as they're pulled from the auth context on the server
        // fullName: user?.name,
        // email: user?.email,
        // enrollmentNumber: user?.enrollmentNumber,
      };
      
      await onSubmit(applicationData);
      
      toast({
        title: "Application submitted",
        description: `You have successfully applied for ${internship?.title} at ${internship?.company}`,
        variant: "success",
      });
      
      onClose();
      form.reset();
      setResumeFile(null);
    } catch (error) {
      toast({
        title: "Application failed",
        description: error instanceof Error 
          ? error.message 
          : "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#1E293B] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Apply for Internship</DialogTitle>
          <DialogDescription className="text-gray-400">
            {internship ? (
              <>
                {internship.title} at {internship.company}
              </>
            ) : (
              "Complete the form below to apply for this internship"
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* User information section (read-only, from auth) */}
            <div className="bg-[#162032]/50 p-4 rounded-lg mb-4 border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Your Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-sm text-gray-200">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-200">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Enrollment Number</p>
                  <p className="text-sm text-gray-200">{user?.enrollmentNumber}</p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your phone number"
                      className="bg-[#162032] border-gray-700 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Current Semester</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 4th semester"
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="degreeProgram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Degree Program</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., B.Tech in Computer Science"
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Cover Letter (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Why are you interested in this internship? What makes you a good fit?"
                      className="w-full min-h-[100px] px-3 py-2 text-base bg-[#162032] border border-gray-700 rounded-md text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resume"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Resume</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors bg-[#162032]/50" onClick={() => document.getElementById('resume-upload')?.click()}>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                        {...field}
                      />
                      
                      {resumeFile ? (
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                            <Upload className="h-6 w-6 text-blue-400" />
                          </div>
                          <p className="text-sm font-medium text-white">{resumeFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs border-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setResumeFile(null);
                              form.setValue("resume", undefined as any);
                            }}
                          >
                            Change file
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-gray-700/30 flex items-center justify-center mb-2">
                            <Upload className="h-6 w-6 text-gray-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-300">Upload your resume</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-8 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="border-gray-700 text-gray-300"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 