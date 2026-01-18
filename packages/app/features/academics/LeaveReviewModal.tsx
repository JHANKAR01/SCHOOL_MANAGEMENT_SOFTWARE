// packages/app/features/academics/LeaveReviewModal.tsx
// Modal for Principal to review and approve/reject leave applications
import React, { useState, useEffect } from 'react';
import {
    X, CheckCircle, XCircle, Calendar, User, Clock,
    FileText, AlertTriangle, Loader2, Users
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AffectedClass {
    className: string;
    period: number;
    subject: string;
}

interface LeaveDetails {
    id: string;
    staffName: string;
    staffRole: string;
    staffDepartment: string;
    leaveType: 'SICK' | 'CASUAL' | 'EARNED';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    appliedAt: string;
    affectedClasses: AffectedClass[];
    leaveBalance: {
        sick: number;
        casual: number;
        earned: number;
    };
    previousLeaves: number; // Count in current month
}

interface LeaveReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    leaveId: string;
    onApprove: () => void;
    onReject: (reason: string) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_LEAVE: LeaveDetails = {
    id: 'leave_demo_001',
    staffName: 'Mr. Rajesh Kumar',
    staffRole: 'Mathematics Teacher',
    staffDepartment: 'Senior Secondary',
    leaveType: 'SICK',
    startDate: '2026-01-20',
    endDate: '2026-01-22',
    days: 3,
    reason: 'Suffering from viral fever. Doctor has advised rest for 3 days. Medical certificate attached.',
    appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    affectedClasses: [
        { className: 'Class 10-A', period: 1, subject: 'Mathematics' },
        { className: 'Class 10-B', period: 3, subject: 'Mathematics' },
        { className: 'Class 9-A', period: 5, subject: 'Mathematics' },
        { className: 'Class 11-C', period: 7, subject: 'Mathematics' },
    ],
    leaveBalance: {
        sick: 8,
        casual: 5,
        earned: 12
    },
    previousLeaves: 2
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LeaveTypeBadge: React.FC<{ type: 'SICK' | 'CASUAL' | 'EARNED' }> = ({ type }) => {
    const colors = {
        SICK: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        CASUAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        EARNED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[type]}`}>
            {type} Leave
        </span>
    );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 py-2">
        <div className="text-slate-400">{icon}</div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
    isOpen,
    onClose,
    leaveId,
    onApprove,
    onReject
}) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [leaveDetails, setLeaveDetails] = useState<LeaveDetails | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Load leave data
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // TODO: Fetch real data from API
            setTimeout(() => {
                setLeaveDetails(MOCK_LEAVE);
                setLoading(false);
            }, 400);
        }
    }, [isOpen, leaveId]);

    // Handle approve
    const handleApprove = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/principal/approvals/${leaveId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({ action: 'APPROVE', type: 'LEAVE_REQUEST' })
            });
            if (res.ok) {
                onApprove();
                onClose();
            }
        } catch (error) {
            console.error('Approve error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle reject
    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/principal/approvals/${leaveId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({ action: 'REJECT', type: 'LEAVE_REQUEST', reason: rejectReason })
            });
            if (res.ok) {
                onReject(rejectReason);
                onClose();
            }
        } catch (error) {
            console.error('Reject error:', error);
        } finally {
            setSubmitting(false);
            setShowRejectModal(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-teal-500" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Leave Request Review
                            </h2>
                            {leaveDetails && (
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Applied {new Date(leaveDetails.appliedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                        </div>
                    ) : leaveDetails ? (
                        <div className="space-y-6">
                            {/* Staff Info & Leave Type */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {leaveDetails.staffName}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {leaveDetails.staffRole} • {leaveDetails.staffDepartment}
                                    </p>
                                </div>
                                <LeaveTypeBadge type={leaveDetails.leaveType} />
                            </div>

                            {/* Date Range */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <div className="grid grid-cols-3 gap-4">
                                    <InfoRow
                                        icon={<Calendar className="w-4 h-4" />}
                                        label="From"
                                        value={formatDate(leaveDetails.startDate)}
                                    />
                                    <InfoRow
                                        icon={<Calendar className="w-4 h-4" />}
                                        label="To"
                                        value={formatDate(leaveDetails.endDate)}
                                    />
                                    <InfoRow
                                        icon={<Clock className="w-4 h-4" />}
                                        label="Duration"
                                        value={`${leaveDetails.days} day${leaveDetails.days > 1 ? 's' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Reason
                                </h4>
                                <p className={`p-4 rounded-lg text-sm ${isDarkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-50 text-slate-700'
                                    }`}>
                                    {leaveDetails.reason}
                                </p>
                            </div>

                            {/* Affected Classes */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Affected Classes ({leaveDetails.affectedClasses.length})
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {leaveDetails.affectedClasses.map((cls, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-200'
                                            }`}>
                                            <p className="font-medium text-slate-900 dark:text-white">{cls.className}</p>
                                            <p className="text-xs text-slate-500">Period {cls.period} • {cls.subject}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Leave Balance */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Leave Balance
                                </h4>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                        <p className="text-xs text-slate-500">Sick</p>
                                        <p className="text-lg font-bold text-red-600">{leaveDetails.leaveBalance.sick}</p>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                        <p className="text-xs text-slate-500">Casual</p>
                                        <p className="text-lg font-bold text-blue-600">{leaveDetails.leaveBalance.casual}</p>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                        <p className="text-xs text-slate-500">Earned</p>
                                        <p className="text-lg font-bold text-green-600">{leaveDetails.leaveBalance.earned}</p>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                        <p className="text-xs text-slate-500">This Month</p>
                                        <p className="text-lg font-bold text-slate-600">{leaveDetails.previousLeaves}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className={`flex justify-between items-center p-6 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
                    }`}>
                    <p className="text-sm text-slate-500">
                        {leaveDetails?.affectedClasses.length || 0} classes will need substitution
                    </p>
                    <div className="flex gap-3">
                        <NebulaButton
                            variant="secondary"
                            onClick={() => setShowRejectModal(true)}
                            disabled={submitting}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </NebulaButton>
                        <NebulaButton
                            variant="primary"
                            onClick={handleApprove}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve Leave
                        </NebulaButton>
                    </div>
                </div>
            </div>

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
                    <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'
                        }`}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Reason for Rejection
                        </h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter the reason for rejecting this leave request..."
                            className={`w-full h-32 px-4 py-3 rounded-lg border resize-none ${isDarkMode
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-white border-slate-200 text-slate-900'
                                }`}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <NebulaButton variant="ghost" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </NebulaButton>
                            <NebulaButton
                                variant="primary"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || submitting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
                            </NebulaButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveReviewModal;
