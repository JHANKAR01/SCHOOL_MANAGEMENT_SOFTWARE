// packages/app/components/nebula/NebulaToggle.native.tsx
// Mobile-native version of NebulaToggle components
// Uses StyleSheet instead of className for TypeScript compatibility

import React, { useState } from 'react';
import { View, Text, Pressable, Switch, Modal, StyleSheet } from 'react-native';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA MODIFY TOGGLE - Native Version
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaModifyToggleProps {
    isModifyMode: boolean;
    onToggle: () => void;
    label?: string;
}

export const NebulaModifyToggle: React.FC<NebulaModifyToggleProps> = ({
    isModifyMode,
    onToggle,
    label = 'Edit Mode',
}) => {
    const { isDarkMode } = useTheme();

    return (
        <Pressable onPress={onToggle} style={[
            styles.modifyToggle,
            isDarkMode ? styles.modifyToggleDark : styles.modifyToggleLight,
            isModifyMode && styles.modifyToggleActive,
        ]}>
            <View style={[
                styles.modifyIndicator,
                isModifyMode ? styles.indicatorActive : styles.indicatorInactive,
            ]} />
            <Text style={[
                styles.modifyLabel,
                isDarkMode && styles.modifyLabelDark,
            ]}>
                {label}
            </Text>
        </Pressable>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA SWITCH - Native Version
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaSwitchProps {
    value: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const NebulaSwitch: React.FC<NebulaSwitchProps> = ({
    value,
    onChange,
    label,
    disabled = false,
}) => {
    const { isDarkMode } = useTheme();

    return (
        <View style={styles.switchContainer}>
            {label && (
                <Text style={[styles.switchLabel, isDarkMode && styles.switchLabelDark]}>
                    {label}
                </Text>
            )}
            <Switch
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                trackColor={{ false: '#94a3b8', true: '#3b82f6' }}
                thumbColor={value ? '#ffffff' : '#f4f3f4'}
            />
        </View>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIRM OVERRIDE MODAL - Native Version
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConfirmOverrideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export const ConfirmOverrideModal: React.FC<ConfirmOverrideModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
}) => {
    if (!isOpen) return null;

    return (
        <Modal
            visible={isOpen}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.warningIcon}>
                            <AlertTriangle size={24} color="#f59e0b" />
                        </View>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <View style={styles.modalActions}>
                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>{cancelLabel}</Text>
                        </Pressable>
                        <Pressable onPress={onConfirm} style={styles.confirmButton}>
                            <Text style={styles.confirmText}>{confirmLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // Modify Toggle Styles
    modifyToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    modifyToggleLight: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
    },
    modifyToggleDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    modifyToggleActive: {
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    modifyIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    indicatorActive: {
        backgroundColor: '#f59e0b',
    },
    indicatorInactive: {
        backgroundColor: '#94a3b8',
    },
    modifyLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    modifyLabelDark: {
        color: '#f1f5f9',
    },

    // Switch Styles
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchLabel: {
        fontSize: 14,
        color: '#1e293b',
    },
    switchLabelDark: {
        color: '#f1f5f9',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    warningIcon: {
        marginRight: 12,
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    closeButton: {
        padding: 4,
    },
    modalMessage: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    confirmButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#f59e0b',
    },
    confirmText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#ffffff',
    },
});

export default NebulaModifyToggle;
