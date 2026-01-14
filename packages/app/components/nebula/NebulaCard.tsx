import React from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA CARD - Glassmorphic Card Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaCardProps {
    children: React.ReactNode;
    className?: string;
    modifyMode?: boolean;      // Glows amber when true (for View/Modify pattern)
    noPadding?: boolean;
    onClick?: () => void;
}

export const NebulaCard: React.FC<NebulaCardProps> = ({
    children,
    className = '',
    modifyMode = false,
    noPadding = false,
    onClick,
}) => {
    // Detect if we should use solid bg (mobile) or blur (desktop)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const baseClasses = `
    rounded-2xl border transition-all duration-200
    ${noPadding ? '' : 'p-6'}
    ${onClick ? 'cursor-pointer hover:border-white/20' : ''}
  `;

    const themeClasses = isMobile
        ? 'bg-slate-900/95 border-white/10'  // Solid for mobile
        : 'bg-slate-900/60 backdrop-blur-xl border-white/10';  // Glass for desktop

    const modifyClasses = modifyMode
        ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
        : '';

    return (
        <div
            className={`${baseClasses} ${themeClasses} ${modifyClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA STAT CARD - For KPI/Metric Display
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaStatCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    status?: 'default' | 'success' | 'warning' | 'critical';
}

export const NebulaStatCard: React.FC<NebulaStatCardProps> = ({
    label,
    value,
    subValue,
    icon,
    trend,
    trendValue,
    status = 'default',
}) => {
    const statusColors = {
        default: 'text-slate-50',
        success: 'text-teal-400',
        warning: 'text-amber-400',
        critical: 'text-red-400',
    };

    const trendColors = {
        up: 'text-emerald-400',
        down: 'text-red-400',
        neutral: 'text-slate-400',
    };

    return (
        <NebulaCard className="relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/5 blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {label}
                    </span>
                    {icon && (
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            {icon}
                        </div>
                    )}
                </div>

                <div className={`text-3xl font-bold font-mono ${statusColors[status]}`}>
                    {value}
                </div>

                <div className="flex items-center justify-between mt-2">
                    {subValue && (
                        <span className="text-sm text-slate-500">{subValue}</span>
                    )}
                    {trend && trendValue && (
                        <span className={`text-xs font-medium ${trendColors[trend]}`}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                        </span>
                    )}
                </div>
            </div>
        </NebulaCard>
    );
};

export default NebulaCard;
