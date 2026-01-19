// packages/app/features/teacher/TeacherLeave.tsx
// Leave management with balances, application, and history
// Integrated with LeaveBalance model from schema

import React, { useState } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useLeaveBalances, useSyncQueue } from '../../hooks/useTeacherData';

// ============================================================================
// TYPES
// ============================================================================

type LeaveType = 'SICK' | 'CASUAL' | 'EARNED';
type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface LeaveApplication {
    id: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
    appliedAt: string;
}

interface LeaveBalance {
    type: LeaveType;
    totalAllowed: number;
    used: number;
    remaining: number;
}

// ============================================================================
// LEAVE BALANCE CARD
// ============================================================================

const LeaveBalanceCard: React.FC<{ balance: LeaveBalance }> = ({ balance }) => {
    const { t } = useTranslation();
    const percentage = (balance.used / balance.totalAllowed) * 100;

    const colorMap = {
        SICK: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', bar: 'bg-red-500' },
        CASUAL: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', bar: 'bg-blue-500' },
        EARNED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500' },
    };

    const colors = colorMap[balance.type];

    return (
        <div className={`p-4 rounded-2xl ${colors.bg}`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${colors.text}`}>
                    {balance.type} Leave
                </span>
                <span className={`text-lg font-bold ${colors.text}`}>
                    {balance.remaining}/{balance.totalAllowed}
                </span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${colors.bar} transition-all`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className={`text-xs mt-2 ${colors.text} opacity-70`}>
                {balance.used} used • {balance.remaining} remaining
            </p>
        </div>
    );
};

// ============================================================================
// LEAVE HISTORY ITEM
// ============================================================================

const LeaveHistoryItem: React.FC<{ leave: LeaveApplication }> = ({ leave }) => {
    const statusConfig = {
        PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '⏳' },
        APPROVED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: '✓' },
        REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: '✗' },
    };

    const config = statusConfig[leave.status];
    const startDate = new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const endDate = new Date(leave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {leave.type}
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-white mt-1">
                        {startDate} - {endDate}
                    </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                    {config.icon} {leave.status}
                </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {leave.reason}
            </p>
        </div>
    );
};

// ============================================================================
// APPLY LEAVE FORM
// ============================================================================

interface ApplyFormProps {
    balances: LeaveBalance[];
    onClose: () => void;
    onSubmit: (data: { type: LeaveType; startDate: string; endDate: string; reason: string }) => void;
}

const ApplyLeaveForm: React.FC<ApplyFormProps> = ({ balances, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        type: 'CASUAL' as LeaveType,
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [saving, setSaving] = useState(false);

    const selectedBalance = balances.find(b => b.type === formData.type);
    const canApply = (selectedBalance?.remaining || 0) > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canApply) return;
        setSaving(true);
        await onSubmit(formData);
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            {t('apply_leave')}
                        </h3>
                        <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Leave Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as LeaveType }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                {balances.map(b => (
                                    <option key={b.type} value={b.type}>
                                        {b.type} ({b.remaining} remaining)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">From</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">To</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    required
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="Reason for leave..."
                                required
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        {!canApply && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-700 dark:text-red-400">
                                ⚠️ No {formData.type} leaves remaining. Please select a different type.
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !canApply}
                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {saving ? 'Submitting...' : t('submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TeacherLeave: React.FC = () => {
    const { t } = useTranslation();
    const { data: balances = [], isLoading } = useLeaveBalances();
    const { queueOperation } = useSyncQueue();
    const [showApplyForm, setShowApplyForm] = useState(false);

    // Mock leave history (in production, fetch via useQuery)
    const [leaveHistory] = useState<LeaveApplication[]>([
        {
            id: '1',
            type: 'CASUAL',
            startDate: '2026-01-25',
            endDate: '2026-01-26',
            reason: 'Family function',
            status: 'APPROVED',
            appliedAt: '2026-01-20',
        },
        {
            id: '2',
            type: 'SICK',
            startDate: '2026-01-10',
            endDate: '2026-01-10',
            reason: 'Fever and cold',
            status: 'APPROVED',
            appliedAt: '2026-01-10',
        },
    ]);

    // Mock balances if API returns empty
    const displayBalances = balances.length > 0 ? balances : [
        { type: 'CASUAL' as LeaveType, totalAllowed: 12, used: 3, remaining: 9 },
        { type: 'SICK' as LeaveType, totalAllowed: 10, used: 2, remaining: 8 },
        { type: 'EARNED' as LeaveType, totalAllowed: 15, used: 0, remaining: 15 },
    ];

    const handleApplyLeave = async (data: { type: LeaveType; startDate: string; endDate: string; reason: string }) => {
        await queueOperation('LEAVE', data, `leave:apply:${Date.now()}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {t('leave')}
                </h2>
                <button
                    onClick={() => setShowApplyForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('apply_leave')}
                </button>
            </div>

            {/* Leave Balances */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                    {t('leave_balance')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {displayBalances.map(balance => (
                        <LeaveBalanceCard key={balance.type} balance={balance} />
                    ))}
                </div>
            </div>

            {/* Leave History */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                    {t('leave_history')}
                </h3>
                {leaveHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p>No leave applications found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaveHistory.map(leave => (
                            <LeaveHistoryItem key={leave.id} leave={leave} />
                        ))}
                    </div>
                )}
            </div>

            {/* Apply Form Modal */}
            {showApplyForm && (
                <ApplyLeaveForm
                    balances={displayBalances}
                    onClose={() => setShowApplyForm(false)}
                    onSubmit={handleApplyLeave}
                />
            )}
        </div>
    );
};

export default TeacherLeave;
