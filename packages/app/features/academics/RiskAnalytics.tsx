// packages/app/features/academics/RiskAnalytics.tsx
// Phase 3: Risk Monitor 2.0 - Scenario Builder with Dynamic Filtering
import React, { useState, useMemo } from 'react';
import {
    AlertTriangle, TrendingDown, ArrowLeft, Users, BookOpen,
    Filter, ChevronDown, Search, ChevronRight, Clock, Calendar
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type RiskType = 'attendance' | 'academic';

interface StudentRisk {
    id: string;
    name: string;
    rollNo: string;
    class: string;
    section: string;
    attendancePct: number;
    failingSubjects: number;
    lastAbsent: string;
    parentContact: string;
    riskLevel: 'critical' | 'high' | 'medium';
}

interface Props {
    onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ALL_AT_RISK_STUDENTS: StudentRisk[] = [
    { id: 'std_001', name: 'Aarav Sharma', rollNo: '10A-01', class: '10', section: 'A', attendancePct: 45, failingSubjects: 4, lastAbsent: '2026-01-17', parentContact: '+91 98765 43210', riskLevel: 'critical' },
    { id: 'std_002', name: 'Priya Patel', rollNo: '10B-15', class: '10', section: 'B', attendancePct: 52, failingSubjects: 3, lastAbsent: '2026-01-16', parentContact: '+91 98765 43211', riskLevel: 'critical' },
    { id: 'std_003', name: 'Rahul Kumar', rollNo: '9A-08', class: '9', section: 'A', attendancePct: 68, failingSubjects: 2, lastAbsent: '2026-01-15', parentContact: '+91 98765 43212', riskLevel: 'high' },
    { id: 'std_004', name: 'Kavya Iyer', rollNo: '9B-22', class: '9', section: 'B', attendancePct: 62, failingSubjects: 3, lastAbsent: '2026-01-14', parentContact: '+91 98765 43213', riskLevel: 'high' },
    { id: 'std_005', name: 'Arjun Nair', rollNo: '8A-11', class: '8', section: 'A', attendancePct: 72, failingSubjects: 1, lastAbsent: '2026-01-13', parentContact: '+91 98765 43214', riskLevel: 'medium' },
    { id: 'std_006', name: 'Sneha Gupta', rollNo: '8B-19', class: '8', section: 'B', attendancePct: 78, failingSubjects: 2, lastAbsent: '2026-01-12', parentContact: '+91 98765 43215', riskLevel: 'medium' },
    { id: 'std_007', name: 'Vikram Reddy', rollNo: '7A-05', class: '7', section: 'A', attendancePct: 58, failingSubjects: 4, lastAbsent: '2026-01-17', parentContact: '+91 98765 43216', riskLevel: 'critical' },
    { id: 'std_008', name: 'Ananya Singh', rollNo: '7B-14', class: '7', section: 'B', attendancePct: 74, failingSubjects: 1, lastAbsent: '2026-01-10', parentContact: '+91 98765 43217', riskLevel: 'medium' },
    { id: 'std_009', name: 'Rohan Mehta', rollNo: '6A-03', class: '6', section: 'A', attendancePct: 55, failingSubjects: 3, lastAbsent: '2026-01-16', parentContact: '+91 98765 43218', riskLevel: 'critical' },
    { id: 'std_010', name: 'Ishita Verma', rollNo: '6B-21', class: '6', section: 'B', attendancePct: 82, failingSubjects: 0, lastAbsent: '2026-01-05', parentContact: '+91 98765 43219', riskLevel: 'medium' },
    { id: 'std_011', name: 'Aditya Joshi', rollNo: '10A-12', class: '10', section: 'A', attendancePct: 65, failingSubjects: 2, lastAbsent: '2026-01-14', parentContact: '+91 98765 43220', riskLevel: 'high' },
    { id: 'std_012', name: 'Meera Rao', rollNo: '9A-18', class: '9', section: 'A', attendancePct: 71, failingSubjects: 2, lastAbsent: '2026-01-11', parentContact: '+91 98765 43221', riskLevel: 'medium' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RiskAnalytics: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();

    // Control Panel State
    const [riskType, setRiskType] = useState<RiskType>('attendance');
    const [threshold, setThreshold] = useState<number>(75);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentRisk | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Dynamic Filtering based on risk type and threshold
    const filteredStudents = useMemo(() => {
        return ALL_AT_RISK_STUDENTS.filter(student => {
            // Apply risk type filter
            if (riskType === 'attendance') {
                if (student.attendancePct >= threshold) return false;
            } else {
                // Academic risk: students failing > threshold subjects
                if (student.failingSubjects <= threshold) return false;
            }

            // Apply search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = student.name.toLowerCase().includes(query);
                const matchesRoll = student.rollNo.toLowerCase().includes(query);
                const matchesClass = `${student.class}-${student.section}`.toLowerCase().includes(query);
                if (!matchesName && !matchesRoll && !matchesClass) return false;
            }

            return true;
        });
    }, [riskType, threshold, searchQuery]);

    // Summary stats
    const summaryStats = useMemo(() => {
        const critical = filteredStudents.filter(s => s.riskLevel === 'critical').length;
        const high = filteredStudents.filter(s => s.riskLevel === 'high').length;
        const medium = filteredStudents.filter(s => s.riskLevel === 'medium').length;
        return { total: filteredStudents.length, critical, high, medium };
    }, [filteredStudents]);

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENT DETAIL VIEW
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedStudent) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h1>
                        <p className="text-sm text-slate-500">Class {selectedStudent.class}-{selectedStudent.section} • Roll: {selectedStudent.rollNo}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(selectedStudent.riskLevel)}`}>
                        {selectedStudent.riskLevel.toUpperCase()} RISK
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attendance Card */}
                    <NebulaCard className="p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" /> Attendance
                        </h3>
                        <div className="text-center py-6">
                            <p className={`text-5xl font-bold ${selectedStudent.attendancePct < 60 ? 'text-red-600' :
                                    selectedStudent.attendancePct < 75 ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                                }`}>
                                {selectedStudent.attendancePct}%
                            </p>
                            <p className="text-sm text-slate-500 mt-2">Current Attendance</p>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <p className="text-sm text-slate-500">Last Absent: <span className="font-medium text-slate-900 dark:text-white">{selectedStudent.lastAbsent}</span></p>
                        </div>
                    </NebulaCard>

                    {/* Academic Card */}
                    <NebulaCard className="p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-500" /> Academic Performance
                        </h3>
                        <div className="text-center py-6">
                            <p className={`text-5xl font-bold ${selectedStudent.failingSubjects >= 3 ? 'text-red-600' :
                                    selectedStudent.failingSubjects >= 2 ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                                }`}>
                                {selectedStudent.failingSubjects}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">Failing Subjects</p>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <p className="text-sm text-slate-500">Needs intervention in {selectedStudent.failingSubjects > 0 ? selectedStudent.failingSubjects : 'no'} subject(s)</p>
                        </div>
                    </NebulaCard>

                    {/* Contact Card */}
                    <NebulaCard className="p-6 md:col-span-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-500" /> Parent Contact
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg font-medium text-slate-900 dark:text-white">{selectedStudent.parentContact}</p>
                                <p className="text-sm text-slate-500">Guardian phone number</p>
                            </div>
                            <NebulaButton variant="primary">
                                Schedule Call
                            </NebulaButton>
                        </div>
                    </NebulaCard>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN VIEW
    // ─────────────────────────────────────────────────────────────────────────
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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Risk Monitor 2.0</h1>
                        <p className="text-sm text-slate-500">Scenario Builder • Dynamic Filtering</p>
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <NebulaCard className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Risk Type Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                } hover:border-indigo-400`}
                        >
                            {riskType === 'attendance' ? (
                                <Calendar className="w-4 h-4 text-indigo-500" />
                            ) : (
                                <BookOpen className="w-4 h-4 text-amber-500" />
                            )}
                            <span className="font-medium text-slate-900 dark:text-white">
                                {riskType === 'attendance' ? 'Attendance Risk' : 'Academic Risk'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {dropdownOpen && (
                            <div className={`absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg border z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                }`}>
                                <button
                                    onClick={() => { setRiskType('attendance'); setThreshold(75); setDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 ${riskType === 'attendance' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                        }`}
                                >
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm font-medium">Attendance Risk</span>
                                </button>
                                <button
                                    onClick={() => { setRiskType('academic'); setThreshold(2); setDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 ${riskType === 'academic' ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                                        }`}
                                >
                                    <BookOpen className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-medium">Academic Risk</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Threshold Input */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}>
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">
                            {riskType === 'attendance' ? 'Below' : 'Failing >'}
                        </span>
                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value) || 0)}
                            className="w-12 bg-transparent border-none outline-none text-sm font-bold text-center text-indigo-600 dark:text-indigo-400"
                            min={0}
                            max={riskType === 'attendance' ? 100 : 10}
                        />
                        <span className="text-sm text-slate-500">
                            {riskType === 'attendance' ? '%' : 'subjects'}
                        </span>
                    </div>

                    {/* Search */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 max-w-xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}>
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm"
                        />
                    </div>

                    {/* Summary Badge */}
                    <div className={`ml-auto px-4 py-2 rounded-full text-sm font-bold ${summaryStats.total > 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                        Found {summaryStats.total} student{summaryStats.total !== 1 ? 's' : ''} matching criteria
                    </div>
                </div>
            </NebulaCard>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{summaryStats.critical}</p>
                            <p className="text-xs text-slate-500">Critical</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">{summaryStats.high}</p>
                            <p className="text-xs text-slate-500">High Risk</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{summaryStats.medium}</p>
                            <p className="text-xs text-slate-500">Medium Risk</p>
                        </div>
                    </div>
                </NebulaCard>
            </div>

            {/* Student List */}
            <NebulaCard className="flex-1">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        At-Risk Students ({filteredStudents.length})
                    </h3>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <AlertTriangle className="w-12 h-12 text-emerald-300 dark:text-emerald-800 mb-4" />
                        <p className="text-slate-500 font-medium">No students match the criteria</p>
                        <p className="text-sm text-slate-400">Try adjusting the threshold</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-96 overflow-y-auto">
                        {filteredStudents.map(student => (
                            <button
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-left"
                            >
                                <div className={`p-3 rounded-xl ${student.riskLevel === 'critical' ? 'bg-red-100 dark:bg-red-900/20' :
                                        student.riskLevel === 'high' ? 'bg-orange-100 dark:bg-orange-900/20' :
                                            'bg-amber-100 dark:bg-amber-900/20'
                                    }`}>
                                    <Users className={`w-5 h-5 ${student.riskLevel === 'critical' ? 'text-red-600' :
                                            student.riskLevel === 'high' ? 'text-orange-600' : 'text-amber-600'
                                        }`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                                    <p className="text-xs text-slate-500">Class {student.class}-{student.section} • {student.rollNo}</p>
                                </div>

                                <div className="text-right">
                                    {riskType === 'attendance' ? (
                                        <p className={`text-lg font-bold ${student.attendancePct < 60 ? 'text-red-600' : 'text-amber-600'
                                            }`}>{student.attendancePct}%</p>
                                    ) : (
                                        <p className={`text-lg font-bold ${student.failingSubjects >= 3 ? 'text-red-600' : 'text-amber-600'
                                            }`}>{student.failingSubjects} subjects</p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        {riskType === 'attendance' ? 'Attendance' : 'Failing'}
                                    </p>
                                </div>

                                <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(student.riskLevel)}`}>
                                    {student.riskLevel.toUpperCase()}
                                </span>

                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </button>
                        ))}
                    </div>
                )}
            </NebulaCard>
        </div>
    );
};

export default RiskAnalytics;
