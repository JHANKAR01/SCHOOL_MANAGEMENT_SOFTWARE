// packages/app/components/ActionModal.native.tsx
// Mobile-native version of ActionModal using React Native Modal
// Uses StyleSheet instead of className for TypeScript compatibility

import React from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react';
import { SovereignButton } from './SovereignComponents';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export const ActionModal: React.FC<ActionModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    actions,
}) => {
    if (!isOpen) return null;

    return (
        <Modal
            visible={isOpen}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content}>
                        {children}
                    </ScrollView>

                    {/* Actions */}
                    {actions && (
                        <View style={styles.actions}>
                            {actions}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        gap: 12,
    },
});

export default ActionModal;
