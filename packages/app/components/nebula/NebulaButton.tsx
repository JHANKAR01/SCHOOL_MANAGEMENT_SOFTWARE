import React from 'react';
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
    type?: 'button' | 'submit';
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
    type = 'button',
}) => {
    const isDisabled = disabled || loading;

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
        primary: `
      bg-gradient-to-r from-indigo-600 to-violet-600 text-white
      hover:from-indigo-500 hover:to-violet-500
      shadow-lg shadow-indigo-500/20
      border border-indigo-500/20
    `,
        secondary: `
      bg-white/10 text-slate-50 border border-white/10
      hover:bg-white/15 hover:border-white/20
    `,
        ghost: `
      bg-transparent text-slate-300
      hover:bg-white/10 hover:text-slate-50
    `,
        danger: `
      bg-red-600 text-white border border-red-500/20
      hover:bg-red-500
      shadow-lg shadow-red-500/20
    `,
        warning: `
      bg-amber-600 text-white border border-amber-500/20
      hover:bg-amber-500
      shadow-lg shadow-amber-500/20
    `,
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!loading && icon && iconPosition === 'left' && icon}
            {children}
            {!loading && icon && iconPosition === 'right' && icon}
        </button>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA ICON BUTTON - Compact Icon-only Button
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaIconButtonProps {
    icon: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'danger' | 'warning';
    size?: 'sm' | 'md';
    disabled?: boolean;
    tooltip?: string;
    className?: string;
}

export const NebulaIconButton: React.FC<NebulaIconButtonProps> = ({
    icon,
    onClick,
    variant = 'default',
    size = 'md',
    disabled = false,
    tooltip,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
    };

    const variantClasses = {
        default: 'text-slate-400 hover:text-slate-200 hover:bg-white/10',
        danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
        warning: 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={tooltip}
            className={`
        rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
        >
            {icon}
        </button>
    );
};

export default NebulaButton;
