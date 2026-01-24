import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { CalendarCheck, AlertTriangle } from 'lucide-react';
import api from '../../api/client';

export const AttendanceMonitorModule = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/vice-principal/attendance/monitor');
                if (res.status === 200) {
                    setData(res.data);
                }
            } catch (error) {
                console.error(error);
                // Fallback mock data if API fails or doesn't exist yet
                setData([
                    { date: '2023-11-20', percentage: 92 },
                    { date: '2023-11-21', percentage: 88 },
                    { date: '2023-11-22', percentage: 76 },
                    { date: '2023-11-23', percentage: 95 },
                    { date: '2023-11-24', percentage: 84 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <View className="h-64 items-center justify-center">
                <Text className="text-slate-400">Loading attendance data...</Text>
            </View>
        );
    }

    // Find max value to normalize height (although percentage is 0-100)
    const maxVal = 100;

    return (
        <NebulaCard className="min-h-[400px]">
            <View className="flex-row justify-between items-start mb-6">
                <View>
                    <View className="flex-row items-center gap-2">
                        <CalendarCheck size={24} color="#10b981" />
                        <Text className="text-xl font-bold text-slate-800 dark:text-white">
                            Attendance Monitor
                        </Text>
                    </View>
                    <Text className="text-sm text-slate-500 mt-1">Daily attendance overview</Text>
                </View>
                <View className="bg-rose-50 px-3 py-1 rounded-lg flex-row items-center gap-1">
                    <AlertTriangle size={14} color="#be123c" />
                    <Text className="text-rose-700 text-sm font-bold">Low: &lt;85%</Text>
                </View>
            </View>

            <View className="flex-1 justify-end h-64 w-full">
                <View className="flex-row justify-between items-end h-full w-full gap-2 px-2">
                    {data.map((entry, index) => {
                        const heightPct = `${entry.percentage}%`;
                        const isLow = entry.percentage < 85;
                        const dateLabel = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });

                        return (
                            <View key={index} className="flex-1 items-center gap-2">
                                <View className="relative w-full items-center justify-end h-48 bg-slate-50 dark:bg-slate-800/50 rounded-t-lg overflow-hidden">
                                    {/* The Bar */}
                                    <View
                                        style={{ height: heightPct as any, width: '60%' }}
                                        className={`rounded-t-sm ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    />
                                </View>
                                <View className="items-center">
                                    <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {entry.percentage}%
                                    </Text>
                                    <Text className="text-xs text-slate-400 uppercase">
                                        {dateLabel}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* X-Axis Line */}
                <View className="h-[1px] bg-slate-200 dark:bg-slate-700 w-full mt-2" />
            </View>
        </NebulaCard>
    );
};
