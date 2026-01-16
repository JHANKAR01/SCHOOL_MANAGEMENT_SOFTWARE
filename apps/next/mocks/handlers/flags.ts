import { http, HttpResponse, delay } from 'msw';

let MOCK_FLAGS = [
    { key: 'enable_finance_v2', label: 'Finance Engine V2', enabled: true, description: 'Enables new ledger system and tax automation.' },
    { key: 'enable_ai_importer', label: 'AI Data Importer', enabled: false, description: 'Allows schools to upload unstructured CSVs for student admission.' },
    { key: 'enable_whatsapp', label: 'WhatsApp Integration', enabled: true, description: 'Global switch for Meta Cloud API integration.' },
    { key: 'maintenance_mode', label: 'Global Maintenance', enabled: false, description: 'Puts the entire platform into read-only mode for upgrades.', isCritical: true },
    { key: 'beta_features', label: 'Beta Access', enabled: false, description: 'Unlocks experimental features for schools tagged as "Early Adopter".' },
];

export const flagHandlers = [
    http.get('/api/super-admin/flags', async () => {
        await delay(800);
        return HttpResponse.json(MOCK_FLAGS);
    }),

    http.post('/api/super-admin/flags/:key/toggle', async ({ params }) => {
        await delay(800);
        const { key } = params;
        const flagIndex = MOCK_FLAGS.findIndex(f => f.key === key);

        if (flagIndex > -1) {
            MOCK_FLAGS[flagIndex].enabled = !MOCK_FLAGS[flagIndex].enabled;
            return HttpResponse.json({ success: true, flag: MOCK_FLAGS[flagIndex] });
        }

        return new HttpResponse(null, { status: 404 });
    }),
];
