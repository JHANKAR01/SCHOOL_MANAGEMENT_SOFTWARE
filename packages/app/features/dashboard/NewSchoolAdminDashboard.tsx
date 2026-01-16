import React, { useState } from 'react';
import { DashboardShell, Module } from '../../components/DashboardShell';
import { Activity, Bell, AlertTriangle } from 'lucide-react';

// MOCK COMPONENTS
const SchoolPulseMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total Students', 'Staff Present', 'Fee Collection', 'Pending Issues'].map((label, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</span>
                    <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">1,234</div>
                <div className="text-xs text-green-600 font-medium">+5.2% from last month</div>
            </div>
        ))}
    </div>
);

const ActionCenter = () => (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/20">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Action Center</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tasks requiring your attention</p>
            </div>
        </div>
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-200">Pending Fee Approval</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Class X-A student request for fee concession requires approval.</p>
                        <div className="flex gap-2 mt-3">
                            <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Approve</button>
                            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Dismiss</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SchoolAdminDashboard = () => {
    const [activeModule, setActiveModule] = useState<Module>('overview');

    return (
        <DashboardShell
            title="School Operations"
            role="SCHOOL_ADMIN"
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            stats={<SchoolPulseMetrics />}
        >
            {/* Module Switching Logic */}
            {activeModule === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActionCenter />
                    {/* Additional widgets can be added here */}
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                        Additional Widgets Placeholder
                    </div>
                </div>
            )}
            {activeModule !== 'overview' && (
                <div className="flex items-center justify-center h-96 text-slate-400">
                    Module {activeModule} content under construction
                </div>
            )}
        </DashboardShell>
    );
};
