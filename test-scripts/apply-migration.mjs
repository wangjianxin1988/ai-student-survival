/**
 * Apply migration using Supabase Service Role via direct connection attempt
 * Uses the pg library to connect to Supabase PostgreSQL
 */
import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

async function main() {
  console.log('=== Applying contact_messages Migration ===\n');

  // Migration SQL
  const migrationSQL = readFileSync(
    'D:/suoyouxiangmu/ai-student-survival/supabase/migrations/20260524_add_contact_messages.sql',
    'utf-8'
  );

  // Try to get connection info from wrangler config
  // Supabase provides a direct PostgreSQL connection
  // We need the password from Supabase dashboard

  // Check env for DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('[ERROR] DATABASE_URL not found in environment');
    console.log('[HINT] Get connection string from:');
    console.log('  https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/database');
    console.log('');
    console.log('[ACTION] Set environment variable:');
    console.log('  export DATABASE_URL="postgresql://postgres:PASSWORD@db.giynvpfnzzelzwpmsgtf.supabase.co:5432/postgres"');
    return;
  }

  console.log('[INFO] DATABASE_URL found, connecting...');

  try {
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('[OK] Connected to PostgreSQL');

    // Run migration
    const result = await client.query(migrationSQL);
    console.log('[OK] Migration executed successfully');

    await client.end();
    console.log('[INFO] Connection closed');

  } catch (error) {
    console.error('[ERROR] Migration failed:', error.message);
  }
}

main().catch(console.error);
