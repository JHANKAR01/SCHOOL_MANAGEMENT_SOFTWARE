// packages/app/features/academics/ResultsCommandCenter.tsx
// Phase 3: Exam "War Room" - Kanban-Style Status Board
import React, { useState } from 'react';
import {
    FileText, CheckCircle, Clock, Lock, AlertTriangle,
    ChevronRight, Calendar, Users, ArrowLeft, Eye
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';
import { ResultReviewModal } from './ResultReviewModal';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ExamStatus = 'active' | 'pending' | 'published';

interface Exam {
    id: string;
    name: string;
    class: string;
    subject?: string;
    date: string;
    status: ExamStatus;
    progress?: number; // For active exams
    teacherName?: string;
    totalStudents: number;
    marksEntered?: number;
    publishedDate?: string;
}

interface Props {
    onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_EXAMS: Exam[] = [
    // Active Exams
    { id: 'exam_001', name: 'Mid-Term Assessment 2026', class: 'All Classes', date: '2026-01-20', status: 'active', progress: 65, totalStudents: 420, marksEntered: 273 },
    { id: 'exam_002', name: 'Class 10 Pre-Board', class: 'Class 10', date: '2026-01-25', status: 'active', progress: 30, totalStudents: 82, marksEntered: 25 },

    // Pending Approval
    { id: 'exam_003', name: 'Class 9 Unit Test 3', class: 'Class 9', subject: 'Mathematics', date: '2026-01-15', status: 'pending', teacherName: 'Mrs. Sharma', totalStudents: 83, marksEntered: 83 },
    { id: 'exam_004', name: 'Class 8 Science Practical', class: 'Class 8', subject: 'Science', date: '2026-01-12', status: 'pending', teacherName: 'Mr. Patel', totalStudents: 85, marksEntered: 85 },
    { id: 'exam_005', name: 'Class 7 English FA-2', class: 'Class 7', subject: 'English', date: '2026-01-10', status: 'pending', teacherName: 'Ms. Iyer', totalStudents: 83, marksEntered: 83 },

    // Published
    { id: 'exam_006', name: 'Annual Examination 2025', class: 'All Classes', date: '2025-03-15', status: 'published', publishedDate: '2025-04-01', totalStudents: 412, marksEntered: 412 },
    { id: 'exam_007', name: 'Half-Yearly 2025', class: 'All Classes', date: '2025-09-20', status: 'published', publishedDate: '2025-10-05', totalStudents: 418, marksEntered: 418 },
    { id: 'exam_008', name: 'Class 10 Pre-Board 2025', class: 'Class 10', date: '2025-12-10', status: 'published', publishedDate: '2025-12-20', totalStudents: 80, marksEntered: 80 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAM CARD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ExamCardProps {
    exam: Exam;
    onReview?: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onReview }) => {
    const { isDarkMode } = useTheme();

    const getStatusIcon = () => {
        switch (exam.status) {
            case 'active': return <Clock className="w-4 h-4 text-blue-500" />;
            case 'pending': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'published': return <Lock className="w-4 h-4 text-emerald-500" />;
        }
    };

    const getStatusBg = () => {
        switch (exam.status) {
            case 'active': return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10';
            case 'pending': return 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10';
            case 'published': return 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50';
        }
    };

    return (
        <div className={`p-4 rounded-xl border ${getStatusBg()} transition-all hover:shadow-md mb-3`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${exam.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        exam.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                            'bg-slate-100 dark:bg-slate-800'
                    }`}>
                    <FileText className={`w-5 h-5 ${exam.status === 'active' ? 'text-blue-600' :
                            exam.status === 'pending' ? 'text-amber-600' :
                                'text-slate-500'
                        }`} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{exam.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {exam.class}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {exam.date}
                        </span>
                    </div>

                    {/* Status-specific content */}
                    {exam.status === 'active' && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-500">Marks Entry Progress</span>
                                <span className="font-medium text-blue-600">{exam.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${exam.progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{exam.marksEntered}/{exam.totalStudents} entered</p>
                        </div>
                    )}

                    {exam.status === 'pending' && (
                        <div className="mt-3">
                            <p className="text-xs text-slate-500">Submitted by: <span className="font-medium text-slate-700 dark:text-slate-300">{exam.teacherName}</span></p>
                            <p className="text-xs text-slate-400">{exam.marksEntered} marks ready for review</p>
                        </div>
                    )}

                    {exam.status === 'published' && (
                        <div className="mt-3">
                            <p className="text-xs text-slate-500">Published: <span className="font-medium text-slate-700 dark:text-slate-300">{exam.publishedDate}</span></p>
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Locked & Archived
                            </p>
                        </div>
                    )}
                </div>

                {/* Action */}
                {exam.status === 'pending' && onReview && (
                    <NebulaButton variant="primary" size="sm" onClick={onReview}>
                        Review
                    </NebulaButton>
                )}

                {exam.status === 'published' && (
                    <NebulaButton variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                    </NebulaButton>
                )}
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ResultsCommandCenter: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();

    // State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    // Group exams by status
    const activeExams = MOCK_EXAMS.filter(e => e.status === 'active');
    const pendingExams = MOCK_EXAMS.filter(e => e.status === 'pending');
    const publishedExams = MOCK_EXAMS.filter(e => e.status === 'published');

    const handleReview = (exam: Exam) => {
        setSelectedExam(exam);
        setShowReviewModal(true);
    };

    const handleApprove = () => {
        setShowReviewModal(false);
        setSelectedExam(null);
        // TODO: Refresh data
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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Results Command Center</h1>
                        <p className="text-sm text-slate-500">Examination War Room • Status Board</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{activeExams.length}</p>
                            <p className="text-xs text-slate-500">In Progress</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{pendingExams.length}</p>
                            <p className="text-xs text-slate-500">Awaiting Approval</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{publishedExams.length}</p>
                            <p className="text-xs text-slate-500">Published</p>
                        </div>
                    </div>
                </NebulaCard>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Active Column */}
                <NebulaCard className="flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Active Exams</h3>
                        <span className="ml-auto px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                            {activeExams.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {activeExams.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No active exams</p>
                        ) : (
                            activeExams.map(exam => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))
                        )}
                    </div>
                </NebulaCard>

                {/* Pending Column */}
                <NebulaCard className="flex flex-col border-2 border-amber-200 dark:border-amber-800">
                    <div className="p-4 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 bg-amber-50/50 dark:bg-amber-900/10">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-amber-700 dark:text-amber-400">Pending Approval</h3>
                        <span className="ml-auto px-2 py-0.5 bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold rounded">
                            {pendingExams.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {pendingExams.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">All caught up!</p>
                        ) : (
                            pendingExams.map(exam => (
                                <ExamCard key={exam.id} exam={exam} onReview={() => handleReview(exam)} />
                            ))
                        )}
                    </div>
                </NebulaCard>

                {/* Published Column */}
                <NebulaCard className="flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Published</h3>
                        <span className="ml-auto px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded">
                            {publishedExams.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {publishedExams.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No published exams</p>
                        ) : (
                            publishedExams.map(exam => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))
                        )}
                    </div>
                </NebulaCard>
            </div>

            {/* Review Modal */}
            <ResultReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                approvalId={selectedExam?.id || ''}
                examId={selectedExam?.id || ''}
                onApprove={handleApprove}
                onReject={(reason) => {
                    console.log('Rejected:', reason);
                    setShowReviewModal(false);
                }}
            />
        </div>
    );
};

export default ResultsCommandCenter;
