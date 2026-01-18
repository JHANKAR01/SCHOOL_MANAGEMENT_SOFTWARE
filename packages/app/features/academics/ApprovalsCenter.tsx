// packages/app/features/academics/ApprovalsCenter.tsx
// Principal Approvals Inbox - Full-screen list view with tabs, search, filters
import React, { useState, useMemo } from 'react';
import {
    Search, Filter, CheckCircle, XCircle, Clock, FileText, Shield,
    Calendar, ChevronDown, AlertTriangle, CheckSquare, Square,
    ArrowLeft, RefreshCw, Loader2
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';
import { usePrincipalStats, ApprovalRequest, ApprovalType } from '../../hooks/usePrincipalStats';

// Import Modals
import { ResultReviewModal } from './ResultReviewModal';
import { LeaveReviewModal } from './LeaveReviewModal';
import { DemaskPIIDemo } from '../admin/DemaskPII';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type TabType = 'ALL' | 'RESULTS' | 'LEAVES' | 'SENSITIVE';
type ActiveModal = 'NONE' | 'RESULT' | 'LEAVE' | 'DEMASK';

interface Props {
    onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getTypeLabel = (type: ApprovalType): string => {
    switch (type) {
        case 'RESULT_PUBLISH': return 'Result';
        case 'LEAVE_REQUEST': return 'Leave';
        case 'DEMASK_PII': return 'Sensitive';
        default: return 'Other';
    }
};

const getTypeColor = (type: ApprovalType): string => {
    switch (type) {
        case 'RESULT_PUBLISH': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'LEAVE_REQUEST': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
        case 'DEMASK_PII': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const formatTimeAgo = (isoString: string): string => {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ApprovalsCenter: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();
    const { stats, loading, refetch } = usePrincipalStats();

    // State
    const [activeTab, setActiveTab] = useState<TabType>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUrgentOnly, setShowUrgentOnly] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [activeModal, setActiveModal] = useState<ActiveModal>('NONE');
    const [selectedItem, setSelectedItem] = useState<ApprovalRequest | null>(null);

    // Filter approvals based on tab, search, and urgent filter
    const filteredApprovals = useMemo(() => {
        if (!stats?.approvals) return [];

        return stats.approvals.filter((item) => {
            // Tab filter
            if (activeTab === 'RESULTS' && item.type !== 'RESULT_PUBLISH') return false;
            if (activeTab === 'LEAVES' && item.type !== 'LEAVE_REQUEST') return false;
            if (activeTab === 'SENSITIVE' && item.type !== 'DEMASK_PII') return false;

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = item.title.toLowerCase().includes(query);
                const matchesRequester = item.requester.toLowerCase().includes(query);
                if (!matchesTitle && !matchesRequester) return false;
            }

            // Urgent filter
            if (showUrgentOnly && item.urgency !== 'HIGH') return false;

            return true;
        });
    }, [stats?.approvals, activeTab, searchQuery, showUrgentOnly]);

    // Tab counts
    const tabCounts = useMemo(() => {
        if (!stats?.approvals) return { all: 0, results: 0, leaves: 0, sensitive: 0 };
        return {
            all: stats.approvals.length,
            results: stats.approvals.filter(a => a.type === 'RESULT_PUBLISH').length,
            leaves: stats.approvals.filter(a => a.type === 'LEAVE_REQUEST').length,
            sensitive: stats.approvals.filter(a => a.type === 'DEMASK_PII').length,
        };
    }, [stats?.approvals]);

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredApprovals.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredApprovals.map(a => a.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    // Action handlers
    const handleReview = (item: ApprovalRequest) => {
        setSelectedItem(item);
        if (item.type === 'RESULT_PUBLISH') setActiveModal('RESULT');
        else if (item.type === 'LEAVE_REQUEST') setActiveModal('LEAVE');
        else if (item.type === 'DEMASK_PII') setActiveModal('DEMASK');
    };

    const closeModal = () => {
        setActiveModal('NONE');
        setSelectedItem(null);
    };

    const handleApprovalSuccess = () => {
        refetch();
        closeModal();
        setSelectedIds(new Set());
    };

    const handleBulkApprove = () => {
        // TODO: API call to bulk approve
        console.log('Bulk approving:', Array.from(selectedIds));
        alert(`Approving ${selectedIds.size} items (Demo Mode)`);
        setSelectedIds(new Set());
        refetch();
    };

    const handleBulkReject = () => {
        // TODO: API call to bulk reject
        console.log('Bulk rejecting:', Array.from(selectedIds));
        alert(`Rejecting ${selectedIds.size} items (Demo Mode)`);
        setSelectedIds(new Set());
        refetch();
    };

    // Loading state
    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Approvals Center</h1>
                        <p className="text-sm text-slate-500">Review and manage pending requests</p>
                    </div>
                </div>
                <NebulaButton variant="ghost" onClick={refetch}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </NebulaButton>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                {[
                    { id: 'ALL' as TabType, label: 'All', count: tabCounts.all },
                    { id: 'RESULTS' as TabType, label: 'Results', count: tabCounts.results },
                    { id: 'LEAVES' as TabType, label: 'Leaves', count: tabCounts.leaves },
                    { id: 'SENSITIVE' as TabType, label: 'Sensitive Data', count: tabCounts.sensitive },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 min-w-[250px] max-w-md">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}>
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or requester..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Urgent Filter */}
                <button
                    onClick={() => setShowUrgentOnly(!showUrgentOnly)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${showUrgentOnly
                            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Urgent Only</span>
                </button>

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
                        <NebulaButton variant="primary" size="sm" onClick={handleBulkApprove}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve All
                        </NebulaButton>
                        <NebulaButton variant="secondary" size="sm" onClick={handleBulkReject}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                        </NebulaButton>
                    </div>
                )}
            </div>

            {/* List */}
            <NebulaCard className="flex-1 overflow-hidden">
                {/* List Header */}
                <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <button onClick={toggleSelectAll} className="p-1">
                        {selectedIds.size === filteredApprovals.length && filteredApprovals.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                        )}
                    </button>
                    <div className="flex-1">Request</div>
                    <div className="w-24 text-center">Type</div>
                    <div className="w-24 text-center">Priority</div>
                    <div className="w-24 text-center">Time</div>
                    <div className="w-24 text-center">Action</div>
                </div>

                {/* List Body */}
                <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                    {filteredApprovals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <CheckCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-500 font-medium">No pending requests</p>
                            <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        filteredApprovals.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-4 px-4 py-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.has(item.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                                    }`}
                            >
                                {/* Checkbox */}
                                <button onClick={() => toggleSelect(item.id)} className="p-1">
                                    {selectedIds.has(item.id) ? (
                                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                                    ) : (
                                        <Square className="w-4 h-4 text-slate-400" />
                                    )}
                                </button>

                                {/* Icon + Info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-lg ${item.type === 'RESULT_PUBLISH' ? 'bg-blue-50 dark:bg-blue-900/20' :
                                            item.type === 'LEAVE_REQUEST' ? 'bg-teal-50 dark:bg-teal-900/20' :
                                                'bg-purple-50 dark:bg-purple-900/20'
                                        }`}>
                                        {item.type === 'RESULT_PUBLISH' && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                        {item.type === 'LEAVE_REQUEST' && <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                                        {item.type === 'DEMASK_PII' && <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                                        <p className="text-xs text-slate-500 truncate">{item.requester} • {item.subtitle}</p>
                                    </div>
                                </div>

                                {/* Type Badge */}
                                <div className="w-24 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                                        {getTypeLabel(item.type)}
                                    </span>
                                </div>

                                {/* Priority */}
                                <div className="w-24 text-center">
                                    {item.urgency === 'HIGH' ? (
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                            Urgent
                                        </span>
                                    ) : item.urgency === 'MEDIUM' ? (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            Medium
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">Normal</span>
                                    )}
                                </div>

                                {/* Time */}
                                <div className="w-24 text-center">
                                    <span className="text-xs text-slate-500">{formatTimeAgo(item.timestamp)}</span>
                                </div>

                                {/* Action */}
                                <div className="w-24 text-center">
                                    <NebulaButton variant="secondary" size="sm" onClick={() => handleReview(item)}>
                                        Review
                                    </NebulaButton>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </NebulaCard>

            {/* MODALS */}
            <ResultReviewModal
                isOpen={activeModal === 'RESULT'}
                onClose={closeModal}
                approvalId={selectedItem?.id || ''}
                examId={selectedItem?.metadata?.examId || ''}
                onApprove={handleApprovalSuccess}
                onReject={(reason) => { console.log('Rejected:', reason); handleApprovalSuccess(); }}
            />

            <LeaveReviewModal
                isOpen={activeModal === 'LEAVE'}
                onClose={closeModal}
                leaveId={selectedItem?.id || ''}
                onApprove={handleApprovalSuccess}
                onReject={(reason) => { console.log('Rejected:', reason); handleApprovalSuccess(); }}
            />

            {activeModal === 'DEMASK' && (
                <DemaskPIIDemo onClose={closeModal} />
            )}
        </div>
    );
};

export default ApprovalsCenter;
