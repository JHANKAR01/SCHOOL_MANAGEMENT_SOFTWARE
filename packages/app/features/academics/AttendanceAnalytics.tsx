// packages/app/features/academics/AttendanceAnalytics.tsx
// Phase 3: Advanced Attendance Analytics with Reactive Filtering & CSS Bar Chart
import React, { useState, useMemo } from 'react';
import {
    Calendar, TrendingUp, TrendingDown, Minus, AlertTriangle,
    ChevronRight, ArrowLeft, Users, Filter, Search, Sun, Coffee
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
    shortLabel: string;
    percentage: number;
    isHoliday: boolean;
    holidayName?: string;
}

interface WeekData {
    weekNum: number;
    label: string;
    percentage: number;
    daysCount: number;
}

interface ClassAttendance {
    id: string;
    name: string;
    section: string;
    totalStudents: number;
    presentToday: number;
    weeklyAvg: number;
    monthlyAvg: number;
    yearlyAvg: number;
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
// HOLIDAYS CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HOLIDAYS: Record<string, string> = {
    '2026-01-14': 'Makar Sankranti',
    '2026-01-26': 'Republic Day',
    '2026-03-14': 'Holi',
    '2026-08-15': 'Independence Day',
    '2026-10-02': 'Gandhi Jayanti',
    '2026-11-01': 'Diwali',
    '2026-12-25': 'Christmas',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA GENERATORS (Skip Sundays!)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const generateDailyData = (days: number): DayData[] => {
    const today = new Date();
    const data: DayData[] = [];
    let daysAdded = 0;
    let offset = 0;

    // Work backwards, skipping Sundays
    while (daysAdded < days) {
        const date = new Date(today);
        date.setDate(date.getDate() - offset);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        offset++;

        // Skip Sundays entirely
        if (dayOfWeek === 0) continue;

        const holiday = HOLIDAYS[dateStr];

        // If it's a holiday, still add but mark it
        if (holiday) {
            data.unshift({
                date: dateStr,
                label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                shortLabel: date.toLocaleDateString('en-IN', { weekday: 'short' }),
                percentage: 0,
                isHoliday: true,
                holidayName: holiday,
            });
        } else {
            // Generate random but realistic attendance (80-98%)
            const baseAttendance = 88 + Math.random() * 10;
            const variance = (Math.random() - 0.5) * 8;
            const attendance = Math.max(70, Math.min(100, baseAttendance + variance));

            data.unshift({
                date: dateStr,
                label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                shortLabel: date.toLocaleDateString('en-IN', { weekday: 'short' }),
                percentage: Math.round(attendance * 10) / 10,
                isHoliday: false,
            });
        }

        daysAdded++;
    }

    return data;
};

const generateWeeklyData = (weeks: number): WeekData[] => {
    const data: WeekData[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
        // Each week has 6 working days (Mon-Sat)
        const attendance = 85 + Math.random() * 12;
        data.push({
            weekNum: weeks - i,
            label: `Week ${weeks - i}`,
            percentage: Math.round(attendance * 10) / 10,
            daysCount: 6,
        });
    }

    return data;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK CLASS DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ALL_CLASSES: ClassAttendance[] = [
    { id: 'cls_10a', name: 'Class 10', section: 'A', totalStudents: 42, presentToday: 40, weeklyAvg: 94.5, monthlyAvg: 93.2, yearlyAvg: 91.8, trend: 'stable', atRiskStudents: 2 },
    { id: 'cls_10b', name: 'Class 10', section: 'B', totalStudents: 40, presentToday: 28, weeklyAvg: 72.3, monthlyAvg: 74.8, yearlyAvg: 76.2, trend: 'down', atRiskStudents: 8 },
    { id: 'cls_9a', name: 'Class 9', section: 'A', totalStudents: 45, presentToday: 43, weeklyAvg: 96.1, monthlyAvg: 95.5, yearlyAvg: 94.2, trend: 'up', atRiskStudents: 1 },
    { id: 'cls_9b', name: 'Class 9', section: 'B', totalStudents: 38, presentToday: 26, weeklyAvg: 68.4, monthlyAvg: 71.2, yearlyAvg: 73.5, trend: 'down', atRiskStudents: 10 },
    { id: 'cls_8a', name: 'Class 8', section: 'A', totalStudents: 44, presentToday: 42, weeklyAvg: 95.2, monthlyAvg: 94.8, yearlyAvg: 93.1, trend: 'stable', atRiskStudents: 2 },
    { id: 'cls_8b', name: 'Class 8', section: 'B', totalStudents: 41, presentToday: 39, weeklyAvg: 92.7, monthlyAvg: 91.5, yearlyAvg: 90.3, trend: 'stable', atRiskStudents: 3 },
    { id: 'cls_7a', name: 'Class 7', section: 'A', totalStudents: 43, presentToday: 30, weeklyAvg: 73.5, monthlyAvg: 76.2, yearlyAvg: 78.9, trend: 'down', atRiskStudents: 7 },
    { id: 'cls_7b', name: 'Class 7', section: 'B', totalStudents: 40, presentToday: 38, weeklyAvg: 89.5, monthlyAvg: 88.2, yearlyAvg: 87.5, trend: 'stable', atRiskStudents: 4 },
    { id: 'cls_6a', name: 'Class 6', section: 'A', totalStudents: 45, presentToday: 44, weeklyAvg: 97.2, monthlyAvg: 96.5, yearlyAvg: 95.8, trend: 'up', atRiskStudents: 1 },
    { id: 'cls_6b', name: 'Class 6', section: 'B', totalStudents: 42, presentToday: 29, weeklyAvg: 69.8, monthlyAvg: 72.1, yearlyAvg: 74.5, trend: 'down', atRiskStudents: 9 },
];

const MOCK_STUDENTS: StudentDetail[] = [
    { id: 'std_001', name: 'Aarav Sharma', rollNo: '01', attendancePct: 45, absentDays: 12, status: 'absent' },
    { id: 'std_002', name: 'Priya Patel', rollNo: '02', attendancePct: 68, absentDays: 7, status: 'present' },
    { id: 'std_003', name: 'Rahul Kumar', rollNo: '03', attendancePct: 52, absentDays: 10, status: 'absent' },
    { id: 'std_004', name: 'Ananya Singh', rollNo: '04', attendancePct: 95, absentDays: 1, status: 'present' },
    { id: 'std_005', name: 'Vikram Reddy', rollNo: '05', attendancePct: 88, absentDays: 3, status: 'present' },
    { id: 'std_006', name: 'Kavya Iyer', rollNo: '06', attendancePct: 62, absentDays: 8, status: 'late' },
    { id: 'std_007', name: 'Arjun Nair', rollNo: '07', attendancePct: 72, absentDays: 6, status: 'present' },
    { id: 'std_008', name: 'Sneha Gupta', rollNo: '08', attendancePct: 91, absentDays: 2, status: 'present' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CSS BAR CHART COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BarChartProps {
    data: (DayData | WeekData)[];
    granularity: Granularity;
    isDarkMode: boolean;
}

const CSSBarChart: React.FC<BarChartProps> = ({ data, granularity, isDarkMode }) => {
    const isDaily = granularity === 'daily';
    const maxHeight = 160; // px

    // Filter out holidays for display calculation
    const workingData = isDaily
        ? (data as DayData[]).filter(d => !d.isHoliday)
        : data;

    const getBarColor = (pct: number): string => {
        if (pct < 75) return 'bg-red-500';
        if (pct < 85) return 'bg-amber-500';
        if (pct >= 90) return 'bg-emerald-500';
        return 'bg-indigo-500';
    };

    return (
        <div className="flex items-end justify-between gap-1 h-48 px-2">
            {(data as any[]).map((item, idx) => {
                const isHoliday = isDaily && (item as DayData).isHoliday;
                const pct = isHoliday ? 0 : (item.percentage || 0);
                const barHeight = isHoliday ? 0 : (pct / 100) * maxHeight;
                const label = isDaily ? (item as DayData).shortLabel : (item as WeekData).label;

                return (
                    <div key={idx} className="flex flex-col items-center flex-1 max-w-16">
                        {/* Value Label */}
                        <span className={`text-xs font-medium mb-1 ${isHoliday ? 'text-amber-500' :
                                pct < 75 ? 'text-red-600' :
                                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}>
                            {isHoliday ? '🏖️' : `${pct}%`}
                        </span>

                        {/* Bar Container */}
                        <div
                            className={`w-full rounded-t-md transition-all duration-300 ${isHoliday
                                    ? 'bg-amber-100 dark:bg-amber-900/20 border-2 border-dashed border-amber-300 dark:border-amber-700'
                                    : getBarColor(pct)
                                }`}
                            style={{
                                height: isHoliday ? 40 : barHeight,
                                minHeight: isHoliday ? 40 : 4,
                            }}
                        />

                        {/* X-axis Label */}
                        <span className={`text-[10px] mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AttendanceAnalytics: React.FC<Props> = ({ onBack }) => {
    const { isDarkMode } = useTheme();

    // Control State
    const [timeScope, setTimeScope] = useState<TimeScope>('week');
    const [granularity, setGranularity] = useState<Granularity>('daily');
    const [threshold, setThreshold] = useState<number>(75);
    const [selectedClass, setSelectedClass] = useState<ClassAttendance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Generate chart data based on time scope and granularity
    const chartData = useMemo(() => {
        if (granularity === 'daily') {
            const days = timeScope === 'week' ? 6 : timeScope === 'month' ? 24 : 48;
            return generateDailyData(days);
        } else if (granularity === 'weekly') {
            const weeks = timeScope === 'week' ? 1 : timeScope === 'month' ? 4 : 12;
            return generateWeeklyData(weeks);
        } else {
            // Monthly - show 4 or 12 months
            const months = timeScope === 'year' ? 12 : 4;
            return generateWeeklyData(months); // Reuse weekly generator as placeholder
        }
    }, [timeScope, granularity]);

    // REACTIVE FILTER: Classes below threshold
    const filteredClasses = useMemo(() => {
        return ALL_CLASSES.filter(cls => {
            const avg = timeScope === 'week' ? cls.weeklyAvg :
                timeScope === 'month' ? cls.monthlyAvg : cls.yearlyAvg;
            return avg < threshold;
        });
    }, [threshold, timeScope]);

    // Summary statistics
    const summaryStats = useMemo(() => {
        const workingDays = (chartData as DayData[]).filter(d => !d.isHoliday);
        const avgAttendance = workingDays.length > 0
            ? workingDays.reduce((sum, d) => sum + (d.percentage || 0), 0) / workingDays.length
            : 0;
        const holidayCount = (chartData as DayData[]).filter(d => d.isHoliday).length;

        return {
            avgAttendance: avgAttendance.toFixed(1),
            workingDays: workingDays.length,
            holidayCount,
            atRiskClasses: filteredClasses.length,
        };
    }, [chartData, filteredClasses]);

    // Filtered students for drill-down
    const filteredStudents = useMemo(() => {
        if (!selectedClass) return [];
        return MOCK_STUDENTS.filter(s => {
            if (!searchQuery) return true;
            return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.rollNo.includes(searchQuery);
        });
    }, [selectedClass, searchQuery]);

    // ─────────────────────────────────────────────────────────────────────────
    // DRILL-DOWN VIEW
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedClass) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setSelectedClass(null)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {selectedClass.name}-{selectedClass.section}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {selectedClass.atRiskStudents} at-risk • {selectedClass.totalStudents} total
                        </p>
                    </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-2 mb-4 rounded-lg border max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
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

                <NebulaCard className="flex-1">
                    <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                        <div>Roll</div>
                        <div className="col-span-2">Student</div>
                        <div className="text-center">Attendance</div>
                        <div className="text-center">Status</div>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {filteredStudents.map(s => (
                            <div key={s.id} className="grid grid-cols-5 gap-4 px-4 py-3 items-center">
                                <div className="font-mono text-sm text-slate-600 dark:text-slate-400">{s.rollNo}</div>
                                <div className="col-span-2">
                                    <p className="font-medium text-slate-900 dark:text-white">{s.name}</p>
                                    <p className="text-xs text-slate-500">{s.absentDays} days absent</p>
                                </div>
                                <div className="text-center">
                                    <span className={`text-lg font-bold ${s.attendancePct < 75 ? 'text-red-600' :
                                            s.attendancePct < 85 ? 'text-amber-600' : 'text-emerald-600'
                                        }`}>{s.attendancePct}%</span>
                                </div>
                                <div className="text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            s.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>{s.status}</span>
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
                        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Analytics</h1>
                        <p className="text-sm text-slate-500">Diagnose problems • Track trends • Sunday excluded</p>
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Time Scope */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {(['week', 'month', 'year'] as TimeScope[]).map(scope => (
                        <button
                            key={scope}
                            onClick={() => setTimeScope(scope)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${timeScope === scope
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            This {scope.charAt(0).toUpperCase() + scope.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Granularity */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {(['daily', 'weekly', 'monthly'] as Granularity[]).map(g => (
                        <button
                            key={g}
                            onClick={() => setGranularity(g)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${granularity === g
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Problem Finder - REACTIVE */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Show classes below</span>
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value) || 0)}
                        className="w-12 bg-transparent border-none outline-none text-sm font-bold text-center text-indigo-600 dark:text-indigo-400"
                        min={50}
                        max={100}
                    />
                    <span className="text-sm text-slate-500">%</span>
                </div>

                {/* Summary Badge */}
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${filteredClasses.length > 0
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                    {filteredClasses.length > 0
                        ? `⚠️ ${filteredClasses.length} classes at risk`
                        : '✅ All classes healthy'}
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
                            <p className="text-xs text-slate-500">Holidays</p>
                        </div>
                    </div>
                </NebulaCard>

                <NebulaCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{summaryStats.atRiskClasses}</p>
                            <p className="text-xs text-slate-500">At-Risk Classes</p>
                        </div>
                    </div>
                </NebulaCard>
            </div>

            {/* Bar Chart */}
            <NebulaCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Attendance Trend</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> &gt;90%</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-500" /> 85-90%</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500" /> 75-85%</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /> &lt;75%</span>
                    </div>
                </div>
                <CSSBarChart data={chartData} granularity={granularity} isDarkMode={isDarkMode} />
            </NebulaCard>

            {/* Class List */}
            <NebulaCard>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Classes Below {threshold}%
                    </h3>
                    <span className="text-sm text-slate-500">{filteredClasses.length} found</span>
                </div>

                {filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                        <TrendingUp className="w-12 h-12 text-emerald-300 dark:text-emerald-800 mb-4" />
                        <p className="text-slate-500 font-medium">All classes above threshold!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {filteredClasses.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-left"
                            >
                                <div className={`p-3 rounded-xl ${cls.weeklyAvg < 70 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-amber-100 dark:bg-amber-900/20'
                                    }`}>
                                    <Users className={`w-5 h-5 ${cls.weeklyAvg < 70 ? 'text-red-600' : 'text-amber-600'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">{cls.name}-{cls.section}</p>
                                    <p className="text-xs text-slate-500">{cls.atRiskStudents} at-risk • {cls.totalStudents} total</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-bold ${cls.weeklyAvg < 70 ? 'text-red-600' : 'text-amber-600'}`}>
                                        {timeScope === 'week' ? cls.weeklyAvg : timeScope === 'month' ? cls.monthlyAvg : cls.yearlyAvg}%
                                    </p>
                                    <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                                        {cls.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                        {cls.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                                        {cls.trend === 'stable' && <Minus className="w-3 h-3" />}
                                        {timeScope === 'week' ? 'Weekly' : timeScope === 'month' ? 'Monthly' : 'Yearly'}
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
