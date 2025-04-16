import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { FacultyTechSessions } from "@/components/tech-sessions/faculty-tech-sessions";
import { StudentTechSessions } from "@/components/tech-sessions/student-tech-sessions";

export default function TechSessionsPage() {
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {user?.role === "faculty" ? (
          <FacultyTechSessions />
        ) : (
          <StudentTechSessions />
        )}
      </div>
    </Layout>
  );
} 