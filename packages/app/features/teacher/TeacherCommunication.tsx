// packages/app/features/teacher/TeacherCommunication.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useTranslation } from '../../provider/language-context';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import client from '../../api/client';
import { useMyClassesToday } from '../../hooks/useTeacherData';

interface Announcement {
    id: string;
    title: string;
    message: string;
    created_at: string;
}

export const TeacherCommunication = () => {
    const { t } = useTranslation();
    const { data: classes = [] } = useMyClassesToday();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [history, setHistory] = useState<Announcement[]>([]);
    const [sending, setSending] = useState(false);

    // Get unique classes
    const uniqueClasses = Array.from(new Set(classes.map(c => c.classId)))
        .map(id => classes.find(c => c.classId === id))
        .filter(Boolean);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await client.get('/api/teacher/announcements');
            setHistory(res.data);
        } catch (e) {
            console.error('Failed to load announcements', e);
        }
    };

    const handleSend = async () => {
        if (!title || !message || selectedClassIds.length === 0) {
            Alert.alert('Error', 'Please fill all fields and select at least one class');
            return;
        }

        setSending(true);
        try {
            await client.post('/api/teacher/announcements', {
                title,
                message,
                targetClassIds: selectedClassIds
            });
            Alert.alert('Success', 'Announcement sent successfully');
            setTitle('');
            setMessage('');
            setSelectedClassIds([]);
            loadHistory();
        } catch (e) {
            Alert.alert('Error', 'Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    const toggleClass = (id: string) => {
        if (selectedClassIds.includes(id)) {
            setSelectedClassIds(prev => prev.filter(c => c !== id));
        } else {
            setSelectedClassIds(prev => [...prev, id]);
        }
    };

    return (
        <ScrollView className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">
            <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                Announcements
            </Text>

            {/* Compose Card */}
            <NebulaCard className="mb-6 p-4">
                <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    New Message
                </Text>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Select Classes
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {uniqueClasses.map((c: any) => (
                            <TouchableOpacity
                                key={c.classId}
                                onPress={() => toggleClass(c.classId)}
                                className={`px-3 py-2 rounded-full border ${selectedClassIds.includes(c.classId)
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <Text className={`text-sm font-medium ${selectedClassIds.includes(c.classId)
                                    ? 'text-white'
                                    : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                    {c.className}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <NebulaInput
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    placeholder="e.g. Exam Schedule"
                    className="mb-4"
                />

                {/* Custom Text Area since NebulaInput doesn't support multiline yet */}
                <View className="mb-4 space-y-1.5">
                    <Text className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Message
                    </Text>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type your message..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200
                        border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 
                        text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <NebulaButton
                    onClick={handleSend}
                    disabled={sending}
                    variant="primary"
                >
                    {sending ? "Sending..." : "Send Announcement"}
                </NebulaButton>
            </NebulaCard>

            {/* History */}
            <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Recent Announcements
            </Text>

            {history.map(item => (
                <NebulaCard key={item.id} className="mb-3 p-4">
                    <Text className="font-bold text-slate-800 dark:text-white text-base">
                        {item.title}
                    </Text>
                    <Text className="text-slate-600 dark:text-slate-300 mt-1">
                        {item.message}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-2">
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </NebulaCard>
            ))}

            {history.length === 0 && (
                <Text className="text-center text-slate-400 py-8">
                    No announcements sent yet
                </Text>
            )}
        </ScrollView>
    );
};
