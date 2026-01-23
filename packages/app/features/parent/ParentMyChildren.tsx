// packages/app/features/parent/ParentMyChildren.tsx
// Landing screen showing all linked children with KPIs

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Users, Calendar, BookOpen, Wallet, TrendingUp, Video, ChevronRight } from 'lucide-react';
import { SovereignBadge } from '../../components/SovereignComponents';

interface ChildData {
    student_id: string;
    name: string;
    class: string;
    photo_url: string | null;
    attendance_today: string;
    attendance_percent: number;
    pending_homework: number;
    outstanding_fees: number;
    next_live_class: {
        subject: string;
        start_time: string;
        meeting_link: string;
        is_active: boolean;
    } | null;
    relation: string;
}

interface KPIs {
    total_due: number;
    next_due_date: string | null;
    unread_notifications: number;
    recent_result: {
        exam_name: string;
        percentage: number;
        published_at: string;
    } | null;
}

interface Props {
    children: ChildData[];
    kpis?: KPIs;
    onSelectChild: (studentId: string) => void;
}

export const ParentMyChildren: React.FC<Props> = ({ children, kpis, onSelectChild }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getAttendanceColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'text-green-600 dark:text-green-400';
            case 'ABSENT': return 'text-red-600 dark:text-red-400';
            case 'LATE': return 'text-amber-600 dark:text-amber-400';
            default: return 'text-slate-400 dark:text-slate-500';
        }
    };

    const getAttendanceBadge = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'success';
            case 'ABSENT': return 'error';
            case 'LATE': return 'warning';
            default: return 'default';
        }
    };

    if (children.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <Text className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No Children Linked
                </Text>
                <Text className="text-sm text-slate-500 dark:text-slate-500 text-center px-8">
                    Your account is not linked to any students. Please contact the school administration.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
            {/* KPI Summary Cards */}
            {kpis && (
                <View className="flex-row flex-wrap gap-4 mb-6">
                    <View className="flex-1 min-w-[140px] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Wallet className="w-5 h-5 text-red-500" />
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                Total Due
                            </Text>
                        </View>
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatCurrency(kpis.total_due)}
                        </Text>
                        {kpis.next_due_date && (
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Due: {new Date(kpis.next_due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </Text>
                        )}
                    </View>

                    {kpis.recent_result && (
                        <View className="flex-1 min-w-[140px] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <View className="flex-row items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Recent Result
                                </Text>
                            </View>
                            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                                {kpis.recent_result.percentage}%
                            </Text>
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {kpis.recent_result.exam_name}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Children Cards */}
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                My Children
            </Text>

            {children.map((child) => (
                <TouchableOpacity
                    key={child.student_id}
                    onPress={() => onSelectChild(child.student_id)}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden active:opacity-80"
                >
                    {/* Card Header */}
                    <View className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center">
                                    {child.photo_url ? (
                                        <img
                                            src={child.photo_url}
                                            alt={child.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <Text className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            {child.name.charAt(0)}
                                        </Text>
                                    )}
                                </View>
                                <View>
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                                        {child.name}
                                    </Text>
                                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                                        Class {child.class} • {child.relation}
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View className="p-4 flex-row flex-wrap gap-4">
                        {/* Today's Attendance */}
                        <View className="flex-1 min-w-[100px]">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Today</Text>
                            <SovereignBadge status={getAttendanceBadge(child.attendance_today) as any}>
                                {child.attendance_today === 'NOT_MARKED' ? 'Not Marked' : child.attendance_today}
                            </SovereignBadge>
                        </View>

                        {/* Attendance % */}
                        <View className="flex-1 min-w-[80px]">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Attendance</Text>
                            <Text className={`text-lg font-bold ${child.attendance_percent >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                {child.attendance_percent}%
                            </Text>
                        </View>

                        {/* Pending Homework */}
                        <View className="flex-1 min-w-[80px]">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Homework</Text>
                            <View className="flex-row items-center gap-1">
                                <BookOpen className="w-4 h-4 text-amber-500" />
                                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                                    {child.pending_homework}
                                </Text>
                            </View>
                        </View>

                        {/* Fees Due */}
                        <View className="flex-1 min-w-[100px]">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fees Due</Text>
                            <Text className={`text-lg font-bold ${child.outstanding_fees > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(child.outstanding_fees)}
                            </Text>
                        </View>
                    </View>

                    {/* Live Class Banner */}
                    {child.next_live_class && child.next_live_class.is_active && (
                        <View className="px-4 pb-4">
                            <TouchableOpacity
                                className="flex-row items-center justify-between bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800"
                                onPress={() => {
                                    if (typeof window !== 'undefined') {
                                        window.open(child.next_live_class!.meeting_link, '_blank');
                                    }
                                }}
                            >
                                <View className="flex-row items-center gap-2">
                                    <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <Video className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <Text className="text-sm font-medium text-red-700 dark:text-red-300">
                                        {child.next_live_class.subject} - Live Now
                                    </Text>
                                </View>
                                <Text className="text-xs font-bold text-red-600 dark:text-red-400">
                                    JOIN
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};
