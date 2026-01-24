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

export const NebulaIconButton: React.FC<{
    icon: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}> = ({
    icon,
    onClick,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    className = '',
}) => {
        const sizeClasses = {
            sm: 'p-1.5',
            md: 'p-2',
            lg: 'p-3',
        };

        const variantClasses = {
            primary: 'bg-indigo-600 rounded-lg hover:bg-indigo-700',
            secondary: 'bg-white/10 rounded-lg hover:bg-white/20 border border-white/10',
            ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 rounded-lg',
            danger: 'bg-transparent hover:bg-red-50 text-red-500 rounded-lg',
        };

        return (
            <Pressable
                onPress={onClick}
                disabled={disabled}
                className={`items-center justify-center transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50' : 'active:opacity-70'} ${className}`}
            >
                {icon}
            </Pressable>
        );
    };

export default NebulaButton;
