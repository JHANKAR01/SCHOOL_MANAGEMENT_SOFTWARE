// packages/app/features/dashboard/NewTeacherDashboard.tsx
// Teacher Dashboard using DashboardShell with offline-first design
// Mobile-first, speed-optimized for live classroom usage

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Check, LayoutGrid } from 'lucide-react';
import { DashboardShell, Module } from '../../components/DashboardShell';
import { useSyncQueue } from '../../hooks/useSyncQueue';
import { useTranslation } from '../../provider/language-context';
import { preCacheTeacherData } from '../../utils/pre-cache-service';

// Import Teacher Modules
import { TeacherAttendance } from '../teacher/TeacherAttendance';
import { TeacherDailyConsole } from '../teacher/TeacherDailyConsole';
import { TeacherMarksEntry } from '../teacher/TeacherMarksEntry';
import { TeacherHomework } from '../teacher/TeacherHomework';
import { TeacherClassView } from '../teacher/TeacherClassView';
import { TeacherLeave } from '../teacher/TeacherLeave';

// ============================================================================
// SYNC STATUS WIDGET
// ============================================================================

interface SyncStatusWidgetProps {
    online: boolean;
    pending: number;
    lastSync: Date | null;
}

const SyncStatusWidget: React.FC<SyncStatusWidgetProps> = ({ online, pending, lastSync }) => {
    const { t } = useTranslation();

    return (
        <View className="flex-row items-center gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Online/Offline Indicator */}
            <View className="flex-row items-center gap-2">
                <View className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <Text className={`text-sm font-medium ${online ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {online ? t('online') : t('offline')}
                </Text>
            </View>

            {/* Pending Sync Count */}
            {pending > 0 && (
                <View className="flex-row items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {pending} {t('pending_sync')}
                    </Text>
                </View>
            )}

            {/* Last Sync Time */}
            {lastSync && online && pending === 0 && (
                <View className="flex-row items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                        {t('synced')} {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            )}
        </View>
    );
};

// ============================================================================
// PLACEHOLDER MODULES (to be replaced with real implementations)
// ============================================================================

const PlaceholderModule: React.FC<{ name: string }> = ({ name }) => (
    <View className="flex-col items-center justify-center h-64">
        <View className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-4">
            <LayoutGrid className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </View>
        <Text className="text-lg font-semibold text-slate-600 dark:text-slate-300">{name}</Text>
        <Text className="text-sm mt-2 text-slate-400 dark:text-slate-500">Module under construction</Text>
    </View>
);

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const NewTeacherDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { status, forceSync } = useSyncQueue();
    const [currentModule, setCurrentModule] = useState<Module>('today');
    const [preCacheComplete, setPreCacheComplete] = useState(false);

    // Pre-cache data on mount
    useEffect(() => {
        const runPreCache = async () => {
            console.log('[TeacherDashboard] Running pre-cache...');
            const result = await preCacheTeacherData();
            console.log('[TeacherDashboard] Pre-cache result:', result);
            setPreCacheComplete(true);
        };
        runPreCache();
    }, []);

    // Handle module change from sidebar
    const handleModuleChange = (module: Module) => {
        setCurrentModule(module);
    };

    // Get title based on current module
    const getTitle = (): string => {
        switch (currentModule) {
            case 'today': return t('my_classes_today');
            case 'attendance': return t('attendance');
            case 'marks': return t('marks_entry');
            case 'homework': return t('homework');
            case 'classes': return t('my_classes');
            case 'leave': return t('leave');
            default: return t('today');
        }
    };

    // Render content based on current module
    const renderContent = () => {
        switch (currentModule) {
            case 'today':
                return <TeacherDailyConsole onNavigateToAttendance={() => setCurrentModule('attendance')} />;

            case 'attendance':
                return <TeacherAttendance />;

            case 'marks':
                return <TeacherMarksEntry />;

            case 'homework':
                return <TeacherHomework />;

            case 'classes':
                return <TeacherClassView />;

            case 'leave':
                return <TeacherLeave />;

            default:
                return <PlaceholderModule name="Unknown Module" />;
        }
    };

    return (
        <DashboardShell
            role="TEACHER"
            title={getTitle()}
            activeModule={currentModule}
            onModuleChange={handleModuleChange}
            stats={
                <SyncStatusWidget
                    online={status.online}
                    pending={status.pending}
                    lastSync={status.lastSync}
                />
            }
        >
            {renderContent()}
        </DashboardShell>
    );
};

export default NewTeacherDashboard;
