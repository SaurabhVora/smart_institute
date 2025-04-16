import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle, CheckCircle, Mail, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ProfileCompletionData = {
  isComplete: boolean;
  missingFields: string[];
  emailVerified: boolean;
};

export function ProfileCompletion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileCompletionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/profile-completion");
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkProfileCompletion();
    }
  }, [user]);

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        });
      } else {
        toast({
          title: "Failed to send verification email",
          description: data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading || !profileData || (profileData.isComplete && profileData.emailVerified)) {
    return null;
  }

  return (
    <Card className="mb-6 bg-[#0F172A] border-yellow-600/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
          Complete Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!profileData.isComplete && (
            <div className="flex items-start">
              <User className="h-5 w-5 mr-3 mt-0.5 text-yellow-500" />
              <div>
                <p className="text-white">Your profile is incomplete</p>
                <p className="text-sm text-gray-400">
                  Please complete your profile to access all features.
                  {profileData.missingFields.length > 0 && (
                    <span> Missing: {profileData.missingFields.join(", ")}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {!profileData.emailVerified && (
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 mt-0.5 text-yellow-500" />
              <div>
                <p className="text-white">Your email is not verified</p>
                <p className="text-sm text-gray-400">
                  Please verify your email to ensure you receive important notifications.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!profileData.isComplete && (
          <Link href="/profile">
            <Button variant="outline" className="border-yellow-600/50 text-white hover:bg-yellow-600/20">
              Complete Profile
            </Button>
          </Link>
        )}
        
        {!profileData.emailVerified && (
          <Button 
            variant="outline" 
            className="border-yellow-600/50 text-white hover:bg-yellow-600/20"
            onClick={handleResendVerification}
            disabled={resendingEmail}
          >
            {resendingEmail ? "Sending..." : "Resend Verification Email"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 