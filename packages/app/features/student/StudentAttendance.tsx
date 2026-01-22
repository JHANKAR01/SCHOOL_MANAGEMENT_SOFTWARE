// packages/app/features/student/StudentAttendance.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useStudentAttendance } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton, SovereignButton } from '../../components/SovereignComponents';
import { Calendar, UserCheck, UserX, Clock, Plus } from 'lucide-react';
import { useTranslation } from '../../provider/language-context';

const StatCard = ({ label, value, color, icon: Icon }: any) => (
    <View className={`flex-1 p-4 rounded-xl ${color} border-0`}>
        <View className="flex-row justify-between items-start mb-2">
            <Text className="text-xs font-bold opacity-70 uppercase">{label}</Text>
            <Icon className="w-4 h-4 opacity-50" />
        </View>
        <Text className="text-2xl font-bold">{value}</Text>
    </View>
);

export const StudentAttendance = () => {
    const { t } = useTranslation();
    const { data, isLoading } = useStudentAttendance();
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50">
                <PageHeader title={t('attendance')} subtitle="Track your presence" />
                <View className="flex-row gap-4 mb-6">
                    <SovereignSkeleton className="h-24 flex-1 rounded-xl" />
                    <SovereignSkeleton className="h-24 flex-1 rounded-xl" />
                </View>
                <SovereignSkeleton className="h-64 w-full rounded-xl" />
            </View>
        );
    }

    const { stats, logs } = data || { stats: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }, logs: [] };

    // Placeholder data for heat map or calendar view logic
    // For now we list recent logs

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 bg-white border-b border-gray-200 pb-4">
                <View className="flex-row justify-between items-center mb-4">
                    <PageHeader title={t('attendance')} subtitle={`${stats.percentage}% Attendance Rate`} />
                    <SovereignButton variant="outline" className="flex-row gap-2">
                        <Plus className="w-4 h-4" />
                        <Text>Apply Leave</Text>
                    </SovereignButton>
                </View>

                {/* Stats Row */}
                <View className="flex-row gap-3">
                    <StatCard
                        label="Present"
                        value={stats.present}
                        color="bg-emerald-100 text-emerald-900"
                        icon={UserCheck}
                    />
                    <StatCard
                        label="Absent"
                        value={stats.absent}
                        color="bg-rose-100 text-rose-900"
                        icon={UserX}
                    />
                    <StatCard
                        label="Late"
                        value={stats.late}
                        color="bg-amber-100 text-amber-900"
                        icon={Clock}
                    />
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-800">Recent Activity</Text>
                </View>

                <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {logs.length === 0 ? (
                        <View className="p-8 items-center">
                            <Text className="text-gray-400">No attendance records found.</Text>
                        </View>
                    ) : (
                        logs.map((log, index) => (
                            <View
                                key={log.id}
                                className={`p-4 flex-row items-center justify-between ${index !== logs.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className={`w-10 h-10 rounded-full flex items-center justify-center ${log.status === 'PRESENT' ? 'bg-emerald-100' :
                                            log.status === 'ABSENT' ? 'bg-rose-100' : 'bg-amber-100'
                                        }`}>
                                        <Text className={`font-bold ${log.status === 'PRESENT' ? 'text-emerald-700' :
                                                log.status === 'ABSENT' ? 'text-rose-700' : 'text-amber-700'
                                            }`}>
                                            {new Date(log.date).getDate()}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text className="font-medium text-gray-900">
                                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short' })}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {log.remarks || 'Regular Day'}
                                        </Text>
                                    </View>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' :
                                        log.status === 'ABSENT' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    <Text className="text-xs font-bold">{log.status}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};
