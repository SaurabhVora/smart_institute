import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document, FacultyAllocation } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Users, FileText } from "lucide-react";

type FacultyOverviewProps = {
  documents: Document[];
  allocations: FacultyAllocation[];
};

export function FacultyOverview({ documents, allocations }: FacultyOverviewProps) {
  const pendingDocuments = documents?.filter(doc => doc.status === "pending").length || 0;
  const activeStudents = allocations?.filter(alloc => alloc.status === "active").length || 0;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Active Students</span>
              <Badge>{activeStudents}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Allocations</span>
              <Badge variant="secondary">{allocations?.length || 0}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Pending Reviews</span>
              <Badge variant="secondary">{pendingDocuments}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Documents</span>
              <Badge variant="secondary">{documents?.length || 0}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
