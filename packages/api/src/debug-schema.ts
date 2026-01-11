
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function debugSchema() {
    console.log("--- DEBUG SCHEMA & TABLES ---");
    console.log("URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')); // Log masked URL

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("Connected to DB.");

        console.log("\n1. Current Schema Search Path:");
        const pathRes = await client.query('SHOW search_path');
        console.log(pathRes.rows[0]);

        console.log("\n2. All Schemas:");
        const schemas = await client.query('SELECT schema_name FROM information_schema.schemata');
        console.log(schemas.rows.map(r => r.schema_name).join(', '));

        console.log("\n3. searching for table 'User' in all schemas:");
        const tables = await client.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name = 'User' OR table_name = 'user' OR table_name = 'User';
    `);
        if (tables.rows.length === 0) {
            console.log("CRITICAL: Table 'User' NOT FOUND in any schema!");
        } else {
            console.table(tables.rows);
        }

        client.release();
    } catch (err) {
        console.error("Connection Error:", err);
    } finally {
        pool.end();
    }
}

debugSchema();
