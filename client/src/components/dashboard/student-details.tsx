import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@shared/schema";

type StudentDetailsProps = {
  student: User;
};

export function StudentDetails({ student }: StudentDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">Contact Information</h3>
          <div className="space-y-1 mt-2 text-sm text-muted-foreground">
            <p>Email: {student.email || 'Not provided'}</p>
            <p>Phone: {student.phone || 'Not provided'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium">Academic Details</h3>
          <div className="space-y-1 mt-2 text-sm text-muted-foreground">
            <p>University: {student.university || 'Not provided'}</p>
            <p>Department: {student.department || 'Not provided'}</p>
            <p>Year: {student.year || 'Not provided'}</p>
          </div>
        </div>

        {student.bio && (
          <div>
            <h3 className="font-medium">Bio</h3>
            <p className="mt-2 text-sm text-muted-foreground">{student.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
