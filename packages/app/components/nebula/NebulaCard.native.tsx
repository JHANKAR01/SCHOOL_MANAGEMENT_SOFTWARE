// packages/app/components/nebula/NebulaCard.native.tsx
// Mobile-native version of NebulaCard
// Uses StyleSheet instead of className for TypeScript compatibility

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../provider/ThemeProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA CARD - Native Version
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NebulaCardProps {
    children: React.ReactNode;
    modifyMode?: boolean;
    noPadding?: boolean;
    onClick?: () => void;
}

export const NebulaCard: React.FC<NebulaCardProps> = ({
    children,
    modifyMode = false,
    noPadding = false,
    onClick,
}) => {
    const { isDarkMode } = useTheme();

    const containerStyle = [
        styles.card,
        isDarkMode ? styles.cardDark : styles.cardLight,
        modifyMode && styles.modifyMode,
        !noPadding && styles.padding,
    ];

    if (onClick) {
        return (
            <Pressable onPress={onClick} style={containerStyle}>
                {children}
            </Pressable>
        );
    }

    return <View style={containerStyle}>{children}</View>;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA STAT CARD - Native Version
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

    const getStatusColor = () => {
        switch (status) {
            case 'success': return isDarkMode ? '#2dd4bf' : '#0d9488';
            case 'warning': return isDarkMode ? '#fbbf24' : '#d97706';
            case 'critical': return isDarkMode ? '#f87171' : '#dc2626';
            default: return isDarkMode ? '#f1f5f9' : '#1e293b';
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up': return isDarkMode ? '#34d399' : '#059669';
            case 'down': return isDarkMode ? '#f87171' : '#dc2626';
            default: return '#94a3b8';
        }
    };

    const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

    return (
        <NebulaCard>
            <View style={styles.statHeader}>
                <Text style={[styles.statLabel, { color: '#94a3b8' }]}>{label}</Text>
                {icon && (
                    <View style={[styles.iconContainer, isDarkMode ? styles.iconDark : styles.iconLight]}>
                        {icon}
                    </View>
                )}
            </View>
            <Text style={[styles.statValue, { color: getStatusColor() }]}>{value}</Text>
            <View style={styles.statFooter}>
                {subValue && <Text style={styles.subValue}>{subValue}</Text>}
                {trend && trendValue && (
                    <Text style={[styles.trendText, { color: getTrendColor() }]}>
                        {trendSymbol} {trendValue}
                    </Text>
                )}
            </View>
        </NebulaCard>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardLight: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
    },
    cardDark: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
    },
    modifyMode: {
        borderColor: '#f59e0b',
    },
    padding: {
        padding: 16,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    iconLight: {
        backgroundColor: '#f8fafc',
        borderColor: '#f1f5f9',
    },
    iconDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
    },
    statFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    subValue: {
        fontSize: 14,
        color: '#94a3b8',
    },
    trendText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default NebulaCard;
