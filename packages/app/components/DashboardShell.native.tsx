// packages/app/components/DashboardShell.native.tsx
// Mobile-native version of DashboardShell using React Native primitives
// Uses StyleSheet instead of className for TypeScript compatibility

import React, { useState, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Menu, X, Home, Users, BookOpen, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../provider/AuthContext';
import { useTheme } from '../provider/ThemeProvider';

interface DashboardShellProps {
    children: ReactNode;
    role?: string;
}

const MENU_ITEMS = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, role }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const { currentUser, logout } = useAuth();
    const { isDarkMode } = useTheme();

    const handleLogout = () => {
        logout();
    };

    const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    const headerBg = isDarkMode ? '#1e293b' : '#ffffff';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: headerBg }]}>
                <View style={styles.headerContent}>
                    {/* Menu Toggle */}
                    <Pressable
                        onPress={() => setMenuOpen(!menuOpen)}
                        style={styles.menuButton}
                    >
                        {menuOpen ? (
                            <X size={24} color={textColor} />
                        ) : (
                            <Menu size={24} color={textColor} />
                        )}
                    </Pressable>

                    {/* Title */}
                    <Text style={[styles.title, { color: textColor }]}>
                        Sovereign School
                    </Text>
                    <Text style={[styles.roleText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                        {role || currentUser?.role || 'Dashboard'}
                    </Text>
                </View>
            </View>

            {/* Slide-out Menu */}
            {menuOpen && (
                <View style={[styles.menu, { backgroundColor: headerBg }]}>
                    <View style={styles.menuItems}>
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => {
                                        setActiveTab(item.id);
                                        setMenuOpen(false);
                                    }}
                                    style={[
                                        styles.menuItem,
                                        isActive && styles.menuItemActive,
                                    ]}
                                >
                                    <Icon size={20} color={isActive ? '#3b82f6' : textColor} />
                                    <Text style={[
                                        styles.menuItemText,
                                        { color: isActive ? '#3b82f6' : textColor }
                                    ]}>
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Logout */}
                    <View style={styles.logoutSection}>
                        <Text style={[styles.userName, { color: textColor }]}>
                            {currentUser?.name || 'User'}
                        </Text>
                        <Pressable onPress={handleLogout} style={styles.logoutButton}>
                            <LogOut size={18} color="#ef4444" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Overlay when menu is open */}
            {menuOpen && (
                <Pressable
                    onPress={() => setMenuOpen(false)}
                    style={styles.overlay}
                />
            )}

            {/* Main Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        padding: 8,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    roleText: {
        fontSize: 12,
        marginLeft: 8,
    },
    menu: {
        position: 'absolute',
        top: 60,
        left: 0,
        bottom: 0,
        width: 280,
        zIndex: 100,
        paddingTop: 16,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    menuItems: {
        flex: 1,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    menuItemActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    menuItemText: {
        fontSize: 15,
        marginLeft: 12,
    },
    logoutSection: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    userName: {
        fontSize: 14,
        marginBottom: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        color: '#ef4444',
        marginLeft: 8,
        fontSize: 14,
    },
    overlay: {
        position: 'absolute',
        top: 60,
        left: 280,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 50,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
});

export default DashboardShell;
