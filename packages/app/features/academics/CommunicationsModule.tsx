import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaButton } from '../../components/nebula/NebulaButton';
import { Send, Users, UserCog, CheckCircle } from 'lucide-react';
import api from '../../api/client';

export const CommunicationsModule = () => {
    const [targetType, setTargetType] = useState<'CLASS' | 'STAFF'>('CLASS');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await api.post('/vice-principal/communications/send', {
                targetType,
                message
            });
            setSuccess(true);
            setMessage('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            alert('Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    return (
        <NebulaCard className="min-h-[400px]">
            <View className="flex-row items-center gap-2 mb-6">
                <Send size={24} color="#3b82f6" />
                <Text className="text-xl font-bold text-slate-800 dark:text-white">
                    Quick Broadcast
                </Text>
            </View>

            <View className="gap-6">
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                        Target Audience
                    </Text>
                    <View className="flex-row gap-4">
                        <Pressable
                            onPress={() => setTargetType('CLASS')}
                            className={`flex-1 p-4 rounded-xl border-2 items-center gap-2 ${targetType === 'CLASS'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700'
                                }`}
                        >
                            <Users size={24} color={targetType === 'CLASS' ? '#1d4ed8' : '#64748b'} />
                            <Text className={`font-bold ${targetType === 'CLASS' ? 'text-blue-700' : 'text-slate-500'}`}>
                                All Classes
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setTargetType('STAFF')}
                            className={`flex-1 p-4 rounded-xl border-2 items-center gap-2 ${targetType === 'STAFF'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700'
                                }`}
                        >
                            <UserCog size={24} color={targetType === 'STAFF' ? '#7e22ce' : '#64748b'} />
                            <Text className={`font-bold ${targetType === 'STAFF' ? 'text-purple-700' : 'text-slate-500'}`}>
                                All Staff
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                        Message Content
                    </Text>
                    <TextInput
                        className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white align-top"
                        placeholder={`Type your announcement for ${targetType === 'CLASS' ? 'students' : 'staff'}...`}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <View className="flex-row items-center justify-between">
                    {success ? (
                        <View className="flex-row items-center gap-2">
                            <CheckCircle size={20} color="#059669" />
                            <Text className="text-emerald-600 font-bold">Sent Successfully!</Text>
                        </View>
                    ) : (
                        <View />
                    )}

                    <NebulaButton
                        onClick={handleSend}
                        disabled={sending || !message}
                        className="bg-slate-800 px-8"
                    >
                        <Text className="text-white font-medium">
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </Text>
                    </NebulaButton>
                </View>
            </View>
        </NebulaCard>
    );
};
