import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../provider/ThemeProvider';

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
    const { isDarkMode } = useTheme();

    const baseClasses = `
    rounded-2xl border transition-all duration-200
    ${noPadding ? '' : 'p-6'}
    ${onClick ? 'active:opacity-90' : ''}
  `;

    // LIGHT MODE: Clean Paper (White + Shadow + Thin Grey Border)
    // DARK MODE: Glass (Translucent + Blur)
    // Note: 'backdrop-blur-xl' works on Web. For Native, we might need BlurView, 
    // but for now we'll stick to simple BG colors for "Universal" simplicity.
    const themeClasses = isDarkMode
        ? 'bg-slate-900 border-white/10 shadow-sm'
        : 'bg-white border-slate-200 shadow-sm';

    const modifyClasses = modifyMode
        ? 'border-amber-500/50'
        : '';

    const Container = onClick ? Pressable : View;

    return (
        <Container
            className={`${baseClasses} ${themeClasses} ${modifyClasses} ${className}`}
            onPress={onClick}
        >
            {children}
        </Container>
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
    const { isDarkMode } = useTheme();

    const statusColors = {
        default: isDarkMode ? 'text-slate-50' : 'text-slate-900',
        success: isDarkMode ? 'text-teal-400' : 'text-teal-600',
        warning: isDarkMode ? 'text-amber-400' : 'text-amber-600',
        critical: isDarkMode ? 'text-red-400' : 'text-red-600',
    };

    const trendColors = {
        up: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
        down: isDarkMode ? 'text-red-400' : 'text-red-600',
        neutral: 'text-slate-400',
    };

    return (
        <NebulaCard className="relative overflow-hidden">
            {/* Background accent - Dark Mode Only (Simplified for Universal) */}
            {isDarkMode && (
                <View className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/10 opacity-50" />
            )}

            <View className="relative z-10 w-full">
                <View className="flex-row items-center justify-between mb-4 w-full">
                    <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {label}
                    </Text>
                    {icon && (
                        <View className={`p-2 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                            {icon}
                        </View>
                    )}
                </View>

                <Text className={`text-3xl font-bold ${statusColors[status]}`}>
                    {value}
                </Text>

                <View className="flex-row items-center justify-between mt-2 w-full">
                    {subValue && (
                        <Text className="text-sm text-slate-500">{subValue}</Text>
                    )}
                    {trend && trendValue && (
                        <Text className={`text-xs font-medium ${trendColors[trend]}`}>
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                        </Text>
                    )}
                </View>
            </View>
        </NebulaCard>
    );
};

export default NebulaCard;
