import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { z } from "zod";
import { GraduationCap, User, Lock, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Updated schema to accept either username or email format
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, loginMutation } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#1E293B]">
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="bg-[#0F172A] border-gray-800 shadow-xl overflow-hidden">
              <div className="h-1 bg-gray-700" />
              
              <CardHeader>
                <div className="flex justify-center">
                  <Skeleton className="h-8 w-40" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <div className="flex justify-end">
                  <Skeleton className="h-4 w-32" />
                </div>
                
                <Skeleton className="h-10 w-full" />
              </CardContent>
              
              <CardFooter className="flex justify-center">
                <Skeleton className="h-5 w-64" />
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-center justify-center bg-[#0F172A] p-8">
          <Skeleton className="h-24 w-24 rounded-full mb-8" />
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-2" />
          <Skeleton className="h-4 w-5/6 max-w-md mb-2" />
          <Skeleton className="h-4 w-4/6 max-w-md" />
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
              <CardTitle className="text-2xl text-center text-white flex justify-center items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                <span>Welcome Back!</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-gray-300 flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-400" />
                            Username or Email
                          </Label>
                          <FormControl>
                            <Input className="bg-[#1E293B] border-gray-700 text-white" {...field} />
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
                            <Lock className="h-4 w-4 text-blue-400" />
                            Password
                          </Label>
                          <FormControl>
                            <PasswordInput className="bg-[#1E293B] border-gray-700 text-white" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <div className="text-right">
                      <Link href="/forgot-password">
                        <motion.span 
                          className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                        >
                          Forgot Password?
                        </motion.span>
                      </Link>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-300">
                Don't have an account?{" "}
                <Link href="/register">
                  <motion.span 
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    Register here
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
          <GraduationCap className="h-24 w-24 mb-8 text-blue-400" />
        </motion.div>
        <motion.h1 
          className="text-4xl font-bold mb-4 text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Internship Management Portal
        </motion.h1>
        <motion.p 
          className="text-lg text-center max-w-md text-gray-300"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Streamline your internship process with our comprehensive management system.
          Track documents, connect with mentors, and manage your internship journey efficiently.
        </motion.p>
      </motion.div>
    </div>
  );
} 