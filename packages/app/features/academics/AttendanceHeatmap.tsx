// packages/app/features/academics/AttendanceHeatmap.tsx
// Attendance Heatmap - Visual class-wise attendance overview
import React, { useState, useEffect } from 'react';
import {
    Calendar, TrendingUp, TrendingDown, Users, Filter,
    ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ClassAttendance {
    classId: string;
    className: string;
    section: string;
    totalStudents: number;
    dailyAttendance: number[]; // Last 7 days %
    weeklyAvg: number;
    trend: 'up' | 'down' | 'stable';
}

interface HeatmapProps {
    onClassClick?: (classId: string) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const generateMockData = (): ClassAttendance[] => {
    const classes = [
        { name: '6', sections: ['A', 'B', 'C'] },
        { name: '7', sections: ['A', 'B', 'C'] },
        { name: '8', sections: ['A', 'B', 'C'] },
        { name: '9', sections: ['A', 'B', 'C', 'D'] },
        { name: '10', sections: ['A', 'B', 'C', 'D'] },
        { name: '11', sections: ['A', 'B'] },
        { name: '12', sections: ['A', 'B'] },
    ];

    return classes.flatMap(c =>
        c.sections.map(s => {
            const dailyAttendance = Array(7).fill(0).map(() =>
                Math.round(75 + Math.random() * 23)
            );
            const weeklyAvg = Math.round(dailyAttendance.reduce((a, b) => a + b, 0) / 7);
            const firstHalf = dailyAttendance.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            const secondHalf = dailyAttendance.slice(4).reduce((a, b) => a + b, 0) / 3;
            const trend = secondHalf > firstHalf + 2 ? 'up' : secondHalf < firstHalf - 2 ? 'down' : 'stable';

            return {
                classId: `cls_${c.name}${s}`,
                className: c.name,
                section: s,
                totalStudents: 35 + Math.floor(Math.random() * 10),
                dailyAttendance,
                weeklyAvg,
                trend
            };
        })
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getHeatmapColor = (percentage: number, isDark: boolean): string => {
    if (percentage >= 95) return isDark ? 'bg-emerald-600' : 'bg-emerald-500';
    if (percentage >= 90) return isDark ? 'bg-green-600' : 'bg-green-500';
    if (percentage >= 85) return isDark ? 'bg-lime-600' : 'bg-lime-500';
    if (percentage >= 80) return isDark ? 'bg-yellow-600' : 'bg-yellow-500';
    if (percentage >= 75) return isDark ? 'bg-amber-600' : 'bg-amber-500';
    if (percentage >= 70) return isDark ? 'bg-orange-600' : 'bg-orange-500';
    return isDark ? 'bg-red-600' : 'bg-red-500';
};

const getDayName = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGEND COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HeatmapLegend: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Low</span>
        <div className="flex gap-0.5">
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-red-600' : 'bg-red-500'}`} />
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-orange-600' : 'bg-orange-500'}`} />
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-amber-600' : 'bg-amber-500'}`} />
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'}`} />
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-lime-600' : 'bg-lime-500'}`} />
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-green-600' : 'bg-green-500'}`} />
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-emerald-600' : 'bg-emerald-500'}`} />
        </div>
        <span>High</span>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AttendanceHeatmap: React.FC<HeatmapProps> = ({ onClassClick }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ClassAttendance[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>('all');

    // Load data
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setData(generateMockData());
            setLoading(false);
        }, 500);
    }, []);

    // Filter by grade
    const filteredData = selectedGrade === 'all'
        ? data
        : data.filter(c => c.className === selectedGrade);

    // Calculate overall stats
    const overallAvg = filteredData.length > 0
        ? Math.round(filteredData.reduce((sum, c) => sum + c.weeklyAvg, 0) / filteredData.length)
        : 0;

    const lowAttendanceClasses = filteredData.filter(c => c.weeklyAvg < 85).length;

    return (
        <NebulaCard>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Attendance Heatmap
                    </h3>
                    <p className="text-sm text-slate-500">Last 7 days overview</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                            }`}
                    >
                        <option value="all">All Classes</option>
                        {['6', '7', '8', '9', '10', '11', '12'].map(g => (
                            <option key={g} value={g}>Class {g}</option>
                        ))}
                    </select>
                    <HeatmapLegend isDark={isDarkMode} />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">Weekly Average</p>
                    <p className="text-2xl font-bold text-indigo-600">{overallAvg}%</p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">Classes Below 85%</p>
                    <p className={`text-2xl font-bold ${lowAttendanceClasses > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {lowAttendanceClasses}
                    </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">Total Classes</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredData.length}</p>
                </div>
            </div>

            {/* Heatmap Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left px-3 py-2 text-xs text-slate-500">Class</th>
                                {[6, 5, 4, 3, 2, 1, 0].map(daysAgo => (
                                    <th key={daysAgo} className="text-center px-2 py-2 text-xs text-slate-500">
                                        {getDayName(daysAgo)}
                                    </th>
                                ))}
                                <th className="text-center px-3 py-2 text-xs text-slate-500">Avg</th>
                                <th className="text-center px-3 py-2 text-xs text-slate-500">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(classData => (
                                <tr
                                    key={classData.classId}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                    onClick={() => onClassClick?.(classData.classId)}
                                >
                                    <td className="px-3 py-2">
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {classData.className}-{classData.section}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-2">
                                            ({classData.totalStudents})
                                        </span>
                                    </td>
                                    {classData.dailyAttendance.map((pct, idx) => (
                                        <td key={idx} className="px-2 py-2 text-center">
                                            <div
                                                className={`w-10 h-8 mx-auto rounded flex items-center justify-center text-xs font-medium text-white ${getHeatmapColor(pct, isDarkMode)}`}
                                                title={`${pct}%`}
                                            >
                                                {pct}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 text-center">
                                        <span className={`font-bold ${classData.weeklyAvg < 85 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                            {classData.weeklyAvg}%
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {classData.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />}
                                        {classData.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                                        {classData.trend === 'stable' && <span className="text-slate-400">-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </NebulaCard>
    );
};

export default AttendanceHeatmap;
