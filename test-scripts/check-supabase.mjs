/**
 * Check Supabase contact_messages table for test submissions
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://giynvpfnzzelzwpmsgtf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeW52cGZuenplbHp3cG1zZ3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIwNjEyNSwiZXhwIjoyMDk0NzgyMTI1fQ.nkXg3I7RiWmZeShF3QNRrLs-K8sZw39I2BUc84w_zhY';

async function main() {
  console.log('=== Supabase Contact Messages Check ===\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Query recent contact messages
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Query error:', error);
    return;
  }

  console.log(`Found ${data.length} total messages in contact_messages table\n`);

  if (data.length === 0) {
    console.log('[INFO] Table exists but is empty - no contact submissions yet');
    console.log('[INFO] This means emails were sent but DB write may have failed');
  } else {
    console.log('Recent messages:');
    data.forEach((msg, i) => {
      console.log(`\n[${i + 1}] ============================================`);
      console.log(`  ID:        ${msg.id}`);
      console.log(`  Name:      ${msg.name}`);
      console.log(`  Email:     ${msg.email}`);
      console.log(`  Type:      ${msg.type}`);
      console.log(`  Message:   ${msg.message.substring(0, 80)}...`);
      console.log(`  IP:        ${msg.ip_address}`);
      console.log(`  Email sent: ${msg.email_sent ? 'YES' : 'NO'}`);
      console.log(`  Status:    ${msg.status}`);
      console.log(`  Created:   ${msg.created_at}`);
    });
  }

  // Check if our test messages are there
  const ourTests = data.filter(m =>
    m.email === 'apitest@example.com' ||
    m.email === '188801400211@163.com' ||
    m.name === 'API测试员' ||
    m.name === '张同学'
  );

  console.log('\n=== OUR TEST MESSAGES ===');
  if (ourTests.length === 0) {
    console.log('[FAIL] No test messages found in database!');
    console.log('[WARN] Either DB write failed or table is not being written to');
  } else {
    console.log(`[OK] Found ${ourTests.length} of our test messages:`);
    ourTests.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} <${m.email}> - Email sent: ${m.email_sent ? 'YES' : 'NO'}`);
    });
  }
}

main().catch(console.error);