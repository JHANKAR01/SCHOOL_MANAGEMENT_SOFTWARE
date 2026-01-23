// packages/app/features/student/StudentHomework.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useStudentHomework } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton, SovereignBadge, SovereignButton } from '../../components/SovereignComponents';
import { BookOpen, CheckCircle, Clock, FileText, Upload } from 'lucide-react';
import { useTranslation } from '../../provider/language-context';

export const StudentHomework = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<'pending' | 'submitted' | 'graded'>('pending');
    const { data, isLoading, refetch } = useStudentHomework();

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50 dark:bg-slate-900">
                <PageHeader title={t('homework')} subtitle="Assignments & Projects" />
                <View className="flex-row gap-4 mb-6">
                    <SovereignSkeleton className="h-10 w-24 rounded-full" />
                    <SovereignSkeleton className="h-10 w-24 rounded-full" />
                    <SovereignSkeleton className="h-10 w-24 rounded-full" />
                </View>
                {[1, 2, 3].map(i => <SovereignSkeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
            </View>
        );
    }

    // Filter logic - use lowercase to match API response
    const filteredHomework = data?.filter(hw => {
        if (filter === 'pending') return hw.status === 'pending' || hw.status === 'overdue';
        if (filter === 'submitted') return hw.status === 'submitted';
        if (filter === 'graded') return hw.status === 'graded';
        return true;
    }) || [];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            <View className="px-4 pt-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <PageHeader title={t('homework')} subtitle="Assignments & Projects" />

                {/* Filter Tabs */}
                <View className="flex-row gap-2 mb-4">
                    {(['pending', 'submitted', 'graded'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full border ${filter === f
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            <Text className={`font-medium ${filter === f ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {filteredHomework.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">No {filter} homework found</Text>
                    </View>
                ) : (
                    <View className="space-y-4 pb-8">
                        {filteredHomework.map((hw) => (
                            <View key={hw.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View>
                                        <Text className="text-lg font-bold text-gray-900 dark:text-white">{hw.title}</Text>
                                        <Text className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{hw.subject}</Text>
                                    </View>
                                    <SovereignBadge
                                        status={
                                            hw.status === 'pending' ? 'warning' :
                                                hw.status === 'submitted' ? 'info' :
                                                    hw.status === 'graded' ? 'success' : 'error'
                                        }
                                    >
                                        {hw.status}
                                    </SovereignBadge>
                                </View>

                                <Text className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{hw.description}</Text>

                                <View className="flex-row justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <View className="flex-row items-center gap-4">
                                        <View className="flex-row items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                Due: {new Date(hw.due_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {hw.submission?.grade && (
                                            <View className="flex-row items-center gap-1.5">
                                                <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Grade: {hw.submission.grade}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {hw.status === 'pending' && (
                                        <SovereignButton variant="primary" className="flex-row gap-2">
                                            <Upload className="w-4 h-4 text-white" />
                                            <Text className="text-white font-medium">Submit</Text>
                                        </SovereignButton>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
