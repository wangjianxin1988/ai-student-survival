// Create a new Cloudflare API token with full DNS + Pages permissions
const { chromium } = require('./node_modules/playwright');

const EDGE_EXE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const EDGE_DATA = 'C:/Users/Administrator/AppData/Local/Microsoft/Edge/User Data/AutomationEdge';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';
const fs = require('fs');

async function main() {
  console.log('=== Cloudflare Token Creator ===\n');
  let browser;

  try {
    browser = await chromium.launchPersistentContext(EDGE_DATA, {
      executable: EDGE_EXE,
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 20000,
    });

    const page = browser.pages()[0] || (await browser.newPage());

    // Navigate to Cloudflare API tokens page
    console.log('Navigating to Cloudflare API tokens...');
    await page.goto('https://dash.cloudflare.com/profile/api-tokens', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log('URL:', url);
    await page.screenshot({ path: `${OUT_DIR}/cf-tokens-page.png` });

    if (url.includes('login')) {
      console.log('\n=== NOT LOGGED IN to Cloudflare ===');
      console.log('Waiting for manual login (10 min)...');
      const loginStart = Date.now();
      while (Date.now() - loginStart < 600000) {
        if (!page.url().includes('login')) {
          console.log('Login detected!');
          break;
        }
        await page.waitForTimeout(3000);
      }
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${OUT_DIR}/cf-after-login.png` });
    } else {
      console.log('Already logged in to Cloudflare!');
    }

    // Check if we can see the API tokens page
    const pageContent = await page.content();
    if (pageContent.includes('API Tokens') || pageContent.includes('api-tokens') || pageContent.includes('Create Token')) {
      console.log('\nAPI Tokens page loaded successfully!');
      await page.screenshot({ path: `${OUT_DIR}/cf-tokens-loaded.png` });
    } else {
      console.log('\nCould not load API tokens page');
      await page.screenshot({ path: `${OUT_DIR}/cf-tokens-fail.png` });
    }

    // Also navigate to DNS page
    console.log('\nNavigating to DNS settings...');
    await page.goto('https://dash.cloudflare.com/94944d650e42e4b39eca661851016eae/dns', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT_DIR}/cf-dns-page.png` });
    console.log('DNS page URL:', page.url());

    // Navigate to Pages project
    console.log('\nNavigating to Cloudflare Pages...');
    await page.goto('https://dash.cloudflare.com/94944d650e42e4b39eca661851016eae/pages', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT_DIR}/cf-pages-view.png` });
    console.log('Pages URL:', page.url());

    console.log('\nAll screenshots saved. Please complete the remaining steps in the browser.');

  } catch (err) {
    console.error('Error:', err.message.substring(0, 300));
  } finally {
    if (browser) {
      console.log('\nBrowser open. Close manually when done.');
      setTimeout(() => {
        if (browser) browser.close();
      }, 120000);
    }
  }
}

main().catch(console.error);
