import React from 'react';
import { UserRole, SchoolConfig } from '../../../../types';

// Management
import { StaffManagement } from '../admin/StaffManagement';
import { PrincipalDashboard } from '../academics/PrincipalDashboard';
import { VicePrincipalDashboard } from '../academics/VicePrincipalDashboard';
import { FinanceDashboard } from '../admin/FinanceDashboard';

// Academics
import { NewTeacherDashboard } from './NewTeacherDashboard';
import { HODDashboard } from '../academics/HODDashboard';
import { ExamCellDashboard } from '../academics/ExamCellDashboard';

// Operations
import { SecurityDashboard } from '../admin/SecurityDashboard';
import { EstateDashboard } from '../admin/EstateDashboard';
import { ReceptionDashboard } from '../admin/ReceptionDashboard';
import { InventoryDashboard } from '../inventory/InventoryDashboard';
import { InfirmaryDashboard } from '../health/InfirmaryDashboard';
import { AdmissionsDashboard } from '../admissions/AdmissionsDashboard';
import { CounselorDashboard } from '../health/CounselorDashboard';
import { ITAdminDashboard } from '../admin/ITAdminDashboard';

// Facilities
import { BusFleet } from '../transport/BusFleet';
import { LibraryManagement } from '../library/LibraryManagement';
import { HostelWarden } from '../hostel/HostelWarden';

// Users
import { ParentDashboard } from './ParentDashboard';
import { StudentDashboard } from './StudentDashboard';

// Import the new page component
import SchoolAdminDashboardPage from '../../../../apps/web/pages/school-admin/dashboard';

interface Props {
  role: UserRole;
  school: SchoolConfig;
  activeModule: string;
}

export const RoleBasedRouter: React.FC<Props> = ({ role, school, activeModule }) => {
  // Helper to check if Finance module is active for multi-module roles
  const isFinanceActive = activeModule === 'FINANCE';

  switch (role) {
    // Top Management
    case UserRole.SUPER_ADMIN:
      return <StaffManagement />;

    case UserRole.SCHOOL_ADMIN:
      return <SchoolAdminDashboardPage />;

    case UserRole.PRINCIPAL:
      // PRINCIPAL: Oversight/Audit - can access Finance if module selected
      if (isFinanceActive) return <FinanceDashboard school={school} activeModule={activeModule} />;
      if (activeModule === 'ADMISSIONS' || activeModule === 'admissions') return <AdmissionsDashboard />;
      return <PrincipalDashboard activeModule={activeModule} />;

    case UserRole.VICE_PRINCIPAL:
      return <VicePrincipalDashboard />;

    // Finance Roles - Direct access to Finance Dashboard
    case UserRole.FINANCE_MANAGER:
    case UserRole.ACCOUNTANT:
      return <FinanceDashboard school={school} activeModule={activeModule} />;

    // Academic Heads
    case UserRole.HOD: return <HODDashboard />;
    case UserRole.EXAM_CELL: return <ExamCellDashboard />;
    case UserRole.TEACHER: return <NewTeacherDashboard />;

    // Operations & Admin
    case UserRole.SECURITY_HEAD: return <SecurityDashboard />;
    case UserRole.ESTATE_MANAGER: return <EstateDashboard />;
    case UserRole.RECEPTIONIST: return <ReceptionDashboard />;
    case UserRole.ADMISSIONS_OFFICER: return <AdmissionsDashboard />;
    case UserRole.INVENTORY_MANAGER: return <InventoryDashboard />;
    case UserRole.NURSE: return <InfirmaryDashboard />;
    case UserRole.COUNSELOR: return <CounselorDashboard />;
    case UserRole.IT_ADMIN: return <ITAdminDashboard />;

    // Facilities
    case UserRole.FLEET_MANAGER: return <BusFleet />;
    case UserRole.LIBRARIAN: return <LibraryManagement />;
    case UserRole.WARDEN: return <HostelWarden />;

    // End Users
    case UserRole.PARENT:
      return <ParentDashboard school={school} activeModule={activeModule} role={role} />;

    case UserRole.STUDENT:
      return <StudentDashboard school={school} activeModule={activeModule} role={role} />;

    // Fallback for unmapped roles
    default: return (
      <div className="flex items-center justify-center h-full text-red-500 font-bold">
        Configuration Error: Role {role} has no assigned dashboard.
      </div>
    );
  }
};
