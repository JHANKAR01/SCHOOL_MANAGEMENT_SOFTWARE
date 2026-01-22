// packages/app/features/student/StudentResults.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useStudentResults } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton, SovereignBadge, SovereignButton } from '../../components/SovereignComponents';
import { FileText, Download, Award, TrendingUp } from 'lucide-react';
import { useTranslation } from '../../provider/language-context';

export const StudentResults = () => {
    const { t } = useTranslation();
    const { data: results, isLoading } = useStudentResults();

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50">
                <PageHeader title={t('results')} subtitle="Report Cards & Marks" />
                {[1, 2].map(i => <SovereignSkeleton key={i} className="h-40 w-full rounded-xl mb-4" />)}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 bg-white border-b border-gray-200">
                <PageHeader title={t('results')} subtitle="Academic Performance" />
            </View>

            <ScrollView className="flex-1 p-4">
                {results && results.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <FileText className="w-16 h-16 text-gray-300 mb-4" />
                        <Text className="text-gray-500 font-medium">No results published yet</Text>
                    </View>
                ) : (
                    <View className="space-y-4 pb-8">
                        {results?.map((result) => (
                            <View key={result.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                {/* Decorative background circle */}
                                <View className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full" />

                                <View className="flex-row justify-between items-start mb-4 relative z-10">
                                    <View>
                                        <Text className="text-lg font-bold text-gray-900">{result.exam_name}</Text>
                                        <Text className="text-sm text-gray-500">
                                            Published on {new Date(result.published_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className="bg-indigo-100 px-3 py-1 rounded-full">
                                        <Text className="text-indigo-700 font-bold">{result.grade}</Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-8 mb-6">
                                    <View>
                                        <Text className="text-xs text-gray-400 uppercase tracking-wider mb-1">Percentage</Text>
                                        <View className="flex-row items-end gap-1">
                                            <Text className="text-2xl font-bold text-gray-800">{result.percentage}%</Text>
                                            <TrendingUp className="w-4 h-4 text-emerald-500 mb-1.5" />
                                        </View>
                                    </View>
                                    <View>
                                        <Text className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Marks</Text>
                                        <Text className="text-2xl font-bold text-gray-800">{result.total_marks}</Text>
                                    </View>
                                </View>

                                <View className="pt-4 border-t border-gray-100 flex-row justify-between items-center">
                                    <View className="flex-row items-center gap-2">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <Text className="text-sm text-gray-600 font-medium">{result.remarks || 'Keep up the good work!'}</Text>
                                    </View>

                                    <SovereignButton variant="outline" size="sm" className="flex-row gap-2">
                                        <Download className="w-4 h-4" />
                                        <Text>Download PDF</Text>
                                    </SovereignButton>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
