// Use Playwright with Chrome to operate Cloudflare Dashboard directly
// This can add DNS records and Pages custom domains without API tokens
const { chromium } = require('./node_modules/playwright');

const MAIN_CHROME = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';
const CHROME_EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';

async function main() {
  console.log('=== Cloudflare DNS & Pages Setup ===\n');

  let browser;
  try {
    browser = await chromium.launchPersistentContext(MAIN_CHROME, {
      executable: CHROME_EXE,
      headless: false, // Need visible for user interaction
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
      timeout: 20000,
    });

    const page = browser.pages()[0] || (await browser.newPage());

    // Step 1: Go to Cloudflare dashboard DNS page
    console.log('Step 1: Navigating to Cloudflare DNS settings...');
    await page.goto('https://dash.cloudflare.com/94944d650e42e4b39eca661851016eae/dns', {
      timeout: 30000,
      waitUntil: 'networkidle2',
    });

    await page.waitForTimeout(3000);
    const dnsUrl = page.url();
    console.log('DNS URL:', dnsUrl);

    if (dnsUrl.includes('login')) {
      console.log('\n=== CLOUDFLARE LOGIN REQUIRED ===');
      console.log('Please log in to Cloudflare in the browser.');
      console.log('Waiting for login...\n');

      try {
        await page.waitForURL(u => !u.includes('login'), { timeout: 300000 });
        console.log('Cloudflare login detected!');
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('Login timeout (5 min). Please log in manually.');
        await page.screenshot({ path: `${OUT_DIR}/cloudflare-login.png` });
        return;
      }
    }

    console.log('Cloudflare dashboard loaded.');

    // Step 2: Add CNAME records
    console.log('\nStep 2: Checking DNS records...');
    await page.waitForTimeout(2000);

    // Look for "Add record" button
    const addButton = await page.$('button:has-text("Add record"), button:has-text("添加记录"), [data-testid="add-record"]');
    if (addButton) {
      console.log('Found Add record button, clicking...');
      await addButton.click();
      await page.waitForTimeout(2000);

      // Fill in CNAME record
      // Type: CNAME
      const typeSelect = await page.$('[data-testid="type-select"], select[name="type"], [aria-label="Type"]');
      if (typeSelect) {
        await typeSelect.selectOption('CNAME');
        await page.waitForTimeout(1000);
      }

      // Name: www
      const nameInput = await page.$('input[name="name"], input[placeholder*="Name"], input[placeholder*="name"]');
      if (nameInput) {
        await nameInput.fill('www');
      }

      // Target: ai-student-survival.pages.dev
      const targetInput = await page.$('input[name="content"], input[placeholder*="Target"], input[placeholder*="target"], input[placeholder*="CNAME"]');
      if (targetInput) {
        await targetInput.fill('ai-student-survival.pages.dev');
      }

      // Proxy: enabled (toggle)
      const proxyToggle = await page.$('[data-testid="proxy-toggle"], input[name="proxied"]');
      if (proxyToggle) {
        const isChecked = await proxyToggle.isChecked();
        if (!isChecked) await proxyToggle.click();
      }

      console.log('DNS record form filled.');
      await page.screenshot({ path: `${OUT_DIR}/cloudflare-dns-form.png` });

    } else {
      console.log('Could not find Add record button. Taking screenshot for debugging...');
      await page.screenshot({ path: `${OUT_DIR}/cloudflare-dns-page.png`, fullPage: false });
    }

    // Step 3: Add Pages custom domain
    console.log('\nStep 3: Navigating to Cloudflare Pages...');
    await page.goto('https://dash.cloudflare.com/94944d650e42e4b39eca661851016eae/pages', {
      timeout: 30000,
      waitUntil: 'networkidle2',
    });
    await page.waitForTimeout(3000);

    console.log('Pages URL:', page.url());
    await page.screenshot({ path: `${OUT_DIR}/cloudflare-pages.png`, fullPage: false });

    console.log('\nScreenshots saved. Please complete any remaining steps manually in the browser.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (browser) {
      console.log('\nBrowser open. Close it manually when done.');
      setTimeout(() => {}, 30000);
    }
  }
}

main().catch(console.error);
