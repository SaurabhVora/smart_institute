import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document, FacultyAllocation } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type StudentInfoProps = {
  documents: Document[];
  allocations: FacultyAllocation[];
};

export function StudentInfo({ documents, allocations }: StudentInfoProps) {
  const offerLetter = documents?.find(doc => doc.type === "offer_letter");
  const hasActiveInternship = offerLetter?.status === "approved";

  // Fetch faculty details
  const { data: mentorData, isLoading: isMentorLoading } = useQuery({
    queryKey: ["mentor"],
    queryFn: async () => {
      const response = await fetch("/api/student/mentor");
      if (!response.ok) throw new Error("Failed to fetch mentor details");
      return response.json();
    },
    enabled: allocations?.length > 0
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Internship Status</CardTitle>
        </CardHeader>
        <CardContent>
          {hasActiveInternship ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Company</h3>
                <p className="text-muted-foreground">{offerLetter.companyName}</p>
              </div>
              <div>
                <h3 className="font-medium">Domain</h3>
                <p className="text-muted-foreground">{offerLetter.internshipDomain}</p>
              </div>
              <div>
                <h3 className="font-medium">Start Date</h3>
                <p className="text-muted-foreground">
                  {offerLetter.createdAt && format(new Date(offerLetter.createdAt), "PPP")}
                </p>
              </div>
              <Badge>Active</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">No active internship</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Mentor</CardTitle>
        </CardHeader>
        <CardContent>
          {allocations?.length === 0 ? (
            <div className="text-center py-6">
              <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No faculty mentor assigned yet</p>
            </div>
          ) : isMentorLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[180px]" />
            </div>
          ) : (
            <div className="space-y-4">
              {allocations?.map((allocation) => (
                <div key={allocation.id} className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{mentorData?.mentor?.name}</p>
                        <p className="text-sm text-muted-foreground">{mentorData?.mentor?.email}</p>
                        <p className="text-sm text-muted-foreground">Department: {mentorData?.mentor?.department}</p>
                      </div>
                      <Badge variant={allocation.status === "active" ? "default" : "secondary"}>
                        {allocation.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
