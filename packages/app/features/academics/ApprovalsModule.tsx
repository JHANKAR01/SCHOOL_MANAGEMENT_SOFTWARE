import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';
import { UserRole } from '../../../types/user';

interface ApprovalRequest {
    id: string;
    resource_type: string;
    status: string;
    metadata: any;
    requester: {
        id: string;
        name: string;
        role: UserRole;
    };
    created_at: string;
}

export const ApprovalsModule = () => {
    const { t } = useLanguage();
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [processing, setProcessing] = useState(false);

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vice-principal/approvals');
            if (res.status === 200) {
                setRequests(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleDecision = (req: ApprovalRequest, dec: 'APPROVED' | 'REJECTED') => {
        setSelectedRequest(req);
        setDecision(dec);
        setModalVisible(true);
    };

    const submitDecision = async () => {
        if (!selectedRequest || !decision) return;
        setProcessing(true);
        try {
            const res = await api.post(`/vice-principal/approvals/${selectedRequest.id}/decision`, {
                decision,
                comment
            });

            if (res.status === 200) {
                Alert.alert("Success", t('vp_dashboard.approvals.success_message'));
                setModalVisible(false);
                setComment('');
                fetchApprovals(); // Refresh list
            } else {
                Alert.alert("Error", "Failed to update request");
            }
        } catch (error) {
            Alert.alert("Error", "Network error");
        } finally {
            setProcessing(false);
        }
    };

    const renderItem = ({ item }: { item: ApprovalRequest }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.resourceType}>{item.resource_type.replace('_', ' ')}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.requester}>From: {item.requester.name} ({item.requester.role})</Text>

            {item.metadata?.reason && (
                <Text style={styles.reason}>Reason: {item.metadata.reason}</Text>
            )}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleDecision(item, 'REJECTED')}
                >
                    <Text style={styles.buttonText}>{t('vp_dashboard.approvals.reject')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleDecision(item, 'APPROVED')}
                >
                    <Text style={styles.buttonText}>{t('vp_dashboard.approvals.approve')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" color="#1976d2" />;

    return (
        <View style={styles.container}>
            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 4 }}
            />

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {decision === 'APPROVED' ? t('vp_dashboard.approvals.approve') : t('vp_dashboard.approvals.reject')} Request
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('vp_dashboard.approvals.reason_placeholder')}
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={submitDecision}
                                style={[styles.modalButton, { backgroundColor: decision === 'APPROVED' ? '#4caf50' : '#f44336' }]}
                                disabled={processing}
                            >
                                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                                    {processing ? '...' : t('vp_dashboard.approvals.confirm_decision')}
                                </Text>
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    resourceType: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333'
    },
    date: {
        color: '#999',
        fontSize: 12
    },
    requester: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4
    },
    reason: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#444',
        marginBottom: 12
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4
    },
    approveButton: { backgroundColor: '#4caf50' },
    rejectButton: { backgroundColor: '#f44336' },
    buttonText: { color: 'white', fontWeight: 'bold' },

    // Modal
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
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    modalButton: {
        padding: 10,
        borderRadius: 4
    },
    modalButtonText: {
        fontWeight: 'bold',
        color: '#555'
    }
});
