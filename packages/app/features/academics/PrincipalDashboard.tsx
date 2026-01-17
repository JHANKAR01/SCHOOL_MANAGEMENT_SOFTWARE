// packages/app/features/academics/PrincipalDashboard.tsx
// Principal Command Center - Complete Rewrite using Nebula Design System
import React, { useState } from 'react';
import {
  Users, CheckCircle, AlertTriangle, ClipboardCheck, Calendar,
  Shield, RefreshCw, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { NebulaCard, NebulaStatCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';
import {
  usePrincipalStats,
  ApprovalRequest,
  ApprovalType,
  formatTimeAgo,
  getApprovalColor,
  getUrgencyColor
} from '../../hooks/usePrincipalStats';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  activeModule: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Loading State
const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
    <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
  </div>
);

// Error State
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
    <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Failed to load dashboard</p>
    <p className="text-slate-500 text-sm mb-4">{message}</p>
    <NebulaButton variant="secondary" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" /> Retry
    </NebulaButton>
  </div>
);

// Approval Type Icon Component
const ApprovalIcon: React.FC<{ type: ApprovalType }> = ({ type }) => {
  const colors = getApprovalColor(type);
  const iconClass = "w-5 h-5";

  return (
    <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.darkBg}`}>
      {type === 'RESULT_PUBLISH' && <ClipboardCheck className={`${iconClass} ${colors.text} ${colors.darkText}`} />}
      {type === 'LEAVE_REQUEST' && <Calendar className={`${iconClass} ${colors.text} ${colors.darkText}`} />}
      {type === 'DEMASK_PII' && <Shield className={`${iconClass} ${colors.text} ${colors.darkText}`} />}
    </div>
  );
};

// Single Approval Item Row
const ApprovalItem: React.FC<{
  item: ApprovalRequest;
  onReview: (item: ApprovalRequest) => void;
}> = ({ item, onReview }) => {
  const urgencyColors = getUrgencyColor(item.urgency);

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <ApprovalIcon type={item.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-900 dark:text-white truncate">
            {item.title}
          </h4>
          {item.urgency === 'HIGH' && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${urgencyColors.bg} ${urgencyColors.text}`}>
              Urgent
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">
          {item.requester} • {formatTimeAgo(item.timestamp)}
        </p>
      </div>

      <NebulaButton
        variant="secondary"
        size="sm"
        onClick={() => onReview(item)}
      >
        Review
      </NebulaButton>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WIDGET A: KPI ROW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface KPIRowProps {
  stats: {
    attendance: { studentPct: number; lowClasses: number };
    pendingResults: { count: number; latestExam: string };
    alerts: { critical: number };
  };
}

const KPIRow: React.FC<KPIRowProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Attendance KPI */}
      <NebulaStatCard
        label="School Attendance"
        value={`${stats.attendance.studentPct}%`}
        subValue={stats.attendance.lowClasses > 0
          ? `${stats.attendance.lowClasses} class${stats.attendance.lowClasses > 1 ? 'es' : ''} below 85%`
          : 'All classes above 85%'
        }
        icon={<Users className="w-5 h-5 text-indigo-500" />}
        status={stats.attendance.studentPct < 85 ? 'critical' : stats.attendance.studentPct < 90 ? 'warning' : 'success'}
        trend={stats.attendance.studentPct >= 90 ? 'up' : stats.attendance.studentPct < 85 ? 'down' : 'neutral'}
        trendValue={stats.attendance.studentPct >= 90 ? '+1.2%' : stats.attendance.studentPct < 85 ? '-2.1%' : '+0.3%'}
      />

      {/* Pending Results KPI */}
      <NebulaStatCard
        label="Pending Results"
        value={stats.pendingResults.count.toString()}
        subValue={stats.pendingResults.count > 0 ? stats.pendingResults.latestExam : 'All approved ✓'}
        icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
        status={stats.pendingResults.count === 0 ? 'success' : stats.pendingResults.count > 2 ? 'warning' : 'default'}
      />

      {/* Critical Alerts KPI */}
      <NebulaStatCard
        label="Critical Alerts"
        value={stats.alerts.critical.toString()}
        subValue={stats.alerts.critical > 0 ? 'Requires immediate attention' : 'All clear ✓'}
        icon={<AlertTriangle className={`w-5 h-5 ${stats.alerts.critical > 0 ? 'text-red-500' : 'text-emerald-500'}`} />}
        status={stats.alerts.critical > 0 ? 'critical' : 'success'}
      />
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WIDGET B: APPROVALS QUEUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ApprovalsQueueProps {
  approvals: ApprovalRequest[];
  onReview: (item: ApprovalRequest) => void;
  onRefresh: () => void;
  loading: boolean;
}

const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({ approvals, onReview, onRefresh, loading }) => {
  const { isDarkMode } = useTheme();

  return (
    <NebulaCard className="overflow-hidden" noPadding>
      {/* Header */}
      <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Approvals & Requests
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {approvals.length} item{approvals.length !== 1 ? 's' : ''} requiring your attention
          </p>
        </div>
        <NebulaButton
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </NebulaButton>
      </div>

      {/* Approval List */}
      <div className={`divide-y max-h-[400px] overflow-y-auto ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
        {approvals.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-medium">All caught up!</p>
            <p className="text-slate-500 text-sm">No pending approvals</p>
          </div>
        ) : (
          approvals.map(item => (
            <ApprovalItem key={item.id} item={item} onReview={onReview} />
          ))
        )}
      </div>

      {/* Footer with View All */}
      {approvals.length > 0 && (
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
          <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            View All Approvals
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </NebulaCard>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WIDGET C: RISK MONITOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface RiskMonitorProps {
  metrics: { atRiskAttendance: number; academicWarning: number };
  onViewReport: () => void;
}

const RiskMonitor: React.FC<RiskMonitorProps> = ({ metrics, onViewReport }) => {
  const hasRisk = metrics.atRiskAttendance > 0 || metrics.academicWarning > 0;

  return (
    <NebulaCard>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className={`w-5 h-5 ${hasRisk ? 'text-amber-500' : 'text-emerald-500'}`} />
        <h3 className="font-bold text-slate-900 dark:text-white">Risk Monitor</h3>
        {hasRisk && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {metrics.atRiskAttendance + metrics.academicWarning} at risk
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {/* At-Risk Attendance */}
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">At-Risk Attendance</p>
            <p className="text-xs text-slate-400">Students below 75%</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${metrics.atRiskAttendance > 0
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}>
            {metrics.atRiskAttendance}
          </span>
        </div>

        {/* Academic Warning */}
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Academic Warning</p>
            <p className="text-xs text-slate-400">Failing &gt;2 subjects</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${metrics.academicWarning > 0
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}>
            {metrics.academicWarning}
          </span>
        </div>
      </div>

      {/* View Report Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onViewReport}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          View Full Report
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </NebulaCard>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PrincipalDashboard: React.FC<Props> = ({ activeModule }) => {
  const { stats, loading, error, refetch } = usePrincipalStats();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  // Handle review button click
  const handleReview = (item: ApprovalRequest) => {
    setSelectedApproval(item);
    // TODO: Phase 8/9 - Open review modal based on type
    console.log('Review clicked:', item);

    // Temporary alert for demo
    if (item.type === 'RESULT_PUBLISH') {
      alert(`Result Review Modal (Phase 8)\n\nExam: ${item.title}\nSubmitted by: ${item.requester}\n\nThis will open the result review modal where you can view marks, make edits, and approve/reject.`);
    } else if (item.type === 'LEAVE_REQUEST') {
      alert(`Leave Review Modal (Phase 9)\n\nRequest: ${item.title}\nFrom: ${item.requester}\n\nThis will open the leave detail view with approve/reject options.`);
    }
  };

  // Handle risk report view
  const handleViewRiskReport = () => {
    // TODO: Phase 10 - Navigate to risk analytics
    console.log('View risk report clicked');
    alert('Risk Analytics View (Phase 10)\n\nThis will show:\n• At-risk students list\n• Attendance trends\n• Academic performance graphs\n• Action buttons for interventions');
  };

  // Loading state
  if (loading && !stats) {
    return <LoadingState />;
  }

  // Error state
  if (error && !stats) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  // No stats yet
  if (!stats) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Widget A: KPI Row (The "Morning Coffee") */}
      <KPIRow stats={stats} />

      {/* Widgets B + C: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget B: Approvals Queue (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <ApprovalsQueue
            approvals={stats.approvals}
            onReview={handleReview}
            onRefresh={refetch}
            loading={loading}
          />
        </div>

        {/* Widget C: Risk Monitor (1/3 width on desktop) */}
        <div>
          <RiskMonitor
            metrics={stats.riskMetrics}
            onViewReport={handleViewRiskReport}
          />
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
