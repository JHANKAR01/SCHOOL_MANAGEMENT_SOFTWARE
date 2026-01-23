// packages/app/features/student/StudentLiveClasses.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useStudentLiveClasses } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton, SovereignBadge, SovereignButton } from '../../components/SovereignComponents';
import { Video, Calendar, Clock, User } from 'lucide-react';
import { useTranslation } from '../../provider/language-context';

export const StudentLiveClasses = () => {
    const { t } = useTranslation();
    const { data: liveClasses, isLoading } = useStudentLiveClasses();

    const handleJoin = (url: string) => {
        if (Platform.OS === 'web') {
            window.open(url, '_blank');
        } else {
            Linking.openURL(url);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50 dark:bg-slate-900">
                <PageHeader title={t('live_classes')} subtitle="Join your virtual classroom" />
                {[1, 2, 3].map(i => <SovereignSkeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            <View className="px-4 pt-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <PageHeader title={t('live_classes')} subtitle="Virtual Classroom & Webinars" />
            </View>

            <ScrollView className="flex-1 p-4">
                {liveClasses && liveClasses.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Video className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">No live classes scheduled</Text>
                    </View>
                ) : (
                    <View className="space-y-4 pb-8">
                        {liveClasses?.map((cls) => {
                            const isLiveNow = cls.is_active;
                            return (
                                <View key={cls.id} className={`bg-white dark:bg-slate-800 p-5 rounded-xl border ${isLiveNow ? 'border-rose-200 dark:border-rose-800 ring-2 ring-rose-100 dark:ring-rose-900/50' : 'border-gray-200 dark:border-gray-700'} shadow-sm`}>
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View>
                                            <View className="flex-row items-center gap-2 mb-1">
                                                {isLiveNow && (
                                                    <View className="relative w-2.5 h-2.5">
                                                        <View className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75" />
                                                        <View className="relative rounded-full w-2.5 h-2.5 bg-rose-500" />
                                                    </View>
                                                )}
                                                <Text className="text-lg font-bold text-gray-900 dark:text-white">{cls.subject}</Text>
                                            </View>
                                            <Text className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{cls.subject_code}</Text>
                                        </View>
                                        <SovereignBadge status={isLiveNow ? 'error' : 'neutral'}>
                                            {isLiveNow ? 'LIVE NOW' : 'SCHEDULED'}
                                        </SovereignBadge>
                                    </View>

                                    <View className="flex-row items-center gap-4 mb-4">
                                        <View className="flex-row items-center gap-1.5">
                                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">{cls.teacher}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>

                                    <SovereignButton
                                        className="w-full"
                                        variant={isLiveNow ? 'danger' : 'ghost'}
                                        disabled={!isLiveNow && !cls.can_join}
                                        onPress={() => isLiveNow ? handleJoin(cls.meeting_link) : null}
                                    >
                                        {isLiveNow ? 'Join Now' : 'Scheduled'}
                                    </SovereignButton>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
