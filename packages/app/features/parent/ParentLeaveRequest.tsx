// packages/app/features/parent/ParentLeaveRequest.tsx
// Leave Request Form for Parents

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Calendar, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useRequestLeave } from '../../../hooks/useParentData';
import { SovereignButton, SovereignSkeleton } from '../../components/SovereignComponents';

interface Props {
    studentId: string | null;
}

const LEAVE_TYPES = [
    { id: 'SICK', label: 'Sick Leave' },
    { id: 'CASUAL', label: 'Casual Leave' },
    { id: 'EARNED', label: 'Earned Leave' },
];

export const ParentLeaveRequest: React.FC<Props> = ({ studentId }) => {
    const [leaveType, setLeaveType] = useState('SICK');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const requestLeave = useRequestLeave();

    const handleSubmit = async () => {
        setError('');
        setSuccess(false);

        if (!studentId) {
            setError('Student ID is missing');
            return;
        }

        if (!startDate || !endDate) {
            setError('Please select start and end dates');
            return;
        }

        if (!reason.trim()) {
            setError('Please provide a reason for leave');
            return;
        }

        try {
            await requestLeave.mutateAsync({
                studentId,
                type: leaveType as 'SICK' | 'CASUAL' | 'EARNED',
                start_date: startDate,
                end_date: endDate,
                reason,
                attachment_url: attachment || undefined,
            });
            setSuccess(true);
            // Reset form
            setStartDate('');
            setEndDate('');
            setReason('');
            setAttachment(null);
        } catch (err: any) {
            setError(err.message || 'Failed to submit leave request');
        }
    };

    if (!studentId) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-500 dark:text-slate-400">
                    Please select a child to apply for leave
                </Text>
            </View>
        );
    }

    if (success) {
        return (
            <View className="flex-1 items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl m-4">
                <View className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </View>
                <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Request Submitted
                </Text>
                <Text className="text-center text-slate-500 dark:text-slate-400 mb-6">
                    Your leave request has been sent for approval. You will receive a notification once verified.
                </Text>
                <SovereignButton
                    variant="primary"
                    onPress={() => setSuccess(false)}
                >
                    Submit Another Request
                </SovereignButton>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4">
            <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <View className="flex-row items-center gap-3 mb-6">
                    <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-slate-900 dark:text-white">
                            Apply for Leave
                        </Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400">
                            Submit a leave application for your child
                        </Text>
                    </View>
                </View>

                {/* Leave Type */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Leave Type
                    </Text>
                    <View className="flex-row gap-2 flex-wrap">
                        {LEAVE_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setLeaveType(type.id)}
                                className={`px-4 py-2 rounded-lg border ${leaveType === type.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600'
                                    }`}
                            >
                                <Text className={`font-medium ${leaveType === type.id
                                        ? 'text-indigo-700 dark:text-indigo-300'
                                        : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Dates */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            From Date
                        </Text>
                        <TextInput
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="YYYY-MM-DD"
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            To Date
                        </Text>
                        <TextInput
                            value={endDate}
                            onChangeText={setEndDate}
                            placeholder="YYYY-MM-DD"
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white"
                        />
                    </View>
                </View>

                {/* Reason */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Reason
                    </Text>
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        numberOfLines={4}
                        placeholder="Please describe why leave is required..."
                        textAlignVertical="top"
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white h-32"
                    />
                </View>

                {/* Attachment (Mock) */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Attachment (Optional)
                    </Text>
                    <TouchableOpacity
                        onPress={() => setAttachment('mock-url')} // Mock upload
                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 items-center justify-center bg-slate-50 dark:bg-slate-900"
                    >
                        {attachment ? (
                            <View className="items-center">
                                <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                                <Text className="text-sm text-green-600 font-medium">
                                    File Attached
                                </Text>
                            </View>
                        ) : (
                            <View className="items-center">
                                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                <Text className="text-sm text-slate-500">
                                    Tap to upload medical certificate or proof
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error ? (
                    <View className="flex-row items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6 border border-red-200 dark:border-red-900/50">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <Text className="text-sm text-red-600 dark:text-red-400 flex-1">
                            {error}
                        </Text>
                    </View>
                ) : null}

                {/* Submit Button */}
                <SovereignButton
                    variant="primary"
                    onPress={handleSubmit}
                    isLoading={requestLeave.isPending}
                    className="w-full"
                >
                    Submit Leave Request
                </SovereignButton>
            </View>
        </ScrollView>
    );
};
