import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Building2, Database, UserCog, Sun, Moon,
    Menu, X, LogOut, Activity, ChevronDown, User, Settings,
    Bell, Shield, ExternalLink, AlertTriangle
} from 'lucide-react';
import { UserRole } from '../../types'; // Adjust import path as needed

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type Module = 'command' | 'tenants' | 'explorer' | 'ghost' | 'overview' | 'academics' | 'staff' | 'students' | 'finance' | 'settings';

interface DashboardShellProps {
    title: string;
    role: UserRole | string; // Allow string for flexibility during refactor
    stats?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    activeModule?: Module;
    onModuleChange?: (module: Module) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS (internal to Shell to keep it self-contained as requested)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Header: React.FC<{
    title: string;
    role: string;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onLogout: () => void;
    onMenuClick: () => void;
    isMobile: boolean;
    actions?: React.ReactNode;
}> = ({ title, role, isDarkMode, onToggleTheme, onLogout, onMenuClick, isMobile, actions }) => {
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
                    <span className="mx-2 text-slate-300">/</span>
                    <span className={`font-medium ${textClass}`}>{title}</span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {actions && <div className="mr-2">{actions}</div>}

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
                        <span className={`text-sm font-medium hidden sm:block ${textClass}`}>{role}</span>
                        <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                            <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <p className={`text-sm font-medium ${textClass}`}>user@sovereign.edu</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{role}</p>
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

const Sidebar: React.FC<{
    role: string | UserRole;
    activeModule: Module;
    onModuleChange: (module: Module) => void;
    isDarkMode: boolean;
    isOpen: boolean;
    onClose: () => void;
    isMobile: boolean;
}> = ({ role, activeModule, onModuleChange, isDarkMode, isOpen, onClose, isMobile }) => {
    // Define nav items based on role
    const getNavItems = () => {
        // SUPER_ADMIN Links
        if (role === 'SUPER_ADMIN') {
            return [
                { id: 'command', label: 'Command Center', icon: LayoutDashboard },
                { id: 'tenants', label: 'Tenants', icon: Building2 },
                { id: 'explorer', label: 'Data Explorer', icon: Database },
                { id: 'ghost', label: 'Ghost Mode', icon: UserCog },
            ];
        }
        // SCHOOL_ADMIN Links
        if (role === 'SCHOOL_ADMIN') {
            return [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'academics', label: 'Academics', icon: Building2 }, // Placeholder icon
                { id: 'staff', label: 'Staff', icon: User },
                { id: 'students', label: 'Students', icon: UserCog },
                { id: 'finance', label: 'Finance', icon: Activity },
            ];
        }

        // Default fallback
        return [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        ];
    };

    const navItems = getNavItems();

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
                        onModuleChange(item.id as Module);
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
// MAIN SHELL COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const DashboardShell: React.FC<DashboardShellProps> = ({
    title,
    role,
    stats,
    actions,
    children,
    activeModule,
    onModuleChange
}) => {
    const [internalActiveModule, setInternalActiveModule] = useState<Module>(activeModule || (role === 'SUPER_ADMIN' ? 'command' : 'overview'));
    const isDarkMode = false; // LOCKED TO LIGHT MODE as per current status quo, or configurable
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Sync internal state with prop if provided
    useEffect(() => {
        if (activeModule) {
            setInternalActiveModule(activeModule);
        }
    }, [activeModule]);

    const handleModuleChange = (module: Module) => {
        setInternalActiveModule(module);
        if (onModuleChange) {
            onModuleChange(module);
        }
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = () => {
        // Basic logout handler, can be enhanced
        window.location.href = '/login';
        console.log('[SHELL] Logout');
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

            <div className="relative flex flex-col min-h-screen">
                <Header
                    title={title}
                    role={typeof role === 'string' ? role : 'User'}
                    isDarkMode={isDarkMode}
                    onToggleTheme={() => { /* Toggle logic */ }}
                    onLogout={handleLogout}
                    onMenuClick={() => setSidebarOpen(true)}
                    isMobile={isMobile}
                    actions={actions}
                />

                <div className="flex flex-1">
                    <Sidebar
                        role={role}
                        activeModule={internalActiveModule}
                        onModuleChange={handleModuleChange}
                        isDarkMode={isDarkMode}
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        isMobile={isMobile}
                    />

                    <main className="flex-1 p-4 lg:p-6 overflow-auto">
                        {stats && (
                            <div className="mb-6">
                                {stats}
                            </div>
                        )}
                        <div className={`rounded-2xl border min-h-[calc(100vh-140px)] ${contentBg}`}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
