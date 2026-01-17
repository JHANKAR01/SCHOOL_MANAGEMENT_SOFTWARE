import React, { useState } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { X } from 'lucide-react';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { NebulaInput } from '../../components/nebula/NebulaInput';
import { NebulaButton } from '../../components/nebula/NebulaButton';

interface AddInquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddInquiryModal = ({ isOpen, onClose, onSuccess }: AddInquiryModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        parent_name: '',
        phone: '',
        target_class: '',
        previous_school: '',
    });

    const handleSubmit = async () => {
        if (!formData.student_name || !formData.phone || !formData.parent_name) {
            alert('Student Name, Parent Name, and Phone are required');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    status: 'NEW',
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ student_name: '', parent_name: '', phone: '', target_class: '', previous_school: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create inquiry');
            }
        } catch (error) {
            console.error('Failed to create inquiry:', error);
            alert('Failed to create inquiry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="w-full max-w-md">
                        <NebulaCard className="p-6 max-h-[90%]">

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Header */}
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-bold text-slate-100">New Admission Inquiry</Text>
                                    <TouchableOpacity onPress={onClose}>
                                        <X size={24} color="#94A3B8" />
                                    </TouchableOpacity>
                                </View>

                                {/* Form */}
                                <View className="space-y-4">
                                    <NebulaInput
                                        label="Student Name"
                                        value={formData.student_name}
                                        onChangeText={(t) => setFormData({ ...formData, student_name: t })}
                                        placeholder="e.g. Rahul Kumar"
                                    />
                                    <NebulaInput
                                        label="Parent/Guardian Name"
                                        value={formData.parent_name}
                                        onChangeText={(t) => setFormData({ ...formData, parent_name: t })}
                                        placeholder="e.g. Mr. Suresh Kumar"
                                    />
                                    <NebulaInput
                                        label="Mobile Number"
                                        value={formData.phone}
                                        onChangeText={(t) => setFormData({ ...formData, phone: t })}
                                        placeholder="e.g. 9876543210"
                                        keyboardType="phone-pad"
                                    />
                                    <NebulaInput
                                        label="Target Class"
                                        value={formData.target_class}
                                        onChangeText={(t) => setFormData({ ...formData, target_class: t })}
                                        placeholder="e.g. 10"
                                    />
                                    <NebulaInput
                                        label="Previous School"
                                        value={formData.previous_school}
                                        onChangeText={(t) => setFormData({ ...formData, previous_school: t })}
                                        placeholder="e.g. St. Mary's"
                                    />
                                </View>

                                {/* Footer */}
                                <View className="mt-8 flex-row justify-end space-x-3">
                                    <TouchableOpacity onPress={onClose} className="px-4 py-2">
                                        <Text className="text-slate-400 font-medium">Cancel</Text>
                                    </TouchableOpacity>
                                    <View className="w-32">
                                        <NebulaButton onPress={handleSubmit} disabled={loading}>
                                            {loading ? <ActivityIndicator color="white" size="small" /> : 'Create Inquiry'}
                                        </NebulaButton>
                                    </View>
                                </View>
                            </ScrollView>

                        </NebulaCard>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
