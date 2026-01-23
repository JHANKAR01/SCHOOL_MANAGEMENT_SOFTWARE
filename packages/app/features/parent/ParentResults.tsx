// packages/app/features/parent/ParentResults.tsx
// Results & Report Cards - View published exam results with PDF download

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { FileText, Download, TrendingUp, Award } from 'lucide-react';
import { useChildResults, ExamResult } from '../../../hooks/useParentData';
import { SovereignSkeleton, SovereignBadge } from '../../components/SovereignComponents';

interface Props {
    studentId: string | null;
}

export const ParentResults: React.FC<Props> = ({ studentId }) => {
    const { data, isLoading } = useChildResults(studentId);

    const getGradeColor = (grade: string | null) => {
        if (!grade) return 'text-slate-500';
        const upperGrade = grade.toUpperCase();
        if (upperGrade.startsWith('A') || upperGrade === 'O') return 'text-green-600 dark:text-green-400';
        if (upperGrade.startsWith('B')) return 'text-blue-600 dark:text-blue-400';
        if (upperGrade.startsWith('C')) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const handleDownload = (url: string) => {
        // In production, this would trigger PDF download
        if (typeof window !== 'undefined') {
            window.open(url, '_blank');
        }
    };

    if (!studentId) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-500 dark:text-slate-400">
                    Please select a child to view results
                </Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className="flex-1 p-4">
                <SovereignSkeleton className="h-48 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-48 w-full rounded-xl" />
            </View>
        );
    }

    const results = data?.data || [];

    if (results.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Award className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <Text className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No Results Published
                </Text>
                <Text className="text-sm text-slate-500 dark:text-slate-500 text-center px-8">
                    Exam results will appear here once published by the school.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4">
            {results.map((result) => (
                <ResultCard
                    key={result.result_id}
                    result={result}
                    onDownload={handleDownload}
                    getGradeColor={getGradeColor}
                />
            ))}
        </ScrollView>
    );
};

const ResultCard: React.FC<{
    result: ExamResult;
    onDownload: (url: string) => void;
    getGradeColor: (grade: string | null) => string;
}> = ({ result, onDownload, getGradeColor }) => {
    const [expanded, setExpanded] = React.useState(false);

    return (
        <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden">
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                className="p-4"
            >
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">
                                {result.exam_name}
                            </Text>
                            <Text className="text-sm text-slate-500 dark:text-slate-400">
                                {result.exam_type}
                            </Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {result.total_percentage}%
                        </Text>
                        <Text className={`text-sm font-medium ${getGradeColor(result.grade)}`}>
                            Grade: {result.grade}
                        </Text>
                    </View>
                </View>

                {result.remarks && (
                    <Text className="text-sm text-slate-600 dark:text-slate-400 italic">
                        "{result.remarks}"
                    </Text>
                )}
            </TouchableOpacity>

            {expanded && (
                <View className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                    {/* Subject-wise marks */}
                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Subject-wise Marks
                    </Text>
                    {result.marks.map((mark, idx) => (
                        <View key={idx} className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-slate-900 dark:text-white">
                                    {mark.subject}
                                </Text>
                                <Text className="text-xs text-slate-500">{mark.subject_code}</Text>
                            </View>
                            <View className="flex-row items-center gap-4">
                                <Text className="text-sm text-slate-600 dark:text-slate-400">
                                    {mark.obtained}/{mark.max}
                                </Text>
                                <Text className={`text-sm font-bold ${getGradeColor(mark.grade)}`}>
                                    {mark.grade}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Download Button */}
                    <TouchableOpacity
                        onPress={() => onDownload(result.report_card_url)}
                        className="flex-row items-center justify-center gap-2 mt-4 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg"
                    >
                        <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                            Download Report Card
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
