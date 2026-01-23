// packages/app/features/parent/ParentAttendance.tsx
// Attendance Summary - Monthly view with stats and calendar

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useChildAttendance } from '../../../hooks/useParentData';
import { SovereignSkeleton } from '../../components/SovereignComponents';

interface Props {
    studentId: string | null;
}

export const ParentAttendance: React.FC<Props> = ({ studentId }) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const { data, isLoading } = useChildAttendance(studentId, currentMonth);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const [year, month] = currentMonth.split('-').map(Number);
        let newMonth = month + (direction === 'next' ? 1 : -1);
        let newYear = year;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-').map(Number);
        return new Date(year, month - 1).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PRESENT': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'ABSENT': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'LATE': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-green-100 dark:bg-green-900/30';
            case 'ABSENT': return 'bg-red-100 dark:bg-red-900/30';
            case 'LATE': return 'bg-amber-100 dark:bg-amber-900/30';
            default: return 'bg-slate-100 dark:bg-slate-700';
        }
    };

    if (!studentId) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-500 dark:text-slate-400">
                    Please select a child to view attendance
                </Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className="flex-1 p-4">
                <SovereignSkeleton className="h-32 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-48 w-full rounded-xl" />
            </View>
        );
    }

    const attendance = data?.data;
    const summary = attendance?.summary || { total_days: 0, present: 0, absent: 0, late: 0, percentage: 0 };
    const daily = attendance?.daily || [];

    return (
        <ScrollView className="flex-1 p-4">
            {/* Month Navigation */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity
                    onPress={() => navigateMonth('prev')}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatMonth(currentMonth)}
                </Text>
                <TouchableOpacity
                    onPress={() => navigateMonth('next')}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            <View className="flex-row flex-wrap gap-4 mb-6">
                <View className="flex-1 min-w-[100px] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${summary.percentage >= 75 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                            <Text className={`text-sm font-bold ${summary.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                %
                            </Text>
                        </View>
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                        {summary.percentage}%
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Attendance Rate
                    </Text>
                </View>

                <View className="flex-1 min-w-[80px] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                    <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {summary.present}
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Present
                    </Text>
                </View>

                <View className="flex-1 min-w-[80px] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <XCircle className="w-6 h-6 text-red-500 mb-2" />
                    <Text className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {summary.absent}
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Absent
                    </Text>
                </View>

                <View className="flex-1 min-w-[80px] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Clock className="w-6 h-6 text-amber-500 mb-2" />
                    <Text className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {summary.late}
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Late
                    </Text>
                </View>
            </View>

            {/* Daily List */}
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Daily Record
            </Text>
            <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {daily.length === 0 ? (
                    <View className="p-8 items-center">
                        <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                        <Text className="text-slate-500 dark:text-slate-400">
                            No attendance records for this month
                        </Text>
                    </View>
                ) : (
                    daily.map((record, idx) => (
                        <View
                            key={idx}
                            className={`flex-row items-center justify-between p-4 ${idx < daily.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                                }`}
                        >
                            <View className="flex-row items-center gap-3">
                                <View className={`w-10 h-10 rounded-full items-center justify-center ${getStatusColor(record.status)}`}>
                                    {getStatusIcon(record.status)}
                                </View>
                                <Text className="text-sm font-medium text-slate-900 dark:text-white">
                                    {new Date(record.date).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </Text>
                            </View>
                            <Text className={`text-sm font-medium ${record.status === 'PRESENT' ? 'text-green-600' :
                                    record.status === 'ABSENT' ? 'text-red-600' :
                                        record.status === 'LATE' ? 'text-amber-600' : 'text-slate-500'
                                }`}>
                                {record.status}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};
