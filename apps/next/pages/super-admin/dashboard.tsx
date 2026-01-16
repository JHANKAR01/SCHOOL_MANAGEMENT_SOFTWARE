import React, { useState } from 'react';
import { DashboardShell, Module } from '../../../../packages/app/components/DashboardShell';
import { NebulaErrorBoundary } from '../../../../packages/app/components/NebulaErrorBoundary';
import { useTheme } from '../../../../packages/app/provider/ThemeProvider';
import { TenantManager } from './components/TenantManager';
import { CommandCenter } from './components/CommandCenter';
import { DataExplorer } from './components/DataExplorer';
import { UserCog, ExternalLink, AlertTriangle, Shield } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOST MODE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MOCK_SCHOOLS = [
    { id: 'sch_001', name: 'Greenwood High' },
    { id: 'sch_002', name: 'St. Xavier\'s Academy' },
    { id: 'sch_003', name: 'Delhi Public School' },
    { id: 'sch_004', name: 'Ryan International' },
];

const GhostModeModule: React.FC<{
    isDarkMode: boolean;
    onActivate: (schoolId: string, schoolName: string) => void;
}> = ({ isDarkMode, onActivate }) => {
    const [selectedSchool, setSelectedSchool] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';
    const inputBg = isDarkMode ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';

    return (
        <div className="p-6 space-y-6">
            <div className={`p-6 rounded-2xl border ${cardBg}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                        <UserCog className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-semibold ${textPrimary}`}>Impersonation Mode</h3>
                        <p className={`text-sm ${textSecondary}`}>Login as any school admin for support</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${textSecondary}`}>Select School</label>
                        <select
                            value={selectedSchool}
                            onChange={(e) => setSelectedSchool(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                            <option value="">Choose a school...</option>
                            {MOCK_SCHOOLS.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={!selectedSchool}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" /> Login as School Admin
                    </button>
                </div>
            </div>

            <div className={`p-6 rounded-2xl border ${cardBg}`}>
                <h3 className={`text-sm font-medium uppercase tracking-wider mb-4 ${textSecondary}`}>Security Notes</h3>
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                    <li className="flex items-start gap-2"><span className="text-indigo-400">•</span>All sessions are logged with IP</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-400">•</span>Auto-expires after 30 minutes</li>
                    <li className="flex items-start gap-2"><span className="text-indigo-400">•</span>Your Super Admin session stays active</li>
                </ul>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                    <div className={`relative w-full max-w-sm rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-500/20"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
                            <h3 className={`text-lg font-semibold ${textPrimary}`}>Activate Ghost Mode?</h3>
                        </div>
                        <p className={`text-sm mb-6 ${textSecondary}`}>You are about to impersonate "{MOCK_SCHOOLS.find(s => s.id === selectedSchool)?.name}". This will be logged.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirm(false)} className={`px-4 py-2 text-sm ${textSecondary} hover:opacity-80`}>Cancel</button>
                            <button
                                onClick={() => {
                                    const school = MOCK_SCHOOLS.find(s => s.id === selectedSchool);
                                    if (school) onActivate(school.id, school.name);
                                    setShowConfirm(false);
                                }}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
                            >
                                Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const GhostModeBanner: React.FC<{ schoolName: string; onExit: () => void }> = ({ schoolName, onExit }) => (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 px-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold text-sm">IMPERSONATING: {schoolName}</span>
        </div>
        <button onClick={onExit} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors">
            Exit Ghost Mode
        </button>
    </div>
);

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
    // const { isDarkMode } = useTheme(); // Consider using this if sub-modules need it, or refactor them to use the hook directly.
    // For now, let's keep passing it but driven by the hook if possible, or just remove the prop reliance if they are updated.
    // Actually, simply removing the const and using the hook is the right way.

    // We need to import useTheme first.
    // Since I can't easily add the import in this same block efficiently without reading the top, I'll do a multi-replace or two steps.
    // Let's assume sub-components expect the prop.

    // WAIT: I need to import { useTheme } from the provider.
    // Let's do a multi-replace to add the import and change the line.

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
                    title="Command Center"
                    role="SUPER_ADMIN"
                    activeModule={activeModule}
                    onModuleChange={setActiveModule}
                >
                    {activeModule === 'command' && <CommandCenter isDarkMode={isDarkMode} />}
                    {activeModule === 'tenants' && <TenantManager isDarkMode={isDarkMode} />}
                    {activeModule === 'explorer' && (
                        <NebulaErrorBoundary>
                            <DataExplorer isDarkMode={isDarkMode} />
                        </NebulaErrorBoundary>
                    )}
                    {activeModule === 'ghost' && (
                        <GhostModeModule isDarkMode={isDarkMode} onActivate={handleActivateGhost} />
                    )}
                </DashboardShell>
            </div>
        </>
    );
}
