// packages/app/features/academics/AttendanceAnalytics.tsx
// Advanced Attendance Analytics Dashboard with Charts, Filters, and Drill-Down
import React, { useState, useMemo } from 'react';
import {
    Calendar, TrendingUp, TrendingDown, Minus, AlertTriangle,
    ChevronRight, ArrowLeft, Users, Clock, Filter, Search,
    Sun, Coffee
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type TimeScope = 'week' | 'month' | 'year';
type Granularity = 'daily' | 'weekly' | 'monthly';

interface DayData {
    date: string;
    label: string;
    percentage: number | null; // null = holiday/sunday
    isHoliday: boolean;
    holidayName?: string;
}

interface ClassAttendance {
    id: string;
    name: string;
    section: string;
    totalStudents: number;
    presentToday: number;
    weeklyAvg: number;
    monthlyAvg: number;
    trend: 'up' | 'down' | 'stable';
    atRiskStudents: number;
}

interface StudentDetail {
    id: string;
    name: string;
    rollNo: string;
    attendancePct: number;
    absentDays: number;
    status: 'present' | 'absent' | 'late';
}

interface Props {
    onBack?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HOLIDAYS = [
    { date: '2026-01-14', name: 'Makar Sankranti' },
    { date: '2026-01-26', name: 'Republic Day' },
];

const generateWeekData = (): DayData[] => {
    const today = new Date();
    const data: DayData[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        const isSunday = dayOfWeek === 0;
        const holiday = HOLIDAYS.find(h => h.date === dateStr);

        data.push({
            date: dateStr,
            label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
            percentage: (isSunday || holiday) ? null : Math.floor(Math.random() * 15) + 85,
            isHoliday: isSunday || !!holiday,
            holidayName: isSunday ? 'Sunday' : holiday?.name,
        });
    }
    return data;
};

const MOCK_CLASSES: ClassAttendance[] = [
    { id: 'cls_10a', name: 'Class 10', section: 'A', totalStudents: 42, presentToday: 40, weeklyAvg: 94.5, monthlyAvg: 93.2, trend: 'stable', atRiskStudents: 2 },
    { id: 'cls_10b', name: 'Class 10', section: 'B', totalStudents: 40, presentToday: 28, weeklyAvg: 72.3, monthlyAvg: 74.8, trend: 'down', atRiskStudents: 8 },
    { id: 'cls_9a', name: 'Class 9', section: 'A', totalStudents: 45, presentToday: 43, weeklyAvg: 96.1, monthlyAvg: 95.5, trend: 'up', atRiskStudents: 1 },
    { id: 'cls_9b', name: 'Class 9', section: 'B', totalStudents: 38, presentToday: 26, weeklyAvg: 68.4, monthlyAvg: 71.2, trend: 'down', atRiskStudents: 10 },
    { id: 'cls_8a', name: 'Class 8', section: 'A', totalStudents: 44, presentToday: 42, weeklyAvg: 95.2, monthlyAvg: 94.8, trend: 'stable', atRiskStudents: 2 },
    { id: 'cls_8b', name: 'Class 8', section: 'B', totalStudents: 41, presentToday: 39, weeklyAvg: 92.7, monthlyAvg: 91.5, trend: 'stable', atRiskStudents: 3 },
    { id: 'cls_7a', name: 'Class 7', section: 'A', totalStudents: 43, presentToday: 30, weeklyAvg: 73.5, monthlyAvg: 76.2, trend: 'down', atRiskStudents: 7 },
];

const MOCK_STUDENTS: StudentDetail[] = [
    { id: 'std_001', name: 'Aarav Sharma', rollNo: '01', attendancePct: 45, absentDays: 12, status: 'absent' },
    { id: 'std_002', name: 'Priya Patel', rollNo: '02', attendancePct: 68, absentDays: 7, status: 'present' },
    { id: 'std_003', name: 'Rahul Kumar', rollNo: '03', attendancePct: 52, absentDays: 10, status: 'absent' },
    { id: 'std_004', name: 'Ananya Singh', rollNo: '04', attendancePct: 95, absentDays: 1, status: 'present' },
    { id: 'std_005', name: 'Vikram Reddy', rollNo: '05', attendancePct: 88, absentDays: 3, status: 'present' },
    { id: 'std_006', name: 'Kavya Iyer', rollNo: '06', attendancePct: 62, absentDays: 8, status: 'late' },
    { id: 'std_007', name: 'Arjun Nair', rollNo: '07', attendancePct: 72, absentDays: 6, status: 'present' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHART COMPONENT (Simple SVG)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TrendChart: React.FC<{ data: DayData[]; isDarkMode: boolean }> = ({ data, isDarkMode }) => {
    const workingDays = data.filter(d => d.percentage !== null);
    const width = 100;
    const height = 50;
    const padding = 5;

    if (workingDays.length < 2) return null;

    const maxVal = 100;
    const minVal = 60;
    const range = maxVal - minVal;

    const points = workingDays.map((d, i) => {
        const x = padding + (i / (workingDays.length - 1)) * (width - padding * 2);
        const y = height - padding - ((d.percentage! - minVal) / range) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
            {/* Grid lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding}
                stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth="0.5" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2}
                stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Trend line */}
            <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />

            {/* Data points */}
            {workingDays.map((d, i) => {
                const x = padding + (i / (workingDays.length - 1)) * (width - padding * 2);
                const y = height - padding - ((d.percentage! - minVal) / range) * (height - padding * 2);
                const isLow = d.percentage! < 80;
                return (
                    <g key={d.date}>
                        <circle cx={x} cy={y} r="2.5" fill={isLow ? '#ef4444' : '#6366f1'} />
                        <text x={x} y={height - 1} textAnchor="middle"
                            className={`text-[4px] ${isDarkMode ? 'fill-slate-400' : 'fill-slate-500'}`}>
                            {d.label.split(' ')[0]}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AttendanceAnalytics: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();

    // State
    const [timeScope, setTimeScope] = useState<TimeScope>('week');
    const [granularity, setGranularity] = useState<Granularity>('daily');
    const [threshold, setThreshold] = useState<number>(75);
    const [selectedClass, setSelectedClass] = useState<ClassAttendance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Generate chart data
    const chartData = useMemo(() => generateWeekData(), [timeScope]);

    // Filter classes below threshold
    const filteredClasses = useMemo(() => {
        return MOCK_CLASSES.filter(cls => {
            const avg = timeScope === 'week' ? cls.weeklyAvg : cls.monthlyAvg;
            return avg < threshold;
        });
    }, [threshold, timeScope]);

    // Filtered students in drill-down
    const filteredStudents = useMemo(() => {
        if (!selectedClass) return [];
        return MOCK_STUDENTS.filter(s => {
            if (!searchQuery) return true;
            return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.rollNo.includes(searchQuery);
        });
    }, [selectedClass, searchQuery]);

    // Summary stats
    const summaryStats = useMemo(() => {
        const workingDays = chartData.filter(d => !d.isHoliday);
        const avgAttendance = workingDays.reduce((sum, d) => sum + (d.percentage || 0), 0) / workingDays.length;
        const lowDays = workingDays.filter(d => d.percentage && d.percentage < 85).length;
        const holidayCount = chartData.filter(d => d.isHoliday).length;

        return {
            avgAttendance: avgAttendance.toFixed(1),
            workingDays: workingDays.length,
            lowDays,
            holidayCount,
            atRiskClasses: filteredClasses.length,
        };
    }, [chartData, filteredClasses]);

    // ─────────────────────────────────────────────────────────────────────────
    // DRILL-DOWN VIEW (Student List)
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedClass) {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setSelectedClass(null)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {selectedClass.name}-{selectedClass.section} Students
                        </h1>
                        <p className="text-sm text-slate-500">
                            {selectedClass.atRiskStudents} at-risk students • {selectedClass.totalStudents} total
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className={`flex items-center gap-2 px-3 py-2 mb-4 rounded-lg border max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search student name or roll no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                    />
                </div>

                {/* Student List */}
                <NebulaCard className="flex-1">
                    <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div>Roll No</div>
                        <div className="col-span-2">Student</div>
                        <div className="text-center">Attendance</div>
                        <div className="text-center">Status</div>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="grid grid-cols-5 gap-4 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <div className="text-sm font-mono text-slate-600 dark:text-slate-400">{student.rollNo}</div>
                                <div className="col-span-2">
                                    <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                    <p className="text-xs text-slate-500">{student.absentDays} days absent</p>
                                </div>
                                <div className="text-center">
                                    <span className={`text-lg font-bold ${student.attendancePct < 75 ? 'text-red-600' :
                                            student.attendancePct < 85 ? 'text-amber-600' : 'text-emerald-600'
                                        }`}>
                                        {student.attendancePct}%
                                    </span>
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
    // MAIN VIEW
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Analytics</h1>
                        <p className="text-sm text-slate-500">Diagnose attendance problems and track trends</p>
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Time Scope */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {[
                        { id: 'week' as TimeScope, label: 'This Week' },
                        { id: 'month' as TimeScope, label: 'This Month' },
                        { id: 'year' as TimeScope, label: 'Academic Year' },
                    ].map(scope => (
                        <button
                            key={scope.id}
                            onClick={() => setTimeScope(scope.id)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${timeScope === scope.id
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            {scope.label}
                        </button>
                    ))}
                </div>

                {/* Granularity */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {[
                        { id: 'daily' as Granularity, label: 'Daily' },
                        { id: 'weekly' as Granularity, label: 'Weekly' },
                        { id: 'monthly' as Granularity, label: 'Monthly' },
                    ].map(g => (
                        <button
                            key={g.id}
                            onClick={() => setGranularity(g.id)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${granularity === g.id
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            {g.label}
                        </button>
                    ))}
                </div>

                {/* Problem Finder */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Show classes below</span>
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="w-12 bg-transparent border-none outline-none text-sm font-bold text-center text-indigo-600 dark:text-indigo-400"
                        min={50}
                        max={100}
                    />
                    <span className="text-sm text-slate-500">%</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summaryStats.avgAttendance}%</p>
                            <p className="text-xs text-slate-500">Avg Attendance</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summaryStats.workingDays}</p>
                            <p className="text-xs text-slate-500">Working Days</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summaryStats.holidayCount}</p>
                            <p className="text-xs text-slate-500">Holidays/Sundays</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summaryStats.atRiskClasses}</p>
                            <p className="text-xs text-slate-500">At-Risk Classes</p>
                        </div>
                    </div>
                </NebulaCard>
            </div>

            {/* Trend Chart */}
            <NebulaCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Attendance Trend</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" /> Working Day
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500" /> Below 80%
                        </span>
                    </div>
                </div>
                <TrendChart data={chartData} isDarkMode={isDarkMode} />

                {/* Holiday Legend */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {chartData.filter(d => d.isHoliday).map(d => (
                        <span key={d.date} className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400">
                            <Coffee className="w-3 h-3" />
                            {d.label}: {d.holidayName}
                        </span>
                    ))}
                </div>
            </NebulaCard>

            {/* Drill-Down List */}
            <NebulaCard>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Classes Below {threshold}% Attendance
                    </h3>
                    <span className="text-sm text-slate-500">{filteredClasses.length} classes found</span>
                </div>

                {filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <TrendingUp className="w-12 h-12 text-emerald-300 dark:text-emerald-800 mb-4" />
                        <p className="text-slate-500 font-medium">All classes meet the threshold!</p>
                        <p className="text-sm text-slate-400">No classes below {threshold}% attendance</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {filteredClasses.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left"
                            >
                                <div className={`p-3 rounded-xl ${cls.weeklyAvg < 70 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-amber-100 dark:bg-amber-900/20'
                                    }`}>
                                    <Users className={`w-5 h-5 ${cls.weeklyAvg < 70 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                                        }`} />
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">{cls.name}-{cls.section}</p>
                                    <p className="text-xs text-slate-500">{cls.atRiskStudents} at-risk students • {cls.totalStudents} total</p>
                                </div>

                                <div className="text-right">
                                    <p className={`text-xl font-bold ${cls.weeklyAvg < 70 ? 'text-red-600' : 'text-amber-600'
                                        }`}>
                                        {cls.weeklyAvg.toFixed(1)}%
                                    </p>
                                    <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                                        {cls.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                        {cls.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                                        {cls.trend === 'stable' && <Minus className="w-3 h-3" />}
                                        Weekly Avg
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </button>
                        ))}
                    </div>
                )}
            </NebulaCard>
        </div>
    );
};

export default AttendanceAnalytics;
