import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset link');
      }

      toast({
        title: "Reset link sent",
        description: result.message,
      });

      // Clear the form
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1E293B]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/login">
          <motion.div 
            className="flex items-center text-blue-400 hover:text-blue-300 mb-6 cursor-pointer"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Login</span>
          </motion.div>
        </Link>
        
        <Card className="bg-[#0F172A] border-gray-800 shadow-xl overflow-hidden">
          <motion.div 
            className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white flex justify-center items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-400" />
              <span>Reset Password</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <motion.p 
              className="text-gray-300 text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Enter your email address and we'll send you a link to reset your password.
            </motion.p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
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
                            type="email" 
                            placeholder="Enter your email" 
                            disabled={isLoading}
                            className="bg-[#1E293B] border-gray-700 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-300">
              Remember your password?{" "}
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
  );
} 