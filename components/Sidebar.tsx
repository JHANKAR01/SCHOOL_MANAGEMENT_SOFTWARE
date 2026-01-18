
import React from 'react';
import { UserRole, SchoolConfig } from '../types';
import { useLowDataMode } from '../packages/app/hooks/useLowDataMode';
import { View, Text, Pressable, ScrollView, Platform, TouchableOpacity, Modal } from 'react-native';

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
  const { isLowData } = useLowDataMode();
  const { features } = school;

  // Comprehensive Menu Logic
  const getMenuItems = (): MenuItem[] => {
    let items: MenuItem[] = [];

    switch (role) {
      case UserRole.SCHOOL_ADMIN: // HR Manager
        items = [
          { id: 'STAFF_MGMT', label: 'Staff & HR', icon: '👥' },
          { id: 'ACCESS_LOGS', label: 'Audit Logs', icon: '🛡️' },
          { id: 'SETTINGS', label: 'School Settings', icon: '⚙️' },
        ];
        break;

      case UserRole.PRINCIPAL: // Academic Head
        items = [
          { id: 'OVERVIEW', label: 'School Overview', icon: '📊' },
          { id: 'CLASSROOMS', label: 'Classrooms', icon: '🏫' },
          { id: 'RESULTS', label: 'Publish Results', icon: '📢' },
        ];
        if (features.attendance) items.push({ id: 'ATTENDANCE_REP', label: 'Attendance Reports', icon: '📋' });
        break;

      case UserRole.VICE_PRINCIPAL:
        items = [
          { id: 'TIMETABLES', label: 'Substitutions', icon: '📅' },
          { id: 'SCHEDULES', label: 'Timetables', icon: '🕒' }
        ];
        break;

      case UserRole.FINANCE_MANAGER: // Accountant
        if (features.fees) {
          items = [
            { id: 'COLLECTIONS', label: 'Fee Collections', icon: '💰' },
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
        if (role === UserRole.STUDENT) items.push({ id: 'TIMETABLE', label: 'My Classes', icon: '🎓' });
        else items.push({ id: 'FEES', label: 'Fees & Dues', icon: '💳' });

        if (features.fees && role === UserRole.STUDENT) items.push({ id: 'FEES', label: 'Fees', icon: '💳' });
        if (features.transport) items.push({ id: 'TRACKING', label: 'Bus Tracking', icon: '🚌' });
        items.push({ id: 'REPORT', label: 'Report Card', icon: '📄' });
        break;

      case UserRole.FLEET_MANAGER:
        if (features.transport) items.push({ id: 'LIVE_TRACKING', label: 'Live Tracking', icon: '🚌' });
        break;

      case UserRole.LIBRARIAN:
        if (features.library) items.push({ id: 'CIRCULATION', label: 'Circulation Desk', icon: '📚' });
        break;

      case UserRole.WARDEN:
        if (features.hostel) items.push({ id: 'ALLOCATION', label: 'Room Allocation', icon: '🛏️' });
        break;

      case UserRole.NURSE:
        items.push({ id: 'MEDICAL_LOGS', label: 'Health Logs', icon: '🏥' });
        break;

      case UserRole.SECURITY_HEAD:
        items.push({ id: 'GATE_MGMT', label: 'Gate Logs', icon: '🛡️' });
        break;

      case UserRole.ESTATE_MANAGER:
        items.push({ id: 'MAINTENANCE_TICKETS', label: 'Maintenance', icon: '🔧' });
        break;

      case UserRole.RECEPTIONIST:
        items.push({ id: 'VISITOR_LOGS', label: 'Front Desk', icon: '🛎️' });
        break;

      case UserRole.ADMISSIONS_OFFICER:
        items.push({ id: 'INQUIRIES', label: 'CRM', icon: '🤝' });
        break;

      case UserRole.INVENTORY_MANAGER:
        items.push({ id: 'STOCK_REGISTRY', label: 'Inventory', icon: '📦' });
        break;

      case UserRole.HOD:
        items.push({ id: 'SYLLABUS', label: 'Dept. Progress', icon: '📈' });
        break;

      case UserRole.EXAM_CELL:
        items.push({ id: 'EXAM_SCHEDULE', label: 'Papers & Logistics', icon: '🖨️' });
        break;

      case UserRole.COUNSELOR:
        items.push({ id: 'STUDENT_WELLNESS', label: 'Student Wellness', icon: '🧠' });
        break;

      case UserRole.IT_ADMIN:
        items.push({ id: 'SYSTEM_HEALTH', label: 'Infrastructure', icon: '🖥️' });
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

  const SidebarContent = () => (
    <View className="flex-1 bg-white border-r border-gray-200 h-full">
      {/* Brand Header */}
      <View className="h-20 flex justify-center px-6 relative overflow-hidden" style={{ backgroundColor: school.primary_color }}>
        <View className="absolute inset-0 bg-black opacity-10" />
        <View className="relative z-10">
          <Text className="font-bold text-lg text-white tracking-wide shadow-sm" numberOfLines={1}>
            {school.name}
          </Text>
          <Text className="text-indigo-100 text-xs font-medium uppercase tracking-wider opacity-90 mt-0.5">
            {role.replace('_', ' ')} Portal
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 p-2">
        {menuItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setActiveModule(item.id);
                onClose();
              }}
              className={`flex-row items-center px-4 py-3.5 mb-1 rounded-lg ${isActive ? 'bg-gray-100' : 'bg-transparent'
                }`}
            >
              {isActive && (
                <View
                  className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r"
                  style={{ backgroundColor: school.primary_color }}
                />
              )}

              <Text className="mr-3 text-lg">{item.icon}</Text>
              <Text className={`font-medium ${isActive ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* User Footer */}
      <View className="p-4 border-t border-gray-200 bg-gray-50 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
          <Text className="text-gray-600 font-bold">{role[0]}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-gray-900">Logged In</Text>
          <Text className="text-[10px] text-gray-500 capitalize">{role.toLowerCase().replace('_', ' ')}</Text>
        </View>
        {isLowData && (
          <View className="w-2 h-2 rounded-full bg-yellow-400" />
        )}
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    // WEB IMPLEMENTATION
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
        )}
        <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:shadow-none border-r border-gray-200 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </div>
      </>
    );
  }

  // MOBILE IMPLEMENTATION (Overlay Modal)
  return (
    <View>
      {/* On Mobile, Sidebar is usually hidden behind a drawer or modal logic */}
      {isOpen ? (
        <Modal transparent animationType="fade" visible={isOpen} onRequestClose={onClose}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
            <View style={{ width: '80%', height: '100%', backgroundColor: 'white' }}>
              <SidebarContent />
            </View>
          </View>
        </Modal>
      ) : (
        <View className="hidden lg:flex w-72 h-full">
          <SidebarContent />
        </View>
      )}
    </View>
  );
};
