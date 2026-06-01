/**
 * Debug auth flow - direct call test
 */
import { test, expect, chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4328';

test('Debug auth flow - check isSupabaseConfigured', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('AUTH') || msg.text().includes('DEBUG') || msg.text().includes('configured')) {
      console.log('BROWSER:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  // First go to debug page and login
  await page.goto(`${BASE_URL}/auth/debug`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.fill('#test-email', 'debug2@example.com');
  await page.fill('#test-password', 'password123');
  await page.fill('#test-name', 'Debug User 2');

  await page.click('#test-login');
  await page.waitForTimeout(2000);

  // Now create an HTML test page that imports auth module
  await page.setContent(`
    <html>
      <head><title>Auth Debug</title></head>
      <body>
        <h1>Auth Debug</h1>
        <div id="results"></div>
        <script type="module">
          // Import the auth module
          import { getCurrentUser, initAuth } from '/src/lib/auth.ts';
          import { isSupabaseConfigured } from '/src/lib/supabase.ts';

          const results = document.getElementById('results');

          async function runTests() {
            let html = '<h2>Supabase Config</h2>';
            html += '<p>isSupabaseConfigured: ' + isSupabaseConfigured + '</p>';

            html += '<h2>Before initAuth</h2>';
            const before = getCurrentUser();
            html += '<p>getCurrentUser(): ' + JSON.stringify(before) + '</p>';
            html += '<p>sessionStorage: ' + sessionStorage.getItem('demo_session') + '</p>';

            html += '<h2>After initAuth</h2>';
            const initResult = await initAuth();
            html += '<p>initAuth(): ' + JSON.stringify(initResult) + '</p>';

            const after = getCurrentUser();
            html += '<p>getCurrentUser(): ' + JSON.stringify(after) + '</p>';

            results.innerHTML = html;
          }

          runTests();
        </script>
      </body>
    </html>
  `);

  await page.waitForTimeout(3000);

  const results = await page.locator('#results').innerHTML().catch(() => 'failed to get results');
  console.log('Auth module test results:');
  console.log(results);

  // Also check the user page flow
  console.log('\n\n--- User page test ---');
  await page.goto(`${BASE_URL}/auth/debug`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click check status
  await page.click('#check-status');
  await page.waitForTimeout(500);

  const statusResult = await page.locator('#status-result').textContent().catch(() => 'none');
  console.log('Status result:', statusResult);

  await browser.close();
});