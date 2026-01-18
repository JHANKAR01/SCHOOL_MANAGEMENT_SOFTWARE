// packages/app/features/academics/ResultReviewModal.tsx
// Modal for Principal to review and approve/reject exam results
import React, { useState, useEffect } from 'react';
import {
    X, CheckCircle, XCircle, AlertTriangle, Edit3, Save,
    Users, BarChart3, Loader2, MessageSquare
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface StudentResult {
    id: string;
    studentName: string;
    rollNo: string;
    marks: number;
    maxMarks: number;
    grade: string;
    percentage: number;
}

interface ExamDetails {
    examId: string;
    examName: string;
    className: string;
    subjectName: string;
    teacherName: string;
    submittedAt: string;
    totalStudents: number;
    passCount: number;
    failCount: number;
    avgPercentage: number;
}

interface ResultReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    approvalId: string;
    examId: string;
    onApprove: () => void;
    onReject: (reason: string) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_EXAM: ExamDetails = {
    examId: 'exam_demo_001',
    examName: 'Unit Test 2',
    className: 'Class 10-A',
    subjectName: 'Mathematics',
    teacherName: 'Mrs. Sharma',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    totalStudents: 42,
    passCount: 38,
    failCount: 4,
    avgPercentage: 72.5
};

const MOCK_RESULTS: StudentResult[] = [
    { id: '1', studentName: 'Aarav Sharma', rollNo: '001', marks: 85, maxMarks: 100, grade: 'A', percentage: 85 },
    { id: '2', studentName: 'Priya Patel', rollNo: '002', marks: 92, maxMarks: 100, grade: 'A+', percentage: 92 },
    { id: '3', studentName: 'Rahul Kumar', rollNo: '003', marks: 67, maxMarks: 100, grade: 'B', percentage: 67 },
    { id: '4', studentName: 'Sneha Gupta', rollNo: '004', marks: 78, maxMarks: 100, grade: 'B+', percentage: 78 },
    { id: '5', studentName: 'Arjun Singh', rollNo: '005', marks: 54, maxMarks: 100, grade: 'C', percentage: 54 },
    { id: '6', studentName: 'Kavya Reddy', rollNo: '006', marks: 88, maxMarks: 100, grade: 'A', percentage: 88 },
    { id: '7', studentName: 'Vikash Joshi', rollNo: '007', marks: 31, maxMarks: 100, grade: 'F', percentage: 31 },
    { id: '8', studentName: 'Ananya Das', rollNo: '008', marks: 95, maxMarks: 100, grade: 'A+', percentage: 95 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const StatBox: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className={`text-xl font-bold ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
);

const GradeBadge: React.FC<{ grade: string }> = ({ grade }) => {
    const colors: Record<string, string> = {
        'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        'A': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'B': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        'C': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'F': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${colors[grade] || colors['C']}`}>
            {grade}
        </span>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ResultReviewModal: React.FC<ResultReviewModalProps> = ({
    isOpen,
    onClose,
    approvalId,
    examId,
    onApprove,
    onReject
}) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
    const [results, setResults] = useState<StudentResult[]>([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Load exam data
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // TODO: Fetch real data from API
            // For now, use mock data
            setTimeout(() => {
                setExamDetails(MOCK_EXAM);
                setResults(MOCK_RESULTS);
                setLoading(false);
            }, 500);
        }
    }, [isOpen, examId]);

    // Handle mark edit
    const handleEditStart = (id: string, currentMarks: number) => {
        setEditingId(id);
        setEditValue(currentMarks.toString());
    };

    const handleEditSave = (id: string) => {
        const newMarks = parseInt(editValue, 10);
        if (!isNaN(newMarks) && newMarks >= 0 && newMarks <= 100) {
            setResults(prev => prev.map(r => {
                if (r.id === id) {
                    const percentage = (newMarks / r.maxMarks) * 100;
                    let grade = 'F';
                    if (percentage >= 90) grade = 'A+';
                    else if (percentage >= 80) grade = 'A';
                    else if (percentage >= 70) grade = 'B+';
                    else if (percentage >= 60) grade = 'B';
                    else if (percentage >= 50) grade = 'C';
                    else if (percentage >= 35) grade = 'D';
                    return { ...r, marks: newMarks, percentage, grade };
                }
                return r;
            }));
        }
        setEditingId(null);
        setEditValue('');
    };

    // Handle approve
    const handleApprove = async () => {
        setSubmitting(true);
        try {
            // Call API
            const res = await fetch(`/api/principal/approvals/${approvalId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({ action: 'APPROVE', type: 'RESULT_PUBLISH' })
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
            const res = await fetch(`/api/principal/approvals/${approvalId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({ action: 'REJECT', type: 'RESULT_PUBLISH', reason: rejectReason })
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'
                    }`}>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Result Review
                        </h2>
                        {examDetails && (
                            <p className="text-sm text-slate-500 mt-1">
                                {examDetails.className} • {examDetails.subjectName} • {examDetails.examName}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <StatBox label="Total Students" value={examDetails?.totalStudents || 0} />
                                <StatBox label="Passed" value={examDetails?.passCount || 0} color="text-emerald-600" />
                                <StatBox label="Failed" value={examDetails?.failCount || 0} color="text-red-600" />
                                <StatBox label="Average %" value={`${examDetails?.avgPercentage || 0}%`} color="text-indigo-600" />
                            </div>

                            {/* Submitted By */}
                            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                                }`}>
                                <Users className="w-5 h-5 text-slate-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Submitted by</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{examDetails?.teacherName}</p>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-200'
                                }`}>
                                <table className="w-full">
                                    <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Roll</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Marks</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">%</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Grade</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {results.map(result => (
                                            <tr key={result.id} className={result.percentage < 35 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{result.rollNo}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{result.studentName}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {editingId === result.id ? (
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={() => handleEditSave(result.id)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave(result.id)}
                                                            className="w-16 px-2 py-1 text-center border rounded dark:bg-slate-800 dark:border-slate-700"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-slate-900 dark:text-white">
                                                            {result.marks}/{result.maxMarks}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">
                                                    {result.percentage.toFixed(0)}%
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <GradeBadge grade={result.grade} />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleEditStart(result.id, result.marks)}
                                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-slate-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex justify-between items-center p-6 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
                    }`}>
                    <p className="text-sm text-slate-500">
                        Review the marks carefully before approval
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
                            Approve & Publish
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
                            placeholder="Enter the reason for rejecting these results..."
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

export default ResultReviewModal;
