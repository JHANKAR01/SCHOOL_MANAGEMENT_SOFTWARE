import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../provider/AuthContext';
import { useLanguage } from '../../provider/language-context';
import { UserRole } from '../../../types/user';

interface Props {
    children: React.ReactNode;
    activeTab?: string;
}

export const VicePrincipalLayout = ({ children, activeTab }: Props) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    // useRouter removed

    // Basic Role Guard
    if (!user || (user.role !== UserRole.VICE_PRINCIPAL && user.role !== UserRole.PRINCIPAL && user.role !== UserRole.SCHOOL_ADMIN)) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Access Denied</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header removed to avoid duplication with MainLayout Sidebar/Header */}
            <ScrollView contentContainerStyle={styles.content}>
                {children}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold'
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    content: {
        padding: 16,
    },
    roleBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    roleText: {
        color: '#1976d2',
        fontSize: 12,
        fontWeight: '600'
    }
});
