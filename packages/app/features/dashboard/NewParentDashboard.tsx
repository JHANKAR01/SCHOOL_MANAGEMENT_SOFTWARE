// packages/app/features/dashboard/NewParentDashboard.tsx
// Parent Dashboard - Multi-child view with fee payments and academic tracking
// Uses DashboardShell with PARENT navigation and child switcher

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { DashboardShell, Module } from '../../components/DashboardShell';
import { useParentDashboard } from '../../../hooks/useParentData';
import { UserRole, SchoolConfig } from '../../../../types';

// Import parent feature modules
import {
    ParentMyChildren,
    ParentFees,
    ParentResults,
    ParentAttendance,
    ParentNotifications,
    ParentProfile,
    ParentTimetable,
    ParentLeaveRequest
} from '../parent';

interface Props {
    school: SchoolConfig;
    activeModule: string;
    role: UserRole;
}

// Child Switcher Component
const ChildSwitcher: React.FC<{
    children: Array<{ student_id: string; name: string; class: string }>;
    activeId: string | null;
    onSwitch: (id: string) => void;
}> = ({ children, activeId, onSwitch }) => {
    if (children.length <= 1) return null;

    return (
        <View className="flex-row items-center gap-2 mb-4">
            {children.map((child) => (
                <button
                    key={child.student_id}
                    onClick={() => onSwitch(child.student_id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeId === child.student_id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                >
                    {child.name.split(' ')[0]} ({child.class})
                </button>
            ))}
        </View>
    );
};

export const NewParentDashboard: React.FC<Props> = ({ school, activeModule: initialModule, role }) => {
    const [currentModule, setCurrentModule] = useState<Module>('children');
    const [activeChildId, setActiveChildId] = useState<string | null>(null);

    const { data: dashboardData, isLoading, error } = useParentDashboard();

    // Auto-select first child if none selected
    useEffect(() => {
        if (dashboardData?.data?.children?.length && !activeChildId) {
            setActiveChildId(dashboardData.data.children[0].student_id);
        }
    }, [dashboardData, activeChildId]);

    // Get current child info for title
    const activeChild = dashboardData?.data?.children?.find(c => c.student_id === activeChildId);
    const childrenList = dashboardData?.data?.children || [];

    // Get page title based on current module and child
    const getTitle = () => {
        const childName = activeChild?.name?.split(' ')[0] || '';
        switch (currentModule) {
            case 'children': return 'My Children';
            case 'fees': return childName ? `${childName}'s Fees` : 'Fees & Payments';
            case 'results': return childName ? `${childName}'s Results` : 'Results';
            case 'attendance': return childName ? `${childName}'s Attendance` : 'Attendance';
            case 'timetable': return childName ? `${childName}'s Timetable` : 'Weekly Timetable';
            case 'leave': return childName ? `${childName}'s Leave Application` : 'Apply Leave';
            case 'notifications': return 'Notifications';
            case 'profile': return 'Profile';
            default: return 'Parent Dashboard';
        }
    };

    // Render content based on current module
    const renderContent = () => {
        if (isLoading) {
            return (
                <View className="flex-1 items-center justify-center py-20">
                    <Text className="text-slate-500 dark:text-slate-400">Loading...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 items-center justify-center py-20">
                    <Text className="text-red-500">Error loading data. Please try again.</Text>
                </View>
            );
        }

        switch (currentModule) {
            case 'children':
                return (
                    <ParentMyChildren
                        children={childrenList}
                        kpis={dashboardData?.data?.kpis}
                        onSelectChild={(id) => {
                            setActiveChildId(id);
                            setCurrentModule('fees'); // Navigate to fees after selecting child
                        }}
                    />
                );
            case 'fees':
                return <ParentFees studentId={activeChildId} />;
            case 'results':
                return <ParentResults studentId={activeChildId} />;
            case 'attendance':
                return <ParentAttendance studentId={activeChildId} />;
            case 'notifications':
                return <ParentNotifications />;
            case 'timetable':
                return <ParentTimetable studentId={activeChildId} />;
            case 'leave':
                return <ParentLeaveRequest studentId={activeChildId} />;
            case 'profile':
                return <ParentProfile />;
            default:
                return (
                    <ParentMyChildren
                        children={childrenList}
                        kpis={dashboardData?.data?.kpis}
                        onSelectChild={(id) => {
                            setActiveChildId(id);
                            setCurrentModule('fees');
                        }}
                    />
                );
        }
    };

    // Stats component with child switcher
    const statsComponent = childrenList.length > 1 ? (
        <ChildSwitcher
            children={childrenList.map(c => ({
                student_id: c.student_id,
                name: c.name,
                class: c.class
            }))}
            activeId={activeChildId}
            onSwitch={setActiveChildId}
        />
    ) : undefined;

    return (
        <DashboardShell
            role="PARENT"
            title={getTitle()}
            activeModule={currentModule}
            onModuleChange={setCurrentModule}
            stats={statsComponent}
            user={dashboardData?.data?.parent ? {
                name: dashboardData.data.parent.name,
                email: '',
            } : undefined}
        >
            {renderContent()}
        </DashboardShell>
    );
};
