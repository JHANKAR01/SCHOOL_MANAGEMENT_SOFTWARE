import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, CartesianGrid } from 'recharts';
import { Server, Database, HardDrive, Activity } from 'lucide-react';

interface SystemHealthData {
    apiLatency: number;
    dbLoad: number;
    storageUsage: number;
    activeConnections: number;
    errorRate: number;
}

interface Log {
    id: number;
    level: string;
    message: string;
    timestamp: string;
    service: string;
}

interface SystemHealthProps {
    isDarkMode: boolean;
}

import { SkeletonSystemHealth } from './Skeleton';

// ... existing code ...

export const SystemHealth: React.FC<SystemHealthProps> = ({ isDarkMode }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [health, setHealth] = useState<SystemHealthData | null>(null);
    const [latencyHistory, setLatencyHistory] = useState<any[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    useEffect(() => {
        setIsMounted(true);
        const load = async () => {
            try {
                const [h, l, lg] = await Promise.all([
                    fetch('/api/super-admin/system/health'),
                    fetch('/api/super-admin/system/latency'),
                    fetch('/api/super-admin/system/logs')
                ]);

                if (h.ok) {
                    setHealth(await h.json());
                }

                if (l.ok) {
                    const latencyData = await l.json();
                    setLatencyHistory(Array.isArray(latencyData) ? latencyData : []);
                }

                if (lg.ok) {
                    const logsData = await lg.json();
                    setLogs(Array.isArray(logsData) ? logsData : []);
                }
            } catch (e) {
                console.error("System health fetch failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    if (!isMounted || isLoading || !health) return <SkeletonSystemHealth />;

    const getLoadColor = (val: number) => {
        if (val > 80) return '#ef4444'; // red
        if (val > 60) return '#f59e0b'; // orange
        return '#10b981'; // emerald
    };

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Activity className="w-5 h-5" /></div>
                        <span className={`text-sm font-medium ${textSecondary}`}>API Latency</span>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textPrimary}`}>{health.apiLatency}ms</div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min(health.apiLatency, 100)}%` }} />
                    </div>
                </div>

                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500"><Database className="w-5 h-5" /></div>
                        <span className={`text-sm font-medium ${textSecondary}`}>DB Load</span>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textPrimary}`}>{health.dbLoad}%</div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 mt-3 rounded-full overflow-hidden">
                        <div className="h-full" style={{ width: `${health.dbLoad}%`, backgroundColor: getLoadColor(health.dbLoad) }} />
                    </div>
                </div>

                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Server className="w-5 h-5" /></div>
                        <span className={`text-sm font-medium ${textSecondary}`}>Active Conn.</span>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textPrimary}`}>{health.activeConnections}</div>
                    <p className="text-xs text-slate-500 mt-2">Max capacity: 5000</p>
                </div>

                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><HardDrive className="w-5 h-5" /></div>
                        <span className={`text-sm font-medium ${textSecondary}`}>Storage</span>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textPrimary}`}>{health.storageUsage}%</div>
                    <p className="text-xs text-slate-500 mt-2">2.4 TB free</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latency Graph */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border ${cardBg}`}>
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 ${textSecondary}`}>Real-time Latency (Last 60s)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={latencyHistory}>
                                <defs>
                                    <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderRadius: '12px', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                                    itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                                />
                                <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLat)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Logs */}
                <div className={`p-6 rounded-2xl border overflow-hidden flex flex-col ${cardBg}`}>
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textSecondary}`}>System Logs</h3>
                    <div className="flex-1 overflow-auto space-y-3 font-mono text-xs">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-2">
                                <span className={textSecondary}>{log.timestamp}</span>
                                <span className={`font-bold ${log.level === 'error' ? 'text-red-500' : log.level === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    [{log.level.toUpperCase()}]
                                </span>
                                <span className={textPrimary}>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
