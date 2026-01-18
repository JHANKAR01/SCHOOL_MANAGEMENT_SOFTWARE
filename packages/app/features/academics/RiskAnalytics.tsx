// packages/app/features/academics/RiskAnalytics.tsx
// Risk Analytics View - Shows at-risk students with filters and actions
import React, { useState, useEffect } from 'react';
import {
    AlertTriangle, Users, TrendingDown, Filter, Search,
    ChevronDown, Mail, Phone, FileText, Loader2, ArrowLeft
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type RiskType = 'attendance' | 'academic' | 'both';

interface AtRiskStudent {
    id: string;
    name: string;
    rollNo: string;
    className: string;
    section: string;
    riskType: RiskType;
    attendancePercent: number;
    failingSubjects: number;
    lastAbsentDate: string;
    parentName: string;
    parentPhone: string;
    counselingNotes?: string;
}

interface RiskAnalyticsProps {
    onBack: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_AT_RISK: AtRiskStudent[] = [
    { id: '1', name: 'Vikash Joshi', rollNo: '007', className: '10', section: 'A', riskType: 'both', attendancePercent: 62, failingSubjects: 3, lastAbsentDate: '2026-01-17', parentName: 'Mr. Suresh Joshi', parentPhone: '+91 98765 43210', counselingNotes: 'Family issues reported. Counselor meeting scheduled.' },
    { id: '2', name: 'Rohit Mehta', rollNo: '015', className: '9', section: 'B', riskType: 'attendance', attendancePercent: 68, failingSubjects: 0, lastAbsentDate: '2026-01-16', parentName: 'Mrs. Priya Mehta', parentPhone: '+91 98765 43211' },
    { id: '3', name: 'Sneha Kapoor', rollNo: '023', className: '10', section: 'C', riskType: 'academic', attendancePercent: 89, failingSubjects: 4, lastAbsentDate: '2026-01-10', parentName: 'Mr. Amit Kapoor', parentPhone: '+91 98765 43212' },
    { id: '4', name: 'Ankit Sharma', rollNo: '031', className: '8', section: 'A', riskType: 'attendance', attendancePercent: 71, failingSubjects: 1, lastAbsentDate: '2026-01-15', parentName: 'Mrs. Rekha Sharma', parentPhone: '+91 98765 43213' },
    { id: '5', name: 'Priya Singh', rollNo: '042', className: '11', section: 'B', riskType: 'both', attendancePercent: 58, failingSubjects: 2, lastAbsentDate: '2026-01-17', parentName: 'Mr. Raj Singh', parentPhone: '+91 98765 43214', counselingNotes: 'Health issues - frequent hospital visits.' },
    { id: '6', name: 'Karan Patel', rollNo: '056', className: '9', section: 'A', riskType: 'academic', attendancePercent: 92, failingSubjects: 3, lastAbsentDate: '2026-01-05', parentName: 'Mrs. Neha Patel', parentPhone: '+91 98765 43215' },
    { id: '7', name: 'Aisha Khan', rollNo: '067', className: '10', section: 'B', riskType: 'attendance', attendancePercent: 65, failingSubjects: 0, lastAbsentDate: '2026-01-16', parentName: 'Mr. Zafar Khan', parentPhone: '+91 98765 43216' },
    { id: '8', name: 'Rahul Verma', rollNo: '078', className: '12', section: 'A', riskType: 'both', attendancePercent: 55, failingSubjects: 4, lastAbsentDate: '2026-01-17', parentName: 'Mrs. Suman Verma', parentPhone: '+91 98765 43217', counselingNotes: 'Board exam pressure. Weekly counseling ongoing.' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RiskBadge: React.FC<{ type: RiskType }> = ({ type }) => {
    const config = {
        attendance: { label: 'Attendance', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        academic: { label: 'Academic', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        both: { label: 'Critical', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${config[type].color}`}>
            {config[type].label}
        </span>
    );
};

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RiskAnalytics: React.FC<RiskAnalyticsProps> = ({ onBack }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<AtRiskStudent[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<RiskType | 'all'>('all');
    const [filterClass, setFilterClass] = useState<string>('all');
    const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);

    // Load data
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setStudents(MOCK_AT_RISK);
            setLoading(false);
        }, 400);
    }, []);

    // Filter students
    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNo.includes(searchQuery);
        const matchesType = filterType === 'all' || s.riskType === filterType;
        const matchesClass = filterClass === 'all' || s.className === filterClass;
        return matchesSearch && matchesType && matchesClass;
    });

    // Calculate stats
    const stats = {
        total: students.length,
        attendance: students.filter(s => s.riskType === 'attendance' || s.riskType === 'both').length,
        academic: students.filter(s => s.riskType === 'academic' || s.riskType === 'both').length,
        critical: students.filter(s => s.riskType === 'both').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Risk Analytics</h1>
                    <p className="text-sm text-slate-500">Students requiring intervention</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total At-Risk" value={stats.total} icon={<Users className="w-5 h-5 text-white" />} color="bg-slate-600" />
                <StatCard label="Low Attendance" value={stats.attendance} icon={<TrendingDown className="w-5 h-5 text-white" />} color="bg-amber-500" />
                <StatCard label="Academic Issues" value={stats.academic} icon={<FileText className="w-5 h-5 text-white" />} color="bg-red-500" />
                <StatCard label="Critical (Both)" value={stats.critical} icon={<AlertTriangle className="w-5 h-5 text-white" />} color="bg-purple-500" />
            </div>

            {/* Filters */}
            <NebulaCard>
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <NebulaInput
                            type="text"
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as RiskType | 'all')}
                        className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                        <option value="all">All Risk Types</option>
                        <option value="attendance">Attendance Only</option>
                        <option value="academic">Academic Only</option>
                        <option value="both">Critical (Both)</option>
                    </select>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                        <option value="all">All Classes</option>
                        {['8', '9', '10', '11', '12'].map(c => (
                            <option key={c} value={c}>Class {c}</option>
                        ))}
                    </select>
                </div>
            </NebulaCard>

            {/* Students Table */}
            <NebulaCard noPadding>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Student</th>
                                    <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Class</th>
                                    <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Risk Type</th>
                                    <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Attendance</th>
                                    <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Failing</th>
                                    <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                                <p className="text-xs text-slate-500">Roll: {student.rollNo}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
                                            {student.className}-{student.section}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <RiskBadge type={student.riskType} />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`font-medium ${student.attendancePercent < 75 ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {student.attendancePercent}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`font-medium ${student.failingSubjects > 2 ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {student.failingSubjects}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                    title="View Details"
                                                >
                                                    <FileText className="w-4 h-4 text-slate-500" />
                                                </button>
                                                <a
                                                    href={`tel:${student.parentPhone}`}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                    title="Call Parent"
                                                >
                                                    <Phone className="w-4 h-4 text-slate-500" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredStudents.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-slate-500">No students match your filters</p>
                            </div>
                        )}
                    </div>
                )}
            </NebulaCard>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStudent(null)} />
                    <div className={`relative w-full max-w-lg p-6 rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            {selectedStudent.name}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Class</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedStudent.className}-{selectedStudent.section}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Attendance</span>
                                <span className={`font-medium ${selectedStudent.attendancePercent < 75 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                    {selectedStudent.attendancePercent}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Failing Subjects</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedStudent.failingSubjects}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Last Absent</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedStudent.lastAbsentDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Parent</span>
                                <span className="font-medium text-slate-900 dark:text-white">{selectedStudent.parentName}</span>
                            </div>
                            {selectedStudent.counselingNotes && (
                                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                                    <p className="text-xs font-semibold text-amber-600 mb-1">Counseling Notes</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedStudent.counselingNotes}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <NebulaButton variant="secondary" onClick={() => setSelectedStudent(null)} className="flex-1">
                                Close
                            </NebulaButton>
                            <NebulaButton variant="primary" className="flex-1">
                                <Mail className="w-4 h-4 mr-2" /> Email Parent
                            </NebulaButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskAnalytics;
