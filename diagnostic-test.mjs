/**
 * Diagnostic test - better demo user setup
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4328';
const SCREENSHOT_DIR = 'D:/suoyouxiangmu/ai-student-survival/test-results/';

async function runDiagnostics() {
  console.log('=== Better Diagnostics ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  // Setup demo user BEFORE navigation
  await page.addInitScript(() => {
    const demoUser = {
      id: 'demo-user-test123',
      email: 'demo@test.com',
      name: 'Demo Test User',
      avatar: '',
      created_at: new Date().toISOString(),
      role: 'member',
    };
    localStorage.setItem('demo_session', JSON.stringify(demoUser));
    localStorage.setItem('demo_users', JSON.stringify({ [demoUser.id]: demoUser }));
    console.log('Demo user set in localStorage');
  });

  // Go directly to user page
  await page.goto(`${BASE_URL}/user`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);  // Wait longer for hydration

  // Take screenshot
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'diagnostic-user-page.png'), fullPage: true });
  console.log('Screenshot saved');

  // Get page content
  const pageInfo = await page.evaluate(() => {
    return {
      url: window.location.href,
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean),
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean),
      bodyText: document.body.innerText.substring(0, 800),
    };
  });

  console.log('\n--- Page URL:', pageInfo.url, '---');
  console.log('Buttons:', JSON.stringify(pageInfo.buttons));
  console.log('Headings:', JSON.stringify(pageInfo.headings));
  console.log('\nBody text:', pageInfo.bodyText);

  // Check what the auth state is
  const authInfo = await page.evaluate(() => {
    // Try to get the current user from localStorage
    const session = localStorage.getItem('demo_session');
    const users = localStorage.getItem('demo_users');
    return {
      hasSession: !!session,
      sessionUser: session ? JSON.parse(session) : null,
      hasUsers: !!users,
    };
  });

  console.log('\n--- Auth Info ---');
  console.log(JSON.stringify(authInfo, null, 2));

  // Check for any error states or redirect
  console.log('\n--- Check for login redirect ---');
  const isLoginPage = pageInfo.url.includes('/auth/');
  console.log('Is on login page:', isLoginPage);

  await browser.close();
  console.log('\n=== Done ===');
}

runDiagnostics().catch(console.error);