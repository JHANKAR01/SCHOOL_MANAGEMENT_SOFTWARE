import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { getSuperAdminData } from '../../../../../packages/app/api/client';

interface Stats {
    schools: number;
    students: number;
    revenue: number;
    failedPayments: number;
}

interface ChartData {
    name: string;
    value: number;
}

interface FinanceOverviewProps {
    isDarkMode: boolean;
}

import { SkeletonFinanceOverview } from './Skeleton';

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={`p-3 rounded-xl border backdrop-blur-md shadow-xl ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-white/80 border-slate-200 text-slate-900'}`}>
                <p className="text-xs font-semibold mb-1">{label}</p>
                <p className="text-sm font-mono text-indigo-500">
                    ₹{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({ isDarkMode }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [history, setHistory] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    useEffect(() => {
        setIsMounted(true);
        const loadData = async () => {
            try {
                const [statsData, chartData] = await Promise.all([
                    getSuperAdminData('/stats'),
                    getSuperAdminData('/finance')
                ]);

                setStats(statsData);
                setHistory(Array.isArray(chartData) ? chartData : []);
            } catch (e) {
                console.error("Failed to load finance data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (!isMounted || isLoading || !stats) return <SkeletonFinanceOverview />;

    // Derived metrics
    const annualRunRate = stats.revenue * 12; // Simple projection
    // Mock growth for now as we don't have historical comparison in /stats API yet
    const growth = 12.5;

    // Sort history chronologically
    const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.name).getTime();
        const dateB = new Date(b.name).getTime();
        return isNaN(dateA) || isNaN(dateB) ? 0 : dateA - dateB;
    });

    const formatYAxis = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
        return `₹${value}`;
    };

    return (
        <div className="p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium uppercase tracking-wider ${textSecondary}`}>Monthly Revenue</p>
                            <h3 className={`text-3xl font-bold mt-1 ${textPrimary}`}>₹{(stats.revenue / 100000).toFixed(1)}L</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500"><DollarSign className="w-6 h-6" /></div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" /> {growth}% vs last month
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium uppercase tracking-wider ${textSecondary}`}>Annual Run Rate</p>
                            <h3 className={`text-3xl font-bold mt-1 ${textPrimary}`}>₹{(annualRunRate / 10000000).toFixed(2)} Cr</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500"><CreditCard className="w-6 h-6" /></div>
                    </div>
                    <p className={`text-sm ${textSecondary}`}>Projected based on current MRR</p>
                </div>

                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium uppercase tracking-wider ${textSecondary}`}>Failed Payments</p>
                            <h3 className="text-3xl font-bold mt-1 text-red-500">{stats.failedPayments}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><AlertCircle className="w-6 h-6" /></div>
                    </div>
                    <p className={`text-sm ${textSecondary}`}>Pending {'>'} 30 days</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border ${cardBg}`}>
                    <h3 className={`text-lg font-bold mb-6 ${textPrimary}`}>Revenue Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sortedHistory}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} vertical={false} />
                                <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Failed Transactions List (Placeholder as specific list not yet in API) */}
                <div className={`p-6 rounded-2xl border overflow-hidden flex flex-col ${cardBg}`}>
                    <h3 className={`text-lg font-bold mb-4 ${textPrimary} flex items-center gap-2`}>
                        <AlertCircle className="w-5 h-5 text-red-500" /> Payment Alerts
                    </h3>
                    {stats.failedPayments > 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <AlertCircle className="w-12 h-12 text-red-500/50 mb-3" />
                            <p className={`font-medium ${textPrimary}`}>{stats.failedPayments} invoices require attention.</p>
                            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                                View Invoices
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 opacity-50">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className={textSecondary}>All payments settled.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
