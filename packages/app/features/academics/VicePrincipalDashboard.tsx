import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
            <View className="max-w-7xl mx-auto w-full gap-6">
              {/* 1. KEY STATS */}
              <VicePrincipalStats />

              {/* 2. MAIN GRID LAYOUT */}
              <View className="flex-col xl:flex-row gap-6">
                {/* LEFT COLUMN: CRITICAL OPERATIONS (2/3 width) */}
                <View className="xl:flex-[2] gap-6">
                  {/* APPROVALS PREVIEW */}
                  <View className="gap-4">
                    <Text className="text-xl font-bold text-slate-800 dark:text-white">Pending Actions</Text>
                    <ApprovalsModule />
                  </View>

                  {/* SUBSTITUTION PREVIEW */}
                  <SubstitutionManager />
                </View>

                {/* RIGHT COLUMN: MONITORING (1/3 width) */}
                <View className="xl:flex-1 gap-6">
                  <AttendanceMonitorModule />
                  <IncidentQueue />
                </View>
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
            <AttendanceMonitorModule />
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
