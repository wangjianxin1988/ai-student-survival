const { chromium } = require('./node_modules/playwright');
const fs = require('fs');

const CHROME_PATH = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const USER_DATA_DIR = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';

async function debugSupabase() {
  console.log('Launching Chrome...');
  let browser;
  try {
    browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
      executable: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
    });

    const page = browser.pages()[0] || (await browser.newPage());

    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });

    await page.waitForTimeout(5000);

    // Check page state
    const title = await page.title();
    const url = page.url();
    console.log(`Page title: ${title}`);
    console.log(`Current URL: ${url}`);

    // Check if logged in
    const loginCheck = await page.evaluate(() => {
      const url = window.location.href;
      const bodyText = document.body.innerText.substring(0, 500);
      const hasLogin = bodyText.toLowerCase().includes('sign in') || bodyText.toLowerCase().includes('login');
      return { url, hasLogin, bodyPreview: bodyText.substring(0, 300) };
    });
    console.log(`Logged in: ${!loginCheck.hasLogin}`);
    console.log(`Body preview:\n${loginCheck.bodyPreview}`);

    // Check all input fields
    const inputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return Array.from(inputs).map(el => ({
        type: el.type,
        readonly: el.readOnly,
        value: el.value ? el.value.substring(0, 50) + '...' : '(empty)',
        id: el.id,
        className: el.className,
      }));
    });
    console.log(`\nInput fields found: ${inputs.length}`);
    inputs.slice(0, 10).forEach((inp, i) => {
      console.log(`  [${i+1}] type=${inp.type} readonly=${inp.readonly} id=${inp.id} value=${inp.value}`);
    });

    // Check for code elements
    const codeElements = await page.evaluate(() => {
      const codes = document.querySelectorAll('code, pre');
      return Array.from(codes).map(el => ({
        tag: el.tagName,
        text: (el.textContent || '').trim().substring(0, 100),
      }));
    });
    console.log(`\nCode elements: ${codeElements.length}`);
    codeElements.slice(0, 5).forEach((c, i) => {
      console.log(`  [${i+1}] <${c.tag}>: ${c.text}...`);
    });

    // Take screenshot
    const screenshotPath = `${OUT_DIR}/supabase-debug.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\nScreenshot saved to: ${screenshotPath}`);

    // Try to extract any JWT-looking text from the page
    const allText = await page.evaluate(() => document.body.innerText);
    const jwtMatches = allText.match(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g);
    console.log(`\nJWT-like strings found in page: ${jwtMatches ? jwtMatches.length : 0}`);
    if (jwtMatches) {
      jwtMatches.forEach((m, i) => {
        try {
          const parts = m.split('.');
          const payload = JSON.parse(atob(parts[1]));
          console.log(`  [${i+1}] role=${payload.role} len=${m.length}`);
        } catch (e) {
          console.log(`  [${i+1}] (invalid JWT) len=${m.length}`);
        }
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

debugSupabase();
