// packages/app/features/student/StudentLiveClasses.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useStudentLiveClasses } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton, SovereignBadge, SovereignButton } from '../../components/SovereignComponents';
import { Video, Calendar, Clock, User } from 'lucide-react';
import { useTranslation } from '../../provider/language-context';

export const StudentLiveClasses = () => {
    const { t } = useTranslation();
    const { data: liveClasses, isLoading } = useStudentLiveClasses();

    const handleJoin = (url: string) => {
        // In a real app, might want to open in-app browser or deep link
        window.open(url, '_blank');
    };

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50">
                <PageHeader title={t('live_classes')} subtitle="Join your virtual classroom" />
                {[1, 2, 3].map(i => <SovereignSkeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 bg-white border-b border-gray-200">
                <PageHeader title={t('live_classes')} subtitle="Virtual Classroom & Webinars" />
            </View>

            <ScrollView className="flex-1 p-4">
                {liveClasses && liveClasses.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Video className="w-16 h-16 text-gray-300 mb-4" />
                        <Text className="text-gray-500 font-medium">No live classes scheduled</Text>
                    </View>
                ) : (
                    <View className="space-y-4 pb-8">
                        {liveClasses?.map((cls) => {
                            const isLiveNow = cls.status === 'LIVE';
                            return (
                                <View key={cls.id} className={`bg-white p-5 rounded-xl border ${isLiveNow ? 'border-rose-200 ring-2 ring-rose-100' : 'border-gray-200'} shadow-sm`}>
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View>
                                            <div className="flex items-center gap-2 mb-1">
                                                {isLiveNow && (
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                                    </span>
                                                )}
                                                <Text className="text-lg font-bold text-gray-900">{cls.title}</Text>
                                            </div>
                                            <Text className="text-sm text-indigo-600 font-medium">{cls.subject}</Text>
                                        </View>
                                        <SovereignBadge
                                            label={cls.status}
                                            variant={isLiveNow ? 'error' : 'default'}
                                        />
                                    </View>

                                    <View className="flex-row items-center gap-4 mb-4 text-gray-500">
                                        <View className="flex-row items-center gap-1.5">
                                            <User className="w-4 h-4" />
                                            <Text className="text-xs">{cls.teacher}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <Text className="text-xs">
                                                {new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>

                                    <SovereignButton
                                        className="w-full"
                                        variant={isLiveNow ? 'primary' : 'outline'}
                                        disabled={!isLiveNow && cls.status !== 'SCHEDULED'} // Allow joining scheduled too if close? For now strictly status based.
                                        onPress={() => isLiveNow ? handleJoin(`https://meet.jit.si/${cls.meeting_id}`) : null}
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
