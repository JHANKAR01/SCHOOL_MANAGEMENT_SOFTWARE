// packages/app/features/teacher/TeacherDailyConsole.tsx
// "Today" landing screen showing teacher's classes for the day
// One-tap navigation to attendance, quick stats, sync status

import React, { useState } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useMyClassesToday, useSyncQueue, useLiveClassRoom, useStartLiveClass, useEndLiveClass } from '../../hooks/useTeacherData';

// ============================================================================
// CLASS CARD
// ============================================================================

interface ClassCardProps {
    classData: {
        id: string;
        className: string;
        subjectName: string;
        period: number;
        startTime: string;
        endTime: string;
        attendanceMarked: boolean;
        isCovered?: boolean;
        coveredBy?: string;
        isLive?: boolean;
    };
    onTap: (classId: string) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onTap }) => {
    const { t } = useTranslation();
    const isCovered = classData.isCovered;

    return (
        <button
            onClick={() => !isCovered && onTap(classData.id)}
            disabled={isCovered}
            className={`w-full p-4 rounded-2xl border shadow-sm transition-all duration-200 text-left
                ${isCovered
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md active:scale-[0.98]'
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Period Badge */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center
                    ${isCovered ? 'bg-slate-300 dark:bg-slate-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                    <span className="text-2xl font-bold text-white">{classData.period}</span>
                </div>

                {/* Class Info */}
                <div className="flex-1 text-left">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                        {classData.className}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {classData.subjectName}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {classData.startTime} - {classData.endTime}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    {/* Status Badge */}
                    {isCovered ? (
                        <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            Covered: {classData.coveredBy?.split(' ')[0]}
                        </div>
                    ) : (
                        <div className={`
                        px-3 py-1.5 rounded-full text-xs font-bold
                        ${classData.attendanceMarked
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }
                        `}>
                            {classData.attendanceMarked ? '✓ Marked' : 'Not Marked'}
                        </div>
                    )}

                    {classData.isLive && (
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse">
                            LIVE
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
};

// ============================================================================
// QUICK STAT CARD
// ============================================================================

interface QuickStatProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: 'emerald' | 'amber' | 'indigo' | 'red';
}

const QuickStat: React.FC<QuickStatProps> = ({ icon, label, value, color }) => {
    const colorClasses = {
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };

    return (
        <div className={`flex-1 p-4 rounded-xl ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs font-medium opacity-80">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TeacherDailyConsoleProps {
    onNavigateToAttendance?: (classId: string) => void;
}

export const TeacherDailyConsole: React.FC<TeacherDailyConsoleProps> = ({
    onNavigateToAttendance
}) => {
    const { t } = useTranslation();
    const { data: classesToday = [], isLoading } = useMyClassesToday();
    const { status: syncStatus } = useSyncQueue();
    const [showLiveClassModal, setShowLiveClassModal] = useState(false);

    // Calculate stats
    const totalClasses = classesToday.length;
    const markedCount = classesToday.filter(c => c.attendanceMarked).length;
    const pendingCount = totalClasses - markedCount;

    // Get current period based on time
    const getCurrentPeriod = () => {
        const now = new Date();
        const hour = now.getHours();
        if (hour < 9) return 1;
        if (hour < 10) return 2;
        if (hour < 11) return 3;
        if (hour < 12) return 4;
        if (hour < 13) return 5;
        if (hour < 14) return 6;
        if (hour < 15) return 7;
        return 8;
    };

    const currentPeriod = getCurrentPeriod();
    const currentClass = classesToday.find(c => c.period === currentPeriod);

    const handleClassTap = (classId: string) => {
        if (onNavigateToAttendance) {
            onNavigateToAttendance(classId);
        }
    };

    // Get live class room ID for current class
    const { data: liveClassData } = useLiveClassRoom(
        currentClass?.id || '',
        currentClass?.period || 0
    );

    const startLiveClassMutation = useStartLiveClass();
    const endLiveClassMutation = useEndLiveClass();
    const [processingLive, setProcessingLive] = useState(false);

    const handleStartLiveClass = () => {
        if (currentClass?.isLive) {
            // If already live, maybe just show option to join or end
            // For now assume if active we show end button in main UI
            window.open(`https://meet.jit.si/CLASS_${currentClass.id}`, '_blank');
        } else {
            setShowLiveClassModal(true);
        }
    };

    const confirmStartLiveClass = async () => {
        if (!currentClass) return;
        setProcessingLive(true);
        try {
            const res = await startLiveClassMutation.mutateAsync(currentClass.id);
            if (res.success) {
                const jitsiUrl = `https://meet.jit.si/${res.roomId}`;
                window.open(jitsiUrl, '_blank');
            }
        } catch (e) {
            alert("Failed to start live class");
        } finally {
            setProcessingLive(false);
            setShowLiveClassModal(false);
        }
    };

    const ENDLiveClass = async () => {
        if (!currentClass) return;
        if (confirm("End the current live session?")) {
            await endLiveClassMutation.mutateAsync(currentClass.id);
        }
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
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {t('my_classes_today')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
                <QuickStat
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    label="Total Classes"
                    value={totalClasses}
                    color="indigo"
                />
                <QuickStat
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    label={t('synced')}
                    value={markedCount}
                    color="emerald"
                />
                <QuickStat
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    label="Pending"
                    value={pendingCount}
                    color={pendingCount > 0 ? 'amber' : 'emerald'}
                />
            </div>

            {/* Current Class Highlight */}
            {currentClass && !currentClass.attendanceMarked && (
                <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Current Period</p>
                            <h3 className="text-xl font-bold mt-1">{currentClass.className}</h3>
                            <p className="text-sm opacity-80">{currentClass.subjectName}</p>
                        </div>
                        <div className="flex gap-2">
                            {currentClass.isLive ? (
                                <button
                                    onClick={ENDLiveClass}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition flex items-center gap-2 text-white"
                                >
                                    End Live Class
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartLiveClass}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Start Live Class
                                </button>
                            )}
                            <button
                                onClick={() => handleClassTap(currentClass.id)}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition"
                            >
                                Mark Attendance →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Classes List */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                    All Classes Today
                </h3>
                {classesToday.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>No classes scheduled for today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {classesToday.map(classData => (
                            <ClassCard
                                key={classData.id}
                                classData={classData}
                                onTap={handleClassTap}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Live Class Confirmation Modal */}
            {showLiveClassModal && currentClass && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Start Live Class?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            You are about to start a live class for <strong>{currentClass.className}</strong> - {currentClass.subjectName}.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLiveClassModal(false)}
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStartLiveClass}
                                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                            >
                                Start Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDailyConsole;
