import React from 'react';
import {
    DollarSign, Building2, Server, AlertTriangle, Rocket, Radio, Lock,
    TrendingUp, TrendingDown, Activity, Clock,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const METRICS = {
    totalRevenue: 4567890,
    revenueChange: 12.5,
    activeTenants: 12,
    tenantsChange: 2,
    dbLoad: 34,
    criticalAlerts: 2,
    topSchool: { name: 'DPS Delhi', revenue: 1250000 },
};

const SCHOOLS = [
    { id: 'sch_001', name: 'Greenwood High', slug: 'greenwood', status: 'healthy' as const },
    { id: 'sch_002', name: 'St. Xavier\'s', slug: 'xavier', status: 'healthy' as const },
    { id: 'sch_003', name: 'Delhi Public School', slug: 'dps', status: 'warning' as const },
    { id: 'sch_004', name: 'Ryan International', slug: 'ryan', status: 'critical' as const },
    { id: 'sch_005', name: 'Kendriya Vidyalaya', slug: 'kv', status: 'healthy' as const },
    { id: 'sch_006', name: 'Army Public', slug: 'aps', status: 'healthy' as const },
];

const RECENT_EVENTS = [
    { id: 1, type: 'error', message: 'Ryan International: Payment gateway timeout', time: '5 min ago' },
    { id: 2, type: 'warning', message: 'DPS Delhi: High memory usage (87%)', time: '12 min ago' },
    { id: 3, type: 'success', message: 'Greenwood: Monthly backup complete', time: '1 hr ago' },
];

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const statusColors = {
    healthy: { dot: 'bg-emerald-400', glow: 'shadow-emerald-500/30' },
    warning: { dot: 'bg-amber-400', glow: 'shadow-amber-500/30' },
    critical: { dot: 'bg-red-400 animate-pulse', glow: 'shadow-red-500/30' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAT CARD (Theme-aware)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    isDarkMode: boolean;
    trend?: { value: number; isUp: boolean };
    subtext?: string;
    status?: 'default' | 'success' | 'warning' | 'critical';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, isDarkMode, trend, subtext, status = 'default' }) => {
    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
    const labelColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const subtextColor = isDarkMode ? 'text-slate-500' : 'text-slate-400';
    const iconBg = isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200';

    const statusColors = {
        default: isDarkMode ? 'text-white' : 'text-slate-900',
        success: 'text-teal-500',
        warning: 'text-amber-500',
        critical: 'text-red-500',
    };

    return (
        <div className={`relative p-5 rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${cardBg}`}>
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-medium uppercase tracking-wider ${labelColor}`}>{label}</span>
                    <div className={`p-2 rounded-xl border ${iconBg}`}>{icon}</div>
                </div>
                <div className={`text-3xl font-bold font-mono ${statusColors[status]}`}>{value}</div>
                <div className="flex items-center justify-between mt-2">
                    {subtext && <span className={`text-xs ${subtextColor}`}>{subtext}</span>}
                    {trend && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${trend.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend.value}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMAND CENTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CommandCenterProps {
    isDarkMode: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ isDarkMode }) => {
    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
    const headingColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';
    const textPrimary = isDarkMode ? 'text-slate-200' : 'text-slate-800';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const itemBg = isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300';

    return (
        <div className="p-6 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard isDarkMode={isDarkMode} label="Total Revenue" value={formatCurrency(METRICS.totalRevenue)} icon={<DollarSign className="w-5 h-5 text-teal-500" />} trend={{ value: METRICS.revenueChange, isUp: true }} subtext={`Top: ${METRICS.topSchool.name}`} status="success" />
                <StatCard isDarkMode={isDarkMode} label="Active Tenants" value={METRICS.activeTenants} icon={<Building2 className="w-5 h-5 text-indigo-500" />} trend={{ value: METRICS.tenantsChange, isUp: true }} subtext="Schools connected" />
                <StatCard isDarkMode={isDarkMode} label="Database Load" value={`${METRICS.dbLoad}%`} icon={<Server className="w-5 h-5 text-slate-400" />} subtext="Avg response: 45ms" status={METRICS.dbLoad > 80 ? 'critical' : METRICS.dbLoad > 60 ? 'warning' : 'default'} />
                <StatCard isDarkMode={isDarkMode} label="Critical Alerts" value={METRICS.criticalAlerts} icon={<AlertTriangle className="w-5 h-5 text-red-500" />} subtext="Requires attention" status={METRICS.criticalAlerts > 0 ? 'critical' : 'success'} />
            </div>

            {/* Health Matrix + Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`lg:col-span-2 p-5 rounded-2xl border ${cardBg}`}>
                    <h3 className={`text-sm font-medium uppercase tracking-wider mb-4 ${headingColor}`}>Tenant Health Matrix</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SCHOOLS.map((school) => (
                            <div key={school.id} className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${itemBg}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${statusColors[school.status].dot}`} />
                                    <span className={`text-xs font-mono ${textSecondary}`}>{school.slug}</span>
                                </div>
                                <p className={`text-sm font-medium truncate ${textPrimary}`}>{school.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-medium uppercase tracking-wider ${headingColor}`}>Recent Activity</h3>
                        <Activity className={`w-4 h-4 ${textSecondary}`} />
                    </div>
                    <div className="space-y-3">
                        {RECENT_EVENTS.map((event) => (
                            <div key={event.id} className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${event.type === 'error' ? 'bg-red-400' : event.type === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${textPrimary}`}>{event.message}</p>
                                    <p className={`text-xs flex items-center gap-1 ${textSecondary}`}><Clock className="w-3 h-3" />{event.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={`p-5 rounded-2xl border ${cardBg}`}>
                <h3 className={`text-sm font-medium uppercase tracking-wider mb-4 ${headingColor}`}>Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 transition-all">
                        <Rocket className="w-4 h-4" /> Deploy New School
                    </button>
                    <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}>
                        <Radio className="w-4 h-4" /> Global Broadcast
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-all">
                        <Lock className="w-4 h-4" /> System Lockdown
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
