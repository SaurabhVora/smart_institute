
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StudentStats() {
  const { data: students } = useQuery<User[]>({
    queryKey: ["/api/students"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Records</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Internship Status</TableHead>
              <TableHead>Faculty Mentor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell>{student.year}</TableCell>
                <TableCell>
                  <Badge variant={student.hasActiveInternship ? "success" : "secondary"}>
                    {student.hasActiveInternship ? "Active" : "Not Started"}
                  </Badge>
                </TableCell>
                <TableCell>{student.facultyMentor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
