import React, { useState } from 'react';
import { DashboardShell, Module } from '../../../../packages/app/components/DashboardShell';
import { Activity, Bell, AlertTriangle, Users, LayoutDashboard, Shield, GraduationCap, DollarSign, Settings, BookOpen, School } from 'lucide-react';
import { InquiryBoard } from '../../../../packages/app/features/admissions/InquiryBoard';
import { UserAccessControl } from '../../../../packages/app/features/admin/UserAccessControl';
import { ClassManager } from '../../../../packages/app/features/academics/ClassManager';
import { SubjectManager } from '../../../../packages/app/features/academics/SubjectManager';
import { FeeStructureManager } from '../../../../packages/app/features/finance/FeeStructureManager';
import { SchoolSettings } from '../../../../packages/app/features/settings/SchoolSettings';

// MOCK COMPONENTS (Overview Widgets)
const SchoolPulseMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total Students', 'Staff Present', 'Fee Collection', 'Pending Issues'].map((label, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</span>
                    <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">1,234</div>
                <div className="text-xs text-green-600 font-medium">+5.2% from last month</div>
            </div>
        ))}
    </div>
);

const ActionCenter = () => (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
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
                            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Dismiss</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Academics Sub-Module Tabs
const AcademicsModule: React.FC = () => {
    const [subTab, setSubTab] = useState<'classes' | 'subjects'>('classes');

    return (
        <div className="space-y-6">
            {/* Sub-Navigation */}
            <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
                <button
                    onClick={() => setSubTab('classes')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${subTab === 'classes'
                        ? 'bg-indigo-500 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <School className="w-4 h-4" /> Classes
                </button>
                <button
                    onClick={() => setSubTab('subjects')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${subTab === 'subjects'
                        ? 'bg-indigo-500 text-white shadow'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <BookOpen className="w-4 h-4" /> Subjects
                </button>
            </div>

            {/* Sub-Module Content */}
            {subTab === 'classes' && <ClassManager />}
            {subTab === 'subjects' && <SubjectManager />}
        </div>
    );
};

export default function SchoolAdminDashboard() {
    const [activeModule, setActiveModule] = useState<Module>('overview');

    // Sidebar Configuration
    const sidebarItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admissions', label: 'Admissions', icon: Users, badge: 'Kanban' },
        { id: 'academics', label: 'Academics', icon: GraduationCap },
        { id: 'finance', label: 'Finance Setup', icon: DollarSign },
        { id: 'system-admin', label: 'System Access', icon: Shield },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <DashboardShell
            title="School Operations"
            role="SCHOOL_ADMIN"
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            navItems={sidebarItems}
            stats={activeModule === 'overview' ? <SchoolPulseMetrics /> : undefined}
        >
            {/* ---------------------------------------------------------------------- */}
            {/* MODULE ROUTING */}
            {/* ---------------------------------------------------------------------- */}

            {activeModule === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActionCenter />
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                        Additional Widgets Placeholder
                    </div>
                </div>
            )}

            {activeModule === 'admissions' && <InquiryBoard />}

            {activeModule === 'academics' as Module && <AcademicsModule />}

            {activeModule === 'finance' as Module && <FeeStructureManager />}

            {activeModule === 'system-admin' as Module && <UserAccessControl />}

            {activeModule === 'settings' as Module && <SchoolSettings />}

            {/* Fallback for unmatched modules */}
            {!['overview', 'admissions', 'academics', 'finance', 'system-admin', 'settings'].includes(activeModule) && (
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                        <Activity className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Module Not Found</h3>
                    <p className="text-sm">The module "{activeModule}" is not available.</p>
                </div>
            )}
        </DashboardShell>
    );
}
