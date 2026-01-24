import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { Search, User, Phone, Mail } from 'lucide-react';
import api from '../../api/client';

export const StudentRosterModule = () => {
    const [query, setQuery] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (query.trim().length < 2) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await api.get(`/vice-principal/students/search?query=${encodeURIComponent(query)}`);
            if (res.status === 200) {
                setStudents(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <NebulaCard className="min-h-[400px]">
            <View className="mb-6">
                <View className="flex-row items-center gap-2 mb-4">
                    <User color="#6366f1" size={24} />
                    <Text className="text-xl font-bold text-slate-800 dark:text-white">
                        Student Directory
                    </Text>
                </View>

                <View className="flex-row gap-2">
                    <View className="flex-1 relative justify-center">
                        <View className="absolute left-3 z-10">
                            <Search size={20} color="#94a3b8" />
                        </View>
                        <TextInput
                            placeholder="Search by name or admission number..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <NebulaButton onClick={handleSearch} disabled={loading || query.length < 2}>
                        <Text className="text-white">{loading ? 'Searching...' : 'Search'}</Text>
                    </NebulaButton>
                </View>
            </View>

            <ScrollView className="w-full">
                {searched && students.length === 0 && !loading && (
                    <View className="p-8 items-center">
                        <Text className="text-slate-400">
                            No students found matching "{query}"
                        </Text>
                    </View>
                )}

                <View className="gap-3">
                    {students.map((student) => (
                        <View
                            key={student.id}
                            className="flex-row items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                        >
                            <View className="flex-row items-center gap-4 flex-1">
                                <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                                    <Text className="text-indigo-600 font-bold">
                                        {student.name.charAt(0)}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-slate-800 dark:text-white">{student.name}</Text>
                                    <View className="flex-row items-center gap-2 mt-1">
                                        <View className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                            <Text className="text-xs text-slate-600 dark:text-slate-300">
                                                {student.admission_no}
                                            </Text>
                                        </View>
                                        {student.enrollments?.[0]?.class ? (
                                            <Text className="text-sm text-slate-500">
                                                Class {student.enrollments[0].class.grade}-{student.enrollments[0].class.section}
                                            </Text>
                                        ) : (
                                            <Text className="text-sm text-slate-400 italic">No active class</Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row gap-2">
                                <Pressable className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 items-center justify-center">
                                    <User size={18} color="#94a3b8" />
                                </Pressable>
                                <Pressable className="p-2 rounded-lg bg-emerald-50 items-center justify-center">
                                    <Phone size={18} color="#059669" />
                                </Pressable>
                                <Pressable className="p-2 rounded-lg bg-blue-50 items-center justify-center">
                                    <Mail size={18} color="#2563eb" />
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </NebulaCard>
    );
};
