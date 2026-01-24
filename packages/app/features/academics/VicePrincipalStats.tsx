import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';

interface StatsData {
    pendingApprovals: number;
    urgentIncidents: number;
    substitutionNeeds: number;
    staffOnLeave: number;
}

export const VicePrincipalStats = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/vice-principal/stats');
            if (res.status === 200) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch VP stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return <ActivityIndicator size="small" color="#1976d2" style={{ marginVertical: 20 }} />;
    }

    if (!stats) return null;

    const cards = [
        { label: t('vp_dashboard.stats.pending_approvals'), value: stats.pendingApprovals, color: '#ff9800' },
        { label: t('vp_dashboard.stats.urgent_incidents'), value: stats.urgentIncidents, color: '#f44336' },
        { label: t('vp_dashboard.stats.substitution_needs'), value: stats.substitutionNeeds, color: '#2196f3' },
        { label: t('vp_dashboard.stats.staff_on_leave'), value: stats.staffOnLeave, color: '#9c27b0' }
    ];

    return (
        <View style={styles.container}>
            {cards.map((card, index) => (
                <View key={index} style={[styles.card, { borderLeftColor: card.color }]}>
                    <Text style={[styles.value, { color: card.color }]}>{card.value}</Text>
                    <Text style={styles.label}>{card.label}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'space-between'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        width: '48%',
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4
    },
    label: {
        fontSize: 14,
        color: '#666'
    }
});
