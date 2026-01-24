import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';

interface Substitution {
    id: string;
    originalTeacherName: string;
    className: string;
    date: string;
    period: number;
    reason: string;
    status: string;
}

const MOCK_TEACHERS = [
    { id: 'user_1', name: 'Mr. Sharma (Math)' },
    { id: 'user_2', name: 'Ms. Gupta (Science)' },
    { id: 'user_3', name: 'Mrs. Khan (English)' },
];

export const SubstitutionManager = () => {
    const { t } = useLanguage();
    const [subs, setSubs] = useState<Substitution[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState<Substitution | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [processing, setProcessing] = useState(false);

    const fetchSubs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vice-principal/substitutions');
            if (res.status === 200) {
                setSubs(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubs();
    }, []);

    const handleAssign = (sub: Substitution) => {
        setSelectedSub(sub);
        setModalVisible(true);
    };

    const confirmAssignment = async (teacherId: string) => {
        if (!selectedSub) return;
        setProcessing(true);
        try {
            const res = await api.post('/vice-principal/substitutions/confirm', {
                substitutionId: selectedSub.id,
                substituteTeacherId: teacherId
            });

            if (res.status === 200) {
                Alert.alert("Success", "Substitution assigned");
                setModalVisible(false);
                fetchSubs();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to assign");
        } finally {
            setProcessing(false);
        }
    };

    const renderItem = ({ item }: { item: Substitution }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.period}>Period {item.period}</Text>
                <Text style={styles.className}>{item.className}</Text>
            </View>
            <Text style={styles.teacher}>Absent: {item.originalTeacherName}</Text>
            <Text style={styles.reason}>Reason: {item.reason}</Text>

            <TouchableOpacity
                style={styles.assignButton}
                onPress={() => handleAssign(item)}
            >
                <Text style={styles.assignText}>{t('vp_dashboard.substitutions.assign')}</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" color="#1976d2" />;

    return (
        <View style={styles.container}>
            {subs.length === 0 ? (
                <Text style={styles.empty}>{t('vp_dashboard.substitutions.no_pending')}</Text>
            ) : (
                <FlatList
                    data={subs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            )}

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('vp_dashboard.substitutions.select_teacher')}</Text>

                        {MOCK_TEACHERS.map(teacher => (
                            <TouchableOpacity
                                key={teacher.id}
                                style={styles.teacherOption}
                                onPress={() => confirmAssignment(teacher.id)}
                            >
                                <Text style={styles.teacherName}>{teacher.name}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    empty: { textAlign: 'center', marginTop: 20, color: '#666' },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    period: {
        fontWeight: 'bold',
        color: '#1976d2',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    className: {
        fontWeight: 'bold',
        fontSize: 16
    },
    teacher: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4
    },
    reason: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 12
    },
    assignButton: {
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center'
    },
    assignText: { color: 'white', fontWeight: 'bold' },

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
    teacherOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    teacherName: {
        fontSize: 16,
        color: '#333'
    },
    cancelButton: {
        marginTop: 16,
        alignItems: 'center'
    },
    cancelText: {
        color: '#f44336'
    }
});
