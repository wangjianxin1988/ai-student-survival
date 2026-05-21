// Fixed version - use correct waitUntil options
const { chromium } = require('./node_modules/playwright');

const MAIN_CHROME = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';
const CHROME_EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';
const fs = require('fs');

async function main() {
  console.log('=== Supabase Key Extraction ===\n');
  let browser;
  try {
    console.log('Launching Chrome with main profile...');
    browser = await chromium.launchPersistentContext(MAIN_CHROME, {
      executable: CHROME_EXE,
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
      timeout: 20000,
    });

    const page = browser.pages()[0] || (await browser.newPage());

    console.log('Navigating to Supabase API settings...');
    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log('URL:', url);

    if (url.includes('sign-in')) {
      console.log('\n=== NOT LOGGED IN ===');
      console.log('Please log in to Supabase in the browser window.');
      console.log('The script will detect login and extract keys automatically.');
      console.log('Waiting up to 5 minutes...\n');

      try {
        // Wait for login by polling URL every 2s for up to 10 minutes
        console.log('Waiting for login (up to 10 minutes)...');
        const loginCheckStart = Date.now();
        while (Date.now() - loginCheckStart < 600000) {
          const currentUrl = page.url();
          if (!currentUrl.includes('sign-in')) {
            console.log('Login detected!');
            break;
          }
          await page.waitForTimeout(2000);
          if (Date.now() - loginCheckStart > 10000 && page.url().includes('sign-in')) {
            console.log('Still waiting for login...');
          }
        }
        if (page.url().includes('sign-in')) {
          throw new Error('Login timeout');
        }
        console.log('Login detected!');
        await page.waitForTimeout(5000);
      } catch (e) {
        console.log('Timeout waiting for login. Please log in and re-run the script.');
        await page.screenshot({ path: `${OUT_DIR}/supabase-login-wait.png` });
        console.log('\nAfter logging in, please run this command again:');
        console.log('  node supabase-helper-v2.cjs');
        console.log('\nThe browser will stay open. Close it manually when done.');
        setTimeout(() => {}, 120000);
        return;
      }
    } else {
      console.log('Already logged in!');
    }

    // Extract keys
    const result = await extractKeys(page);
    console.log('\n=== RESULT ===');
    if (result.serviceRoleKey) {
      console.log('SERVICE ROLE KEY FOUND!');
      console.log(result.serviceRoleKey);
      fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, result.serviceRoleKey);
      console.log('\nSaved to:', `${OUT_DIR}/.service_role_key.txt`);
    } else {
      console.log('Service role key not found. Taking screenshot...');
      await page.screenshot({ path: `${OUT_DIR}/supabase-api-page.png`, fullPage: true });
      console.log('Screenshot saved to:', `${OUT_DIR}/supabase-api-page.png`);
    }

  } catch (err) {
    console.error('Error:', err.message.substring(0, 300));
  } finally {
    if (browser) {
      console.log('\nBrowser open. Close manually when done.');
      setTimeout(() => {
        if (browser) browser.close();
      }, 30000);
    }
  }
}

async function extractKeys(page) {
  const result = { anonKey: null, serviceRoleKey: null };

  const allText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const results = [];
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent || '';
      if (text.match(/eyJ[A-Za-z0-9_=-]+\./)) {
        results.push(text.trim());
      }
    }
    return results;
  });

  for (const text of allText) {
    const matches = text.match(/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+/g) || [];
    for (const m of matches) {
      try {
        const parts = m.split('.');
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
        console.log(`  JWT: role=${payload.role}, preview="${m.substring(0, 35)}..."`);
        if (payload.role === 'service_role') result.serviceRoleKey = m;
        if (payload.role === 'anon') result.anonKey = m;
      } catch (e) {}
    }
  }

  return result;
}

main().catch(console.error);
