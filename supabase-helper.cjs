// Use Playwright with the main Chrome profile (where supabase cookies exist)
// to navigate to Supabase dashboard and extract the service role key
const { chromium } = require('./node_modules/playwright');

const MAIN_CHROME = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';
const CHROME_EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';
const fs = require('fs');

async function main() {
  console.log('=== Supabase Key Extraction via Main Chrome Profile ===\n');

  let browser;
  try {
    console.log('Launching Chrome with main profile...');
    browser = await chromium.launchPersistentContext(MAIN_CHROME, {
      executable: CHROME_EXE,
      headless: false, // Need visible for potential 2FA
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--disable-web-security',
      ],
      timeout: 15000,
    });

    const page = browser.pages()[0] || (await browser.newPage());

    // Go directly to Supabase API settings
    console.log('Navigating to Supabase API settings...');
    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
      timeout: 20000,
      waitUntil: 'networkidle2',
    });

    await page.waitForTimeout(5000);

    const url = page.url();
    console.log('Current URL:', url);

    if (url.includes('sign-in')) {
      console.log('\n=== LOGIN REQUIRED ===');
      console.log('Please log in to Supabase in the browser window.');
      console.log('If you have 2FA enabled, you will need to approve it.');
      console.log('The script will detect when you are logged in and extract the keys.\n');

      // Wait for login
      try {
        await page.waitForURL(u => !u.includes('sign-in'), { timeout: 300000 });
        console.log('Login detected!');
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('Login timeout (5 minutes). Please try again.');
        await page.screenshot({ path: `${OUT_DIR}/supabase-login-timeout.png` });
        await browser.close();
        return;
      }
    }

    await page.waitForTimeout(3000);

    // Now we're logged in - extract the keys
    console.log('\nExtracting keys...');
    const result = await extractKeys(page);

    if (result.serviceRoleKey) {
      console.log('\n========================================');
      console.log('SERVICE ROLE KEY EXTRACTED!');
      console.log('========================================');
      console.log(result.serviceRoleKey);
      fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, result.serviceRoleKey);
      console.log('\nSaved to:', `${OUT_DIR}/.service_role_key.txt`);
    } else {
      console.log('\nCould not extract service role key from page.');
      console.log('Please scroll down on the API settings page to find the service_role secret.');
      await page.screenshot({ path: `${OUT_DIR}/supabase-api-final.png`, fullPage: true });
    }

    // Also try to click on API settings tab if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('/settings/api')) {
      console.log('\nNavigating to API settings...');
      await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
        timeout: 15000,
        waitUntil: 'networkidle2',
      });
      await page.waitForTimeout(5000);
      const keys = await extractKeys(page);
      if (keys.serviceRoleKey) {
        console.log('\n=== SERVICE ROLE KEY FOUND ===');
        console.log(keys.serviceRoleKey);
        fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, keys.serviceRoleKey);
      }
    }

    await page.screenshot({ path: `${OUT_DIR}/supabase-api-final.png`, fullPage: true });
    console.log('\nScreenshot saved.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (browser) {
      console.log('\nBrowser will stay open. Close it manually when done.');
      setTimeout(() => {}, 60000);
    }
  }
}

async function extractKeys(page) {
  const result = { anonKey: null, serviceRoleKey: null };

  // Method 1: Find all JWT-like strings in the page
  const allText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts = [];
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent || '';
      if (text.match(/eyJ[A-Za-z0-9_=-]+\./)) {
        texts.push({ text: text.trim(), tag: node.parentElement?.tagName });
      }
    }
    return texts;
  });

  console.log('\nJWT candidates found:', allText.length);
  for (const item of allText) {
    const matches = item.text.match(/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+/g) || [];
    for (const m of matches) {
      try {
        const parts = m.split('.');
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
        const preview = m.substring(0, 40) + '...';
        console.log(`  JWT role=${payload.role} preview="${preview}" parent=<${item.tag}>`);
        if (payload.role === 'service_role') result.serviceRoleKey = m;
        if (payload.role === 'anon') result.anonKey = m;
      } catch (e) {}
    }
  }

  // Method 2: Try to find the service role key specifically
  const pageHTML = await page.content();

  // Search for patterns like "eyJ...service_role..."
  const srMatch = pageHTML.match(/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.eyJ[^"<]+\.service_role[^"<]+[A-Za-z0-9_=-]+/);
  if (srMatch) {
    console.log('\nFound service_role JWT in HTML');
    console.log(srMatch[0].substring(0, 80));
  }

  // Method 3: Try to find input fields with keys
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[readonly], input')).map(el => {
      const val = el.value || '';
      const isJwt = val.match(/^eyJ/) && val.split('.').length === 3;
      return {
        id: el.id || '',
        name: el.name || '',
        type: el.type || '',
        readonly: el.readOnly,
        isJwt,
        valuePreview: val ? val.substring(0, 30) + (val.length > 30 ? '...' : '') : '',
        parentText: (el.closest('div, section, div[role]')?.innerText || '').substring(0, 100),
      };
    }).filter(x => x.isJwt || x.id.includes('key') || x.name.includes('key'));
  });

  console.log('\nKey input fields:', inputs.length);
  for (const inp of inputs) {
    console.log(`  id=${inp.id} name=${inp.name} readonly=${inp.readOnly} isJwt=${inp.isJwt}`);
    if (inp.isJwt) console.log(`    value: ${inp.valuePreview}`);
  }

  return result;
}

main().catch(console.error);
