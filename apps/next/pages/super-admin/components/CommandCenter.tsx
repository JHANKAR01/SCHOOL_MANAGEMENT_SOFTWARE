import React, { useState, useEffect } from 'react';
import {
    DollarSign, Building2, Server, AlertTriangle, Rocket, Radio, Lock,
    TrendingUp, TrendingDown, Activity, Clock,
} from 'lucide-react';
import { getSuperAdminData } from '../../../../../packages/app/api/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & MOCK DATA (Events are still mock as no API exists yet)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RECENT_EVENTS = [
    { id: 1, type: 'error', message: 'Ryan International: Payment gateway timeout', time: '5 min ago' },
    { id: 2, type: 'warning', message: 'DPS Delhi: High memory usage (87%)', time: '12 min ago' },
    { id: 3, type: 'success', message: 'Greenwood: Monthly backup complete', time: '1 hr ago' },
];

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const statusColors = {
    ACTIVE: { dot: 'bg-emerald-400', glow: 'shadow-emerald-500/30' },
    INACTIVE: { dot: 'bg-red-400', glow: 'shadow-red-500/30' },
    warning: { dot: 'bg-amber-400', glow: 'shadow-amber-500/30' },
    default: { dot: 'bg-slate-400', glow: 'shadow-slate-500/30' }
};
const getStatusColor = (status: string) => (statusColors as any)[status] || statusColors.default;

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

    const statusTextColors = {
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
                <div className={`text-3xl font-bold font-mono ${statusTextColors[status]}`}>{value}</div>
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

import { SkeletonCommandCenter } from './Skeleton';

export const CommandCenter: React.FC<CommandCenterProps> = ({ isDarkMode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [schools, setSchools] = useState<any[]>([]);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                // Fetch stats for KPIs and tenants for the Health Matrix
                const [statsData, tenantsData] = await Promise.all([
                    getSuperAdminData('/stats'),
                    getSuperAdminData('/tenants')
                ]);

                setStats(statsData);
                setSchools(Array.isArray(tenantsData) ? tenantsData.slice(0, 9) : []); // Show top 9 in matrix
            } catch (error) {
                console.error('Failed to load command center metrics', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadMetrics();
    }, []);

    if (isLoading || !stats) return <SkeletonCommandCenter />;

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
    const headingColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';
    const textPrimary = isDarkMode ? 'text-slate-200' : 'text-slate-800';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const itemBg = isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300';

    const annualRunRate = stats.revenue * 12;

    return (
        <div className="p-6 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard isDarkMode={isDarkMode} label="Total Revenue" value={formatCurrency(stats.revenue)} icon={<DollarSign className="w-5 h-5 text-teal-500" />} trend={{ value: 12.5, isUp: true }} subtext={`ARR: ₹${(annualRunRate / 10000000).toFixed(2)}Cr`} status="success" />
                <StatCard isDarkMode={isDarkMode} label="Active Tenants" value={stats.schools} icon={<Building2 className="w-5 h-5 text-indigo-500" />} trend={{ value: 1, isUp: true }} subtext="Schools connected" />
                <StatCard isDarkMode={isDarkMode} label="Total Students" value={stats.students.toLocaleString()} icon={<Server className="w-5 h-5 text-slate-400" />} subtext="Across all schools" status="default" />
                <StatCard isDarkMode={isDarkMode} label="System Health" value="99.9%" icon={<AlertTriangle className="w-5 h-5 text-emerald-500" />} subtext="Operational" status="success" />
            </div>

            {/* Health Matrix + Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`lg:col-span-2 p-5 rounded-2xl border ${cardBg}`}>
                    <h3 className={`text-sm font-medium uppercase tracking-wider mb-4 ${headingColor}`}>Tenant Health Matrix</h3>
                    {schools.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {schools.map((school) => (
                                <div key={school.id} className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${itemBg}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(school.status).dot}`} />
                                        <span className={`text-xs font-mono ${textSecondary} truncate`}>{school.region}</span>
                                    </div>
                                    <p className={`text-sm font-medium truncate ${textPrimary}`}>{school.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-10 ${textSecondary}`}>No active tenants found.</div>
                    )}
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
