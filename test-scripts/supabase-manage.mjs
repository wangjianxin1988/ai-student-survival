/**
 * Use Supabase Management API to apply migration
 * https://supabase.com/docs/guides/api#/components/schemas/pg_database
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://giynvpfnzzelzwpmsgtf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeW52cGZuenplbHp3cG1zZ3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIwNjEyNSwiZXhwIjoyMDk0NzgyMTI1fQ.nkXg3I7RiWmZeShF3QNRrLs-K8sZw39I2BUc84w_zhY';

async function main() {
  console.log('=== Supabase Management API Test ===\n');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
  });

  // Test 1: List existing tables via PostgREST
  console.log('[TEST 1] Listing tables via pg_catalog...');
  const { data, error } = await supabase.rpc('pg_catalog', {}).catch(() => null);
  console.log(`  Result: ${data ? 'OK' : 'Failed (expected for direct RPC)'}`);

  // Test 2: Try to insert into contact_messages
  console.log('\n[TEST 2] Direct insert into contact_messages...');
  const { data: insertData, error: insertError } = await supabase
    .from('contact_messages')
    .insert({
      name: 'Migration Test',
      email: 'migration@test.com',
      type: 'feedback',
      message: 'Testing if table exists',
      ip_address: '127.0.0.1',
      status: 'pending'
    })
    .select()
    .single();

  console.log(`  Result: ${insertError ? 'FAILED' : 'SUCCESS'}`);
  if (insertError) {
    console.log(`  Error code: ${insertError.code}`);
    console.log(`  Error message: ${insertError.message}`);
  } else {
    console.log(`  Inserted ID: ${insertData?.id}`);
  }

  // Test 3: Check via REST API endpoint
  console.log('\n[TEST 3] Query existing tables via information_schema...');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_schema')
    .eq('table_schema', 'public');

  if (tablesError) {
    console.log(`  Note: Cannot query information_schema directly (expected)`);
    console.log(`  ${tablesError.message}`);
  } else {
    console.log(`  Found ${tables?.length || 0} tables in public schema`);
    tables?.forEach(t => console.log(`    - ${t.table_schema}.${t.table_name}`));
  }

  // Test 4: Check if users table exists (known table)
  console.log('\n[TEST 4] Checking known tables...');
  const knownTables = ['users', 'profiles', 'posts', 'comments'];
  for (const table of knownTables) {
    const { data: exists, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);
    
    if (error) {
      console.log(`  ${table}: NOT FOUND (${error.code})`);
    } else {
      console.log(`  ${table}: EXISTS`);
    }
  }
}

main().catch(console.error);
