import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export const startMockWorker = () => {
    if (typeof window !== 'undefined') {
        return worker.start();
    }
};
