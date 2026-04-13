const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const migrate = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Migrating tender_formats table...');
        
        await client.query('ALTER TABLE tender.tender_formats DROP COLUMN IF EXISTS template_html');
        await client.query('ALTER TABLE tender.tender_formats ADD COLUMN IF NOT EXISTS template_pages jsonb NOT NULL DEFAULT \'[]\'');
        
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
};

migrate();
