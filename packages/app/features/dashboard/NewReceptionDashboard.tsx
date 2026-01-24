// packages/app/features/dashboard/NewReceptionDashboard.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { LayoutDashboard, Users, Wallet, Settings, Check } from 'lucide-react';
import { DashboardShell, Module } from '../../components/DashboardShell';
import { useTranslation } from '../../provider/language-context';
import { useSyncQueue } from '../../hooks/useSyncQueue';

// Import Reception Modules
import { ReceptionConsole } from '../reception/ReceptionConsole';
import { ReceptionVisitorLog } from '../reception/ReceptionVisitorLog';
import { ReceptionParcels } from '../reception/ReceptionParcels';
// import { ReceptionSettings } from '../reception/ReceptionSettings';

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
                    {online ? 'Online' : 'Offline'}
                </Text>
            </View>

            {/* Pending Sync Count */}
            {pending > 0 && (
                <View className="flex-row items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {pending} Pending
                    </Text>
                </View>
            )}

            {/* Last Sync Time */}
            {lastSync && online && pending === 0 && (
                <View className="flex-row items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Synced {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            )}
        </View>
    );
};

// Placeholder for missing modules
const PlaceholderModule: React.FC<{ name: string; icon: any }> = ({ name, icon: Icon }) => (
    <View className="flex-1 items-center justify-center h-96">
        <View className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </View>
        <Text className="text-lg font-semibold text-slate-600 dark:text-slate-300">{name}</Text>
        <Text className="text-sm mt-2 text-slate-400 dark:text-slate-500">Module under construction</Text>
    </View>
);

export const NewReceptionDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { status } = useSyncQueue();
    const [currentModule, setCurrentModule] = useState<Module>('dashboard');

    // Handle module change from sidebar
    const handleModuleChange = (module: Module) => {
        setCurrentModule(module);
    };

    // Get title based on current module
    const getTitle = (): string => {
        switch (currentModule) {
            case 'dashboard': return 'Reception Console';
            case 'visitors': return 'Visitor Log';
            case 'parcels': return 'Parcel Management';
            case 'settings': return 'Reception Settings';
            default: return 'Reception Console';
        }
    };

    // Render content based on current module
    const renderContent = () => {
        switch (currentModule) {
            case 'dashboard':
                return <ReceptionConsole onNavigate={(mod) => setCurrentModule(mod as Module)} />;

            case 'visitors':
                return <ReceptionVisitorLog />;

            case 'parcels':
                return <ReceptionParcels />;

            case 'settings':
                return <PlaceholderModule name="Reception Settings" icon={Settings} />;

            default:
                return <PlaceholderModule name="Unknown Module" icon={LayoutDashboard} />;
        }
    };

    return (
        <DashboardShell
            role="RECEPTIONIST"
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
