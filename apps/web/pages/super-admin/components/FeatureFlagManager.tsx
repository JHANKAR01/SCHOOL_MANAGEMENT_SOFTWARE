import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

interface FeatureFlag {
    key: string;
    label: string;
    enabled: boolean;
    description: string;
    isCritical?: boolean;
}

interface FeatureFlagManagerProps {
    isDarkMode: boolean;
}

import { SkeletonFeatureFlagManager } from './Skeleton';

// ... existing code ...

export const FeatureFlagManager: React.FC<FeatureFlagManagerProps> = ({ isDarkMode }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingFlag, setPendingFlag] = useState<FeatureFlag | null>(null);

    const cardBg = isDarkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    useEffect(() => {
        setIsMounted(true);
        const fetchFlags = async () => {
            try {
                const res = await fetch('/api/super-admin/flags');
                if (res.ok) {
                    const data = await res.json();
                    setFlags(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to fetch flags:', error);
                setFlags([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFlags();
    }, []);

    const handleToggle = async (flag: FeatureFlag) => {
        setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: !f.enabled } : f)); // Optimistic
        try {
            await fetch(`/api/super-admin/flags/${flag.key}/toggle`, { method: 'POST' });
        } catch (e) {
            console.error('Toggle failed', e);
            setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: !f.enabled } : f)); // Revert
        }
    };

    const confirmToggle = (flag: FeatureFlag) => {
        if (flag.isCritical) {
            setPendingFlag(flag);
        } else {
            handleToggle(flag);
        }
    };

    if (!isMounted || isLoading) return <SkeletonFeatureFlagManager />;
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                    <Shield className="w-6 h-6 text-indigo-500" />
                    Feature Control Matrix
                </h2>
                <p className={textSecondary}>Manage global platform capabilities and kill-switches.</p>
            </div>

            <div className="space-y-4">
                {flags.map(flag => (
                    <div key={flag.key} className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:shadow-md ${cardBg}`}>
                        <div className="flex-1 pr-8">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className={`font-medium ${textPrimary}`}>{flag.label}</h3>
                                {flag.isCritical && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                                        Critical
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${flag.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                    {flag.enabled ? 'Active' : 'Disabled'}
                                </span>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>{flag.description}</p>
                        </div>

                        <button
                            onClick={() => confirmToggle(flag)}
                            className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${flag.enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`${flag.enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-5 h-5 transform bg-white rounded-full transition-transform shadow`} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {pendingFlag && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPendingFlag(null)} />
                    <div className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${textPrimary}`}>Confirm Critical Change</h3>
                                <p className={`text-sm ${textSecondary}`}>You are modifying a system-level control.</p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border mb-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <p className={`font-mono text-sm ${textPrimary}`}>Flag: <span className="text-indigo-500">{pendingFlag.key}</span></p>
                            <p className={`text-sm mt-1 ${pendingFlag.enabled ? 'text-red-500' : 'text-emerald-500'}`}>
                                Action: {pendingFlag.enabled ? 'DISABLE' : 'ENABLE'}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPendingFlag(null)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { handleToggle(pendingFlag); setPendingFlag(null); }}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                            >
                                Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
