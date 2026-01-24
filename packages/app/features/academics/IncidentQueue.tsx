import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { AlertCircle, FileText, CheckCircle, ArrowRight } from 'lucide-react';

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
                alert("Incident updated");
                setModalVisible(false);
                setNote('');
                fetchIncidents();
            }
        } catch (error) {
            alert("Failed to update");
        } finally {
            setProcessing(false);
        }
    };

    const getSeverityBadge = (severity: string) => {
        const styles: Record<string, string> = {
            'CRITICAL': 'bg-red-100 border-red-200',
            'MAJOR': 'bg-orange-100 border-orange-200',
            'MINOR': 'bg-yellow-100 border-yellow-200',
        };

        const textStyles: Record<string, string> = {
            'CRITICAL': 'text-red-800',
            'MAJOR': 'text-orange-800',
            'MINOR': 'text-yellow-800',
        };

        return (
            <View className={`px-2 py-0.5 rounded-full border ${styles[severity] || styles['MINOR']}`}>
                <Text className={`text-xs font-bold ${textStyles[severity] || textStyles['MINOR']}`}>
                    {severity}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="p-8 items-center">
                <Text className="text-slate-500">Loading incidents...</Text>
            </View>
        );
    }

    return (
        <View className="gap-4">
            {incidents.length === 0 && (
                <View className="p-8 items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                    <CheckCircle color="#94a3b8" size={32} opacity={0.5} />
                    <Text className="text-slate-400 mt-2">No new incidents reported</Text>
                </View>
            )}

            {incidents.map(item => (
                <NebulaCard key={item.id} className="border-slate-200">
                    <View className="flex-col md:flex-row justify-between md:items-start gap-4">
                        <View className="flex-1">
                            <View className="flex-row items-center gap-3 mb-2">
                                {getSeverityBadge(item.severity)}
                                <Text className="text-xs text-slate-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-2 mb-1">
                                <Text className="font-bold text-slate-900 dark:text-white">
                                    {item.student.name}
                                </Text>
                                <View className="bg-slate-100 dark:bg-slate-800 px-2 rounded">
                                    <Text className="text-sm font-normal text-slate-500">
                                        {item.student.admission_no}
                                    </Text>
                                </View>
                            </View>

                            <View className="border-l-2 border-slate-200 pl-3 mb-3">
                                <Text className="text-sm text-slate-600 dark:text-slate-300">
                                    {item.description}
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-1">
                                <AlertCircle size={12} color="#94a3b8" />
                                <Text className="text-xs text-slate-400">
                                    Reported by {item.reporter.name}
                                </Text>
                            </View>
                        </View>

                        <NebulaButton onClick={() => openTriage(item)}>
                            <Text className="text-white mr-2">Triage Incident</Text>
                            <ArrowRight size={16} color="white" />
                        </NebulaButton>
                    </View>
                </NebulaCard>
            ))}

            {/* Triage Modal (Universal Overlay) */}
            {modalVisible && (
                <View className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 z-50 items-center justify-center p-4">
                    <View className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <View className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-row items-center gap-2">
                            <FileText size={20} color="#6366f1" />
                            <Text className="font-bold text-lg text-slate-800 dark:text-white">
                                Update Incident Status
                            </Text>
                        </View>

                        <View className="p-6 gap-6">
                            <View>
                                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                    Select New Status
                                </Text>
                                <View className="flex-row gap-2">
                                    {['UNDER_REVIEW', 'RESOLVED', 'ESCALATED'].map(s => (
                                        <Pressable
                                            key={s}
                                            onPress={() => setStatus(s)}
                                            className={`flex-1 py-2 px-3 rounded-lg border items-center ${status === s
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            <Text className={`text-sm font-medium ${status === s ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {s.replace('_', ' ')}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('vp_dashboard.incidents.confidential_note') || "Confidential Notes"}
                                </Text>
                                <TextInput
                                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 min-h-[100px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white align-top"
                                    value={note}
                                    onChangeText={setNote}
                                    placeholder="Add internal notes for staff..."
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                        </View>

                        <View className="p-4 border-t border-slate-100 dark:border-slate-800 flex-row justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                            <NebulaButton
                                variant="ghost"
                                onClick={() => setModalVisible(false)}
                            >
                                <Text className="text-slate-600">Cancel</Text>
                            </NebulaButton>
                            <NebulaButton
                                onClick={submitTriage}
                                disabled={processing}
                                className="bg-indigo-600"
                            >
                                <Text className="text-white">
                                    {processing ? 'Updating...' : 'Update Status'}
                                </Text>
                            </NebulaButton>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};
