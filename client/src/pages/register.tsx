import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link, useLocation } from "wouter";
import { GraduationCap, BookOpen, Building2, User, Check, X, Mail, Phone, School, Briefcase, Loader2 } from "lucide-react";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { PasswordInput } from "@/components/ui/password-input";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Extended schema for registration
const extendedRegisterSchema = insertUserSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(pw => /[A-Z]/.test(pw), "Must contain uppercase")
    .refine(pw => /[a-z]/.test(pw), "Must contain lowercase")
    .refine(pw => /[0-9]/.test(pw), "Must contain number")
    .refine(pw => /[^A-Za-z0-9]/.test(pw), "Must contain special char"),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  position: z.string().optional(),
  expertise: z.string().optional()
});

// Form schema types
interface BaseFormFields {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "faculty" | "company";
}

interface StudentFields extends BaseFormFields {
  university: string;
  department: string;
  year: string;
  enrollmentNumber: string;
}

interface FacultyFields extends BaseFormFields {
  department: string;
  position: string;
  expertise: string;
}

interface CompanyFields extends BaseFormFields {
  companyName: string;
  industry: string;
  position: string;
}

type RegisterFormData = StudentFields | FacultyFields | CompanyFields;

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  return strength;
};

export default function RegisterPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"student" | "faculty" | "company" | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(extendedRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "student" as const,
      university: "",
      department: "",
      year: "",
      enrollmentNumber: "",
    } as RegisterFormData
  });

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const onRoleSelect = (role: "student" | "faculty" | "company") => {
    setSelectedRole(role);
    form.setValue("role", role);
    setStep(2);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Registration failed");
      }

      const user = await response.json();
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });

      if (data.role === "company") {
        navigate("/profile");
      } else {
        navigate("/login");
      }

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#1E293B]">
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="bg-[#0F172A] border-gray-800 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
              
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mx-auto" />
              </CardHeader>
                
              <CardContent>
                <div className="space-y-6">
                  <Skeleton className="h-6 w-full" />
                  
                  {/* Role selection skeletons */}
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="p-6 border rounded-lg flex items-center border-gray-700 bg-[#1E293B]">
                        <Skeleton className="h-12 w-12 mr-4 rounded-md" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-24 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right side - Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-[#0F172A]">
          <div className="max-w-md space-y-6">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6 mx-auto" />
            <div className="mt-8 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#1E293B]">
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#0F172A] border-gray-800 shadow-xl overflow-hidden">
            <motion.div 
              className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            
          <CardHeader>
              <CardTitle className="text-2xl text-center text-white">
                {step === 1 ? "Choose Your Role" : "Create Your Account"}
              </CardTitle>
          </CardHeader>
            
          <CardContent>
              {step === 1 ? (
                <motion.div 
                  className="flex flex-col space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-white text-lg font-medium mb-2 text-center">Select your role to continue</h3>
                  <motion.div 
                    className="p-6 border rounded-lg cursor-pointer flex items-center border-gray-700 bg-[#1E293B] hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                    onClick={() => onRoleSelect("student")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GraduationCap className="h-12 w-12 mr-4 text-blue-500" />
                    <div>
                      <span className="text-white text-lg font-medium block">Student</span>
                      <p className="text-gray-400 text-sm mt-1">
                        Access educational resources and manage your documents
                      </p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="p-6 border rounded-lg cursor-pointer flex items-center border-gray-700 bg-[#1E293B] hover:border-green-500 hover:bg-green-500/10 transition-all"
                    onClick={() => onRoleSelect("faculty")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.1 }}
                  >
                    <BookOpen className="h-12 w-12 mr-4 text-green-500" />
                    <div>
                      <span className="text-white text-lg font-medium block">Faculty</span>
                      <p className="text-gray-400 text-sm mt-1">
                        Mentor students and approve documents
                      </p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="p-6 border rounded-lg cursor-pointer flex items-center border-gray-700 bg-[#1E293B] hover:border-purple-500 hover:bg-purple-500/10 transition-all"
                    onClick={() => onRoleSelect("company")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Building2 className="h-12 w-12 mr-4 text-purple-500" />
                    <div>
                      <span className="text-white text-lg font-medium block">Company</span>
                      <p className="text-gray-400 text-sm mt-1">
                        Post tech sessions and collaborate with students
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
            <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                      {/* Basic Information - Common for all roles */}
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
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
                                  className="bg-[#1E293B] border-gray-700 text-white" 
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
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
                                  className="bg-[#1E293B] border-gray-700 text-white" 
                                  type="email" 
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
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
                                Phone Number
                              </Label>
                        <FormControl>
                                <Input 
                                  className="bg-[#1E293B] border-gray-700 text-white" 
                                  {...field}
                                  value={field.value || ""}
                                />
                        </FormControl>
                              <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                              <Label className="text-gray-300 flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-400" />
                                Username
                              </Label>
                        <FormControl>
                                <Input 
                                  className="bg-[#1E293B] border-gray-700 text-white" 
                                  {...field}
                                  value={field.value || ""}
                                />
                        </FormControl>
                              <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                              <Label className="text-gray-300 flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-400" />
                                Password
                              </Label>
                              <FormControl>
                                <PasswordInput 
                                  className="bg-[#1E293B] border-gray-700 text-white" 
                                  {...field} 
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setPassword(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Password strength:</span>
                                  <span className={
                                    passwordStrength < 40 ? "text-red-400" : 
                                    passwordStrength < 80 ? "text-yellow-400" : 
                                    "text-green-400"
                                  }>
                                    {passwordStrength < 40 && "Weak"}
                                    {passwordStrength >= 40 && passwordStrength < 80 && "Medium"}
                                    {passwordStrength >= 80 && "Strong"}
                                  </span>
                                </div>
                                <Progress 
                                  value={passwordStrength} 
                                  className={`h-1.5 ${
                                    passwordStrength < 40 ? "bg-red-500" : 
                                    passwordStrength < 80 ? "bg-yellow-500" : 
                                    "bg-green-500"
                                  }`}
                                />
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="flex items-center text-xs">
                                  {password.length >= 8 ? 
                                    <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                                    <X className="h-3 w-3 text-red-500 mr-1" />}
                                  <span className={password.length >= 8 ? "text-green-500" : "text-gray-400"}>
                                    At least 8 characters
                                  </span>
                                </div>
                                <div className="flex items-center text-xs">
                                  {/[A-Z]/.test(password) ? 
                                    <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                                    <X className="h-3 w-3 text-red-500 mr-1" />}
                                  <span className={/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                                    Uppercase letter
                                  </span>
                                </div>
                                <div className="flex items-center text-xs">
                                  {/[a-z]/.test(password) ? 
                                    <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                                    <X className="h-3 w-3 text-red-500 mr-1" />}
                                  <span className={/[a-z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                                    Lowercase letter
                                  </span>
                                </div>
                                <div className="flex items-center text-xs">
                                  {/[0-9]/.test(password) ? 
                                    <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                                    <X className="h-3 w-3 text-red-500 mr-1" />}
                                  <span className={/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}>
                                    Number
                                  </span>
                                </div>
                                <div className="flex items-center text-xs">
                                  {/[^A-Za-z0-9]/.test(password) ? 
                                    <Check className="h-3 w-3 text-green-500 mr-1" /> : 
                                    <X className="h-3 w-3 text-red-500 mr-1" />}
                                  <span className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-400"}>
                                    Special character
                                  </span>
                                </div>
                              </div>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Role-specific fields */}
                      {selectedRole === "student" && (
                        <motion.div 
                          className="space-y-4 pt-4 border-t border-gray-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-400" />
                            Student Information
                          </h3>
                          <FormField
                            control={form.control}
                            name="university"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <School className="h-4 w-4 text-blue-400" />
                                  University
                                </Label>
                                <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-blue-400" />
                                  Department
                                </Label>
                                <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-blue-400" />
                                  Year of Study
                                </Label>
                                <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="enrollmentNumber"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-blue-400" />
                                  Enrollment Number
                                </Label>
                                <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                    placeholder="e.g. 2021CS1234"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}

                      {/* Faculty-specific fields */}
                      {selectedRole === "faculty" && (
                        <motion.div 
                          className="space-y-4 pt-4 border-t border-gray-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-green-400" />
                            Faculty Information
                          </h3>
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-green-400" />
                                  Department
                                </Label>
                                <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-green-400" />
                                  Position
                                </Label>
                                <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="expertise"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-green-400" />
                                  Areas of Expertise
                                </Label>
                                <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}

                      {/* Company-specific fields */}
                      {selectedRole === "company" && (
                        <motion.div 
                          className="space-y-4 pt-4 border-t border-gray-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <h3 className="text-white font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-purple-400" />
                            Company Information
                          </h3>
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-purple-400" />
                                  Company Name
                                </Label>
                        <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                        </FormControl>
                                <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                            name="industry"
                    render={({ field }) => (
                      <FormItem>
                                <Label className="text-gray-300 flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-purple-400" />
                                  Industry
                                </Label>
                          <FormControl>
                                  <Input 
                                    className="bg-[#1E293B] border-gray-700 text-white" 
                                    {...field}
                                    value={field.value || ""}
                                  />
                          </FormControl>
                                <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                        </motion.div>
                      )}

                      <motion.div 
                        className="flex space-x-2 pt-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <Button 
                            type="button" 
                            variant="outline"
                            className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800"
                            onClick={() => setStep(1)}
                          >
                            Back
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={form.formState.isSubmitting}
                  >
                            {form.formState.isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              "Register"
                            )}
                  </Button>
                        </motion.div>
                      </motion.div>
                </div>
              </form>
            </Form>
              )}
          </CardContent>
            
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <Link href="/login">
                  <motion.span 
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                  Login here
                  </motion.span>
              </Link>
            </p>
          </CardFooter>
        </Card>
        </motion.div>
      </div>
      
      <motion.div 
        className="hidden md:flex flex-col items-center justify-center bg-[#0F172A] p-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {selectedRole === "student" && <GraduationCap className="h-24 w-24 mb-8 text-blue-400" />}
          {selectedRole === "faculty" && <BookOpen className="h-24 w-24 mb-8 text-green-400" />}
          {selectedRole === "company" && <Building2 className="h-24 w-24 mb-8 text-purple-400" />}
          {!selectedRole && <User className="h-24 w-24 mb-8 text-blue-400" />}
        </motion.div>
        <motion.h1 
          className="text-4xl font-bold mb-4 text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Join Our Platform
        </motion.h1>
        <motion.p 
          className="text-lg text-center max-w-md text-gray-300"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {selectedRole === "student" && "Start your internship journey with us. Access opportunities, manage documents, and track your progress all in one place."}
          {selectedRole === "faculty" && "Guide students through their internship journey. Review documents, provide feedback, and help shape the next generation of professionals."}
          {selectedRole === "company" && "Find talented interns for your organization. Post positions, review applications, and manage your internship program efficiently."}
          {!selectedRole && "Create an account to access our comprehensive internship management platform. Connect with opportunities, mentors, and resources tailored to your needs."}
        </motion.p>
      </motion.div>
    </div>
  );
} 