import { useState, useEffect, useCallback } from 'react';

export interface DashboardStats {
    totalStudents: number;
    totalStaff: number;
    collectedFee: number;
    pendingIssues: number;
}

interface UseDashboardStatsReturn {
    stats: DashboardStats;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const DEFAULT_STATS: DashboardStats = {
    totalStudents: 0,
    totalStaff: 0,
    collectedFee: 0,
    pendingIssues: 0
};

export const useDashboardStats = (): UseDashboardStatsReturn => {
    const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/system-admin/stats', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('sovereign_token')}`
                }
            });

            const data = await res.json();

            if (data.success) {
                setStats(data.data);
            } else {
                setError(data.error || 'Failed to fetch stats');
                setStats(DEFAULT_STATS);
            }
        } catch (err) {
            console.error('[useDashboardStats] Error:', err);
            setError('Network error fetching stats');
            setStats(DEFAULT_STATS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats
    };
};
