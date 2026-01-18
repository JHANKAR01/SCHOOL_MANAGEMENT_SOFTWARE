import React from 'react';
import { DashboardShell } from '../../../../packages/app/components/DashboardShell';
import { AdmissionsDashboard } from '../../../../packages/app/features/admissions/AdmissionsDashboard';
import { UserRole } from '../../../../packages/app/types';

export default function PrincipalAdmissionsPage() {
    return (
        <DashboardShell role={UserRole.PRINCIPAL} title="Admissions Pipeline">
            <AdmissionsDashboard />
        </DashboardShell>
    );
}
