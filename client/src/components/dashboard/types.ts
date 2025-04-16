import { Document, FacultyAllocation, DocumentWithStudentName } from "@shared/schema";

export type QuickActionsProps = {
  role: string;
};

export type StudentDashboardProps = {
  documents: Document[] | undefined;
};

export type FacultyDashboardProps = {
  documents: DocumentWithStudentName[] | undefined;
  allocations: FacultyAllocation[] | undefined;
};

export type CompanyDashboardProps = {
  documents: Document[] | undefined;
};

export type UserProfileProps = {
  user: any;
  onLogout: () => void;
};

export type MenuItemProps = {
  href: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}; 