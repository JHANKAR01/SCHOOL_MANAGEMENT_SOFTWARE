import React, { useState } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput'; // Assuming existence or using TextInput with Nebula style
import { Search, User, Phone, Mail, Filter } from 'lucide-react';
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
        <NebulaCard className="min-h-[600px] flex-1">
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-3">
                    <View className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                        <User className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                            Student Directory
                        </Text>
                        <Text className="text-slate-500 text-sm">
                            Manage student records and contact information
                        </Text>
                    </View>
                </View>
            </View>

            <View className="flex-row gap-3 mb-8">
                <View className="flex-1">
                    {/* Assuming standard TextInput if NebulaInput is not exported or different */}
                    <View className="relative">
                        <View className="absolute left-3 top-3 z-10">
                            <Search size={20} className="text-slate-400" />
                        </View>
                        <View className="flex-row bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden items-center">
                            {/* Universal TextInput */}
                            {/* Note: In a real Nebula ecosystem, use <NebulaInput /> */}
                            <input
                                type="text"
                                className="w-full py-3 pl-10 pr-4 bg-transparent outline-none text-slate-800 dark:text-white"
                                placeholder="Search by name, admission ID, or class..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </View>
                    </View>
                </View>
                <NebulaButton onClick={handleSearch} disabled={loading || query.length < 2} className="px-6">
                    <Text className="text-white font-medium">{loading ? 'Searching...' : 'Search Directory'}</Text>
                </NebulaButton>
            </View>

            {/* TABLE HEADER */}
            <View className="hidden md:flex flex-row px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl border-b border-slate-200 dark:border-slate-700">
                <Text className="flex-[2] text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</Text>
                <Text className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Class</Text>
                <Text className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Contact</Text>
                <Text className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</Text>
            </View>

            <ScrollView className="flex-1">
                {searched && students.length === 0 && !loading && (
                    <View className="p-12 items-center justify-center">
                        <Text className="text-slate-400 text-lg">No students found matching "{query}"</Text>
                    </View>
                )}

                {!searched && students.length === 0 && (
                    <View className="p-12 items-center justify-center opacity-50">
                        <Search size={48} className="text-slate-300 mb-4" />
                        <Text className="text-slate-400 text-lg">Search for a student to begin</Text>
                    </View>
                )}

                <View className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((student) => (
                        <View
                            key={student.id}
                            className="flex-col md:flex-row md:items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            {/* NAME COLUMN */}
                            <View className="flex-[2] flex-row items-center gap-4 mb-2 md:mb-0">
                                <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                    {student.name.charAt(0)}
                                </View>
                                <View>
                                    <Text className="font-bold text-slate-800 dark:text-white text-base">
                                        {student.name}
                                    </Text>
                                    <Text className="text-xs text-slate-400 md:hidden">
                                        {student.admission_no} • {student.enrollments?.[0]?.class ? `Class ${student.enrollments[0].class.grade}-${student.enrollments[0].class.section}` : 'No Class'}
                                    </Text>
                                </View>
                            </View>

                            {/* ID/CLASS COLUMN */}
                            <View className="flex-1 hidden md:flex">
                                <View className="flex-row items-center gap-2">
                                    <Text className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                                        {student.admission_no}
                                    </Text>
                                </View>
                                <Text className="text-sm text-slate-500 mt-1">
                                    {student.enrollments?.[0]?.class ? `Class ${student.enrollments[0].class.grade}-${student.enrollments[0].class.section}` : <span className="italic text-slate-400">No Class</span>}
                                </Text>
                            </View>

                            {/* PARENT COLUMN */}
                            <View className="flex-1 mb-2 md:mb-0">
                                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {/* Mock Parent Name if missing */}
                                    Parent
                                </Text>
                                <View className="flex-row items-center gap-2 mt-1">
                                    <View className="flex-row items-center gap-1">
                                        <Phone size={12} className="text-slate-400" />
                                        <Text className="text-xs text-slate-500">+1 234 567 890</Text>
                                    </View>
                                </View>
                            </View>

                            {/* ACTIONS COLUMN */}
                            <View className="flex-1 flex-row justify-end items-center gap-2">
                                <NebulaButton size="sm" variant="secondary" onClick={() => { }}>
                                    <User size={16} className="text-slate-500" />
                                </NebulaButton>
                                <NebulaButton size="sm" variant="secondary" onClick={() => { }}>
                                    <Mail size={16} className="text-blue-500" />
                                </NebulaButton>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </NebulaCard>
    );
};
