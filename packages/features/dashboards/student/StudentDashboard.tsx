import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
    school: any; // Type as needed
    activeModule: string;
    role: string;
}

export const StudentDashboard: React.FC<Props> = ({ role }) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome, {role.charAt(0) + role.slice(1).toLowerCase()}</Text>
                <Text style={styles.subtitle}>Your dashboard is under construction 🚧</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4, // Android shadow
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});
