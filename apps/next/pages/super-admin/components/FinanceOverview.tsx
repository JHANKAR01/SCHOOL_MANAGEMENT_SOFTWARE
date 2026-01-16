import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';

interface FinanceSummary {
    mrr: number;
    arr: number;
    growth: number;
    totalVolume: number;
}

interface Transaction {
    id: string;
    school: string;
    amount: number;
    date: string;
    reason: string;
}

interface FinanceOverviewProps {
    isDarkMode: boolean;
}

const SkeletonFinance = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
        </div>
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
    </div>
);

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
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [failures, setFailures] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resSummary, resHistory, resFailures] = await Promise.all([
                    fetch('/api/super-admin/finance/summary'),
                    fetch('/api/super-admin/finance/history'),
                    fetch('/api/super-admin/finance/failed-transactions')
                ]);
                setSummary(await resSummary.json());
                setHistory(await resHistory.json());
                setFailures(await resFailures.json());
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading || !summary) return <SkeletonFinance />;

    return (
        <div className="p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium uppercase tracking-wider ${textSecondary}`}>Monthly Recurring</p>
                            <h3 className={`text-3xl font-bold mt-1 ${textPrimary}`}>₹{(summary.mrr / 100000).toFixed(1)}L</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500"><DollarSign className="w-6 h-6" /></div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" /> {summary.growth}% vs last month
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium uppercase tracking-wider ${textSecondary}`}>Annual Run Rate</p>
                            <h3 className={`text-3xl font-bold mt-1 ${textPrimary}`}>₹{(summary.arr / 10000000).toFixed(2)} Cr</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500"><CreditCard className="w-6 h-6" /></div>
                    </div>
                    <p className={`text-sm ${textSecondary}`}>Projected based on current MRR</p>
                </div>

                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium uppercase tracking-wider ${textSecondary}`}>Failed (24h)</p>
                            <h3 className="text-3xl font-bold mt-1 text-red-500">{failures.length}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><AlertCircle className="w-6 h-6" /></div>
                    </div>
                    <p className={`text-sm ${textSecondary}`}>Action required immediately</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border ${cardBg}`}>
                    <h3 className={`text-lg font-bold mb-6 ${textPrimary}`}>Revenue Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} vertical={false} />
                                <XAxis dataKey="month" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 100000}L`} />
                                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Failed Transactions List */}
                <div className={`p-6 rounded-2xl border overflow-hidden flex flex-col ${cardBg}`}>
                    <h3 className={`text-lg font-bold mb-4 ${textPrimary} flex items-center gap-2`}>
                        <AlertCircle className="w-5 h-5 text-red-500" /> Payment Alerts
                    </h3>
                    <div className="flex-1 overflow-auto -mx-2 px-2 space-y-3">
                        {failures.map(tx => (
                            <div key={tx.id} className={`p-3 rounded-xl border border-red-500/10 bg-red-500/5`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-medium ${textPrimary}`}>{tx.school}</span>
                                    <span className="text-sm font-bold text-red-500">₹{tx.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-red-400/80">
                                    <span>{tx.reason}</span>
                                    <span>{new Date(tx.date).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
