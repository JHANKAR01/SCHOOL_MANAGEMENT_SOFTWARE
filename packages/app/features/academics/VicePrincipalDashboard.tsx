import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  ClipboardList,
  CheckCircle,
  RefreshCw,
  LayoutDashboard,
  User,
  Activity,
  MessageSquare
} from 'lucide-react';

import { DashboardShell } from '../../components/DashboardShell';
import { useLanguage } from '../../provider/language-context';
import { VicePrincipalStats } from './VicePrincipalStats';
import { ApprovalsModule } from './ApprovalsModule';
import { SubstitutionManager } from './SubstitutionManager';
import { IncidentQueue } from './IncidentQueue';
import { StudentRosterModule } from './StudentRosterModule';
import { AttendanceMonitorModule } from './AttendanceMonitorModule';
import { CommunicationsModule } from './CommunicationsModule';
import { AttendanceAnalytics } from './AttendanceAnalytics';

export const VicePrincipalDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<any>('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', icon: User },
    { id: 'approvals', label: 'Approvals', icon: ClipboardList },
    { id: 'substitutions', label: 'Substitutions', icon: RefreshCw },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle }, // Using CheckCircle as generic or Lucide icon
    { id: 'incidents', label: 'Incidents', icon: ClipboardList },
    { id: 'communications', label: 'Communications', icon: ClipboardList }, // Reuse or find better icon
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            <View className="max-w-7xl mx-auto w-full gap-8">
              {/* 1. KEY STATS */}
              <VicePrincipalStats />

              {/* 2. QUICK ACCESS GRID */}
              <View>
                <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quick Access</Text>
                <View className="flex-row flex-wrap gap-4">
                  {/* Approvals Card */}
                  <NavCard
                    title="Approvals"
                    scan="View Pending"
                    icon={ClipboardList}
                    color="indigo"
                    onPress={() => setActiveTab('approvals')}
                  />

                  {/* Substitutions Card */}
                  <NavCard
                    title="Substitutions"
                    scan="Manage Teachers"
                    icon={RefreshCw}
                    color="emerald"
                    onPress={() => setActiveTab('substitutions')}
                  />

                  {/* Students Card */}
                  <NavCard
                    title="Student Directory"
                    scan="Search & View"
                    icon={User}
                    color="blue"
                    onPress={() => setActiveTab('students')}
                  />

                  {/* Incidents Card */}
                  <NavCard
                    title="Incidents"
                    scan="View Reports"
                    icon={Activity}
                    color="rose"
                    onPress={() => setActiveTab('incidents')}
                  />

                  {/* Attendance Card */}
                  <NavCard
                    title="Attendance"
                    scan="View Analytics"
                    icon={CheckCircle}
                    color="violet"
                    onPress={() => setActiveTab('attendance')}
                  />
                </View>
              </View>

              {/* 3. RECENT ALERTS (Simplified) */}
              <View className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                <View className="flex-row items-center gap-3 mb-2">
                  <Activity className="text-amber-600 dark:text-amber-400" size={20} />
                  <Text className="font-bold text-amber-800 dark:text-amber-200">System Status</Text>
                </View>
                <Text className="text-amber-700 dark:text-amber-300 text-sm">
                  All academic systems are running smoothly. No critical system-wide alerts.
                </Text>
              </View>
            </View>
          </ScrollView>
        );
      case 'students':
        return (
          <View className="flex-1 p-6">
            <StudentRosterModule />
          </View>
        );
      case 'approvals':
        return (
          <View className="flex-1 p-6">
            <ApprovalsModule />
          </View>
        );
      case 'substitutions':
        return (
          <View className="flex-1 p-6">
            <SubstitutionManager />
          </View>
        );
      case 'attendance':
        return (
          <View className="flex-1 p-6">
            <AttendanceAnalytics />
          </View>
        );
      case 'incidents':
        return (
          <View className="flex-1 p-6 text-slate-800 dark:text-white">
            <View className="mb-6">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white">Incident Management</Text>
              <Text className="text-slate-500">Track and triage student disciplinary incidents.</Text>
            </View>
            <IncidentQueue />
          </View>
        );
      case 'communications':
        return (
          <View className="flex-1 p-6">
            <CommunicationsModule />
          </View>
        );
      default:
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-slate-500">Module under construction</Text>
          </View>
        );
    }
  };

  return (
    <DashboardShell
      title="Vice Principal Dashboard"
      role="VICE_PRINCIPAL"
      activeModule={activeTab}
      onModuleChange={setActiveTab}
      navItems={navItems}
    >
      {renderContent()}
    </DashboardShell>
  );
};

// Quick Access Card Component
const NavCard = ({ title, scan, icon: Icon, color, onPress }: any) => {
  const colorMap: any = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 min-w-[160px] p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className={`p-2 rounded-lg ${colorMap[color].split(' ').slice(0, 2).join(' ')}`}>
          <Icon size={20} className={colorMap[color].split(' ').slice(2).join(' ')} />
        </View>
      </View>
      <Text className="font-bold text-slate-800 dark:text-white mb-1">{title}</Text>
      <Text className="text-xs text-slate-500">{scan}</Text>
    </Pressable>
  );
};
