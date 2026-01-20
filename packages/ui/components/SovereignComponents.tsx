
import React from 'react';
import { getSurface, TYPOGRAPHY, INTERACTIVE, STATUS } from '../theme/design-system';
import { useLowDataMode } from '../hooks/useLowDataMode';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Platform, View, Text, Pressable, TextInput, PressableProps, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

// --- 1. SOVEREIGN BUTTON ---
export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: (e?: any) => void;
  className?: string; // Kept for NativeWind
}

export const SovereignButton: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', className = '', isLoading, icon, style, onClick, onPress, disabled, ...props 
}) => {
  const baseClass = INTERACTIVE.button.base;
  const variantClass = INTERACTIVE.button[variant];
  
  const handlePress = (e: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onClick) onClick(e);
    if (onPress) onPress(e);
  };

  return (
    <Pressable 
      className={`${baseClass} ${variantClass} ${className} ${isLoading ? 'opacity-75' : ''}`}
      disabled={isLoading || disabled}
      onPress={handlePress}
      style={style as any}
      {...props}
    >
      <View className="flex-row items-center justify-center">
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
        {!isLoading && icon && <View className="mr-2">{icon}</View>}
        <Text className={`font-bold ${variant === 'primary' ? 'text-white' : 'text-gray-700'} ${variant === 'danger' ? 'text-red-600' : ''}`}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
};

// --- 2. SOVEREIGN INPUT (UNIVERSAL) ---
export interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  // Web Compatibility Props
  type?: string; 
  name?: string;
  onChange?: any; // Looser type to allow Web Events (e.target.value) alongside Native Events
}

export const SovereignInput: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
  return (
    <View className="space-y-1.5 w-full">
      {label && (
        <Text className="text-xs font-extrabold text-slate-600 uppercase tracking-wide mb-1">
          {label}
        </Text>
      )}
      <View className="relative rounded-lg shadow-sm flex-row items-center border border-gray-300 bg-white">
        {icon && (
          <View className="pl-3">
            {icon}
          </View>
        )}
        <TextInput
          className={`flex-1 p-3 text-gray-900 placeholder:text-gray-400 text-sm font-medium ${className}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
      {error && <Text className="text-xs text-red-600 font-bold mt-1">{error}</Text>}
    </View>
  );
};

// --- 3. SOVEREIGN BADGE ---
interface BadgeProps {
  status: 'success' | 'warning' | 'error' | 'neutral' | 'info';
  children: React.ReactNode;
}

export const SovereignBadge: React.FC<BadgeProps> = ({ status, children }) => {
  // Map simplified status to classes
  const statusStyles = {
    success: 'bg-emerald-100 border-emerald-200',
    warning: 'bg-amber-100 border-amber-200',
    error: 'bg-rose-100 border-rose-200',
    neutral: 'bg-slate-100 border-slate-200',
    info: 'bg-blue-100 border-blue-200'
  };
  
  const textStyles = {
    success: 'text-emerald-800',
    warning: 'text-amber-800',
    error: 'text-rose-800',
    neutral: 'text-slate-700',
    info: 'text-blue-800'
  };

  return (
    <View className={`px-2.5 py-0.5 rounded-full border self-start ${statusStyles[status] || statusStyles.neutral}`}>
      <Text className={`text-xs font-bold capitalize ${textStyles[status] || textStyles.neutral}`}>
        {children}
      </Text>
    </View>
  );
};

// --- 4. STAT CARD (KPI WIDGET) ---
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, subtitle }) => {
  const { isLowData } = useLowDataMode();
  
  return (
    <View className={`${getSurface(isLowData)} rounded-xl p-6 relative overflow-hidden border border-gray-100 mb-4`}>
      <View className="flex-row justify-between items-start mb-4 z-10">
        <View className="p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
          {icon}
        </View>
        {trend && (
          <View className={`flex-row items-center px-2 py-1 rounded-full ${
            trend.isPositive ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1 text-green-700" /> : <ArrowDownRight className="w-3 h-3 mr-1 text-red-700" />}
            <Text className={`text-xs font-bold ${trend.isPositive ? 'text-green-700' : 'text-red-700'}`}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      
      <View className="z-10">
        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</Text>
        <Text className="text-2xl font-black text-gray-900 tracking-tight">{value}</Text>
        {subtitle && <Text className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</Text>}
      </View>
    </View>
  );
};

// --- 5. SOVEREIGN TABLE (UNIVERSAL ADAPTER) ---
export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => React.ReactNode;
}

export function SovereignTable<T extends { id: string | number }>({ data, columns, actions }: TableProps<T>) {
  const { isLowData } = useLowDataMode();

  // Mobile View (List)
  if (Platform.OS !== 'web') {
    return (
      <View className="space-y-3">
        {data.map((item, idx) => (
          <View key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            {columns.map((col, cIdx) => (
              <View key={cIdx} className="flex-row justify-between mb-2">
                <Text className="text-xs font-bold text-gray-500 uppercase">{col.header}</Text>
                <View>
                  {typeof col.accessor === 'function' ? col.accessor(item) : <Text className="text-sm font-medium text-gray-900">{String(item[col.accessor])}</Text>}
                </View>
              </View>
            ))}
            {actions && (
              <View className="mt-2 pt-2 border-t border-gray-100 flex-row justify-end">
                {actions(item)}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }

  // Web View (Table)
  return (
    <div className={`${getSurface(isLowData)} rounded-xl overflow-hidden border border-gray-200 shadow-sm`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80 backdrop-blur-sm">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white/60 divide-y divide-gray-100">
            {data.map((item, rowIdx) => (
              <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                      {actions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 6. SKELETON LOADER ---
export const SovereignSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <View className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

// --- 7. PAGE HEADER ---
export const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <View>
      <Text className="text-2xl font-bold text-gray-900">{title}</Text>
      {subtitle && <Text className="text-sm text-gray-600 mt-1">{subtitle}</Text>}
    </View>
    {action && <View>{action}</View>}
  </View>
);
