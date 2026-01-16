import { http, HttpResponse, delay } from 'msw';

const MOCK_SYSTEM_HEALTH = {
    apiLatency: 45, // ms
    dbLoad: 34, // %
    storageUsage: 68, // %
    activeConnections: 1240,
    errorRate: 0.02, // %
};

const MOCK_LATENCY_HISTORY = Array.from({ length: 20 }, (_, i) => ({
    time: `${i * 2}s`,
    latency: 40 + Math.random() * 20,
    errors: Math.random() < 0.1 ? 1 : 0
}));

const MOCK_LOGS = [
    { id: 1, level: 'info', message: 'Backup job completed successfully', timestamp: '2 mins ago', service: 'Database' },
    { id: 2, level: 'warning', message: 'High memory usage detected on node-04', timestamp: '5 mins ago', service: 'Compute' },
    { id: 3, level: 'error', message: 'Payment gateway timeout (3 retries)', timestamp: '12 mins ago', service: 'Billing' },
    { id: 4, level: 'info', message: 'New tenant deployment initiated: sch_009', timestamp: '15 mins ago', service: 'Orchestrator' },
];

export const systemHandlers = [
    http.get('/api/super-admin/system/health', async () => {
        await delay(800);
        return HttpResponse.json(MOCK_SYSTEM_HEALTH);
    }),

    http.get('/api/super-admin/system/latency', async () => {
        await delay(800);
        return HttpResponse.json(MOCK_LATENCY_HISTORY);
    }),

    http.get('/api/super-admin/system/logs', async () => {
        await delay(800);
        return HttpResponse.json(MOCK_LOGS);
    }),
];
