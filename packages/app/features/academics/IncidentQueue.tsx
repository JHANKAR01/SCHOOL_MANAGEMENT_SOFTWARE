import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';

interface Incident {
    id: string;
    student: { name: string; admission_no: string };
    reporter: { name: string };
    severity: string;
    description: string;
    status: string;
    created_at: string;
}

export const IncidentQueue = () => {
    const { t } = useLanguage();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vice-principal/incidents?status=REPORTED');
            if (res.status === 200) {
                setIncidents(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const openTriage = (incident: Incident) => {
        setSelectedIncident(incident);
        setStatus('UNDER_REVIEW');
        setModalVisible(true);
    };

    const submitTriage = async () => {
        if (!selectedIncident) return;
        setProcessing(true);
        try {
            const res = await api.post(`/vice-principal/incidents/${selectedIncident.id}/triage`, {
                status,
                note
            });

            if (res.status === 200) {
                Alert.alert("Success", "Incident updated");
                setModalVisible(false);
                setNote('');
                fetchIncidents();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update");
        } finally {
            setProcessing(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return '#d32f2f';
            case 'MAJOR': return '#f57c00';
            default: return '#fbc02d';
        }
    };

    const renderItem = ({ item }: { item: Incident }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.badge, { backgroundColor: getSeverityColor(item.severity) }]}>
                    <Text style={styles.badgeText}>{item.severity}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.studentName}>{item.student.name} ({item.student.admission_no})</Text>
            <Text style={styles.reporter}>Reported by: {item.reporter.name}</Text>
            <Text style={styles.desc}>{item.description}</Text>

            <TouchableOpacity style={styles.triageButton} onPress={() => openTriage(item)}>
                <Text style={styles.triageText}>Triage / Review</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" color="#1976d2" />;

    return (
        <View style={styles.container}>
            <FlatList
                data={incidents}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Status</Text>

                        <View style={styles.statusRow}>
                            {['UNDER_REVIEW', 'RESOLVED', 'ESCALATED'].map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.statusOption, status === s && styles.statusActive]}
                                    onPress={() => setStatus(s)}
                                >
                                    <Text style={[styles.statusText, status === s && styles.textActive]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>{t('vp_dashboard.incidents.confidential_note')}</Text>
                        <TextInput
                            style={styles.input}
                            value={note}
                            onChangeText={setNote}
                            multiline
                            placeholder="Add notes..."
                        />

                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={submitTriage}
                                style={[styles.button, styles.confirmButton]}
                                disabled={processing}
                            >
                                <Text style={styles.confirmText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12
    },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    date: { color: '#999', fontSize: 12 },
    studentName: { fontSize: 16, fontWeight: 'bold' },
    reporter: { fontSize: 12, color: '#666', marginBottom: 8 },
    desc: { color: '#333', marginBottom: 16 },
    triageButton: {
        backgroundColor: '#424242',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center'
    },
    triageText: { color: 'white', fontWeight: 'bold' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    statusOption: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4
    },
    statusActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
    statusText: { fontSize: 12 },
    textActive: { color: 'white' },
    label: { marginBottom: 4, fontWeight: 'bold' },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 8,
        height: 80,
        textAlignVertical: 'top',
        marginBottom: 20
    },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    button: { padding: 10 },
    confirmButton: { backgroundColor: '#1976d2', borderRadius: 4 },
    confirmText: { color: 'white', fontWeight: 'bold' }
});
