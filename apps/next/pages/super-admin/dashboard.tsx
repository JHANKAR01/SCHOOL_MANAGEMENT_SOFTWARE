import React, { useState } from 'react';
import { DashboardShell, Module } from '../../../../packages/app/components/DashboardShell';
import { NebulaErrorBoundary } from '../../../../packages/app/components/NebulaErrorBoundary';
import { useTheme } from '../../../../packages/app/provider/ThemeProvider';
import { TenantManager } from './components/TenantManager';
import { CommandCenter } from './components/CommandCenter';
import DataExplorer from './components/DataExplorer';
import { FinanceOverview } from './components/FinanceOverview';
import { SystemHealth } from './components/SystemHealth';
import { FeatureFlagManager } from './components/FeatureFlagManager';
import { GhostModeModule, GhostModeBanner } from './components/GhostModePanel';
import { SystemSettings } from './components/SystemSettings';
import { UserCog, ExternalLink, AlertTriangle, Shield, LayoutDashboard, Building2, Database, Zap, CreditCard, Activity, Settings } from 'lucide-react';



// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SuperAdminDashboard() {
    const [activeModule, setActiveModule] = useState<Module>('command');
    const [ghostMode, setGhostMode] = useState<{ active: boolean; schoolId: string | null; schoolName: string | null }>({
        active: false,
        schoolId: null,
        schoolName: null
    });
    const navItems = [
        { id: 'command', label: 'Command Center', icon: LayoutDashboard },
        { id: 'tenants', label: 'Tenant Manager', icon: Building2 },
        { id: 'finance', label: 'Platform Finance', icon: CreditCard },
        { id: 'health', label: 'System Health', icon: Activity },
        { id: 'explorer', label: 'Data Visualizer', icon: Database },
        { id: 'flags', label: 'Feature Flags', icon: Settings },
        { id: 'ghost', label: 'Ghost Mode', icon: Zap },
    ];

    const { isDarkMode } = useTheme();


    // Ghost Mode Handlers
    const handleActivateGhost = (schoolId: string, schoolName: string) => {
        setGhostMode({ active: true, schoolId, schoolName });
    };

    return (
        <>
            {ghostMode.active && ghostMode.schoolName && (
                <GhostModeBanner
                    schoolName={ghostMode.schoolName}
                    onExit={() => setGhostMode({ active: false, schoolId: null, schoolName: null })}
                />
            )}
            <div className={ghostMode.active ? 'pt-10' : ''}>
                <DashboardShell
                    title="Super Admin Console"
                    role="Platform Owner"
                    navItems={navItems}
                    activeModule={activeModule}
                    onModuleChange={setActiveModule}
                    user={{ name: 'System Overlord', email: 'root@sovereign.edu', avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff' }}
                >
                    <div className={`min-h-full transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
                        <div className="max-w-7xl mx-auto">
                            {activeModule === 'command' && <CommandCenter isDarkMode={isDarkMode} />}
                            {activeModule === 'tenants' && <TenantManager isDarkMode={isDarkMode} />}
                            {activeModule === 'finance' && <FinanceOverview isDarkMode={isDarkMode} />}
                            {activeModule === 'health' && <SystemHealth isDarkMode={isDarkMode} />}
                            {activeModule === 'flags' && <FeatureFlagManager isDarkMode={isDarkMode} />}
                            {activeModule === 'settings' && <SystemSettings />}
                            {activeModule === 'explorer' && (
                                <NebulaErrorBoundary>
                                    <DataExplorer isDarkMode={isDarkMode} />
                                </NebulaErrorBoundary>
                            )}
                            {activeModule === 'ghost' && (
                                <GhostModeModule isDarkMode={isDarkMode} onActivate={handleActivateGhost} />
                            )}
                        </div>
                    </div>
                </DashboardShell>
            </div>
        </>
    );
}
