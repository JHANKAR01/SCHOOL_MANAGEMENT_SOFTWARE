// packages/app/components/nebula/NebulaInput.native.tsx
// Mobile-native version of NebulaInput
// Uses StyleSheet instead of className for TypeScript compatibility

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA INPUT - Native Version
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number';
    disabled?: boolean;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export const NebulaInput: React.FC<NebulaInputProps> = ({
    label,
    value,
    onChange,
    placeholder = '',
    type = 'text',
    disabled = false,
    error,
    helperText,
    icon,
}) => {
    const { isDarkMode } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const getKeyboardType = () => {
        switch (type) {
            case 'email': return 'email-address';
            case 'number': return 'numeric';
            default: return 'default';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                {icon && <View style={styles.labelIcon}>{icon}</View>}
                <Text style={[styles.label, isDarkMode && styles.labelDark]}>{label}</Text>
            </View>
            <View style={[
                styles.inputWrapper,
                isDarkMode ? styles.inputWrapperDark : styles.inputWrapperLight,
                isFocused && styles.inputFocused,
                error && styles.inputError,
                disabled && styles.inputDisabled,
            ]}>
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    editable={!disabled}
                    secureTextEntry={type === 'password' && !showPassword}
                    keyboardType={getKeyboardType()}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={[styles.input, isDarkMode && styles.inputDark]}
                />
                {type === 'password' && (
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        {showPassword ? (
                            <EyeOff size={18} color="#94a3b8" />
                        ) : (
                            <Eye size={18} color="#94a3b8" />
                        )}
                    </Pressable>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA SELECT - Native Version
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    disabled?: boolean;
}

export const NebulaSelect: React.FC<NebulaSelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select...',
    disabled = false,
}) => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>{label}</Text>
            <Pressable
                onPress={() => !disabled && setIsOpen(!isOpen)}
                style={[
                    styles.selectButton,
                    isDarkMode ? styles.inputWrapperDark : styles.inputWrapperLight,
                    disabled && styles.inputDisabled,
                ]}
            >
                <Text style={[
                    styles.selectText,
                    !selectedOption && styles.placeholderText,
                    isDarkMode && styles.inputDark,
                ]}>
                    {selectedOption?.label || placeholder}
                </Text>
                <ChevronDown size={18} color="#94a3b8" />
            </Pressable>

            {isOpen && (
                <View style={[styles.dropdown, isDarkMode && styles.dropdownDark]}>
                    {options.map((option) => (
                        <Pressable
                            key={option.value}
                            onPress={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            style={[
                                styles.dropdownItem,
                                option.value === value && styles.dropdownItemActive,
                            ]}
                        >
                            <Text style={[
                                styles.dropdownItemText,
                                option.value === value && styles.dropdownItemTextActive,
                            ]}>
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    labelIcon: {
        marginRight: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    labelDark: {
        color: '#f1f5f9',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    inputWrapperLight: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
    },
    inputWrapperDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    inputFocused: {
        borderColor: '#3b82f6',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    inputDisabled: {
        opacity: 0.6,
    },
    input: {
        flex: 1,
        height: 44,
        fontSize: 15,
        color: '#1e293b',
    },
    inputDark: {
        color: '#f1f5f9',
    },
    eyeButton: {
        padding: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    helperText: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 4,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 44,
    },
    selectText: {
        fontSize: 15,
        color: '#1e293b',
    },
    placeholderText: {
        color: '#94a3b8',
    },
    dropdown: {
        position: 'absolute',
        top: 76,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    dropdownDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dropdownItemActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#1e293b',
    },
    dropdownItemTextActive: {
        color: '#3b82f6',
        fontWeight: '500',
    },
});

export default NebulaInput;
