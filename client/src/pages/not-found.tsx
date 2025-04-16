import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1E293B] p-4">
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
              <AlertCircle className="h-6 w-6 text-red-400" />
              <span>404 - Page Not Found</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="py-6"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-400" />
              </div>
              
              <p className="text-gray-300 mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex justify-center gap-4 pb-6">
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </motion.div>
            </Link>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
