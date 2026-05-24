/**
 * Auto-apply migration via Supabase Dashboard SQL Editor
 * Uses Chrome profile with existing login session
 */
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const CHROME_EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const CHROME_PROFILE = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';

async function main() {
  console.log('==========================================');
  console.log(' Auto-Migration: contact_messages Table');
  console.log('==========================================\n');

  // Read migration SQL
  const migrationSQL = readFileSync(
    'D:/suoyouxiangmu/ai-student-survival/supabase/migrations/20260524_add_contact_messages.sql',
    'utf-8'
  );

  console.log('[INFO] Migration SQL loaded:');
  console.log('       ' + migrationSQL.split('\n').slice(0, 3).join('\n       ') + '\n');

  let browser;
  try {
    console.log('[INFO] Launching Chrome with main profile...');
    browser = await chromium.launchPersistentContext(CHROME_PROFILE, {
      executable: CHROME_EXE,
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      timeout: 30000,
    });

    const page = browser.pages()[0] || (await browser.newPage());

    // Navigate to SQL Editor
    console.log('[INFO] Navigating to Supabase SQL Editor...');
    await page.goto(
      'https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/sql/new',
      { timeout: 30000, waitUntil: 'networkidle2' }
    );

    // Check if login required
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log('[INFO] Current URL:', url);

    if (url.includes('sign-in')) {
      console.log('\n[ACTION REQUIRED] Please log in to Supabase...');
      console.log('  Email: 188801400211@163.com');
      console.log('  (Or use your existing Supabase account)');
      console.log('\n[INFO] After logging in, the script will continue automatically.\n');

      // Wait for user to log in
      await page.waitForURL(url => !url.includes('sign-in'), { timeout: 120000 });
      console.log('[INFO] Logged in! Continuing...');
    }

    // Wait for SQL editor to load
    console.log('[INFO] Waiting for SQL Editor to load...');
    await page.waitForTimeout(3000);

    // Check if we need to accept any terms
    const currentUrl = page.url();
    console.log('[INFO] URL after login:', currentUrl);

    // Try to find and use the SQL editor
    // Look for textarea or Monaco editor
    const editor = page.locator('textarea, .monaco-editor textarea, [class*="editor"]').first();
    const editorExists = await editor.isVisible({ timeout: 5000 }).catch(() => false);

    if (!editorExists) {
      console.log('[INFO] SQL Editor not immediately visible, trying alternative selectors...');

      // Try clicking in the main content area
      const mainArea = page.locator('main, [role="main"], .content').first();
      if (await mainArea.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('[INFO] Found main content area');
      }
    }

    // Type the SQL into the editor
    console.log('[ACTION] Typing migration SQL into editor...');

    // Focus on editor and type
    await page.click('body');
    await page.keyboard.type(migrationSQL);

    // Alternative: paste from clipboard
    // await page.keyboard.press('Control+a');
    // await page.keyboard.press('Delete');
    // await page.keyboard.down('Control');
    // await page.keyboard.press('v');
    // await page.keyboard.up('Control');

    console.log('[INFO] SQL typed. Looking for RUN button...');

    // Find and click RUN button
    const runButton = page.locator('button:has-text("RUN"), button:has-text("Run"), [class*="run"]').first();
    const runExists = await runButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (runExists) {
      console.log('[INFO] Found RUN button, clicking...');
      await runButton.click();
      await page.waitForTimeout(3000);

      // Check for success
      const pageText = await page.textContent('body');
      const success = pageText?.includes('Success') ||
                      pageText?.includes('success') ||
                      pageText?.includes('completed') ||
                      pageText?.includes('CREATE');
      console.log('[RESULT] Migration ' + (success ? 'SUCCESS' : 'may need verification'));
    } else {
      console.log('[INFO] Could not find RUN button');
      console.log('[ACTION] Please manually click RUN after the SQL is pasted');
    }

    console.log('\n[INFO] Waiting 30 seconds before closing...');
    await page.waitForTimeout(30000);

    await browser.close();
    console.log('\n[OK] Script completed!');

  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error('[ERROR]', error.message);
    console.log('\n[ALTERNATIVE] Please manually apply the migration:');
    console.log('  1. Open: https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/sql/new');
    console.log('  2. Paste the SQL from: supabase/migrations/20260524_add_contact_messages.sql');
    console.log('  3. Click RUN');
  }
}

main().catch(console.error);