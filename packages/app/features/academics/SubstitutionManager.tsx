import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { RefreshCw, UserCheck, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

interface Substitution {
    id: string;
    originalTeacherName: string;
    originalTeacherId: string; // Added field
    className: string;
    classId: string; // Added field
    date: string;
    period: number;
    reason: string;
    status: string;
}

// MOCK_TEACHERS removed in favor of API fetch

export const SubstitutionManager = () => {
    const { t } = useLanguage();
    const [subs, setSubs] = useState<Substitution[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState<Substitution | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);

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

    const fetchTeachers = async () => {
        try {
            // Using the teacher-performance endpoint as it returns a list of teachers with IDs
            const res = await api.get('/vice-principal/teacher-performance');
            if (res.status === 200) {
                setTeachers(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        }
    };

    useEffect(() => {
        fetchSubs();
    }, []);

    const handleAssign = (sub: Substitution) => {
        setSelectedSub(sub);
        // Fetch teachers only when opening the modal to save resources
        if (teachers.length === 0) fetchTeachers();
        setModalVisible(true);
    };

    const confirmAssignment = async (teacherId: string) => {
        if (!selectedSub) return;
        setProcessing(true);
        try {
            const res = await api.post('/vice-principal/substitutions/confirm', {
                substitutionId: selectedSub.id,
                class_id: selectedSub.classId,
                period_slot: selectedSub.period,
                absent_teacher_id: selectedSub.originalTeacherId,
                substitute_teacher_id: teacherId
            });

            if (res.status === 200) {
                alert("Substitution assigned successfully");
                setModalVisible(false);
                fetchSubs();
            }
        } catch (error) {
            console.error(error);
            alert("Failed to assign substitute. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <View className="p-8 items-center">
                <Text className="text-slate-500">Loading schedule...</Text>
            </View>
        );
    }

    return (
        <View className="gap-6">
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                    <RefreshCw color="#6366f1" size={20} />
                    <Text className="text-lg font-bold text-slate-800 dark:text-white">
                        Substitution Needs
                    </Text>
                </View>
            </View>

            {subs.length === 0 ? (
                <View className="items-center p-12 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <CheckCircle color="#34d399" size={32} />
                    <Text className="text-slate-400 mt-2 text-center">
                        {t('vp_dashboard.substitutions.no_pending') || "No pending substitutions needed today."}
                    </Text>
                </View>
            ) : (
                <View className="gap-4">
                    {subs.map(item => (
                        <NebulaCard key={item.id} className="p-4">
                            <View className="flex-col md:flex-row items-center justify-between gap-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-3 mb-2">
                                        <View className="bg-indigo-100 px-3 py-1 rounded-md">
                                            <Text className="text-indigo-700 text-sm font-bold">
                                                Pd. {item.period}
                                            </Text>
                                        </View>
                                        <Text className="text-lg font-semibold text-slate-800 dark:text-white">
                                            {item.className}
                                        </Text>
                                        <View className="flex-row items-center gap-1 ml-auto md:ml-0">
                                            <Calendar size={14} color="#94a3b8" />
                                            <Text className="text-slate-400 text-sm">
                                                {new Date(item.date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-rose-500 font-medium">Absent:</Text>
                                        <Text className="text-slate-600 dark:text-slate-300">{item.originalTeacherName}</Text>
                                        <Text className="text-xs text-slate-400 italic">({item.reason})</Text>
                                    </View>
                                </View>

                                <NebulaButton onClick={() => handleAssign(item)}>
                                    <UserCheck size={16} color="white" className="mr-2" />
                                    <Text className="text-white ml-2">
                                        {t('vp_dashboard.substitutions.assign') || "Assign Substitute"}
                                    </Text>
                                </NebulaButton>
                            </View>
                        </NebulaCard>
                    ))}
                </View>
            )}

            {/* Teacher Selection Modal (Universal Overlay) */}
            {modalVisible && (
                <View className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 z-50 items-center justify-center p-4">
                    <View className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex-shrink h-[80%] max-h-[500px]">
                        <View className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <Text className="font-bold text-lg text-slate-800 dark:text-white">
                                {t('vp_dashboard.substitutions.select_teacher') || "Select Substitute Teacher"}
                            </Text>
                        </View>

                        <ScrollView className="flex-1">
                            {teachers.length === 0 ? (
                                <View className="p-8 items-center">
                                    <Text className="text-slate-400">Loading teachers...</Text>
                                </View>
                            ) : (
                                teachers.map(teacher => (
                                    <Pressable
                                        key={teacher.id}
                                        onPress={() => confirmAssignment(teacher.id)}
                                        className="w-full p-4 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between active:bg-slate-50 dark:active:bg-slate-800 hover:bg-slate-50"
                                    >
                                        <Text className="font-medium text-slate-700 dark:text-slate-300">
                                            {teacher.name}
                                        </Text>
                                        {processing ? (
                                            <Text className="text-xs text-slate-400">...</Text>
                                        ) : (
                                            <ArrowRight size={16} color="#6366f1" />
                                        )}
                                    </Pressable>
                                ))
                            )}
                        </ScrollView>

                        <View className="p-4 bg-slate-50 dark:bg-slate-900/50 flex-row justify-end">
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className="px-4 py-2 rounded-lg"
                            >
                                <Text className="text-rose-600 font-medium font-bold">Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};
