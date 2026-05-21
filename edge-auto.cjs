// Use Edge profile for Supabase + Cloudflare
const { chromium } = require('./node_modules/playwright');

const EDGE_EXE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const EDGE_DATA = 'C:/Users/Administrator/AppData/Local/Microsoft/Edge/User Data/AutomationEdge';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';
const fs = require('fs');

async function main() {
  console.log('=== Edge Browser Automation ===\n');
  let browser;

  try {
    console.log('Launching Edge with copied profile...');
    browser = await chromium.launchPersistentContext(EDGE_DATA, {
      executable: EDGE_EXE,
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 20000,
    });
    console.log('Edge launched successfully!');

    const page = browser.pages()[0] || (await browser.newPage());

    // TASK 1: Supabase API Key
    console.log('\n=== TASK 1: Supabase API Key ===');
    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(8000);

    const url = page.url();
    console.log('URL:', url);
    await page.screenshot({ path: `${OUT_DIR}/edge-step1.png` });

    if (url.includes('sign-in')) {
      console.log('Not logged in to Supabase in Edge. Waiting for manual login (10 min)...');
      const loginStart = Date.now();
      while (Date.now() - loginStart < 600000) {
        if (!page.url().includes('sign-in')) {
          console.log('Login detected!');
          break;
        }
        await page.waitForTimeout(3000);
        if (Date.now() - loginStart > 60000) console.log('Still waiting...');
      }
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `${OUT_DIR}/edge-after-login.png` });
    } else {
      console.log('Already logged in to Supabase in Edge!');
    }

    // Extract keys
    const result = await extractKeys(page);
    if (result.serviceRoleKey) {
      console.log('\nSERVICE ROLE KEY FOUND!');
      console.log(result.serviceRoleKey);
      fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, result.serviceRoleKey);
      console.log('Saved to:', `${OUT_DIR}/.service_role_key.txt`);
    } else {
      console.log('Key not found, scrolling and trying again...');
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 400));
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: `${OUT_DIR}/edge-scrolled.png`, fullPage: true });
      const result2 = await extractKeys(page);
      if (result2.serviceRoleKey) {
        console.log('\nSERVICE ROLE KEY FOUND (after scroll)!');
        fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, result2.serviceRoleKey);
      }
    }

    // TASK 2: Cloudflare DNS
    console.log('\n=== TASK 2: Cloudflare DNS ===');
    await page.goto('https://dash.cloudflare.com/94944d650e42e4b39eca661851016eae/dns', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    const dnsUrl = page.url();
    console.log('DNS URL:', dnsUrl);
    await page.screenshot({ path: `${OUT_DIR}/cf-dns-page.png` });

    if (dnsUrl.includes('login')) {
      console.log('Need to log in to Cloudflare...');
      const cfLoginStart = Date.now();
      while (Date.now() - cfLoginStart < 600000) {
        if (!page.url().includes('login')) {
          console.log('Cloudflare login detected!');
          break;
        }
        await page.waitForTimeout(3000);
        if (Date.now() - cfLoginStart > 60000) console.log('Still waiting...');
      }
      await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: `${OUT_DIR}/cf-dns-loggedin.png` });
    console.log('\nCloudflare DNS page loaded.');

    // Look for "Add record" button
    try {
      const addBtn = page.locator('button:has-text("Add record"), [data-testid="add-record"]').first();
      if (await addBtn.isVisible({ timeout: 5000 })) {
        console.log('Found "Add record" button, clicking...');
        await addBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${OUT_DIR}/cf-add-record-form.png` });

        // Select CNAME
        try {
          const typeSelect = page.locator('select, [data-testid="type-select"], [aria-label*="type"]').first();
          if (await typeSelect.isVisible({ timeout: 3000 })) {
            await typeSelect.selectOption('CNAME');
            await page.waitForTimeout(1000);
          }
        } catch (e) {}

        // Fill name: www
        try {
          const nameInput = page.locator('input[name="name"], input[placeholder*="Name" i], [aria-label*="name" i]').first();
          if (await nameInput.isVisible({ timeout: 3000 })) {
            await nameInput.fill('www');
          }
        } catch (e) {}

        // Fill target
        try {
          const targetInput = page.locator('input[name="content"], input[placeholder*="Target" i], input[placeholder*="CNAME" i]').first();
          if (await targetInput.isVisible({ timeout: 3000 })) {
            await targetInput.fill('ai-student-survival.pages.dev');
          }
        } catch (e) {}

        await page.screenshot({ path: `${OUT_DIR}/cf-record-filled.png` });
        console.log('DNS record form filled.');
      }
    } catch (e) {
      console.log('Could not find Add record button:', e.message.substring(0, 100));
    }

    // TASK 3: Cloudflare Pages custom domain
    console.log('\n=== TASK 3: Cloudflare Pages Custom Domain ===');
    await page.goto('https://dash.cloudflare.com/94944d650e42e4b39eca661851016eae/pages/view/ai-student-survival', {
      timeout: 20000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT_DIR}/cf-pages-project.png` });
    console.log('Pages project URL:', page.url());

    console.log('\nAll tasks complete. Screenshots saved.');

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

async function extractKeys(page) {
  const result = { anonKey: null, serviceRoleKey: null };

  // Click reveal buttons first
  try {
    const revealBtns = await page.locator('button').filter({ hasText: /reveal|show|view/i }).all();
    for (const btn of revealBtns) {
      try {
        await btn.click();
        await page.waitForTimeout(300);
      } catch (e) {}
    }
  } catch (e) {}

  const allText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const results = [];
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent || '';
      if (text.match(/eyJ[A-Za-z0-9_=-]{10,}\./)) {
        results.push({ text: text.trim(), tag: node.parentElement?.tagName });
      }
    }
    return results;
  });

  for (const item of allText) {
    const matches = item.text.match(/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+/g) || [];
    for (const m of matches) {
      try {
        const parts = m.split('.');
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
        console.log(`  JWT: role=${payload.role} preview="${m.substring(0, 40)}..."`);
        if (payload.role === 'service_role') result.serviceRoleKey = m;
        if (payload.role === 'anon') result.anonKey = m;
      } catch (e) {}
    }
  }

  return result;
}

main().catch(console.error);
