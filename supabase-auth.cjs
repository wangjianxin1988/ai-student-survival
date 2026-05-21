const { chromium } = require('./node_modules/playwright');

const CHROME_PATH = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const USER_DATA_DIR = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';

// Supabase credentials - these need to be provided or we use existing session
const SUPABASE_EMAIL = process.env.SUPABASE_EMAIL || '';
const SUPABASE_PASSWORD = process.env.SUPABASE_PASSWORD || '';

async function loginAndGetKey() {
  console.log('Starting browser...');
  let browser;
  try {
    browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
      executable: CHROME_PATH,
      headless: false, // Need visible browser for auth
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox'],
    });

    const page = browser.pages()[0] || (await browser.newPage());

    // Go to Supabase dashboard
    console.log('Navigating to Supabase dashboard...');
    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
      timeout: 30000,
      waitUntil: 'networkidle',
    });

    await page.waitForTimeout(3000);

    const url = page.url();
    console.log('Current URL:', url);

    // Check if already logged in
    if (url.includes('sign-in')) {
      console.log('Not logged in. Please log in manually in the browser window.');
      console.log('After logging in, the script will automatically extract the keys.');
      console.log('Waiting for login...');

      // Wait for navigation away from sign-in page (up to 5 minutes)
      await page.waitForURL(url => !url.includes('sign-in'), { timeout: 300000 });
      console.log('Login detected, continuing...');
    }

    // Wait for the API page to load
    await page.waitForTimeout(5000);

    // Try to extract the keys
    const result = await extractKeys(page);
    console.log('\nExtraction result:', JSON.stringify(result, null, 2));

    if (result.serviceRoleKey) {
      console.log('\n=== SERVICE ROLE KEY FOUND ===');
      console.log(result.serviceRoleKey);
      console.log('================================\n');

      // Save to file
      const fs = require('fs');
      fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, result.serviceRoleKey);
      console.log('Saved to:', `${OUT_DIR}/.service_role_key.txt`);
    }

    // Take screenshot
    await page.screenshot({ path: `${OUT_DIR}/supabase-api-page.png`, fullPage: false });
    console.log('Screenshot saved');

    return result;

  } catch (err) {
    console.error('Error:', err.message);
    if (browser) await browser.close();
  }
}

async function extractKeys(page) {
  const result = {
    anonKey: null,
    serviceRoleKey: null,
    projectRef: 'giynvpfnzzelzwpmsgtf',
    allInputs: [],
  };

  // Get all input fields
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => ({
      type: el.type,
      readonly: el.readOnly,
      id: el.id,
      name: el.name,
      value: el.value ? (el.value.length > 50 ? el.value.substring(0, 50) + '...' : el.value) : '(empty)',
      parentText: el.parentElement?.innerText?.substring(0, 100) || '',
    }));
  });
  result.allInputs = inputs;
  console.log('\nInput fields found:', inputs.length);
  inputs.slice(0, 10).forEach((inp, i) => {
    console.log(`  [${i+1}] id=${inp.id} name=${inp.name} type=${inp.type} readonly=${inp.readOnly} value_len=${inp.value.length} parent="${inp.parentText.substring(0,50)}"`);
  });

  // Look for JWT-like strings in the page
  const pageText = await page.evaluate(() => document.body.innerText);
  const jwtMatches = pageText.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || [];
  console.log('\nJWT-like strings found:', jwtMatches.length);
  jwtMatches.forEach((m, i) => {
    try {
      const parts = m.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const role = payload.role;
      console.log(`  [${i+1}] role=${role} len=${m.length} preview="${m.substring(0, 30)}..."`);
      if (role === 'service_role' && !result.serviceRoleKey) {
        result.serviceRoleKey = m;
      }
      if (role === 'anon' && !result.anonKey) {
        result.anonKey = m;
      }
    } catch (e) {
      // Not a valid JWT
    }
  });

  // Look for code blocks with keys
  const codeBlocks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('code, pre, [data-key]')).map(el => ({
      tag: el.tagName,
      text: (el.textContent || '').trim().substring(0, 100),
      dataKey: el.getAttribute('data-key'),
    }));
  });
  console.log('\nCode/data-key elements:', codeBlocks.length);
  codeBlocks.slice(0, 10).forEach((c, i) => {
    console.log(`  [${i+1}] <${c.tag}> data-key=${c.dataKey} text="${c.text}"`);
  });

  // Look for specific text patterns near "service_role" or "secret"
  const secretPatterns = await page.evaluate(() => {
    const results = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent || '';
      if (text.includes('service_role') || text.includes('service-role') || text.includes('secret')) {
        const parent = node.parentElement;
        results.push({
          text: text.substring(0, 200),
          parentTag: parent?.tagName,
          parentClass: parent?.className?.substring(0, 50),
        });
      }
    }
    return results;
  });
  console.log('\nSecret-related text nodes:', secretPatterns.length);
  secretPatterns.slice(0, 5).forEach((p, i) => {
    console.log(`  [${i+1}] <${p.parentTag}> "${p.text.substring(0,100)}"`);
  });

  return result;
}

loginAndGetKey().then(() => {
  console.log('\nScript completed. Press Ctrl+C to exit, or the browser will close automatically.');
  setTimeout(() => process.exit(0), 60000);
});
