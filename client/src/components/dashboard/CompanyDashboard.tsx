import { Link } from "wouter";
import { motion } from "framer-motion";
import { Laptop, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCompletion } from "@/components/profile-completion";
import { CompanyDashboardProps } from "./types";

export function CompanyDashboard({ documents }: CompanyDashboardProps) {
  return (
    <div className="space-y-6">
      <ProfileCompletion />
      
      <Card className="bg-[#0F1A2D] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-lg font-medium text-white">Active Interns</h3>
              <p className="text-sm text-gray-400 mt-1">5</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-lg font-medium text-white">Open Positions</h3>
              <p className="text-sm text-gray-400 mt-1">3</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-lg font-medium text-white">Completed Resources</h3>
              <p className="text-sm text-gray-400 mt-1">12</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Sessions Card */}
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-purple-500/20 p-4 rounded-full">
              <Laptop className="h-12 w-12 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Tech Sessions</h2>
              <p className="text-gray-300 mb-4">
                Create and manage technical sessions for students. Schedule new sessions and track attendance.
              </p>
              <Link href="/tech-sessions">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Laptop className="mr-2 h-4 w-4" />
                  Manage Tech Sessions
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Card */}
      <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-indigo-500/20 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Resources</h2>
              <p className="text-gray-300 mb-4">
                Share educational resources and learning materials with students. Manage and organize study materials.
              </p>
              <Link href="/resources">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Resources
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 