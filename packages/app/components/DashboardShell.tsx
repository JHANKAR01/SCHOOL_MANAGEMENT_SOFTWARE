import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Building2, Database, UserCog, Sun, Moon,
    Menu, X, LogOut, Activity, ChevronDown, User, Settings,
    Bell, Search, ChevronRight, Command
} from 'lucide-react';
import { UserRole } from '../../../types';
import { useTheme } from '../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type Module = 'command' | 'tenants' | 'explorer' | 'ghost' | 'overview' | 'academics' | 'staff' | 'students' | 'finance' | 'settings' | 'health' | 'flags' | 'admissions' | 'system-admin' | 'approvals' | 'attendance' | 'risk' | 'results' | 'classrooms';

interface NavigationItem {
    id: Module;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
}

interface DashboardShellProps {
    title: string;
    role: UserRole | string;
    stats?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    activeModule?: Module;
    onModuleChange?: (module: Module) => void;
    navItems?: { id: string; label: string; icon: any; badge?: string }[];
    user?: { name: string; email: string; avatar?: string };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NotificationPopover: React.FC<{ isOpen: boolean; onClose: () => void; isDarkMode: boolean }> = ({ isOpen, onClose, isDarkMode }) => {
    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className={`absolute top-12 right-0 w-80 rounded-xl border shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} animate-in fade-in slide-in-from-top-2`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex justify-between items-center`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h4>
                    <span className="text-xs font-medium text-indigo-500">Mark all read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`p-4 border-b last:border-0 hover:bg-black/5 cursor-pointer ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                <div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>New Student Registration</p>
                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>A new student registration request has been received.</p>
                                    <p className="text-[10px] text-slate-400 mt-2">2 mins ago</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const Header: React.FC<{
    title: string;
    role: string;
    onLogout: () => void;
    onMenuClick: () => void;
    isMobile: boolean;
    actions?: React.ReactNode;
    user?: { name: string; email: string; avatar?: string };
}> = ({ title, role, onLogout, onMenuClick, isMobile, actions, user }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const bgClass = isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-200';
    const textClass = isDarkMode ? 'text-white' : 'text-slate-900';
    const iconClass = isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100';
    const searchBg = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600';

    return (
        <header className={`sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 py-3 border-b backdrop-blur-md ${bgClass}`}>
            <div className="flex items-center gap-4 flex-1">
                {isMobile && (
                    <button onClick={onMenuClick} className={`p-2 -ml-2 rounded-lg ${iconClass}`}>
                        <Menu className="w-5 h-5" />
                    </button>
                )}

                {/* Branding / Breadcrumb */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className={`font-bold text-xs tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>SOVEREIGN</span>
                        <div className="flex items-center gap-1 text-sm font-medium">
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>App</span>
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                            <span className={textClass}>{title}</span>
                        </div>
                    </div>
                </div>

                {/* Global Search */}
                <div className="hidden lg:flex items-center max-w-md w-full ml-8">
                    <div className={`relative w-full flex items-center px-3 py-2 rounded-lg border transition-all ${searchBg} focus-within:ring-2 focus-within:ring-indigo-500/50`}>
                        <Search className="w-4 h-4 mr-2 opacity-50" />
                        <input
                            type="text"
                            placeholder="Search (Cmd+K)"
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
                        />
                        <div className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300 text-slate-500'}`}>
                            ⌘K
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {actions && <div className="mr-2">{actions}</div>}

                <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${iconClass}`}>
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative">
                    <button onClick={() => setNotifOpen(!notifOpen)} className={`p-2 rounded-lg transition-colors relative ${iconClass} ${notifOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </button>
                    <NotificationPopover isOpen={notifOpen} onClose={() => setNotifOpen(false)} isDarkMode={isDarkMode} />
                </div>

                <div className="relative ml-2">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-all ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center p-0.5">
                            <img src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="User" className="w-full h-full rounded-full bg-slate-900 border-2 border-transparent" />
                        </div>
                        <div className="hidden sm:flex flex-col items-start pr-1">
                            <span className={`text-xs font-bold leading-none ${textClass}`}>{user?.name || role}</span>
                            <span className="text-[10px] text-slate-500 leading-none mt-1">Super User</span>
                        </div>
                        <ChevronDown className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                            <div className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <p className={`text-sm font-medium ${textClass}`}>{user?.email || 'user@sovereign.edu'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`} />
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Online</p>
                                    </div>
                                </div>
                                <div className="p-1">
                                    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <User className="w-4 h-4" /> Profile
                                    </button>
                                    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <Settings className="w-4 h-4" /> Settings
                                    </button>
                                </div>
                                <div className={`p-1 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
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
    isOpen: boolean;
    onClose: () => void;
    isMobile: boolean;
    onLogout: () => void;
    customNavItems?: { id: string; label: string; icon: any; badge?: string }[];
}> = ({ role, activeModule, onModuleChange, isOpen, onClose, isMobile, onLogout, customNavItems }) => {
    const { isDarkMode } = useTheme();

    const getNavItems = (): NavigationItem[] => {
        if (customNavItems) {
            return customNavItems as NavigationItem[];
        }
        if (role === 'SUPER_ADMIN') {
            return [
                { id: 'command', label: 'Command Center', icon: LayoutDashboard },
                { id: 'tenants', label: 'Tenants', icon: Building2 },
                { id: 'explorer', label: 'Data Explorer', icon: Database },
                { id: 'ghost', label: 'Ghost Mode', icon: UserCog, badge: 'New' },
            ];
        }
        if (role === 'SCHOOL_ADMIN') {
            return [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'academics', label: 'Academics', icon: Building2 },
                { id: 'staff', label: 'Staff', icon: User },
                { id: 'students', label: 'Students', icon: UserCog },
                { id: 'finance', label: 'Finance', icon: Activity },
            ];
        }
        if (role === 'PRINCIPAL') {
            return [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'approvals', label: 'Approvals', icon: Activity },
                { id: 'attendance', label: 'Attendance', icon: Building2 },
                { id: 'risk', label: 'Risk Monitor', icon: Activity },
                { id: 'results', label: 'Results', icon: Activity },
                { id: 'classrooms', label: 'Classrooms', icon: Building2 },
            ];
        }
        return [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }];
    };

    const navItems = getNavItems();

    const bgClass = isDarkMode ? 'bg-slate-950' : 'bg-white';
    const borderClass = isDarkMode ? 'border-slate-800' : 'border-slate-200';
    const labelClass = isDarkMode ? 'text-slate-500' : 'text-slate-400';

    const getItemClass = (isActive: boolean) => {
        if (isActive) {
            return isDarkMode
                ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500'
                : 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600';
        }
        return isDarkMode
            ? 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent';
    };

    const sidebarContent = (
        <nav className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* Main Group */}
            <div>
                <div className={`px-3 mb-2 text-xs font-bold uppercase tracking-widest ${labelClass}`}>
                    Platform
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onModuleChange(item.id as Module);
                                if (isMobile) onClose();
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-r-lg text-sm font-medium transition-all group ${getItemClass(activeModule === item.id)}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5 opacity-80 group-hover:opacity-100" />
                                {item.label}
                            </div>
                            {item.badge && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Placeholder for Future Group */}
            <div>
                <div className={`px-3 mb-2 text-xs font-bold uppercase tracking-widest ${labelClass}`}>
                    Preferences
                </div>
                <button
                    onClick={() => {
                        onModuleChange('settings');
                        if (isMobile) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Settings className="w-5 h-5" />
                    <span>System Settings</span>
                </button>
            </div>
        </nav>
    );

    // Mobile: Overlay sidebar with HIGHEST z-index
    if (isMobile) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-[100]">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className={`absolute left-0 top-0 bottom-0 w-72 flex flex-col ${bgClass} shadow-2xl transition-transform duration-300`}>
                    <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
                                <Command className="w-5 h-5 text-white" />
                            </div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Navigator</span>
                        </div>
                        <button onClick={onClose} className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {sidebarContent}
                    <div className="p-4 border-t border-slate-200/10">
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors rounded-lg">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop sidebar
    return (
        <aside className={`hidden lg:flex flex-col w-64 border-r ${bgClass} ${borderClass} h-[calc(100vh-65px)] sticky top-[65px]`}>
            {sidebarContent}
            <div className="p-4 border-t border-slate-200/10">
                {role !== 'SUPER_ADMIN' && (
                    <div className={`p-4 rounded-xl mb-2 ${isDarkMode ? 'bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-white/5' : 'bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100'}`}>
                        <h4 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>Pro Feature</h4>
                        <p className={`text-xs mb-3 ${isDarkMode ? 'text-slate-400' : 'text-indigo-600/80'}`}>Unlock advanced analytics with Pro plan.</p>
                        <button className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
                            Upgrade Now
                        </button>
                    </div>
                )}
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors rounded-lg">
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>
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
    onModuleChange,
    navItems,
    user
}) => {
    const { isDarkMode } = useTheme();
    const [internalActiveModule, setInternalActiveModule] = useState<Module>(activeModule || (role === 'SUPER_ADMIN' ? 'command' : 'overview'));
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
        // 1. Clear Critical Auth Tokens
        localStorage.removeItem('sovereign_token');
        localStorage.removeItem('sovereign_user_session');

        // 2. Force Hard Redirect to Login
        window.location.href = '/login';
    };

    const contentBg = isDarkMode
        ? 'bg-slate-900/40 border-slate-800'
        : 'bg-white/70 border-slate-200';

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 font-sans' : 'bg-slate-50 font-sans'}`}>
            {/* Background Orbs (Subtler for Production) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                {isDarkMode && (
                    <>
                        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] bg-indigo-900/20" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-violet-900/10" />
                    </>
                )}
            </div>

            <div className="relative flex flex-col min-h-screen">
                <Header
                    title={title}
                    role={typeof role === 'string' ? role : 'User'}
                    onLogout={handleLogout}
                    onMenuClick={() => setSidebarOpen(true)}
                    isMobile={isMobile}
                    actions={actions}
                    user={user}
                />

                <div className="flex flex-1 pt-0 items-start">
                    <Sidebar
                        role={role}
                        activeModule={internalActiveModule}
                        onModuleChange={handleModuleChange}
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        isMobile={isMobile}
                        onLogout={handleLogout}
                        customNavItems={navItems}
                    />

                    <main className="flex-1 p-4 lg:p-6 overflow-y-auto h-[calc(100vh-65px)]">
                        <div className="max-w-7xl mx-auto flex flex-col h-full">
                            {stats && (
                                <div className="mb-6 animate-fade-in-up">
                                    {stats}
                                </div>
                            )}
                            <div className={`flex-1 rounded-2xl border p-6 shadow-sm backdrop-blur-sm ${contentBg}`}>
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
