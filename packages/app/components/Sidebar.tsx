import React from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { UserRole, SchoolConfig } from '../../../types';
import { useLowDataMode } from '../hooks/useLowDataMode';

import { useRouter } from 'expo-router';

interface SidebarProps {
  role: UserRole;
  school: SchoolConfig;
  activeModule: string;
  setActiveModule: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  school,
  activeModule,
  setActiveModule,
  isOpen,
  onClose
}) => {
  const router = useRouter();
  const { isLowData } = useLowDataMode();
  const { features } = school;

  const handleLogout = async () => {
    // Clear storage
    localStorage.removeItem('sovereign_token');
    localStorage.removeItem('sovereign_user_session');

    // Redirect
    router.replace('/login');
  };

  // Strict Departmental Isolation Logic + Feature Flags
  const getMenuItems = (): MenuItem[] => {
    let items: MenuItem[] = [];

    switch (role) {
      case UserRole.SCHOOL_ADMIN: // HR Manager + Technical Backup
        items = [
          { id: 'STAFF_MGMT', label: 'Staff & HR', icon: '👥' },
          { id: 'ACCESS_LOGS', label: 'Audit Logs', icon: '🛡️' },
          { id: 'SETTINGS', label: 'School Settings', icon: '⚙️' },
        ];
        if (features.fees) items.push({ id: 'FINANCE', label: 'Finance', icon: '💰' });
        break;

      case UserRole.PRINCIPAL: // Academic Head + Oversight
        items = [
          { id: 'OVERVIEW', label: 'Overview', icon: '📊' },
          { id: 'APPROVALS', label: 'Approvals', icon: '✅' },
          { id: 'ATTENDANCE', label: 'Attendance', icon: '📅' },
          { id: 'RISK', label: 'Risk Monitor', icon: '⚠️' },
          { id: 'CLASSROOMS', label: 'Classrooms', icon: '🏫' },
          { id: 'RESULTS', label: 'Publish Results', icon: '📢' },
          { id: 'SETTINGS', label: 'Settings', icon: '⚙️' },
        ];
        if (features.fees) items.push({ id: 'FINANCE', label: 'Finance', icon: '💰' });
        break;

      case UserRole.FINANCE_MANAGER: // Finance Approver
      case UserRole.ACCOUNTANT: // Primary Operator
        if (features.fees) {
          items = [
            { id: 'FINANCE', label: 'Finance Dashboard', icon: '💰' },
            { id: 'COLLECTIONS', label: 'Fee Collections', icon: '💵' },
            { id: 'RECONCILIATION', label: 'Bank Reconcile', icon: '🏦' },
            { id: 'PAYROLL', label: 'Staff Payroll', icon: '💸' },
          ];
        }
        break;

      case UserRole.TEACHER:
        if (features.attendance) items.push({ id: 'ATTENDANCE', label: 'Attendance', icon: '📋' });
        items.push({ id: 'GRADEBOOK', label: 'Gradebook', icon: '📝' });
        if (features.library) items.push({ id: 'LIBRARY', label: 'Library', icon: '📚' });
        break;

      case UserRole.PARENT:
      case UserRole.STUDENT:
        if (features.fees) items.push({ id: 'FEES', label: 'Fees & Dues', icon: '💳' });
        if (features.transport) items.push({ id: 'TRACKING', label: 'Bus Tracking', icon: '🚌' });
        items.push({ id: 'REPORT', label: 'Report Card', icon: '📄' });
        break;

      case UserRole.FLEET_MANAGER:
        if (features.transport) items.push({ id: 'FLEET', label: 'Live Tracking', icon: '🚌' });
        break;

      case UserRole.LIBRARIAN:
        if (features.library) items.push({ id: 'LIBRARY', label: 'Circulation Desk', icon: '📚' });
        break;

      case UserRole.WARDEN:
        if (features.hostel) items.push({ id: 'HOSTEL', label: 'Room Allocation', icon: '🛏️' });
        break;

      case UserRole.NURSE:
        items.push({ id: 'INFIRMARY', label: 'Health Logs', icon: '🏥' });
        break;

      case UserRole.SECURITY_HEAD:
        items.push({ id: 'GATE', label: 'Gate Logs', icon: '🛡️' });
        break;

      case UserRole.ESTATE_MANAGER:
        items.push({ id: 'TICKETS', label: 'Maintenance', icon: '🔧' });
        break;

      case UserRole.RECEPTIONIST:
        items.push({ id: 'VISITORS', label: 'Front Desk', icon: '🛎️' });
        break;

      case UserRole.ADMISSIONS_OFFICER:
        items.push({ id: 'INQUIRIES', label: 'CRM', icon: '🤝' });
        break;

      case UserRole.HOD:
        items.push({ id: 'SYLLABUS', label: 'Dept. Progress', icon: '📈' });
        break;

      case UserRole.EXAM_CELL:
        items.push({ id: 'EXAMS', label: 'Papers & Logistics', icon: '🖨️' });
        break;

      case UserRole.COUNSELOR:
        items.push({ id: 'WELLNESS', label: 'Student Wellness', icon: '🧠' });
        break;

      case UserRole.IT_ADMIN:
        items.push({ id: 'SYSTEM', label: 'Infrastructure', icon: '🖥️' });
        break;

      default:
        items = [
          { id: 'HOME', label: 'Home', icon: '🏠' },
          { id: 'PROFILE', label: 'My Profile', icon: '👤' },
        ];
    }
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay - Uses View and Pressable */}
      {isOpen && (
        <Pressable
          className="absolute inset-0 bg-black/50 z-20 lg:hidden"
          onPress={onClose}
        />
      )}

      {/* Sidebar Container - Uses View */}
      <View className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-2xl transition-all duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:shadow-none border-r border-gray-200 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Brand Header */}
        <View className="h-20 flex-row items-center px-6 relative overflow-hidden" style={{ backgroundColor: school.primary_color }}>
          {/* Decorative sheen - Absolute positioning works in RN */}
          <View className="absolute inset-0 bg-white/10 pointer-events-none" />

          <View className="relative z-10">
            <Text className="text-white font-bold text-lg tracking-wide shadow-sm" numberOfLines={1}>
              {school.name}
            </Text>
            <Text className="text-indigo-100 text-xs font-medium uppercase tracking-wider opacity-90 mt-0.5">
              {role.replace('_', ' ')} Portal
            </Text>
          </View>
        </View>

        {/* Menu Items - Uses ScrollView instead of nav */}
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {menuItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setActiveModule(item.id);
                  onClose();
                }}
                className={`flex-row w-full items-center px-4 py-3.5 mb-1 rounded-lg ${isActive
                  ? 'bg-gray-50 shadow-sm'
                  : 'bg-transparent'
                  }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <View
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"
                    style={{ backgroundColor: school.primary_color }}
                  />
                )}

                <Text className={`mr-3 text-lg ${isActive ? 'scale-110' : 'text-gray-400'}`}>
                  {item.icon}
                </Text>
                <Text className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="p-4 border-t border-gray-200 bg-gray-50">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
              <Text className="text-gray-600 font-bold">{role[0]}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-gray-900" numberOfLines={1}>Logged In</Text>
              <Text className="text-[10px] text-gray-500 capitalize" numberOfLines={1}>
                {role.toLowerCase().replace('_', ' ')}
              </Text>
            </View>
            <Pressable
              onPress={handleLogout}
              className="p-2 bg-red-50 rounded-full hover:bg-red-100"
            >
              <Text className="text-red-500 text-xs">🚪</Text>
            </Pressable>
            {isLowData && (
              <View className="w-2 h-2 rounded-full bg-yellow-400" />
            )}
          </View>
        </View>
      </View>
    </>
  );
};
