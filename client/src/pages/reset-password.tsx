import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useRoute, Redirect } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PasswordInput } from "@/components/ui/password-input";
import { motion } from "framer-motion";

// Password strength validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number"
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    "Password must contain at least one special character"
  );

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 12.5;
  if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
  
  return Math.min(strength, 100);
};

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/reset-password/:token");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!params?.token) {
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-reset-token/${params.token}`);
        const data = await response.json();
        setIsTokenValid(data.valid);
      } catch (error) {
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [params?.token]);

  // Update password strength when password changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value.password || ''));
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: ResetPasswordData) => {
    if (!params?.token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: params.token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password",
      });

      // Redirect to login
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // If token is invalid, redirect to forgot password
  if (isTokenValid === false) {
    return <Redirect to="/forgot-password" />;
  }

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
            {isTokenValid === null ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-300">Verifying your reset link...</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-gray-300 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                            New Password
                          </Label>
                          <FormControl>
                            <PasswordInput 
                              className="bg-[#1E293B] border-gray-700 text-white"
                              disabled={isLoading}
                              {...field} 
                            />
                          </FormControl>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Password strength:</span>
                              <span className={passwordStrength < 40 ? "text-red-400" : passwordStrength < 70 ? "text-yellow-400" : "text-green-400"}>
                                {passwordStrength < 40 ? "Weak" : passwordStrength < 70 ? "Medium" : "Strong"}
                              </span>
                            </div>
                            <Progress value={passwordStrength} className="h-1.5 bg-gray-700" indicatorClassName={getStrengthColor()} />
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="flex items-center gap-1 text-xs">
                                {/[A-Z]/.test(field.value) ? (
                                  <Check className="h-3 w-3 text-green-400" />
                                ) : (
                                  <X className="h-3 w-3 text-red-400" />
                                )}
                                <span className="text-gray-400">Uppercase</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                {/[a-z]/.test(field.value) ? (
                                  <Check className="h-3 w-3 text-green-400" />
                                ) : (
                                  <X className="h-3 w-3 text-red-400" />
                                )}
                                <span className="text-gray-400">Lowercase</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                {/[0-9]/.test(field.value) ? (
                                  <Check className="h-3 w-3 text-green-400" />
                                ) : (
                                  <X className="h-3 w-3 text-red-400" />
                                )}
                                <span className="text-gray-400">Number</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                {/[^A-Za-z0-9]/.test(field.value) ? (
                                  <Check className="h-3 w-3 text-green-400" />
                                ) : (
                                  <X className="h-3 w-3 text-red-400" />
                                )}
                                <span className="text-gray-400">Special</span>
                              </div>
                            </div>
                          </div>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-gray-300">Confirm Password</Label>
                          <FormControl>
                            <PasswordInput 
                              className="bg-[#1E293B] border-gray-700 text-white"
                              disabled={isLoading}
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
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 