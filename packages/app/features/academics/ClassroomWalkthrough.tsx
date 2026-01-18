// packages/app/features/academics/ClassroomWalkthrough.tsx
// Phase 3: Digital Classroom Walkthrough - Grade → Section → Class Navigation
import React, { useState, useMemo } from 'react';
import {
    ArrowLeft, Users, Calendar, BookOpen, Clock, TrendingUp,
    ChevronRight, Search, GraduationCap
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ViewState = 'hallway' | 'door' | 'inside';

interface ClassSection {
    id: string;
    grade: number;
    section: string;
    teacherName: string;
    totalStudents: number;
    presentToday: number;
    classAverage: number;
}

interface Student {
    id: string;
    rollNo: string;
    name: string;
    attendancePct: number;
    classAvg: number;
    status: 'present' | 'absent' | 'late';
}

interface Props {
    onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SECTIONS = ['A', 'B', 'C'];

const MOCK_CLASSES: ClassSection[] = [
    { id: 'cls_10a', grade: 10, section: 'A', teacherName: 'Mrs. Sharma', totalStudents: 42, presentToday: 40, classAverage: 78.5 },
    { id: 'cls_10b', grade: 10, section: 'B', teacherName: 'Mr. Patel', totalStudents: 40, presentToday: 28, classAverage: 72.3 },
    { id: 'cls_10c', grade: 10, section: 'C', teacherName: 'Ms. Iyer', totalStudents: 38, presentToday: 36, classAverage: 81.2 },
    { id: 'cls_9a', grade: 9, section: 'A', teacherName: 'Mr. Kumar', totalStudents: 45, presentToday: 43, classAverage: 76.8 },
    { id: 'cls_9b', grade: 9, section: 'B', teacherName: 'Mrs. Gupta', totalStudents: 38, presentToday: 26, classAverage: 68.4 },
    { id: 'cls_9c', grade: 9, section: 'C', teacherName: 'Mr. Reddy', totalStudents: 40, presentToday: 38, classAverage: 74.1 },
    { id: 'cls_8a', grade: 8, section: 'A', teacherName: 'Ms. Nair', totalStudents: 44, presentToday: 42, classAverage: 79.2 },
    { id: 'cls_8b', grade: 8, section: 'B', teacherName: 'Mr. Singh', totalStudents: 41, presentToday: 39, classAverage: 75.7 },
];

const MOCK_STUDENTS: Student[] = [
    { id: 'std_001', rollNo: '01', name: 'Aarav Sharma', attendancePct: 92, classAvg: 85.5, status: 'present' },
    { id: 'std_002', rollNo: '02', name: 'Priya Patel', attendancePct: 88, classAvg: 78.2, status: 'present' },
    { id: 'std_003', rollNo: '03', name: 'Rahul Kumar', attendancePct: 65, classAvg: 62.1, status: 'absent' },
    { id: 'std_004', rollNo: '04', name: 'Ananya Singh', attendancePct: 95, classAvg: 91.3, status: 'present' },
    { id: 'std_005', rollNo: '05', name: 'Vikram Reddy', attendancePct: 78, classAvg: 72.5, status: 'late' },
    { id: 'std_006', rollNo: '06', name: 'Kavya Iyer', attendancePct: 71, classAvg: 68.8, status: 'present' },
    { id: 'std_007', rollNo: '07', name: 'Arjun Nair', attendancePct: 82, classAvg: 76.4, status: 'present' },
    { id: 'std_008', rollNo: '08', name: 'Sneha Gupta', attendancePct: 90, classAvg: 82.7, status: 'present' },
    { id: 'std_009', rollNo: '09', name: 'Rohan Mehta', attendancePct: 58, classAvg: 55.2, status: 'absent' },
    { id: 'std_010', rollNo: '10', name: 'Ishita Verma', attendancePct: 94, classAvg: 88.9, status: 'present' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ClassroomWalkthrough: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();

    // Navigation State
    const [view, setView] = useState<ViewState>('hallway');
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Get sections for selected grade
    const gradeSections = useMemo(() => {
        if (!selectedGrade) return [];
        return MOCK_CLASSES.filter(c => c.grade === selectedGrade);
    }, [selectedGrade]);

    // Filter students
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return MOCK_STUDENTS;
        return MOCK_STUDENTS.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNo.includes(searchQuery)
        );
    }, [searchQuery]);

    // Navigate to grade
    const handleGradeClick = (grade: number) => {
        setSelectedGrade(grade);
        setView('door');
    };

    // Navigate to class
    const handleSectionClick = (classSection: ClassSection) => {
        setSelectedClass(classSection);
        setView('inside');
    };

    // Go back
    const handleBack = () => {
        if (view === 'inside') {
            setSelectedClass(null);
            setView('door');
        } else if (view === 'door') {
            setSelectedGrade(null);
            setView('hallway');
        } else if (onBack) {
            onBack();
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // VIEW 3: Inside the Class
    // ─────────────────────────────────────────────────────────────────────────
    if (view === 'inside' && selectedClass) {
        const attendancePct = Math.round((selectedClass.presentToday / selectedClass.totalStudents) * 100);

        return (
            <div className="h-full flex flex-col space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Class {selectedClass.grade}-{selectedClass.section}
                            </h1>
                            <p className="text-sm text-slate-500">
                                Class Teacher: {selectedClass.teacherName}
                            </p>
                        </div>
                    </div>
                    <NebulaButton variant="secondary" onClick={() => { setView('hallway'); setSelectedGrade(null); setSelectedClass(null); }}>
                        Return to Hallway
                    </NebulaButton>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                    <NebulaCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {selectedClass.presentToday}/{selectedClass.totalStudents}
                                </p>
                                <p className="text-xs text-slate-500">Present Today</p>
                            </div>
                        </div>
                    </NebulaCard>

                    <NebulaCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${attendancePct < 75 ? 'text-red-600' : 'text-emerald-600'
                                    }`}>{attendancePct}%</p>
                                <p className="text-xs text-slate-500">Attendance</p>
                            </div>
                        </div>
                    </NebulaCard>

                    <NebulaCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedClass.classAverage}%</p>
                                <p className="text-xs text-slate-500">Class Average</p>
                            </div>
                        </div>
                    </NebulaCard>
                </div>

                {/* Search */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
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

                {/* Student List */}
                <NebulaCard className="flex-1">
                    <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                        <div>Roll</div>
                        <div className="col-span-2">Student</div>
                        <div className="text-center">Attendance</div>
                        <div className="text-center">Status</div>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-96 overflow-y-auto">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="grid grid-cols-5 gap-4 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <div className="font-mono text-sm text-slate-600 dark:text-slate-400">{student.rollNo}</div>
                                <div className="col-span-2">
                                    <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                    <p className="text-xs text-slate-500">Avg: {student.classAvg}%</p>
                                </div>
                                <div className="text-center">
                                    <span className={`text-lg font-bold ${student.attendancePct < 75 ? 'text-red-600' :
                                            student.attendancePct < 85 ? 'text-amber-600' : 'text-emerald-600'
                                        }`}>{student.attendancePct}%</span>
                                </div>
                                <div className="text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${student.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            student.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </NebulaCard>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VIEW 2: The Door (Section Selector)
    // ─────────────────────────────────────────────────────────────────────────
    if (view === 'door' && selectedGrade) {
        return (
            <div className="h-full flex flex-col space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grade {selectedGrade}</h1>
                        <p className="text-sm text-slate-500">Select a section to enter</p>
                    </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {gradeSections.length > 0 ? (
                        gradeSections.map(cls => {
                            const attendancePct = Math.round((cls.presentToday / cls.totalStudents) * 100);
                            return (
                                <NebulaCard
                                    key={cls.id}
                                    className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-indigo-300"
                                    onClick={() => handleSectionClick(cls)}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                                            <GraduationCap className="w-8 h-8 text-indigo-600" />
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                        {selectedGrade}-{cls.section}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">{cls.teacherName}</p>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{cls.totalStudents}</p>
                                            <p className="text-xs text-slate-500">Students</p>
                                        </div>
                                        <div>
                                            <p className={`text-lg font-bold ${attendancePct < 75 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {attendancePct}%
                                            </p>
                                            <p className="text-xs text-slate-500">Attendance</p>
                                        </div>
                                    </div>
                                </NebulaCard>
                            );
                        })
                    ) : (
                        <div className="col-span-3 text-center py-12">
                            <p className="text-slate-500">No sections found for Grade {selectedGrade}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VIEW 1: The Hallway (Grade Selector)
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                {onBack && (
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Classroom Walkthrough</h1>
                    <p className="text-sm text-slate-500">Select a grade to begin your virtual tour</p>
                </div>
            </div>

            {/* Grade Grid */}
            <NebulaCard className="p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Select Grade</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {GRADES.map(grade => {
                        const gradeClasses = MOCK_CLASSES.filter(c => c.grade === grade);
                        const hasClasses = gradeClasses.length > 0;

                        return (
                            <button
                                key={grade}
                                onClick={() => handleGradeClick(grade)}
                                disabled={!hasClasses}
                                className={`p-6 rounded-xl border-2 transition-all ${hasClasses
                                        ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 hover:border-indigo-400 hover:shadow-md cursor-pointer'
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="text-center">
                                    <p className={`text-3xl font-bold mb-1 ${hasClasses ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                                        }`}>{grade}</p>
                                    <p className={`text-xs ${hasClasses ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'}`}>
                                        Grade {grade}
                                    </p>
                                    {hasClasses && (
                                        <p className="text-[10px] text-indigo-500 mt-1">{gradeClasses.length} sections</p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </NebulaCard>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{MOCK_CLASSES.length}</p>
                            <p className="text-xs text-slate-500">Total Sections</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {MOCK_CLASSES.reduce((sum, c) => sum + c.totalStudents, 0)}
                            </p>
                            <p className="text-xs text-slate-500">Total Students</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {Math.round(MOCK_CLASSES.reduce((sum, c) => sum + c.classAverage, 0) / MOCK_CLASSES.length)}%
                            </p>
                            <p className="text-xs text-slate-500">School Average</p>
                        </div>
                    </div>
                </NebulaCard>
            </div>
        </div>
    );
};

export default ClassroomWalkthrough;
