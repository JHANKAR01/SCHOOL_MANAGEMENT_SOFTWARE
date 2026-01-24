import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';
import { UserRole } from '../../../types/user';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { Check, X, Clock } from 'lucide-react';

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
                setModalVisible(false);
                setComment('');
                fetchApprovals(); // Refresh list
            } else {
                alert("Failed to update request");
            }
        } catch (error) {
            alert("Network error");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <View className="p-8 items-center">
                <Text className="text-slate-500">Loading requests...</Text>
            </View>
        );
    }

    return (
        <View className="gap-4">
            {requests.length === 0 && (
                <View className="p-8 items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                    <Text className="text-slate-400">No pending approval requests</Text>
                </View>
            )}

            {requests.map(item => (
                <NebulaCard key={item.id} className="flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                            <View className="bg-blue-100 px-2 py-0.5 rounded">
                                <Text className="text-blue-800 text-xs font-bold uppercase">
                                    {item.resource_type.replace('_', ' ')}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Clock size={12} color="#94a3b8" />
                                <Text className="text-slate-400 text-xs text-xs">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                        <Text className="font-semibold text-slate-800 dark:text-white mb-1">
                            {item.requester.name} <Text className="text-slate-400 font-normal">({item.requester.role})</Text>
                        </Text>
                        {item.metadata?.reason && (
                            <Text className="text-sm text-slate-600 dark:text-slate-300 italic">
                                "{item.metadata.reason}"
                            </Text>
                        )}
                    </View>

                    <View className="flex-row gap-2 w-full md:w-auto">
                        <NebulaButton
                            variant="secondary"
                            className="bg-rose-50 border-rose-200"
                            onClick={() => handleDecision(item, 'REJECTED')}
                        >
                            <X size={16} color="#e11d48" className="mr-2" />
                            <Text className="text-rose-600 ml-2">Reject</Text>
                        </NebulaButton>
                        <NebulaButton
                            className="bg-emerald-600 border-transparent"
                            onClick={() => handleDecision(item, 'APPROVED')}
                        >
                            <Check size={16} color="white" className="mr-2" />
                            <Text className="text-white ml-2">Approve</Text>
                        </NebulaButton>
                    </View>
                </NebulaCard>
            ))}

            {/* Universal Modal Overlay */}
            {modalVisible && (
                <View className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 z-50 items-center justify-center p-4">
                    <View className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <View className={`p-4 border-b ${decision === 'APPROVED' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <Text className={`font-bold text-lg ${decision === 'APPROVED' ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {decision === 'APPROVED' ? 'Approve Request' : 'Reject Request'}
                            </Text>
                        </View>

                        <View className="p-6">
                            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {decision === 'APPROVED' ? 'Approval Note (Optional)' : 'Rejection Reason (Required)'}
                            </Text>
                            <TextInput
                                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 min-h-[100px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white align-top"
                                placeholder="Add a note..."
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View className="p-4 border-t border-slate-100 dark:border-slate-800 flex-row justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                            <NebulaButton
                                variant="ghost"
                                onClick={() => setModalVisible(false)}
                            >
                                Cancel
                            </NebulaButton>
                            <NebulaButton
                                onClick={submitDecision}
                                disabled={processing}
                                className={decision === 'APPROVED' ? 'bg-emerald-600' : 'bg-rose-600'}
                            >
                                {processing ? 'Processing...' : `Confirm ${decision === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                            </NebulaButton>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};
