/**
 * InteractionContext.tsx
 * 
 * FINAL MINIMAL VERSION - The "God Context" is no more!
 * 
 * All domain-specific data has been migrated to component-level hooks:
 * - useTransport.ts (buses)
 * - useAcademics.ts (homeworks, exams, syllabus, leaves, liveClasses)
 * - useOperations.ts (visitors, tickets, gateLogs)
 * - useAdmissions.ts (inquiries)
 * - useLibrary.ts (books)
 * - useHealth.ts (medicalLogs)
 * - useHostel.ts (hostelRooms)
 * - useHR.ts (students, staff)
 * - useFinance.ts (invoices, expenses)
 * 
 * This context now ONLY contains:
 * - Global lockdown state (needed by SecurityDashboard)
 * - PERMISSIONS constant (exported for all hooks)
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { UserRole } from '../../../types';

// ============================================================================
// PERMISSION GROUPS - Source of Truth for all hooks
// ============================================================================
export const PERMISSIONS = {
  FINANCE: [UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN],
  ACADEMICS: [UserRole.TEACHER, UserRole.HOD, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.STUDENT, UserRole.PARENT, UserRole.EXAM_CELL],
  OPERATIONS: [UserRole.RECEPTIONIST, UserRole.SCHOOL_ADMIN, UserRole.ESTATE_MANAGER, UserRole.SECURITY_HEAD, UserRole.PRINCIPAL, UserRole.IT_ADMIN],
  HR: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN, UserRole.PRINCIPAL],
  TRANSPORT: [UserRole.FLEET_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PARENT, UserRole.STUDENT, UserRole.PRINCIPAL],
  LIBRARY: [UserRole.LIBRARIAN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PRINCIPAL],
  HEALTH: [UserRole.NURSE, UserRole.SCHOOL_ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL],
  HOSTEL: [UserRole.WARDEN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL],
  ADMISSIONS: [UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN, UserRole.RECEPTIONIST, UserRole.PRINCIPAL],
  INVENTORY: [UserRole.INVENTORY_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL],
  IT_SYSTEMS: [UserRole.IT_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN]
};

// ============================================================================
// CONTEXT TYPE - Only Global State
// ============================================================================
export interface InteractionContextType {
  lockdownMode: boolean;
  toggleLockdown: () => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

// ============================================================================
// PROVIDER - Minimal, only global settings
// ============================================================================
export const InteractionProvider: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
  role?: UserRole;
}> = ({ children, isAuthenticated }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(`[InteractionContext] Auth: ${isAuthenticated}`);
  }, [isAuthenticated]);

  // Global Settings Query
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await client.get('/operations/settings')).data,
    initialData: { lockdown_mode: false },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false
  });

  const lockdownMode = settings?.lockdown_mode || false;

  // Lockdown Mutation
  const toggleLockdownMutation = useMutation({
    mutationFn: (enabled: boolean) => client.post('/operations/settings/toggle-lockdown', { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });

  const toggleLockdown = () => toggleLockdownMutation.mutate(!lockdownMode);

  return (
    <InteractionContext.Provider value={{ lockdownMode, toggleLockdown }}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) throw new Error("useInteraction must be used within InteractionProvider");
  return context;
};
