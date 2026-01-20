import { http, HttpResponse } from 'msw';
import { financeHandlers } from './handlers/finance';
import { systemHandlers } from './handlers/system';
import { flagHandlers } from './handlers/flags';

export const handlers = [
    http.get('/api/user', () => {
        return HttpResponse.json({
            id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
            firstName: 'John',
            lastName: 'Maverick',
        })
    }),
    ...financeHandlers,
    ...systemHandlers,
    ...flagHandlers,
];
