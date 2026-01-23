// packages/app/features/parent/ParentTimetable.tsx
// Weekly Timetable View for Parents

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, Calendar, User, BookOpen } from 'lucide-react';
import { useChildTimetable, TimetableEntry } from '../../../hooks/useParentData';
import { SovereignSkeleton } from '../../components/SovereignComponents';

interface Props {
    studentId: string | null;
}

const DAYS = [
    { id: 1, label: 'Mon', full: 'Monday' },
    { id: 2, label: 'Tue', full: 'Tuesday' },
    { id: 3, label: 'Wed', full: 'Wednesday' },
    { id: 4, label: 'Thu', full: 'Thursday' },
    { id: 5, label: 'Fri', full: 'Friday' },
    { id: 6, label: 'Sat', full: 'Saturday' },
];

export const ParentTimetable: React.FC<Props> = ({ studentId }) => {
    // Default to current day of week (Monday if Sunday)
    const today = new Date().getDay();
    const defaultDay = today === 0 ? 1 : today;

    const [selectedDay, setSelectedDay] = useState(defaultDay);
    const { data, isLoading } = useChildTimetable(studentId);

    if (!studentId) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-500 dark:text-slate-400">
                    Please select a child to view timetable
                </Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className="flex-1 p-4">
                <SovereignSkeleton className="h-12 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-32 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-32 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-32 w-full rounded-xl" />
            </View>
        );
    }

    const timetable = data?.data?.timetable || [];
    const classSection = data?.data?.class || '';

    // Filter periods for selected day
    const dayPeriods = timetable
        .filter(t => t.day_of_week === selectedDay)
        .sort((a, b) => a.period - b.period);

    return (
        <View className="flex-1">
            {/* Header with Class Info */}
            <View className="px-4 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        Weekly Timetable
                    </Text>
                    <View className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                        <Text className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            Class {classSection}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Day Selector */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="max-h-14 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
            >
                {DAYS.map((day) => (
                    <TouchableOpacity
                        key={day.id}
                        onPress={() => setSelectedDay(day.id)}
                        className={`mr-2 px-4 py-2 rounded-full transition-all ${selectedDay === day.id
                                ? 'bg-indigo-600'
                                : 'bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Text className={`font-medium ${selectedDay === day.id
                                ? 'text-white'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}>
                            {day.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Timetable List */}
            <ScrollView className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 ml-1">
                    {DAYS.find(d => d.id === selectedDay)?.full}
                </Text>

                {dayPeriods.length === 0 ? (
                    <View className="items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                        <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                        <Text className="text-slate-500 dark:text-slate-400">
                            No classes scheduled for this day
                        </Text>
                    </View>
                ) : (
                    <View className="space-y-3">
                        {dayPeriods.map((period, index) => (
                            <PeriodCard key={index} period={period} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// Period Card Component
const PeriodCard: React.FC<{ period: TimetableEntry }> = ({ period }) => {
    return (
        <View className="flex-row bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {/* Time Column */}
            <View className="w-24 bg-slate-50 dark:bg-slate-800/50 p-4 border-r border-slate-100 dark:border-slate-700 flex-col items-center justify-center">
                <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatTime(period.start_time)}
                </Text>
                <Text className="text-xs text-slate-400 my-1">to</Text>
                <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatTime(period.end_time)}
                </Text>
            </View>

            {/* Details Column */}
            <View className="flex-1 p-4 justify-center">
                <View className="flex-row items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <Text className="text-base font-bold text-slate-900 dark:text-white">
                        {period.subject}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <User className="w-3 h-3 text-slate-400" />
                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                        {period.teacher}
                    </Text>
                </View>
            </View>
        </View>
    );
};

// Helper: Format time string (HH:MM or HH:MM:SS) to HH:MM AM/PM
function formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
