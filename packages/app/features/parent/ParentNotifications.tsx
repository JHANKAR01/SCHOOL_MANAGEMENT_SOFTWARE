// packages/app/features/parent/ParentNotifications.tsx
// Notification Center - Announcements and alerts for parents

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, Megaphone, AlertCircle, Info } from 'lucide-react';
import { useParentNotifications, useMarkNotificationRead } from '../../../hooks/useParentData';
import { SovereignSkeleton, SovereignBadge } from '../../components/SovereignComponents';

export const ParentNotifications: React.FC = () => {
    const { data, isLoading } = useParentNotifications();
    const markAsRead = useMarkNotificationRead();

    const handleNotificationPress = (notification: any) => {
        if (notification.is_new && !markAsRead.isPending) {
            markAsRead.mutate(notification.id);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            if (hours === 0) {
                const mins = Math.floor(diffMs / (1000 * 60));
                return `${mins}m ago`;
            }
            return `${hours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 p-4">
                <SovereignSkeleton className="h-24 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-24 w-full rounded-xl mb-4" />
                <SovereignSkeleton className="h-24 w-full rounded-xl" />
            </View>
        );
    }

    const notifications = data?.data || [];

    if (notifications.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Bell className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <Text className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                    No Notifications
                </Text>
                <Text className="text-sm text-slate-500 dark:text-slate-500 text-center px-8">
                    You're all caught up! New announcements will appear here.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4">
            {notifications.map((notification) => (
                <TouchableOpacity
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                    className={`bg-white dark:bg-slate-800 rounded-xl border mb-4 overflow-hidden ${notification.is_new
                        ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10'
                        : 'border-slate-200 dark:border-slate-700'
                        }`}
                >
                    <View className="p-4">
                        <View className="flex-row items-start gap-3">
                            <View className={`w-10 h-10 rounded-full items-center justify-center ${notification.is_new
                                ? 'bg-indigo-100 dark:bg-indigo-900/30'
                                : 'bg-slate-100 dark:bg-slate-700'
                                }`}>
                                <Megaphone className={`w-5 h-5 ${notification.is_new
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`} />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <View className="flex-1 pr-2">
                                        <Text className={`text-base text-slate-900 dark:text-white ${notification.is_new ? 'font-bold' : 'font-medium'}`}>
                                            {notification.title}
                                        </Text>
                                    </View>
                                    {notification.is_new && (
                                        <SovereignBadge status="info">New</SovereignBadge>
                                    )}
                                </View>
                                <Text className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    {notification.message}
                                </Text>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-xs text-slate-500 dark:text-slate-500">
                                        {notification.author} ({notification.author_role})
                                    </Text>
                                    <Text className="text-xs text-slate-400">•</Text>
                                    <Text className="text-xs text-slate-500 dark:text-slate-500">
                                        {formatDate(notification.created_at)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};
