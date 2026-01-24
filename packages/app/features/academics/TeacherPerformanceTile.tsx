import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';

export const TeacherPerformanceTile = () => {
    const { t } = useLanguage();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPerformance = async () => {
        try {
            const res = await api.get('/vice-principal/teacher-performance');
            if (res.status === 200) {
                setData(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, []);

    if (loading) return <ActivityIndicator size="small" color="#1976d2" />;

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{t('vp_dashboard.tabs.performance')}</Text>
            {data.length === 0 ? (
                <Text style={styles.empty}>No performance data available yet.</Text>
            ) : (
                <View>
                    {/* Placeholder for real charts/lists */}
                    <Text>Performance metrics loaded.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginTop: 20
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    empty: {
        color: '#666',
        fontStyle: 'italic'
    }
});
