import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLanguage } from '../../provider/language-context';
import api from '../../api/client';
import { NebulaStatCard } from '../../components/nebula/NebulaCard';
import { ClipboardList, AlertTriangle, RefreshCw, Users } from 'lucide-react';

interface StatsData {
    pendingApprovals: number;
    urgentIncidents: number;
    substitutionNeeds: number;
    staffOnLeave: number;
}

export const VicePrincipalStats = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/vice-principal/stats');
            if (res.status === 200) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch VP stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <View className="p-4 items-center">
                <Text className="text-slate-500">Loading stats...</Text>
            </View>
        );
    }

    if (!stats) return null;

    return (
        <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="w-full md:w-[48%] lg:w-[23%]">
                <NebulaStatCard
                    label={t('vp_dashboard.stats.pending_approvals') || "Pending Approvals"}
                    value={stats.pendingApprovals}
                    icon={<ClipboardList size={20} color="#f59e0b" />}
                    status="warning"
                />
            </View>
            <View className="w-full md:w-[48%] lg:w-[23%]">
                <NebulaStatCard
                    label={t('vp_dashboard.stats.urgent_incidents') || "Urgent Incidents"}
                    value={stats.urgentIncidents}
                    icon={<AlertTriangle size={20} color="#ef4444" />}
                    status="critical"
                />
            </View>
            <View className="w-full md:w-[48%] lg:w-[23%]">
                <NebulaStatCard
                    label={t('vp_dashboard.stats.substitution_needs') || "Substitution Needs"}
                    value={stats.substitutionNeeds}
                    icon={<RefreshCw size={20} color="#3b82f6" />}
                    status="default"
                />
            </View>
            <View className="w-full md:w-[48%] lg:w-[23%]">
                <NebulaStatCard
                    label={t('vp_dashboard.stats.staff_on_leave') || "Staff on Leave"}
                    value={stats.staffOnLeave}
                    icon={<Users size={20} color="#a855f7" />}
                    status="default"
                />
            </View>
        </View>
    );
};
