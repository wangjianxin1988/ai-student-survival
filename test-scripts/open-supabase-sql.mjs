/**
 * Open Supabase SQL Editor for manual migration
 * The user needs to paste the migration SQL manually
 */
import { chromium } from 'playwright';

const SUPABASE_DASHBOARD = 'https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/sql/new';
const MAIN_CHROME = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';
const CHROME_EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';

async function main() {
  console.log('=== Open Supabase SQL Editor ===\n');
  console.log('This script will open Chrome and navigate to the Supabase SQL Editor.');
  console.log('You will need to:');
  console.log('1. Log in to Supabase if not already logged in');
  console.log('2. Paste the SQL from: supabase/migrations/20260524_add_contact_messages.sql');
  console.log('3. Click "RUN" to execute\n');

  let browser;
  try {
    console.log('[INFO] Launching Chrome with main profile...');
    browser = await chromium.launchPersistentContext(MAIN_CHROME, {
      executable: CHROME_EXE,
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      timeout: 30000,
    });

    const page = browser.pages()[0] || (await browser.newPage());
    console.log('[INFO] Navigating to Supabase SQL Editor...');
    await page.goto(SUPABASE_DASHBOARD, { timeout: 30000, waitUntil: 'networkidle2' });

    console.log('[INFO] Waiting for page to load...');
    await page.waitForTimeout(5000);

    console.log('\n[ACTION REQUIRED] Please:');
    console.log('1. If not logged in, log in to Supabase');
    console.log('2. Copy the SQL from: supabase/migrations/20260524_add_contact_messages.sql');
    console.log('3. Paste it into the SQL Editor');
    console.log('4. Click "RUN" or press Ctrl+Enter to execute');
    console.log('5. Verify it says "Success" or "Table created"');
    console.log('\n[INFO] The browser will remain open for 60 seconds...');

    // Wait for user
    await page.waitForTimeout(60000);

    await browser.close();
    console.log('\n[INFO] Done!');

  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error('[ERROR]', error.message);
  }
}

main().catch(console.error);
