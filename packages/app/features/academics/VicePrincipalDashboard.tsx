import React, { useState } from 'react';
import {
  ClipboardList,
  Users,
  AlertTriangle,
  RefreshCw,
  FileText,
  CheckCircle
} from 'lucide-react';

import { DashboardShell, Module } from '../../components/DashboardShell';
import { useLanguage } from '../../provider/language-context';
import { VicePrincipalStats } from './VicePrincipalStats';
import { ApprovalsModule } from './ApprovalsModule';
import { SubstitutionManager } from './SubstitutionManager';
import { IncidentQueue } from './IncidentQueue';
import { TeacherPerformanceTile } from './TeacherPerformanceTile';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';

export const VicePrincipalDashboard = () => {
  const { t } = useLanguage();
  const [currentModule, setCurrentModule] = useState<Module>('overview');

  const vpNavItems = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'substitutions', label: 'Substitutions', icon: RefreshCw },
    { id: 'risk', label: 'Incidents', icon: AlertTriangle },
    { id: 'staff', label: 'Staff Perf.', icon: Users }
  ];

  const getTitle = (): string => {
    switch (currentModule) {
      case 'overview': return "Vice Principal's Office";
      case 'approvals': return "Approvals";
      case 'substitutions': return "Substitution Management";
      case 'risk': return "Incident Queue";
      case 'staff': return "Teacher Performance";
      default: return "Vice Principal's Office";
    }
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'overview':
        return (
          <div className="space-y-6">
            <VicePrincipalStats />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NebulaCard title="Quick Actions" className="p-4">
                <div className="flex gap-4">
                  <NebulaButton onClick={() => setCurrentModule('approvals')}>
                    Review Approvals
                  </NebulaButton>
                  <NebulaButton variant="secondary" onClick={() => setCurrentModule('substitutions')}>
                    Manage Substitutions
                  </NebulaButton>
                </div>
              </NebulaCard>
              <TeacherPerformanceTile />
            </div>
          </div>
        );
      case 'approvals':
        return <ApprovalsModule />;
      case 'substitutions':
        return <SubstitutionManager />;
      case 'risk':
        return <IncidentQueue />;
      case 'staff':
        return <TeacherPerformanceTile />;
      default:
        return null;
    }
  };

  return (
    <DashboardShell
      role="VICE_PRINCIPAL"
      title={getTitle()}
      activeModule={currentModule}
      onModuleChange={setCurrentModule}
      navItems={vpNavItems}
    >
      {renderContent()}
    </DashboardShell>
  );
};
