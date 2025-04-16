import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useRoute, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import VerifyEmailPage from "@/pages/verify-email";
import Dashboard from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import DocumentsPage from "@/pages/documents";
import TechSessionsPage from "@/pages/tech-sessions";
import TechSessionDetailsPage from "@/pages/tech-session-details";
import ResourcesPage from "@/pages/resources";
import AboutPage from "@/pages/about";
import { Home } from "@/pages/Home";
import { Navbar } from "@/components/navbar";
import DocumentReviewPage from "@/pages/document-review";
import ReviewsPage from "@/pages/reviews";
import AllocationsPage from "@/pages/allocations";
import InternshipsPage from "@/pages/companies";
import FacultyInternshipsPage from "@/pages/faculty-internships";
import StudentApplicationsPage from "@/pages/student-applications";

function AppContent() {
  const [dashboardMatch] = useRoute("/dashboard*");
  const [verifyMatch] = useRoute("/verify-email*");
  const [profileMatch] = useRoute("/profile");
  const [documentsMatch] = useRoute("/documents");
  const [techSessionsMatch] = useRoute("/tech-sessions");
  const [resourcesMatch] = useRoute("/resources");
  const [reviewsMatch] = useRoute("/reviews");
  const [documentReviewMatch] = useRoute("/document-review/:id");
  const [allocationsMatch] = useRoute("/allocations");
  const [aboutMatch] = useRoute("/about");
  const [companiesMatch] = useRoute("/companies");
  const [studentApplicationsMatch] = useRoute("/student-applications");
  const [facultyInternshipsMatch] = useRoute("/faculty-internships");

  // Only show navbar on pages that aren't dashboard, profile, documents, or tech sessions
  // About page should show the navbar
  const showNavbar = !dashboardMatch && !verifyMatch && !profileMatch && 
                    !documentsMatch && !techSessionsMatch && !resourcesMatch &&
                    !reviewsMatch && !documentReviewMatch && !allocationsMatch &&
                    !companiesMatch && !studentApplicationsMatch && !facultyInternshipsMatch;

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password/:token" component={ResetPasswordPage} />
          <Route path="/verify-email/:token" component={VerifyEmailPage} />
          <Route path="/about" component={AboutPage} />
          <ProtectedRoute path="/companies" component={InternshipsPage} />
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/documents" component={DocumentsPage} />
          <ProtectedRoute path="/tech-sessions" component={TechSessionsPage} />
          <ProtectedRoute path="/tech-session-details/:id" component={TechSessionDetailsPage} />
          <ProtectedRoute path="/resources" component={ResourcesPage} />
          <ProtectedRoute path="/reviews" component={ReviewsPage} />
          <ProtectedRoute path="/document-review/:id" component={DocumentReviewPage} />
          <ProtectedRoute path="/allocations" component={AllocationsPage} />
          <ProtectedRoute path="/faculty-internships" component={FacultyInternshipsPage} />
          <ProtectedRoute path="/student-applications" component={StudentApplicationsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;