/**
 * Run migration to create contact_messages table
 */
import pg from 'pg';
const { Client } = pg;

const SUPABASE_HOST = 'db.giynvpfnzzelzwpmsgtf.supabase.co';
const SUPABASE_PORT = 5432;
const SUPABASE_DB = 'postgres';
const SUPABASE_USER = 'postgres';

// We need the database password - it's in the service role key format
// Actually for Supabase, we need to use the connection string from the dashboard
// Let me check if we have it

async function main() {
  console.log('=== Running Migration: contact_messages table ===\n');

  // Read the migration file
  const migrationSQL = `
-- Create contact_messages table for storing contact form submissions
-- Even if email sending fails, messages are persisted to database

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('feedback', 'bug', 'feature', 'other')),
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  captcha_verified BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_type ON contact_messages(type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Any visitor can submit a contact message (rate limited at API level)
CREATE POLICY "Anyone can insert contact messages"
ON contact_messages FOR INSERT
WITH CHECK (true);
`;

  // Supabase connection via direct PostgreSQL
  // The password for postgres user is the same as the service_role key secret part
  // But for Supabase cloud, we need the connection string from the dashboard
  
  // Instead, let's use the Supabase Management API
  // Or try to connect via the anon key with postgrest
  
  console.log('[INFO] Supabase cloud requires connection string from dashboard');
  console.log('[INFO] You need to:');
  console.log('  1. Go to https://supabase.com/dashboard');
  console.log('  2. Select project giynvpfnzzelzwpmsgtf');
  console.log('  3. Go to Settings > Database');
  console.log('  4. Copy the "Connection string" (URI)');
  console.log('  5. Run: psql "YOUR_CONNECTION_STRING" -f supabase/migrations/20260524_add_contact_messages.sql');
  console.log('');
  console.log('[INFO] Alternatively, you can run this SQL in the Supabase SQL Editor:');
  console.log('');
  console.log(migrationSQL);
}

main().catch(console.error);
