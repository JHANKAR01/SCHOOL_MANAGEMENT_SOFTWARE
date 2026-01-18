// packages/app/features/academics/SubstitutionManager.tsx
// Phase 4A: Substitution War Room - Real-time Coverage Management
import React, { useState, useMemo } from 'react';
import {
    AlertTriangle, Clock, CheckCircle, UserX, UserCheck, Users,
    ChevronRight, ArrowLeft, Phone, Mail, Calendar, Search, X
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AbsentTeacher {
    id: string;
    name: string;
    subject: string;
    reason: 'sick' | 'leave' | 'emergency' | 'personal';
    reportedAt: string;
    affectedPeriods: number[];
}

interface CoverageGap {
    id: string;
    period: number;
    startTime: string;
    endTime: string;
    className: string;
    section: string;
    subject: string;
    absentTeacher: AbsentTeacher;
    status: 'uncovered' | 'covered' | 'pending';
    assignedTo?: FreeTeacher;
}

interface FreeTeacher {
    id: string;
    name: string;
    subject: string;
    phone: string;
    freePeriods: number[];
    substitutionCount: number; // This month
}

interface SubstitutionLog {
    id: string;
    period: number;
    className: string;
    originalTeacher: string;
    substituteTeacher: string;
    assignedAt: string;
    status: 'confirmed' | 'pending' | 'declined';
}

interface Props {
    onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ABSENT_TEACHERS: AbsentTeacher[] = [
    { id: 'tch_001', name: 'Mr. Sharma', subject: 'Physics', reason: 'sick', reportedAt: '07:45 AM', affectedPeriods: [2, 4, 6] },
    { id: 'tch_002', name: 'Mrs. Patel', subject: 'Mathematics', reason: 'leave', reportedAt: '08:00 AM', affectedPeriods: [1, 3, 5] },
    { id: 'tch_003', name: 'Ms. Gupta', subject: 'English', reason: 'emergency', reportedAt: '08:15 AM', affectedPeriods: [3, 7] },
];

const FREE_TEACHERS: FreeTeacher[] = [
    { id: 'ft_001', name: 'Mrs. Iyer', subject: 'Physics', phone: '+91 98765 43210', freePeriods: [2, 4, 5], substitutionCount: 3 },
    { id: 'ft_002', name: 'Mr. Kumar', subject: 'Mathematics', phone: '+91 98765 43211', freePeriods: [1, 3, 6], substitutionCount: 5 },
    { id: 'ft_003', name: 'Ms. Nair', subject: 'Science', phone: '+91 98765 43212', freePeriods: [2, 3, 7], substitutionCount: 2 },
    { id: 'ft_004', name: 'Mr. Reddy', subject: 'English', phone: '+91 98765 43213', freePeriods: [1, 4, 7], substitutionCount: 4 },
    { id: 'ft_005', name: 'Mrs. Singh', subject: 'Hindi', phone: '+91 98765 43214', freePeriods: [3, 5, 6], substitutionCount: 1 },
];

const COVERAGE_GAPS: CoverageGap[] = [
    { id: 'gap_001', period: 2, startTime: '09:00', endTime: '09:45', className: 'Class 10', section: 'A', subject: 'Physics', absentTeacher: ABSENT_TEACHERS[0], status: 'uncovered' },
    { id: 'gap_002', period: 4, startTime: '11:00', endTime: '11:45', className: 'Class 9', section: 'B', subject: 'Physics', absentTeacher: ABSENT_TEACHERS[0], status: 'uncovered' },
    { id: 'gap_003', period: 1, startTime: '08:00', endTime: '08:45', className: 'Class 8', section: 'A', subject: 'Mathematics', absentTeacher: ABSENT_TEACHERS[1], status: 'covered', assignedTo: FREE_TEACHERS[1] },
    { id: 'gap_004', period: 3, startTime: '10:00', endTime: '10:45', className: 'Class 10', section: 'B', subject: 'Mathematics', absentTeacher: ABSENT_TEACHERS[1], status: 'pending' },
    { id: 'gap_005', period: 3, startTime: '10:00', endTime: '10:45', className: 'Class 7', section: 'A', subject: 'English', absentTeacher: ABSENT_TEACHERS[2], status: 'uncovered' },
];

const SUBSTITUTION_LOG: SubstitutionLog[] = [
    { id: 'log_001', period: 1, className: 'Class 8-A', originalTeacher: 'Mrs. Patel', substituteTeacher: 'Mr. Kumar', assignedAt: '08:05 AM', status: 'confirmed' },
];

const PERIOD_TIMES = [
    { period: 1, time: '08:00 - 08:45' },
    { period: 2, time: '09:00 - 09:45' },
    { period: 3, time: '10:00 - 10:45' },
    { period: 4, time: '11:00 - 11:45' },
    { period: 5, time: '12:00 - 12:45' },
    { period: 6, time: '01:30 - 02:15' },
    { period: 7, time: '02:30 - 03:15' },
    { period: 8, time: '03:30 - 04:15' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSIGN MODAL COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AssignModalProps {
    gap: CoverageGap;
    suggestedTeacher: FreeTeacher;
    allFreeTeachers: FreeTeacher[];
    onAssign: (teacherId: string) => void;
    onClose: () => void;
}

const AssignSubstituteModal: React.FC<AssignModalProps> = ({
    gap, suggestedTeacher, allFreeTeachers, onAssign, onClose
}) => {
    const { isDarkMode } = useTheme();
    const [selectedTeacher, setSelectedTeacher] = useState(suggestedTeacher.id);
    const [notifyVia, setNotifyVia] = useState<'sms' | 'app' | 'both'>('both');

    const availableTeachers = allFreeTeachers.filter(t => t.freePeriods.includes(gap.period));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-lg mx-4 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'
                }`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Assign Substitute
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Gap Info */}
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500">Class</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{gap.className}-{gap.section}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Period</p>
                                <p className="font-semibold text-slate-900 dark:text-white">Period {gap.period} ({gap.startTime})</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Subject</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{gap.subject}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Absent</p>
                                <p className="font-semibold text-red-600">{gap.absentTeacher.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Substitute Teacher
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableTeachers.map(teacher => (
                                <button
                                    key={teacher.id}
                                    onClick={() => setSelectedTeacher(teacher.id)}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${selectedTeacher === teacher.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{teacher.name}</p>
                                            <p className="text-xs text-slate-500">{teacher.subject} • {teacher.substitutionCount} subs this month</p>
                                        </div>
                                        {teacher.id === suggestedTeacher.id && (
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium rounded">
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notification Preference */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Notify Via
                        </label>
                        <div className="flex gap-2">
                            {(['sms', 'app', 'both'] as const).map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setNotifyVia(opt)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${notifyVia === opt
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    {opt === 'sms' ? '📱 SMS' : opt === 'app' ? '🔔 App' : '📱🔔 Both'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <NebulaButton variant="secondary" className="flex-1" onClick={onClose}>
                        Cancel
                    </NebulaButton>
                    <NebulaButton variant="primary" className="flex-1" onClick={() => onAssign(selectedTeacher)}>
                        <UserCheck className="w-4 h-4 mr-2" /> Assign & Notify
                    </NebulaButton>
                </div>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SubstitutionManager: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();

    // State
    const [gaps, setGaps] = useState(COVERAGE_GAPS);
    const [logs, setLogs] = useState(SUBSTITUTION_LOG);
    const [selectedGap, setSelectedGap] = useState<CoverageGap | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Summary stats
    const stats = useMemo(() => ({
        absent: ABSENT_TEACHERS.length,
        uncovered: gaps.filter(g => g.status === 'uncovered').length,
        covered: gaps.filter(g => g.status === 'covered').length,
        pending: gaps.filter(g => g.status === 'pending').length,
    }), [gaps]);

    // Get suggested teacher for a gap
    const getSuggestedTeacher = (gap: CoverageGap): FreeTeacher | null => {
        // Find teachers free in this period
        const available = FREE_TEACHERS.filter(t => t.freePeriods.includes(gap.period));
        if (available.length === 0) return null;

        // Prefer same subject, then least substitutions this month
        const sameSubject = available.filter(t => t.subject === gap.subject);
        if (sameSubject.length > 0) {
            return sameSubject.sort((a, b) => a.substitutionCount - b.substitutionCount)[0];
        }
        return available.sort((a, b) => a.substitutionCount - b.substitutionCount)[0];
    };

    // Handle assign
    const handleAssign = (gap: CoverageGap) => {
        setSelectedGap(gap);
        setShowModal(true);
    };

    const handleConfirmAssign = (teacherId: string) => {
        if (!selectedGap) return;

        const teacher = FREE_TEACHERS.find(t => t.id === teacherId);
        if (!teacher) return;

        // Update gaps
        setGaps(prev => prev.map(g =>
            g.id === selectedGap.id
                ? { ...g, status: 'covered' as const, assignedTo: teacher }
                : g
        ));

        // Add to log
        const newLog: SubstitutionLog = {
            id: `log_${Date.now()}`,
            period: selectedGap.period,
            className: `${selectedGap.className}-${selectedGap.section}`,
            originalTeacher: selectedGap.absentTeacher.name,
            substituteTeacher: teacher.name,
            assignedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: 'confirmed',
        };
        setLogs(prev => [newLog, ...prev]);

        setShowModal(false);
        setSelectedGap(null);
    };

    const getReasonBadge = (reason: string) => {
        switch (reason) {
            case 'sick': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'leave': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'emergency': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Substitution Manager</h1>
                        <p className="text-sm text-slate-500">Real-time coverage management • Today's status</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <UserX className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                            <p className="text-xs text-slate-500">Absent Today</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{stats.uncovered}</p>
                            <p className="text-xs text-slate-500">Uncovered</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                            <p className="text-xs text-slate-500">Pending</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{stats.covered}</p>
                            <p className="text-xs text-slate-500">Covered</p>
                        </div>
                    </div>
                </NebulaCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Absent Teachers */}
                <NebulaCard className="flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <UserX className="w-5 h-5 text-red-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Absent Teachers</h3>
                        <span className="ml-auto px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded">
                            {ABSENT_TEACHERS.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                        {ABSENT_TEACHERS.map(teacher => (
                            <div key={teacher.id} className={`p-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-slate-900 dark:text-white">{teacher.name}</p>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getReasonBadge(teacher.reason)}`}>
                                        {teacher.reason}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">{teacher.subject} • Reported at {teacher.reportedAt}</p>
                                <div className="flex gap-1">
                                    {teacher.affectedPeriods.map(p => (
                                        <span key={p} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs rounded">
                                            P{p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </NebulaCard>

                {/* Coverage Gaps */}
                <NebulaCard className="flex flex-col lg:col-span-2 border-2 border-amber-200 dark:border-amber-800">
                    <div className="p-4 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 bg-amber-50/50 dark:bg-amber-900/10">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-amber-700 dark:text-amber-400">Coverage Gaps</h3>
                        <span className="ml-auto px-2 py-0.5 bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold rounded">
                            {stats.uncovered} need attention
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                        {gaps.filter(g => g.status !== 'covered').map(gap => {
                            const suggested = getSuggestedTeacher(gap);
                            return (
                                <div key={gap.id} className={`p-4 rounded-xl border-2 ${gap.status === 'uncovered'
                                        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                                        : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                                    }`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${gap.status === 'uncovered' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                                                    }`}>
                                                    Period {gap.period}
                                                </span>
                                                <span className="text-xs text-slate-500">{gap.startTime} - {gap.endTime}</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{gap.className}-{gap.section}</p>
                                            <p className="text-sm text-slate-500">{gap.subject} • {gap.absentTeacher.name} (absent)</p>
                                        </div>

                                        {gap.status === 'uncovered' && suggested && (
                                            <NebulaButton variant="primary" size="sm" onClick={() => handleAssign(gap)}>
                                                Assign
                                            </NebulaButton>
                                        )}
                                    </div>

                                    {gap.status === 'uncovered' && suggested && (
                                        <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'
                                            }`}>
                                            <span className="text-emerald-600 text-sm">💡 Suggested:</span>
                                            <span className="font-medium text-emerald-700 dark:text-emerald-400">{suggested.name}</span>
                                            <span className="text-xs text-emerald-600">({suggested.subject}, {suggested.substitutionCount} subs this month)</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {stats.uncovered === 0 && stats.pending === 0 && (
                            <div className="flex flex-col items-center py-12">
                                <CheckCircle className="w-12 h-12 text-emerald-300 dark:text-emerald-800 mb-4" />
                                <p className="text-slate-500 font-medium">All periods covered!</p>
                            </div>
                        )}
                    </div>
                </NebulaCard>
            </div>

            {/* Today's Log */}
            <NebulaCard>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Today's Substitution Log</h3>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No substitutions assigned yet</div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="px-4 py-3 flex items-center gap-4">
                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded">
                                    P{log.period}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">{log.className}</p>
                                    <p className="text-xs text-slate-500">{log.originalTeacher} → {log.substituteTeacher}</p>
                                </div>
                                <span className="text-xs text-slate-400">{log.assignedAt}</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${log.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        log.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {log.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </NebulaCard>

            {/* Modal */}
            {showModal && selectedGap && getSuggestedTeacher(selectedGap) && (
                <AssignSubstituteModal
                    gap={selectedGap}
                    suggestedTeacher={getSuggestedTeacher(selectedGap)!}
                    allFreeTeachers={FREE_TEACHERS}
                    onAssign={handleConfirmAssign}
                    onClose={() => { setShowModal(false); setSelectedGap(null); }}
                />
            )}
        </div>
    );
};

export default SubstitutionManager;
