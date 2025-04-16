import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [, params] = useRoute("/verify-email/:token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!params?.token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await fetch(`/api/verify-email/${params.token}`);
        const data = await response.json();

        if (response.ok && data.verified) {
          setStatus("success");
          toast({
            title: "Email verified",
            description: "Your email has been successfully verified.",
          });
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email");
          toast({
            title: "Verification failed",
            description: data.message || "Failed to verify email",
            variant: "destructive",
          });
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
        toast({
          title: "Verification error",
          description: "An error occurred during verification",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [params?.token, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E293B] p-4">
      <Card className="w-full max-w-md bg-[#0F172A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
              <p className="text-white text-center">Verifying your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-gray-300 text-center mb-6">
                Your email has been successfully verified. You can now access all features of the platform.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-gray-300 text-center mb-6">
                {message || "We couldn't verify your email. The link may be invalid or expired."}
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Go to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 