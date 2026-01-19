// packages/app/features/dashboard/NewTeacherDashboard.tsx
// Teacher Dashboard using DashboardShell with offline-first design
// Mobile-first, speed-optimized for live classroom usage

import React, { useState, useEffect } from 'react';
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
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Online/Offline Indicator */}
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                <span className={`text-sm font-medium ${online ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {online ? t('online') : t('offline')}
                </span>
            </div>

            {/* Pending Sync Count */}
            {pending > 0 && (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {pending} {t('pending_sync')}
                    </span>
                </div>
            )}

            {/* Last Sync Time */}
            {lastSync && online && pending === 0 && (
                <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t('synced')} {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// PLACEHOLDER MODULES (to be replaced with real implementations)
// ============================================================================

const PlaceholderModule: React.FC<{ name: string }> = ({ name }) => (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">{name}</h3>
        <p className="text-sm mt-2">Module under construction</p>
    </div>
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
