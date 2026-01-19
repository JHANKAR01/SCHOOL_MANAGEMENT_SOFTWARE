// packages/app/features/teacher/TeacherMarksEntry.tsx
// Exam list with marks entry grid
// Status tracking: Not Started → In Progress → Submitted

import React, { useState } from 'react';
import { useTranslation } from '../../provider/language-context';
import { useMyExams, useSyncQueue } from '../../hooks/useTeacherData';

// ============================================================================
// TYPES
// ============================================================================

type ExamStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'PUBLISHED';

interface Exam {
    id: string;
    name: string;
    subjectName: string;
    className: string;
    status: ExamStatus;
    maxMarks: number;
    date: string;
}

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge: React.FC<{ status: ExamStatus }> = ({ status }) => {
    const { t } = useTranslation();

    const config = {
        NOT_STARTED: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Not Started' },
        IN_PROGRESS: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'In Progress' },
        SUBMITTED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Submitted' },
        PUBLISHED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Published' },
    };

    const { bg, text, label } = config[status];

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
            {label}
        </span>
    );
};

// ============================================================================
// EXAM CARD
// ============================================================================

interface ExamCardProps {
    exam: Exam;
    onSelect: (examId: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(exam.id)}
            className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] text-left"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                        {exam.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {exam.subjectName} • {exam.className}
                    </p>
                </div>
                <StatusBadge status={exam.status} />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {exam.date}
                </span>
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Max: {exam.maxMarks}
                </span>
            </div>
        </button>
    );
};

// ============================================================================
// MARKS ENTRY GRID (Modal)
// ============================================================================

interface MarksGridProps {
    examId: string;
    examName: string;
    maxMarks: number;
    onClose: () => void;
    onSave: (marks: { studentId: string; marks: number }[]) => void;
}

const MarksGrid: React.FC<MarksGridProps> = ({ examId, examName, maxMarks, onClose, onSave }) => {
    const { t } = useTranslation();
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Mock students for demo (in production, fetch from useStudentsForClass)
    const students = [
        { id: '1', name: 'Aarav Sharma', rollNumber: 1 },
        { id: '2', name: 'Priya Patel', rollNumber: 2 },
        { id: '3', name: 'Rahul Singh', rollNumber: 3 },
        { id: '4', name: 'Ananya Gupta', rollNumber: 4 },
        { id: '5', name: 'Vikram Reddy', rollNumber: 5 },
    ];

    const handleMarkChange = (studentId: string, value: string) => {
        const numValue = parseFloat(value);
        if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= maxMarks)) {
            setMarks(prev => ({ ...prev, [studentId]: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const marksData = Object.entries(marks)
            .filter(([_, value]) => value !== '')
            .map(([studentId, value]) => ({
                studentId,
                marks: parseFloat(value),
            }));

        await onSave(marksData);
        setSaving(false);
        onClose();
    };

    const isValid = (value: string) => {
        if (value === '') return true;
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= maxMarks;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{examName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Max Marks: {maxMarks}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Grid */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                <th className="pb-3 font-medium">Roll</th>
                                <th className="pb-3 font-medium">Student Name</th>
                                <th className="pb-3 font-medium text-center">Marks</th>
                                <th className="pb-3 font-medium text-center">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {students.map(student => {
                                const value = marks[student.id] || '';
                                const percentage = value ? Math.round((parseFloat(value) / maxMarks) * 100) : 0;
                                const hasError = !isValid(value);

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {student.rollNumber}
                                        </td>
                                        <td className="py-3 text-sm font-medium text-slate-800 dark:text-white">
                                            {student.name}
                                        </td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                value={value}
                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                placeholder="-"
                                                className={`w-20 px-3 py-2 rounded-lg border text-center font-bold text-sm
                          ${hasError
                                                        ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                                                    } text-slate-900 dark:text-white`}
                                                min="0"
                                                max={maxMarks}
                                            />
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className={`text-sm font-bold ${percentage >= 80 ? 'text-emerald-600' :
                                                    percentage >= 60 ? 'text-blue-600' :
                                                        percentage >= 40 ? 'text-amber-600' :
                                                            'text-red-600'
                                                }`}>
                                                {value ? `${percentage}%` : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {saving ? 'Saving...' : t('save_draft')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TeacherMarksEntry: React.FC = () => {
    const { t } = useTranslation();
    const { data: exams = [], isLoading } = useMyExams();
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [statusFilter, setStatusFilter] = useState<ExamStatus | 'ALL'>('ALL');

    // Filter exams
    const filteredExams = statusFilter === 'ALL'
        ? exams
        : exams.filter(e => e.status === statusFilter);

    const handleSaveMarks = async (marks: { studentId: string; marks: number }[]) => {
        console.log('[MarksEntry] Saving marks:', marks);
        // In production, call API via useMutation
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
                    {t('marks_entry')}
                </h2>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition
              ${statusFilter === status
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {status === 'ALL' ? 'All Exams' : status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Exam List */}
            {filteredExams.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No exams found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredExams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            onSelect={() => setSelectedExam(exam)}
                        />
                    ))}
                </div>
            )}

            {/* Marks Entry Modal */}
            {selectedExam && (
                <MarksGrid
                    examId={selectedExam.id}
                    examName={selectedExam.name}
                    maxMarks={selectedExam.maxMarks}
                    onClose={() => setSelectedExam(null)}
                    onSave={handleSaveMarks}
                />
            )}
        </div>
    );
};

export default TeacherMarksEntry;
