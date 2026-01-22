// packages/app/features/student/StudentNotifications.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStudentNotifications } from '../../../hooks/useStudentData';
import { PageHeader, SovereignSkeleton } from '../../components/SovereignComponents';
import { Bell, Megaphone, Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../provider/language-context';

export const StudentNotifications = () => {
    const { t } = useTranslation();
    const { data: notifications, isLoading } = useStudentNotifications();

    if (isLoading) {
        return (
            <View className="flex-1 p-4 bg-gray-50">
                <PageHeader title={t('notifications')} subtitle="Announcements & Alerts" />
                {[1, 2, 3].map(i => <SovereignSkeleton key={i} className="h-24 w-full rounded-xl mb-4" />)}
            </View>
        );
    }

    const getIcon = (isNew: boolean) => {
        return isNew ? <Megaphone className="w-5 h-5 text-indigo-500" /> : <Info className="w-5 h-5 text-gray-500" />;
    };

    const getBgColor = (isNew: boolean) => {
        return isNew ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200';
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 bg-white border-b border-gray-200">
                <PageHeader title={t('notifications')} subtitle="Announcements & Alerts" />
            </View>

            <ScrollView className="flex-1 p-4">
                {notifications && notifications.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Bell className="w-16 h-16 text-gray-300 mb-4" />
                        <Text className="text-gray-500 font-medium">No new notifications</Text>
                    </View>
                ) : (
                    <View className="space-y-3 pb-8">
                        {notifications?.map((notif) => (
                            <View
                                key={notif.id}
                                className={`p-4 rounded-xl border flex-row gap-4 ${getBgColor(notif.is_new)}`}
                            >
                                <View className="mt-1">{getIcon(notif.is_new)}</View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="font-bold text-gray-900 flex-1 mr-2">{notif.title}</Text>
                                        <Text className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text className="text-sm text-gray-600 leading-relaxed">
                                        {notif.message}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
