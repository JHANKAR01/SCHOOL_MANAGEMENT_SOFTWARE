// packages/app/features/teacher/TeacherAttendance.tsx
// Speed-optimized attendance marking with inverse marking pattern
// All students default to PRESENT - tap only on absent students

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useStudentsForClass, useSubmitAttendance, useSyncQueue } from '../../hooks/useTeacherData';
import { useMyClassesToday } from '../../hooks/useTeacherData';

// ============================================================================
// TYPES
// ============================================================================

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

interface StudentAttendance {
    studentId: string;
    name: string;
    rollNumber: number;
    photoUrl?: string;
    status: AttendanceStatus;
}

// ============================================================================
// PERIOD SELECTOR
// ============================================================================

interface PeriodSelectorProps {
    selectedPeriod: number;
    onSelect: (period: number) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onSelect }) => {
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap gap-2">
            {periods.map(period => (
                <button
                    key={period}
                    onClick={() => onSelect(period)}
                    className={`
            w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
            ${selectedPeriod === period
                            ? 'bg-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }
          `}
                >
                    {period}
                </button>
            ))}
        </div>
    );
};

// ============================================================================
// STUDENT CARD (One-Tap Toggle)
// ============================================================================

interface StudentCardProps {
    student: StudentAttendance;
    onToggle: (studentId: string) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onToggle }) => {
    const { t } = useTranslation();
    const isPresent = student.status === 'PRESENT';

    return (
        <button
            onClick={() => onToggle(student.studentId)}
            className={`
        w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4
        min-h-[72px] active:scale-[0.98]
        ${isPresent
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                }
      `}
        >
            {/* Avatar */}
            <div className={`
        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
        ${isPresent
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }
      `}>
                {student.rollNumber}
            </div>

            {/* Name */}
            <div className="flex-1 text-left">
                <div className={`font-semibold ${isPresent ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                    {student.name}
                </div>
                <div className={`text-xs ${isPresent ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    Roll #{student.rollNumber}
                </div>
            </div>

            {/* Status Badge */}
            <div className={`
        px-3 py-1.5 rounded-full text-sm font-bold
        ${isPresent
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }
      `}>
                {isPresent ? t('present') : t('absent')}
            </div>
        </button>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TeacherAttendance: React.FC = () => {
    const { t } = useTranslation();
    const { status: syncStatus } = useSyncQueue();
    const { data: classesToday = [], isLoading: loadingClasses } = useMyClassesToday();
    const submitAttendance = useSubmitAttendance();

    // State
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

    // Auto-select first class
    React.useEffect(() => {
        if (!selectedClassId && classesToday.length > 0) {
            setSelectedClassId(classesToday[0].id);
        }
    }, [classesToday, selectedClassId]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch students when class is selected
    const { data: students = [], isLoading: loadingStudents } = useStudentsForClass(selectedClassId);

    // Initialize all students as PRESENT when roster loads
    React.useEffect(() => {
        if (students.length > 0) {
            const initialMap: Record<string, AttendanceStatus> = {};
            students.forEach(s => {
                initialMap[s.id] = 'PRESENT';
            });
            setAttendanceMap(initialMap);
        }
    }, [students]);

    // Build attendance list with status
    const attendanceList: StudentAttendance[] = useMemo(() => {
        return students.map(s => ({
            studentId: s.id,
            name: s.name,
            rollNumber: s.rollNumber,
            photoUrl: s.photoUrl,
            status: attendanceMap[s.id] || 'PRESENT',
        }));
    }, [students, attendanceMap]);

    // Count present/absent
    const presentCount = attendanceList.filter(s => s.status === 'PRESENT').length;
    const absentCount = attendanceList.filter(s => s.status === 'ABSENT').length;

    // Toggle student status
    const handleToggle = useCallback((studentId: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
        }));
    }, []);

    // Submit attendance
    const handleSubmit = async () => {
        if (!selectedClassId || students.length === 0) return;

        setIsSubmitting(true);
        try {
            const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
                studentId,
                status,
            }));

            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            await submitAttendance.mutateAsync({
                classId: selectedClassId,
                date: today,
                period: selectedPeriod,
                records,
            });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('[Attendance] Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mark all as present
    const handleMarkAllPresent = () => {
        const newMap: Record<string, AttendanceStatus> = {};
        students.forEach(s => {
            newMap[s.id] = 'PRESENT';
        });
        setAttendanceMap(newMap);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {t('attendance')}
                </h2>
                {showSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            {syncStatus.online ? t('synced') : t('queued')}
                        </span>
                    </div>
                )}
            </div>

            {/* Class Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Select Class
                </label>
                <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                    <option value="">-- Select a class --</option>
                    {classesToday.map(cls => (
                        <option key={cls.id} value={cls.id}>
                            {cls.className} - {cls.subjectName} (Period {cls.period})
                        </option>
                    ))}
                </select>
            </div>

            {/* Period Selector */}
            {selectedClassId && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                        {t('period')}
                    </label>
                    <PeriodSelector selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} />
                </div>
            )}

            {/* Stats Bar */}
            {selectedClassId && students.length > 0 && (
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{presentCount}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">{t('present')}</div>
                    </div>
                    <div className="flex-1 bg-red-100 dark:bg-red-900/30 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{absentCount}</div>
                        <div className="text-xs text-red-600 dark:text-red-400">{t('absent')}</div>
                    </div>
                    <button
                        onClick={handleMarkAllPresent}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        {t('all_present')}
                    </button>
                </div>
            )}

            {/* Student Roster */}
            {selectedClassId && (
                <div className="space-y-3">
                    {loadingStudents ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No students found for this class
                        </div>
                    ) : (
                        attendanceList.map(student => (
                            <StudentCard
                                key={student.studentId}
                                student={student}
                                onToggle={handleToggle}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Submit Button */}
            {selectedClassId && students.length > 0 && (
                <div className="sticky bottom-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`
              w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-200
              ${isSubmitting
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl active:scale-[0.98]'
                            }
            `}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t('submit')} ({presentCount} {t('present')}, {absentCount} {t('absent')})
                            </span>
                        )}
                    </button>
                    {!syncStatus.online && (
                        <p className="text-center text-xs text-amber-600 dark:text-amber-400 mt-2">
                            ⚠️ {t('offline')} - Will sync when back online
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;
