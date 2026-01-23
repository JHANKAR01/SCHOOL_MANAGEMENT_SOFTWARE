// packages/app/features/student/StudentTimetable.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useStudentTimetable } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton, SovereignButton } from '../../components/SovereignComponents';
import { Calendar, User, Clock } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const StudentTimetable = () => {
    const [selectedDay, setSelectedDay] = useState(0);
    const apiDay = selectedDay + 1;

    const { data, isLoading, refetch, isRefetching } = useStudentTimetable(apiDay);

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50 dark:bg-slate-900">
                <SovereignSkeleton className="h-12 w-1/2 mb-6" />
                <View className="flex-row justify-between mb-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <SovereignSkeleton key={i} className="h-10 w-12 rounded-lg" />)}
                </View>
                <SovereignSkeleton className="h-24 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-24 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-24 w-full rounded-xl" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            <View className="px-4 pt-4 pb-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <PageHeader
                    title="Weekly Schedule"
                    subtitle={data?.class ? `Class ${data.class}` : 'Loading...'}
                />

                {/* Day Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
                    {DAYS.map((day, idx) => (
                        <SovereignButton
                            key={day}
                            variant={selectedDay === idx ? 'primary' : 'ghost'}
                            onPress={() => setSelectedDay(idx)}
                            className={`mr-2 h-10 px-4 rounded-full ${selectedDay === idx ? '' : 'bg-gray-100 dark:bg-slate-700'}`}
                            style={{ minWidth: 60 }}
                        >
                            {day}
                        </SovereignButton>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 p-4"
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            >
                {!data?.timetable || data.timetable.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">No classes scheduled for this day</Text>
                    </View>
                ) : (
                    <View className="space-y-4 pb-8">
                        {data.timetable.map((t) => (
                            <View key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-row">
                                {/* Time Column */}
                                <View className="w-20 border-r border-gray-100 dark:border-gray-700 pr-4 mr-4 justify-center">
                                    <Text className="text-gray-900 dark:text-white font-bold mb-1">
                                        {new Date(t.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text className="text-gray-400 dark:text-gray-500 text-xs">
                                        {new Date(t.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>

                                {/* Info Column */}
                                <View className="flex-1 justify-center">
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t.subject}</Text>
                                    <View className="flex-row items-center">
                                        <User className="w-3 h-3 text-gray-400 dark:text-gray-500 mr-1" />
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">{t.teacher}</Text>
                                    </View>
                                    <View className="bg-indigo-50 dark:bg-indigo-900/30 self-start px-2 py-0.5 rounded mt-2">
                                        <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{t.subject_code}</Text>
                                    </View>
                                </View>

                                {/* Period Badge */}
                                <View className="absolute top-4 right-4 bg-gray-100 dark:bg-slate-700 rounded-lg w-8 h-8 items-center justify-center">
                                    <Text className="font-bold text-gray-600 dark:text-gray-300">{t.period}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Substitutions */}
                {data?.substitutions && data.substitutions.length > 0 && (
                    <View className="mt-4 mb-8">
                        <Text className="text-red-600 dark:text-red-400 font-bold mb-2 uppercase text-xs tracking-wider">Substitutions Today</Text>
                        {data.substitutions.map((sub, idx) => (
                            <View key={idx} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 mb-2">
                                <Text className="font-bold text-red-900 dark:text-red-200">Period {sub.period}: {sub.subject}</Text>
                                <Text className="text-sm text-red-700 dark:text-red-300">Substituted by {sub.substitute_teacher}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
