// Smart Supabase key extraction - clicks reveal buttons and reads hidden inputs
const { chromium } = require('./node_modules/playwright');

const MAIN_CHROME = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/AutomationProfile';
const CHROME_EXE = 'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1097/chrome-win/chrome.exe';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';
const fs = require('fs');

async function main() {
  console.log('=== Smart Supabase Key Extraction ===\n');
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
    // Navigate to the main project page first
    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT_DIR}/step1-project.png` });
    console.log('On project page:', page.url());

    // Now navigate directly to API settings
    console.log('Navigating to API settings...');
    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(10000);

    const url = page.url();
    await page.screenshot({ path: `${OUT_DIR}/step2-api-settings.png` });
    console.log('URL:', url);
    console.log('Screenshot saved: step2-api-settings.png');

    if (url.includes('sign-in')) {
      console.log('\n=== NOT LOGGED IN ===');
      console.log('Please log in to Supabase in the browser window.');
      console.log('Waiting up to 10 minutes...\n');

      const loginCheckStart = Date.now();
      while (Date.now() - loginCheckStart < 600000) {
        const currentUrl = page.url();
        if (!currentUrl.includes('sign-in')) {
          console.log('Login detected!');
          break;
        }
        await page.waitForTimeout(2000);
      }
      if (page.url().includes('sign-in')) {
        console.log('Login timeout.');
        await page.screenshot({ path: `${OUT_DIR}/cf-login-timeout.png` });
        return;
      }
    } else {
      console.log('Already logged in!');
    }

    // Wait for page to fully load
    await page.waitForTimeout(5000);

    // Step 1: Find all "Reveal" buttons and click them
    console.log('\n--- Step 1: Clicking all Reveal buttons ---');
    const revealButtons = await page.locator('button, [role="button"]').filter({
      hasText: /reveal|show|view|display/i
    }).all();

    console.log(`Found ${revealButtons.length} reveal button(s)`);
    for (const btn of revealButtons) {
      try {
        const text = await btn.textContent();
        await btn.click();
        console.log(`  Clicked: "${text?.trim()}"`);
        await page.waitForTimeout(500);
      } catch (e) {
        console.log(`  Failed to click button: ${e.message.substring(0, 50)}`);
      }
    }

    // Step 2: Find all input fields with JWT-like values
    console.log('\n--- Step 2: Scanning input fields ---');
    const inputs = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input').forEach(el => {
        const val = el.value || '';
        if (val.match(/^eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+$/)) {
          fields.push({
            type: el.type,
            id: el.id,
            name: el.name,
            readonly: el.readOnly,
            label: (el.closest('div, section, label')?.querySelector('label, span, p, div')?.textContent || '').trim().substring(0, 100),
            value: val
          });
        }
      });
      return fields;
    });

    if (inputs.length > 0) {
      console.log(`Found ${inputs.length} JWT input(s):`);
      for (const inp of inputs) {
        console.log(`  type=${inp.type} readonly=${inp.readonly} label="${inp.label}"`);
        console.log(`  value: ${inp.value.substring(0, 50)}...`);

        // Try to get full value
        try {
          if (inp.type === 'password' || inp.readOnly) {
            // Remove readonly and get value
            await page.evaluate((id) => {
              const el = document.querySelector(`#${id}`);
              if (el) {
                el.removeAttribute('readonly');
                el.removeAttribute('disabled');
                el.type = 'text';
              }
            }, inp.id);
            await page.waitForTimeout(200);
          }
        } catch (e) {}
      }
    }

    // Step 3: Now scan ALL text on the page for JWTs (revealed keys)
    console.log('\n--- Step 3: Full page JWT scan ---');
    const allText = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const results = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent || '';
        if (text.match(/eyJ[A-Za-z0-9_=-]{10,}\./)) {
          results.push({
            text: text.trim(),
            tag: node.parentElement?.tagName || '?',
            className: node.parentElement?.className?.substring(0, 50) || ''
          });
        }
      }
      return results;
    });

    console.log(`Found ${allText.length} text nodes with JWT patterns`);
    const result = { anonKey: null, serviceRoleKey: null };

    for (const item of allText) {
      const matches = item.text.match(/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+/g) || [];
      for (const m of matches) {
        try {
          const parts = m.split('.');
          const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
          console.log(`  JWT: role=${payload.role} preview="${m.substring(0, 40)}..." tag=<${item.tag}> class="${item.className}"`);
          if (payload.role === 'service_role') result.serviceRoleKey = m;
          if (payload.role === 'anon') result.anonKey = m;
        } catch (e) {
          console.log(`  Parse error for: ${m.substring(0, 40)}...`);
        }
      }
    }

    // Step 4: Try to read directly from input value attribute
    console.log('\n--- Step 4: Direct input value read ---');
    const directKeys = await page.evaluate(() => {
      const keys = [];
      document.querySelectorAll('input').forEach(el => {
        const val = el.value || '';
        if (val.match(/^eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+$/)) {
          keys.push(val);
          el.type = 'text'; // Reveal password fields
        }
      });
      return keys;
    });

    for (const k of directKeys) {
      try {
        const parts = k.split('.');
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
        console.log(`  Direct: role=${payload.role} key=${k.substring(0, 50)}...`);
        if (payload.role === 'service_role' && !result.serviceRoleKey) {
          result.serviceRoleKey = k;
        }
        if (payload.role === 'anon' && !result.anonKey) {
          result.anonKey = k;
        }
      } catch (e) {}
    }

    // Final result
    console.log('\n=== RESULT ===');
    if (result.serviceRoleKey) {
      console.log('SERVICE ROLE KEY FOUND!');
      console.log(result.serviceRoleKey);
      fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, result.serviceRoleKey);
      console.log('\nSaved to:', `${OUT_DIR}/.service_role_key.txt`);
    } else {
      console.log('Service role key still not found.');
      await page.screenshot({ path: `${OUT_DIR}/supabase-api-final.png`, fullPage: true });
      console.log('Full page screenshot saved.');

      // Try scrolling down and scanning again
      console.log('\n--- Trying scroll approach ---');
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: `${OUT_DIR}/supabase-api-scrolled.png`, fullPage: true });
      console.log('Scrolled screenshot saved.');
    }

  } catch (err) {
    console.error('Error:', err.message.substring(0, 300));
  } finally {
    if (browser) {
      console.log('\nBrowser open. Close manually when done.');
      setTimeout(() => {
        if (browser) browser.close();
      }, 60000);
    }
  }
}

main().catch(console.error);
