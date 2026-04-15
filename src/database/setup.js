const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const setupDatabase = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sqlFiles = [
      'master_setup.sql',
      'tenders.sql',
      'tender_categories.sql',
      'update_status.sql',
      'project_types.sql',
      'remove_type_code.sql',
      'tender_formats.sql',
      'format_mappings.sql',
      'organizations.sql'
    ];

    for (const file of sqlFiles) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await client.query(sql);
      console.log(`${file} executed successfully`);
    }

    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await client.end();
  }
};

setupDatabase();
