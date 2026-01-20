// server/src/routes/reports.ts
// Report generation API endpoints

import { Hono } from 'hono';
import { generatePDFMarksheet } from '../services/pdf-service';

const reportsRouter = new Hono();

// ============================================================================
// GET /reports/generate
// Generate PDF marksheet for a student
// Query params: studentId, term (examId)
// ============================================================================

reportsRouter.get('/generate', async (c) => {
    try {
        const studentId = c.req.query('studentId');
        const term = c.req.query('term'); // Used as examId

        if (!studentId) {
            return c.json({ error: 'studentId is required' }, 400);
        }

        if (!term) {
            return c.json({ error: 'term is required' }, 400);
        }

        console.log(`[Reports API] Generating PDF for student ${studentId}, exam ${term}`);

        // Generate the PDF (returns base64 data URL)
        const url = await generatePDFMarksheet(studentId, term);

        if (!url) {
            return c.json({ error: 'Failed to generate PDF' }, 500);
        }

        return c.json({ url });
    } catch (error) {
        console.error('[Reports API] Error generating report:', error);
        return c.json({ error: 'Failed to generate report' }, 500);
    }
});

export { reportsRouter };
