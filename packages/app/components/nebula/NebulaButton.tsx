import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { Loader2 } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA BUTTON - Themed Button Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface NebulaButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    className?: string;
    type?: 'button' | 'submit'; // Kept for prop compat, unused in Native
}

export const NebulaButton: React.FC<NebulaButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
}) => {
    const isDisabled = disabled || loading;

    const sizeContainerClasses = {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
    };

    const sizeTextClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const variantContainerClasses = {
        primary: 'bg-indigo-600 rounded-lg shadow-sm border border-indigo-500',
        secondary: 'bg-white/10 rounded-lg border border-white/20',
        ghost: 'bg-transparent',
        danger: 'bg-red-600 rounded-lg border border-red-500',
        warning: 'bg-amber-600 rounded-lg border border-amber-500',
    };

    const variantTextClasses = {
        primary: 'text-white font-medium',
        secondary: 'text-slate-50 font-medium',
        ghost: 'text-slate-300 font-medium',
        danger: 'text-white font-medium',
        warning: 'text-white font-medium',
    };

    return (
        <Pressable
            onPress={onClick}
            disabled={isDisabled}
            className={`
        flex-row items-center justify-center gap-2
        transition-all duration-200
        ${isDisabled ? 'opacity-50' : 'active:opacity-80'}
        ${sizeContainerClasses[size]}
        ${variantContainerClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
        >
            {loading && <ActivityIndicator size="small" color="#ffffff" />}

            {!loading && icon && iconPosition === 'left' && icon}

            <Text className={`${sizeTextClasses[size]} ${variantTextClasses[variant]}`}>
                {children}
            </Text>

            {!loading && icon && iconPosition === 'right' && icon}
        </Pressable>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA ICON BUTTON - Compact Icon-only Button
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaIconButtonProps extends Omit<NebulaButtonProps, 'children' | 'icon' | 'iconPosition' | 'fullWidth'> {
    icon: React.ReactNode;
}

export const NebulaIconButton: React.FC<NebulaIconButtonProps> = ({
    icon,
    onClick,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    const variantClasses = {
        primary: 'bg-indigo-600 text-white',
        secondary: 'bg-white/10 text-slate-50 border border-white/10',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
        danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
        warning: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    };

    return (
        <Pressable
            onPress={onClick}
            disabled={disabled || loading}
            className={`
                rounded-full items-center justify-center transition-colors
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${disabled ? 'opacity-50' : 'active:opacity-80'}
                ${className}
            `}
        >
            {loading ? <ActivityIndicator size="small" /> : icon}
        </Pressable>
    );
};

export default NebulaButton;
