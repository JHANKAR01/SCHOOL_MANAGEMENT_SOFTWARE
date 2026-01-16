import { http, HttpResponse, delay } from 'msw';

const MOCK_FINANCE_SUMMARY = {
    mrr: 4500000,
    arr: 54000000,
    growth: 12.5,
    activeSubscriptions: 142,
    avgRevenuePerUser: 31690,
    totalVolume: 12500000
};

const MOCK_REVENUE_HISTORY = [
    { month: 'Jan', revenue: 3800000, expenses: 1200000 },
    { month: 'Feb', revenue: 3950000, expenses: 1300000 },
    { month: 'Mar', revenue: 4100000, expenses: 1150000 },
    { month: 'Apr', revenue: 4200000, expenses: 1400000 },
    { month: 'May', revenue: 4350000, expenses: 1250000 },
    { month: 'Jun', revenue: 4500000, expenses: 1350000 },
];

const MOCK_FAILED_TRANSACTIONS = [
    { id: 'tx_001', school: 'Ryan International', amount: 45000, date: '2025-02-14T10:30:00Z', reason: 'Insufficient Funds' },
    { id: 'tx_002', school: 'DPS Delhi', amount: 12500, date: '2025-02-14T09:15:00Z', reason: 'Gateway Timeout' },
    { id: 'tx_003', school: 'St. Xavier\'s', amount: 28000, date: '2025-02-13T16:45:00Z', reason: 'Card Expired' },
];

export const financeHandlers = [
    http.get('/api/super-admin/finance/summary', async () => {
        await delay(800);
        return HttpResponse.json(MOCK_FINANCE_SUMMARY);
    }),

    http.get('/api/super-admin/finance/history', async () => {
        await delay(800);
        return HttpResponse.json(MOCK_REVENUE_HISTORY);
    }),

    http.get('/api/super-admin/finance/failed-transactions', async () => {
        await delay(800);
        return HttpResponse.json(MOCK_FAILED_TRANSACTIONS);
    }),
];
