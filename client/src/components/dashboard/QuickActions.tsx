import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Users, Settings } from "lucide-react";
import { QuickActionsProps } from "./types";

export function QuickActions({ role }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {role === "student" && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Upload Document
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> View Reports
              </Button>
            </>
          )}
          {role === "faculty" && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> View Students
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Review Documents
              </Button>
            </>
          )}
          {role === "admin" && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Manage Users
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 