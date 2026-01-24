import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import {
  ClipboardList,
  CheckCircle,
  RefreshCw
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

  return (
    <DashboardShell title="Vice Principal Dashboard" role="VICE_PRINCIPAL">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <View className="max-w-7xl mx-auto w-full gap-6">

          {/* 1. KEY STATS */}
          <VicePrincipalStats />

          {/* 2. MAIN GRID LAYOUT */}
          <View className="flex-col xl:flex-row gap-6">

            {/* LEFT COLUMN: CRITICAL OPERATIONS (2/3 width) */}
            <View className="xl:flex-[2] gap-6">
              {/* APPROVALS QUEUE */}
              <View className="gap-4">
                <Text className="text-xl font-bold text-slate-800 dark:text-white">Pending Requests</Text>
                <ApprovalsModule />
              </View>

              {/* STUDENT ROSTER & SEARCH */}
              <StudentRosterModule />

              {/* SUBSTITUTION MANAGEMENT */}
              <SubstitutionManager />
            </View>

            {/* RIGHT COLUMN: MONITORING & COMMS (1/3 width) */}
            <View className="xl:flex-1 gap-6">
              {/* ATTENDANCE CHART */}
              <AttendanceMonitorModule />

              {/* INCIDENT QUEUE */}
              <View>
                <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Incident Queue</Text>
                <IncidentQueue />
              </View>

              {/* COMMUNICATIONS */}
              <CommunicationsModule />
            </View>
          </View>
        </View>
      </ScrollView>
    </DashboardShell>
  );
};
