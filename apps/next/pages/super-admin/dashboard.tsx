import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Building2, Database, UserCog, Sun, Moon, Menu, X, LogOut,
    Activity, ChevronDown, User, Settings, Bell, Shield, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { TenantManager } from './components/TenantManager';
import { CommandCenter } from './components/CommandCenter';
import { DataExplorer } from './components/DataExplorer';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type Module = 'command' | 'tenants' | 'explorer' | 'ghost';

interface GhostModeState {
    active: boolean;
    schoolId: string | null;
    schoolName: string | null;
}

const MOCK_SCHOOLS = [
    { id: 'sch_001', name: 'Greenwood High' },
    { id: 'sch_002', name: 'St. Xavier\'s Academy' },
    { id: 'sch_003', name: 'Delhi Public School' },
    { id: 'sch_004', name: 'Ryan International' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOST MODE COMPONENT (Inline to avoid z-index issues)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

            {/* Confirm Modal - Lower z-index than mobile sidebar */}
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOST MODE BANNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
// HEADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Header: React.FC<{
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onLogout: () => void;
    onMenuClick: () => void;
    isMobile: boolean;
}> = ({ isDarkMode, onToggleTheme, onLogout, onMenuClick, isMobile }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const bgClass = isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-slate-200';
    const textClass = isDarkMode ? 'text-white' : 'text-slate-900';
    const iconClass = isDarkMode ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

    return (
        <header className={`sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 py-3 border-b backdrop-blur-xl ${bgClass}`}>
            <div className="flex items-center gap-3">
                {isMobile && (
                    <button onClick={onMenuClick} className={`p-2 -ml-2 rounded-lg ${iconClass}`}>
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-bold text-sm ${textClass}`}>
                        SOVEREIGN<span className="text-indigo-500 ml-1">CONTROL</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button onClick={onToggleTheme} className={`p-2 rounded-lg transition-colors ${iconClass}`}>
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className={`p-2 rounded-lg transition-colors relative ${iconClass}`}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <div className="relative ml-1">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <span className={`text-sm font-medium hidden sm:block ${textClass}`}>Super Admin</span>
                        <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                            <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <p className={`text-sm font-medium ${textClass}`}>super@sovereign.edu</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Platform Owner</p>
                                </div>
                                <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <Settings className="w-4 h-4" /> Settings
                                </button>
                                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIDEBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Sidebar: React.FC<{
    activeModule: Module;
    onModuleChange: (module: Module) => void;
    isDarkMode: boolean;
    isOpen: boolean;
    onClose: () => void;
    isMobile: boolean;
}> = ({ activeModule, onModuleChange, isDarkMode, isOpen, onClose, isMobile }) => {
    const navItems: { id: Module; label: string; icon: React.ComponentType<any> }[] = [
        { id: 'command', label: 'Command Center', icon: LayoutDashboard },
        { id: 'tenants', label: 'Tenants', icon: Building2 },
        { id: 'explorer', label: 'Data Explorer', icon: Database },
        { id: 'ghost', label: 'Ghost Mode', icon: UserCog },
    ];

    const bgClass = isDarkMode ? 'bg-slate-950' : 'bg-white';
    const borderClass = isDarkMode ? 'border-slate-800' : 'border-slate-200';
    const textClass = isDarkMode ? 'text-white' : 'text-slate-900';

    const getItemClass = (isActive: boolean) => {
        if (isActive) {
            return isDarkMode
                ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200';
        }
        return isDarkMode
            ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent';
    };

    const sidebarContent = (
        <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        onModuleChange(item.id);
                        if (isMobile) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${getItemClass(activeModule === item.id)}`}
                >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                </button>
            ))}
        </nav>
    );

    // Mobile: Overlay sidebar with HIGHEST z-index
    if (isMobile) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-[100]">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className={`absolute left-0 top-0 bottom-0 w-72 flex flex-col ${bgClass} shadow-2xl`}>
                    <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
                        <span className={`font-bold ${textClass}`}>Navigation</span>
                        <button onClick={onClose} className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {sidebarContent}
                </div>
            </div>
        );
    }

    // Desktop sidebar
    return (
        <aside className={`hidden lg:flex flex-col w-60 border-r ${bgClass}/50 ${borderClass}`}>
            {sidebarContent}
        </aside>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function SuperAdminDashboard() {
    const [activeModule, setActiveModule] = useState<Module>('command');
    const isDarkMode = false; // LOCKED TO LIGHT MODE
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [ghostMode, setGhostMode] = useState<GhostModeState>({ active: false, schoolId: null, schoolName: null });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = () => console.log('[AUTH] Logout');
    const handleActivateGhost = (schoolId: string, schoolName: string) => {
        setGhostMode({ active: true, schoolId, schoolName });
    };

    const contentBg = isDarkMode
        ? 'bg-slate-900/50 border-slate-800'
        : 'bg-white/70 border-slate-200';

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950' : 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'}`} />
                <div className={`absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] ${isDarkMode ? 'bg-indigo-600/15' : 'bg-indigo-400/10'}`} />
                <div className={`absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] ${isDarkMode ? 'bg-violet-600/10' : 'bg-violet-400/8'}`} />
            </div>

            {/* Ghost Mode Banner */}
            {ghostMode.active && ghostMode.schoolName && (
                <GhostModeBanner schoolName={ghostMode.schoolName} onExit={() => setGhostMode({ active: false, schoolId: null, schoolName: null })} />
            )}

            <div className={`relative flex flex-col min-h-screen ${ghostMode.active ? 'pt-10' : ''}`}>
                <Header isDarkMode={isDarkMode} onToggleTheme={() => { }} onLogout={handleLogout} onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} />

                <div className="flex flex-1">
                    <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} isDarkMode={isDarkMode} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

                    <main className="flex-1 p-4 lg:p-6 overflow-auto">
                        <div className={`rounded-2xl border min-h-[calc(100vh-120px)] ${contentBg}`}>
                            {activeModule === 'command' && <CommandCenter isDarkMode={isDarkMode} />}
                            {activeModule === 'tenants' && <TenantManager isDarkMode={isDarkMode} />}
                            {activeModule === 'explorer' && <DataExplorer isDarkMode={isDarkMode} />}
                            {activeModule === 'ghost' && <GhostModeModule isDarkMode={isDarkMode} onActivate={handleActivateGhost} />}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
