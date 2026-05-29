// Supabase migration runner - types SQL, clicks Run, then configures redirect URLs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CHROME_DATA = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';
const CHROME_EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const PROJECT_REF = 'giynvpfnzzelzwpmsgtf';

async function main() {
  console.log('=== Supabase Migration Runner ===\n');

  const browser = await chromium.launchPersistentContext(CHROME_DATA, {
    executablePath: CHROME_EXE,
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    timeout: 30000,
  });

  try {
    const page = browser.pages()[0] || await browser.newPage();

    // ===== STEP 1: Execute SQL migration =====
    console.log('[STEP 1] Navigating to SQL Editor...');
    await page.goto(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`, {
      timeout: 30000,
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);

    // Read the migration SQL
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260529_fix_registration_points.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('  SQL length:', sql.length, 'chars');

    // Click on the Monaco editor area
    console.log('  Clicking editor area...');
    const monacoEditor = page.locator('.monaco-editor .view-lines');
    await monacoEditor.click({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Select all and replace with our SQL
    console.log('  Typing SQL...');
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(200);
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);

    // Type the SQL in chunks to avoid browser issues
    const chunkSize = 500;
    for (let i = 0; i < sql.length; i += chunkSize) {
      const chunk = sql.substring(i, i + chunkSize);
      await page.keyboard.type(chunk, { delay: 0 });
      process.stdout.write(`  Typed ${Math.min(i + chunkSize, sql.length)}/${sql.length} chars\r`);
    }
    console.log('\n  SQL typed successfully');

    // Click Run button
    console.log('  Clicking Run button...');
    await page.getByTestId('sql-run-button').click();
    console.log('  Waiting for results...');
    await page.waitForTimeout(10000);

    // Take screenshot of results
    await page.screenshot({ path: path.join(__dirname, '..', 'supabase-sql-result.png') });

    // Check for success/error in results
    const resultText = await page.textContent('body');
    if (resultText.includes('error') || resultText.includes('Error') || resultText.includes('ERROR')) {
      console.log('  ⚠️ Possible error detected in results');
      // Extract error message
      const errorMatch = resultText.match(/(?:error|Error|ERROR)[^]*?(?=\n|$)/);
      if (errorMatch) console.log('  Error:', errorMatch[0].substring(0, 200));
    } else {
      console.log('  ✅ SQL executed (check screenshot for details)');
    }

    // ===== STEP 2: Configure redirect URLs =====
    console.log('\n[STEP 2] Navigating to Auth URL Configuration...');
    await page.goto(`https://supabase.com/dashboard/project/${PROJECT_REF}/auth/url-configuration`, {
      timeout: 30000,
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(__dirname, '..', 'supabase-redirect-config.png') });
    console.log('  Screenshot saved: supabase-redirect-config.png');

    // Try to find the redirect URLs input
    const redirectInput = page.locator('input[placeholder*="redirect"], input[placeholder*="Redirect"], textarea[placeholder*="redirect"]');
    if (await redirectInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  Found redirect URLs input');
      const currentValue = await redirectInput.inputValue().catch(() => '');
      console.log('  Current value:', currentValue.substring(0, 200));

      // Add our redirect URLs if not present
      const urls = ['https://mi-to-ai.com/auth/reset-password', 'http://localhost:4321/auth/reset-password'];
      const missing = urls.filter(u => !currentValue.includes(u));

      if (missing.length > 0) {
        const newValue = currentValue + '\n' + missing.join('\n');
        await redirectInput.fill(newValue);
        console.log('  Added missing URLs:', missing);

        // Save
        const saveBtn = page.getByRole('button', { name: /Save|保存|Update/i });
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click();
          console.log('  Saved redirect URLs');
          await page.waitForTimeout(3000);
        }
      } else {
        console.log('  ✅ Redirect URLs already configured');
      }
    } else {
      console.log('  ⚠️ Could not find redirect URLs input');
    }

    await page.screenshot({ path: path.join(__dirname, '..', 'supabase-final.png') });
    console.log('\n=== DONE ===');

  } finally {
    await browser.close();
  }
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
