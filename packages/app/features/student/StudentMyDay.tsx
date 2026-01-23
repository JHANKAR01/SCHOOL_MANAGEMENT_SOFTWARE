// packages/app/features/student/StudentMyDay.tsx
import React from 'react';
import { View, Text, ScrollView, RefreshControl, Linking } from 'react-native';
import { useMyDay } from '../../../hooks/useStudentData';
import {
    PageHeader,
    StatCard,
    SovereignSkeleton,
    SovereignButton,
    SovereignBadge
} from '../../components/SovereignComponents';
import {
    Calendar,
    BookOpen,
    Video,
    Bell,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

export const StudentMyDay = () => {
    const { data, isLoading, refetch, isRefetching } = useMyDay();

    const handleJoinClass = (link: string) => {
        Linking.openURL(link).catch(err =>
            console.error("Couldn't load page", err)
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50 dark:bg-slate-900">
                <SovereignSkeleton className="h-12 w-3/4 mb-4" />
                <View className="flex-row gap-4 mb-6">
                    <SovereignSkeleton className="h-32 flex-1 rounded-xl" />
                    <SovereignSkeleton className="h-32 flex-1 rounded-xl" />
                </View>
                <SovereignSkeleton className="h-64 w-full rounded-xl" />
            </View>
        );
    }

    if (!data) return null;

    const { student, timetable, attendance, pending_homework, live_classes, announcements } = data;

    return (
        <ScrollView
            className="flex-1 bg-gray-50 dark:bg-slate-900"
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
        >
            {/* Header */}
            <PageHeader
                title={`Hello, ${student.name.split(' ')[0]}`}
                subtitle={`Class ${student.class} • Roll No: ${student.roll_number}`}
            />

            {/* Stats Row */}
            <View className="flex-row flex-wrap gap-4 mb-6">
                <View className="flex-1 min-w-[45%]">
                    <StatCard
                        title="ATTENDANCE"
                        value={attendance.marked ? (attendance.status || 'MARKED') : 'NOT MARKED'}
                        icon={<CheckCircle className={attendance.status === 'PRESENT' ? "text-green-600" : "text-gray-400 dark:text-gray-500"} />}
                        subtitle="Today's Status"
                    />
                </View>
                <View className="flex-1 min-w-[45%]">
                    <StatCard
                        title="HOMEWORK"
                        value={pending_homework.length}
                        icon={<BookOpen className="text-indigo-600 dark:text-indigo-400" />}
                        subtitle="Pending Tasks"
                    />
                </View>
            </View>

            {/* Live Classes (Priority) */}
            {live_classes.length > 0 && (
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex-row items-center">
                        <Video className="w-5 h-5 mr-2 text-red-600" /> Live Classes
                    </Text>
                    {live_classes.map(lc => (
                        <View key={lc.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-red-100 dark:border-red-900 shadow-sm mb-3">
                            <View className="flex-row justify-between items-start mb-3">
                                <View>
                                    <Text className="font-bold text-gray-900 dark:text-white text-lg">{lc.subject}</Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-sm">by {lc.teacher}</Text>
                                </View>
                                <SovereignBadge status={lc.is_active ? 'error' : 'warning'}>
                                    {lc.is_active ? 'LIVE NOW' : 'UPCOMING'}
                                </SovereignBadge>
                            </View>
                            {lc.is_active && (
                                <SovereignButton
                                    variant="danger"
                                    onPress={() => handleJoinClass(lc.meeting_link)}
                                    icon={<Video className="w-4 h-4 text-white" />}
                                >
                                    Join Class
                                </SovereignButton>
                            )}
                            {!lc.is_active && (
                                <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                                    Starts at {new Date(lc.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Timetable */}
            <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex-row items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Today's Schedule
                </Text>
                {timetable.length === 0 ? (
                    <View className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 items-center">
                        <Text className="text-gray-400 dark:text-gray-500">No classes scheduled for today.</Text>
                    </View>
                ) : (
                    <View className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {timetable.map((t, idx) => (
                            <View key={idx} className={`flex-row p-4 border-b border-gray-100 dark:border-gray-700 items-center ${idx === timetable.length - 1 ? 'border-b-0' : ''}`}>
                                <View className="w-16 mr-4">
                                    <Text className="font-bold text-gray-900 dark:text-white text-sm">
                                        {new Date(t.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(t.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 dark:text-gray-100 text-base">{t.subject}</Text>
                                    <Text className="text-xs text-gray-500 dark:text-gray-400">{t.teacher}</Text>
                                </View>
                                <View className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                    <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">P{t.period}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Pending Homework */}
            {pending_homework.length > 0 && (
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex-row items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-amber-600" /> Due Soon
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                        {pending_homework.map(hw => (
                            <View key={hw.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 w-64 shadow-sm mr-3">
                                <View className="flex-row justify-between mb-2">
                                    <SovereignBadge status={hw.is_overdue ? 'error' : 'warning'}>
                                        {hw.is_overdue ? 'OVERDUE' : 'PENDING'}
                                    </SovereignBadge>
                                </View>
                                <Text numberOfLines={2} className="font-bold text-gray-900 dark:text-white mb-1 h-12">
                                    {hw.title}
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">{hw.subject}</Text>
                                <View className="flex-row items-center">
                                    <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500 mr-1" />
                                    <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                        Due {new Date(hw.due_date).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
                <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex-row items-center">
                        <Bell className="w-5 h-5 mr-2 text-orange-500" /> Announcements
                    </Text>
                    {announcements.map(a => (
                        <View key={a.id} className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 mb-3">
                            <Text className="font-bold text-gray-900 dark:text-white mb-1">{a.title}</Text>
                            <Text numberOfLines={3} className="text-sm text-gray-600 dark:text-gray-300 leading-5">
                                {a.message}
                            </Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                                {new Date(a.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};
