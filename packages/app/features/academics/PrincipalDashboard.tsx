// packages/app/features/academics/PrincipalDashboard.tsx
// Principal Command Center - Full Navigation Support
import React, { useState } from 'react';
import {
  Users, FileText, AlertTriangle, CheckCircle, Clock, Shield,
  RefreshCw, ChevronRight, Loader2
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { DashboardShell, Module } from '../../components/DashboardShell';
import { usePrincipalStats, ApprovalRequest } from '../../hooks/usePrincipalStats';
import { useTheme } from '../../provider/ThemeProvider';

// Import Advanced Components
import { ResultReviewModal } from './ResultReviewModal';
import { LeaveReviewModal } from './LeaveReviewModal';
import { RiskAnalytics } from './RiskAnalytics';
import { ApprovalsCenter } from './ApprovalsCenter';
import { AttendanceAnalytics } from './AttendanceAnalytics';
import { ResultsCommandCenter } from './ResultsCommandCenter';
import { ClassroomWalkthrough } from './ClassroomWalkthrough';
import { SubstitutionManager } from './SubstitutionManager';
import { LessonPlanOversight } from './LessonPlanOversight';
import { DemaskPIIDemo } from '../admin/DemaskPII';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ActiveModal = 'NONE' | 'RESULT' | 'LEAVE' | 'DEMASK';

interface Props {
  activeModule?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PrincipalDashboard: React.FC<Props> = () => {
  const { isDarkMode } = useTheme();
  const { stats, loading, error, refetch } = usePrincipalStats();

  // Navigation state - synced with DashboardShell
  const [currentModule, setCurrentModule] = useState<Module>('overview');

  // Modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>('NONE');
  const [selectedItem, setSelectedItem] = useState<ApprovalRequest | null>(null);

  // Handle module change from sidebar
  const handleModuleChange = (module: Module) => {
    setCurrentModule(module);
  };

  // Get title based on current module
  const getTitle = (): string => {
    switch (currentModule) {
      case 'overview': return "Principal's Overview";
      case 'approvals': return 'Approvals Center';
      case 'attendance': return 'Attendance Analytics';
      case 'risk': return 'Risk Monitor';
      case 'results': return 'Results Command Center';
      case 'classrooms': return 'Classroom Walkthrough';
      default: return "Principal's Office";
    }
  };

  // Handle "Review" Button Click
  const handleReviewClick = (item: ApprovalRequest) => {
    setSelectedItem(item);
    if (item.type === 'RESULT_PUBLISH') setActiveModal('RESULT');
    else if (item.type === 'LEAVE_REQUEST') setActiveModal('LEAVE');
    else if (item.type === 'DEMASK_PII') setActiveModal('DEMASK');
  };

  // Close modal
  const closeModal = () => {
    setActiveModal('NONE');
    setSelectedItem(null);
  };

  // Handle approval success
  const handleApprovalSuccess = () => {
    refetch();
    closeModal();
  };

  // Handle rejection
  const handleReject = (reason: string) => {
    console.log('Rejected with reason:', reason);
    refetch();
    closeModal();
  };

  // Loading State
  if (loading && !stats) {
    return (
      <DashboardShell role="PRINCIPAL" title="Principal's Office" activeModule={currentModule} onModuleChange={handleModuleChange}>
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      </DashboardShell>
    );
  }

  // Error State
  if (error && !stats) {
    return (
      <DashboardShell role="PRINCIPAL" title="Principal's Office" activeModule={currentModule} onModuleChange={handleModuleChange}>
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <NebulaButton variant="secondary" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </NebulaButton>
        </div>
      </DashboardShell>
    );
  }

  // No stats yet
  if (!stats) {
    return (
      <DashboardShell role="PRINCIPAL" title="Principal's Office" activeModule={currentModule} onModuleChange={handleModuleChange}>
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      </DashboardShell>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT RENDERER - Based on currentModule
  // ─────────────────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (currentModule) {
      case 'risk':
        return <RiskAnalytics onBack={() => setCurrentModule('overview')} />;

      case 'attendance':
        return <AttendanceAnalytics onBack={() => setCurrentModule('overview')} />;

      case 'approvals':
        return <ApprovalsCenter onBack={() => setCurrentModule('overview')} />;

      case 'results':
        return <ResultsCommandCenter onBack={() => setCurrentModule('overview')} />;

      case 'classrooms':
        return <ClassroomWalkthrough onBack={() => setCurrentModule('overview')} />;

      case 'substitutions':
        return <SubstitutionManager onBack={() => setCurrentModule('overview')} />;

      case 'curriculum':
        return <LessonPlanOversight onBack={() => setCurrentModule('overview')} />;

      case 'overview':
      default:
        return renderOverviewContent();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // OVERVIEW CONTENT (Dashboard Home)
  // ─────────────────────────────────────────────────────────────────────────
  const renderOverviewContent = () => (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance */}
        <NebulaCard className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Student Attendance</p>
              <p className={`text-3xl font-bold mt-2 ${stats.attendance.studentPct < 85 ? 'text-red-600' : 'text-emerald-600'}`}>
                {stats.attendance.studentPct}%
              </p>
              <p className="text-xs text-slate-400 mt-1">Staff: {stats.attendance.staffPct}% present</p>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </NebulaCard>

        {/* Pending Results */}
        <NebulaCard className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Results Pending</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {stats.pendingResults.count}
              </p>
              <p className="text-xs text-slate-400 mt-1">Batches awaiting approval</p>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </NebulaCard>

        {/* Alerts */}
        <NebulaCard className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Critical Alerts</p>
              <p className={`text-3xl font-bold mt-2 ${stats.alerts.critical > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                {stats.alerts.critical}
              </p>
              <p className="text-xs text-slate-400 mt-1">Safety & Medical incidents</p>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </NebulaCard>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Queue */}
        <div className="lg:col-span-2">
          <NebulaCard>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Approvals & Requests</h3>
              <NebulaButton variant="ghost" size="sm" onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </NebulaButton>
            </div>
            <div className="p-2">
              {stats.approvals.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-slate-500">All caught up!</p>
                </div>
              ) : (
                stats.approvals.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <div className={`p-2 rounded-lg mr-4 ${item.type === 'RESULT_PUBLISH' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      item.type === 'DEMASK_PII' ? 'bg-purple-50 dark:bg-purple-900/20' :
                        'bg-slate-100 dark:bg-slate-800'
                      }`}>
                      {item.type === 'RESULT_PUBLISH' && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      {item.type === 'DEMASK_PII' && <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {item.type === 'LEAVE_REQUEST' && <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.requester} • {item.subtitle}</p>
                    </div>
                    <NebulaButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReviewClick(item)}
                    >
                      Review
                    </NebulaButton>
                  </div>
                ))
              )}
            </div>
          </NebulaCard>
        </div>

        {/* Risk Monitor */}
        <div>
          <NebulaCard>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Risk Monitor</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                <div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.riskMetrics.atRiskAttendance}</p>
                  <p className="text-xs text-red-600 dark:text-red-300 font-medium">At-Risk Attendance</p>
                  <p className="text-[10px] text-red-400 mt-0.5">Below 75% threshold</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-500 opacity-50" />
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.riskMetrics.academicWarning}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-300 font-medium">Academic Probation</p>
                  <p className="text-[10px] text-orange-400 mt-0.5">Failing &gt; 2 subjects</p>
                </div>
                <FileText className="w-6 h-6 text-orange-500 opacity-50" />
              </div>

              <div className="pt-4">
                <NebulaButton
                  variant="ghost"
                  onClick={() => setCurrentModule('risk')}
                  className="w-full justify-center"
                >
                  View Full Risk Report
                  <ChevronRight className="w-4 h-4 ml-1" />
                </NebulaButton>
              </div>
            </div>
          </NebulaCard>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardShell
      role="PRINCIPAL"
      title={getTitle()}
      activeModule={currentModule}
      onModuleChange={handleModuleChange}
    >
      {renderContent()}

      {/* MODALS */}
      <ResultReviewModal
        isOpen={activeModal === 'RESULT'}
        onClose={closeModal}
        approvalId={selectedItem?.id || ''}
        examId={selectedItem?.metadata?.examId || ''}
        onApprove={handleApprovalSuccess}
        onReject={handleReject}
      />

      <LeaveReviewModal
        isOpen={activeModal === 'LEAVE'}
        onClose={closeModal}
        leaveId={selectedItem?.id || ''}
        onApprove={handleApprovalSuccess}
        onReject={handleReject}
      />

      {activeModal === 'DEMASK' && (
        <DemaskPIIDemo onClose={closeModal} />
      )}
    </DashboardShell>
  );
};

export default PrincipalDashboard;
