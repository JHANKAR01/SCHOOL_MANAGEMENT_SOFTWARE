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

    const { summary, records } = data || { summary: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }, records: [] };
    const percentage = summary?.percentage || 0;

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 bg-white border-b border-gray-200 pb-4">
                <View className="flex-row justify-between items-center mb-4">
                    <PageHeader title={t('attendance')} subtitle={`${percentage}% Attendance Rate`} />
                    <SovereignButton variant="secondary" className="flex-row gap-2">
                        <Plus className="w-4 h-4" />
                        <Text>Apply Leave</Text>
                    </SovereignButton>
                </View>

                {/* Stats Row */}
                <View className="flex-row gap-3">
                    <StatCard
                        label="Present"
                        value={summary?.present || 0}
                        color="bg-emerald-100 text-emerald-900"
                        icon={UserCheck}
                    />
                    <StatCard
                        label="Absent"
                        value={summary?.absent || 0}
                        color="bg-rose-100 text-rose-900"
                        icon={UserX}
                    />
                    <StatCard
                        label="Late"
                        value={summary?.late || 0}
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
                    {records.length === 0 ? (
                        <View className="p-8 items-center">
                            <Text className="text-gray-400">No attendance records found.</Text>
                        </View>
                    ) : (
                        records.map((record, index) => (
                            <View
                                key={`${record.date}-${record.period}`}
                                className={`p-4 flex-row items-center justify-between ${index !== records.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className={`w-10 h-10 rounded-full flex items-center justify-center ${record.status === 'PRESENT' ? 'bg-emerald-100' :
                                        record.status === 'ABSENT' ? 'bg-rose-100' : 'bg-amber-100'
                                        }`}>
                                        <Text className={`font-bold ${record.status === 'PRESENT' ? 'text-emerald-700' :
                                            record.status === 'ABSENT' ? 'text-rose-700' : 'text-amber-700'
                                            }`}>
                                            {new Date(record.date).getDate()}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text className="font-medium text-gray-900">
                                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short' })}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            Period: {record.period === 0 ? 'All Day' : record.period}
                                        </Text>
                                    </View>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' :
                                    record.status === 'ABSENT' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    <Text className="text-xs font-bold">{record.status}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};
