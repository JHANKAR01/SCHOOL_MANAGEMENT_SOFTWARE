
import React, { useState, useEffect } from 'react';
import LoginScreen from './apps/expo/app/login';
import SuperAdminDashboard from './apps/next/pages/super-admin/dashboard';
import { SchoolConfig, UserRole, User, AuthResponse } from './types';
import { RoleBasedRouter } from './packages/app/features/dashboard/RoleBasedRouter';
import { Sidebar } from './components/Sidebar';
import { LanguageProvider, useTranslation } from './packages/app/provider/language-context';
import { InteractionProvider } from './packages/app/provider/InteractionContext';
import { ThemeProvider } from './packages/app/provider/ThemeProvider';
import { useLowDataMode } from './packages/app/hooks/useLowDataMode';
import SchoolAdminDashboard from './apps/next/pages/school-admin/dashboard';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, ScrollView, StatusBar } from 'react-native';
import { Menu, LogOut, Zap, Shield } from 'lucide-react';
import * as SecureStore from 'expo-secure-store';

const MainLayout: React.FC<{
  user: User;
  school: SchoolConfig;
  onLogout: () => void;
}> = ({ user, school, onLogout }) => {
  const { isLowData, toggleLowData } = useLowDataMode();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const defaultModule = React.useMemo(() => {
    switch (user.role) {
      // Management
      case UserRole.SCHOOL_ADMIN: return 'STAFF_MGMT';
      case UserRole.PRINCIPAL: return 'OVERVIEW';
      case UserRole.VICE_PRINCIPAL: return 'TIMETABLES';
      case UserRole.FINANCE_MANAGER: return 'COLLECTIONS';

      // Operations
      case UserRole.FLEET_MANAGER: return 'LIVE_TRACKING';
      case UserRole.LIBRARIAN: return 'CIRCULATION';
      case UserRole.WARDEN: return 'ALLOCATION';
      case UserRole.ADMISSIONS_OFFICER: return 'INQUIRIES';
      case UserRole.NURSE: return 'MEDICAL_LOGS';
      case UserRole.INVENTORY_MANAGER: return 'STOCK_REGISTRY';
      case UserRole.EXAM_CELL: return 'EXAM_SCHEDULE';
      case UserRole.RECEPTIONIST: return 'VISITOR_LOGS';
      case UserRole.SECURITY_HEAD: return 'GATE_MGMT';
      case UserRole.ESTATE_MANAGER: return 'MAINTENANCE_TICKETS';
      case UserRole.IT_ADMIN: return 'SYSTEM_HEALTH';

      // Staff & Users
      case UserRole.TEACHER: return 'ATTENDANCE';
      case UserRole.HOD: return 'SYLLABUS';
      case UserRole.COUNSELOR: return 'STUDENT_WELLNESS';
      case UserRole.PARENT: return 'FEES';
      case UserRole.STUDENT: return 'TIMETABLE';

      default: return 'HOME';
    }
  }, [user.role]);

  const [activeModule, setActiveModule] = useState(defaultModule);

  // Reset module when user role changes (if hot-swapping users)
  React.useEffect(() => {
    setActiveModule(defaultModule);
  }, [user.role, defaultModule]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flex: 1, flexDirection: 'row', height: '100%', backgroundColor: '#F9FAFB', overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <Sidebar
          role={user.role}
          school={school}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <View style={{ flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Header */}
          <View className="bg-white border-b border-gray-200 h-16 flex-row items-center justify-between px-4 lg:px-8 shadow-sm z-10">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </TouchableOpacity>
              {Platform.OS === 'web' && (
                <Text className="text-xl font-bold text-gray-800 hidden sm:flex">
                  {school.name}
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-3">
              {/* Role Badge */}
              <View className="hidden md:flex px-2.5 py-0.5 rounded-full bg-indigo-100">
                <Text className="text-xs font-medium text-indigo-800">
                  {user.role}
                </Text>
              </View>

              {/* Low Data Toggle */}
              <TouchableOpacity onPress={toggleLowData} className={`p-1.5 rounded border flex-row items-center gap-1 ${isLowData ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-200'}`}>
                <Zap className={`w-3 h-3 ${isLowData ? 'text-black' : 'text-gray-500'}`} />
                <Text className={`text-xs font-bold ${isLowData ? 'text-black' : 'text-gray-600'}`}>
                  {isLowData ? 'Lite' : 'HD'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onLogout} className="p-2">
                <LogOut className="w-5 h-5 text-red-600" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dashboard Switcher */}
          <View style={{ flex: 1, backgroundColor: '#F9FAFB', position: 'relative' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              {Platform.OS === 'web' ? (
                <RoleBasedRouter
                  role={user.role}
                  school={school}
                  activeModule={activeModule}
                />
              ) : (
                /* 
                   NOTE: Most RoleBasedRouter sub-components are currently using HTML tags. 
                   For this React Native upgrade, we are enabling the Sidebar and Frame.
                   Individual dashboards must be progressively migrated to <View>/<Text>.
                   We render a placeholder for now to prevent crashes in sub-modules.
                */
                <View className="flex-1 items-center justify-center p-8">
                  <Shield className="w-16 h-16 text-gray-300 mb-4" />
                  <Text className="text-lg font-bold text-gray-600 text-center">
                    Mobile Dashboard Under Construction
                  </Text>
                  <Text className="text-sm text-gray-400 text-center mt-2">
                    Use the Web Portal for full {activeModule} access.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSchool, setCurrentSchool] = useState<SchoolConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        let sessionString: string | null = null;

        if (Platform.OS === 'web') {
          sessionString = localStorage.getItem('sovereign_user_session');
        } else {
          sessionString = await SecureStore.getItemAsync('sovereign_user_session');
        }

        if (sessionString) {
          const { user, school } = JSON.parse(sessionString);
          if (user && school) {
            setCurrentUser(user);
            setCurrentSchool(school);
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLoginSuccess = (data: AuthResponse) => {
    setCurrentUser(data.user);
    setCurrentSchool(data.school);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setCurrentSchool(null);

    if (Platform.OS === 'web') {
      localStorage.removeItem('sovereign_token');
      localStorage.removeItem('sovereign_user_session');
    } else {
      await SecureStore.deleteItemAsync('sovereign_token');
      await SecureStore.deleteItemAsync('sovereign_user_session');
    }
  };

  // 2. Wrap everything in Providers at the Root Level, then conditionally render children
  return (
    <ThemeProvider primaryColor={currentSchool?.primary_color || '#000000'}>
      <InteractionProvider isAuthenticated={!!currentUser} role={currentUser?.role}>
        <LanguageProvider>
          {/* Logic moved inside Providers: */}
          {(() => {
            // 0. Loading State
            if (isLoading) {
              return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                  <Text style={{ color: '#6B7280', fontSize: 16 }}>Loading Sovereign...</Text>
                </View>
              );
            }

            // 1. Super Admin View (Web Only)
            if (currentUser?.role === UserRole.SUPER_ADMIN) {
              if (Platform.OS === 'web') {
                return (
                  <div className="relative">
                    <SuperAdminDashboard />
                  </div>
                );
              }
              return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text>Super Admin not supported on mobile.</Text>
                  <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20, padding: 10, backgroundColor: 'red' }}>
                    <Text style={{ color: 'white' }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            // 1.5 School Admin View (Web Only - Refactored Shell)
            if (currentUser?.role === UserRole.SCHOOL_ADMIN) {
              if (Platform.OS === 'web') {
                return (
                  <div className="relative">
                    <SchoolAdminDashboard />
                  </div>
                );
              }
            }

            // 3. Default Main Layout (Login or Role Dashboard)
            return (!currentUser || !currentSchool) ? (
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
            ) : (
              <MainLayout
                user={currentUser}
                school={currentSchool}
                onLogout={handleLogout}
              />
            );
          })()}
        </LanguageProvider>
      </InteractionProvider>
    </ThemeProvider>
  );
};

export default App;
