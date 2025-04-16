import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Calendar, DollarSign, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Internship, InternshipCategory, InternshipType } from "@/types/internship";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Define the form schema
const internshipSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  stipend: z.string().min(1, "Stipend is required"),
  deadline: z.string().min(1, "Application deadline is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["Full-time", "Part-time"]),
  category: z.enum([
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning", 
    "Cloud Computing",
    "Cybersecurity",
    "UI/UX Design",
    "DevOps",
    "Blockchain",
    "Other"
  ]),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

type InternshipFormValues = z.infer<typeof internshipSchema>;

interface InternshipCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InternshipFormValues) => void;
  initialData?: Internship | null;
}

export function InternshipCreationForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: InternshipCreationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);

  const form = useForm<InternshipFormValues>({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      title: initialData?.title || "",
      company: initialData?.company || "",
      location: initialData?.location || "",
      duration: initialData?.duration || "",
      stipend: initialData?.stipend || "",
      deadline: initialData?.deadline || new Date().toLocaleDateString(),
      description: initialData?.description || "",
      type: initialData?.type || "Full-time",
      category: initialData?.category || "Web Development",
      skills: initialData?.skills || [],
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        company: initialData.company,
        location: initialData.location,
        duration: initialData.duration,
        stipend: initialData.stipend,
        deadline: initialData.deadline,
        description: initialData.description,
        type: initialData.type,
        category: initialData.category,
        skills: initialData.skills,
      });
      setSkills(initialData.skills);
    }
  }, [initialData, form]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      form.setValue("skills", newSkills);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = skills.filter(s => s !== skill);
    setSkills(newSkills);
    form.setValue("skills", newSkills);
  };

  const handleSubmit = async (data: InternshipFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        skills: skills,
      });
      
      toast({
        title: initialData ? "Internship updated" : "Internship created",
        description: initialData 
          ? "The internship has been successfully updated" 
          : "The internship has been successfully created",
        variant: "success",
      });
      
      onClose();
      if (!initialData) {
        form.reset();
        setSkills([]);
      }
    } catch (error) {
      toast({
        title: initialData ? "Update failed" : "Creation failed",
        description: `There was an error ${initialData ? 'updating' : 'creating'} the internship. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-[#1E293B] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {initialData ? "Edit Internship" : "Create New Internship"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {initialData 
              ? "Update the internship details below."
              : "Fill in the details to create a new internship opportunity for students."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Internship Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Frontend Developer Intern"
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Company Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Tech Solutions Inc."
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-blue-400" />
                        Location
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Remote, Hybrid, On-site"
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-400" />
                        Duration
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 3 months, 6 months"
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stipend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-blue-400" />
                        Stipend
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., $1000/month"
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-blue-400" />
                        Application Deadline
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="e.g., March 31, 2023"
                        className="bg-[#162032] border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400 text-xs">
                      Enter date in any format (e.g., "March 31, 2023" or "31/03/2023")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Internship Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#162032] border-gray-700 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1E293B] border-gray-700 text-white">
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#162032] border-gray-700 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1E293B] border-gray-700 text-white">
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="Product Management">Product Management</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the internship, responsibilities, and requirements..."
                      className="bg-[#162032] border-gray-700 text-white min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel className="text-gray-300">Required Skills</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g., React, Python, UI/UX"
                        className="bg-[#162032] border-gray-700 text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSkill}
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20 transition-colors duration-200 flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-300 hover:text-blue-100 ml-1 h-4 w-4 rounded-full flex items-center justify-center"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.skills && (
                    <p className="text-sm font-medium text-destructive mt-1">
                      {form.formState.errors.skills.message}
                    </p>
                  )}
                  <FormDescription className="text-gray-400 text-xs">
                    Press Enter or click Add to add a skill
                  </FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {initialData ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  initialData ? "Update Internship" : "Create Internship"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 