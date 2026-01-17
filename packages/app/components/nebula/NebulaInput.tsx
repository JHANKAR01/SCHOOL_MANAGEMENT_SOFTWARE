import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA INPUT - Themed Input Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    disabled?: boolean;
    readOnly?: boolean;
    masked?: boolean;           // Show masked value (for PII in View mode)
    maskedValue?: string;       // Custom masked display (e.g., "******99")
    icon?: React.ReactNode;
    error?: string;
    hint?: string;
    monospace?: boolean;        // For IDs, keys, financial figures
    className?: string;
}

export const NebulaInput: React.FC<NebulaInputProps> = ({
    label,
    value,
    onChange,
    placeholder = '',
    type = 'text',
    disabled = false,
    readOnly = false,
    masked = false,
    maskedValue,
    icon,
    error,
    hint,
    monospace = false,
    className = '',
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const displayValue = masked ? (maskedValue || '••••••••') : value;
    const inputType = isPassword && !showPassword ? 'password' : 'text';

    const baseClasses = `
    w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200
    ${monospace ? 'font-mono' : ''}
    ${disabled || readOnly ? 'cursor-not-allowed opacity-60' : ''}
    ${error ? 'border-red-500/50 bg-red-500/5' : ''}
  `;

    const stateClasses = isFocused && !disabled && !readOnly
        ? 'border-indigo-500 ring-1 ring-indigo-500/20 bg-white dark:bg-slate-900'
        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600';

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {label}
                    {disabled && <Lock className="inline w-3 h-3 ml-1 opacity-50" />}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {icon}
                    </div>
                )}

                <input
                    type={inputType}
                    value={displayValue}
                    onChange={(e) => !masked && onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || masked}
                    readOnly={readOnly}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            ${baseClasses}
            ${stateClasses}
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none
          `}
                />

                {isPassword && !masked && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
            {hint && !error && (
                <p className="text-xs text-slate-500">{hint}</p>
            )}
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA SELECT - Themed Dropdown Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
    className?: string;
}

export const NebulaSelect: React.FC<NebulaSelectProps> = ({
    label,
    value,
    onChange,
    options,
    disabled = false,
    className = '',
}) => {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {label}
                </label>
            )}

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`
          w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200
          border-white/10 bg-white/5 text-slate-50
          hover:bg-white/8 hover:border-white/15
          focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20
          disabled:cursor-not-allowed disabled:opacity-60
          appearance-none cursor-pointer
        `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem 1.25rem',
                }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-50">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default NebulaInput;
