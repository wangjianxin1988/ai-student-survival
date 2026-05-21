// Try Doubao browser (ByteDance) - might have different session state
const { chromium } = require('./node_modules/playwright');

const DOUBAO = 'C:/Users/Administrator/AppData/Local/Doubao/Application/doubao.exe';
const DOUBAO_DATA = 'C:/Users/Administrator/AppData/Local/Doubao/User Data/Default';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';

async function main() {
  console.log('=== Trying Doubao Browser ===\n');

  let browser;
  try {
    // Check if Doubao exe exists
    const fs = require('fs');
    if (!fs.existsSync(DOUBAO)) {
      console.log('Doubao browser not found at:', DOUBAO);
      // Try to find it
      const dirs = [
        'C:/Users/Administrator/AppData/Local/Doubao/Application',
        'C:/Program Files/Doubao',
        'C:/Program Files (x86)/Doubao',
      ];
      for (const d of dirs) {
        if (fs.existsSync(d)) {
          const files = fs.readdirSync(d).filter(f => f.endsWith('.exe'));
          console.log('Found in', d, ':', files.join(', '));
        }
      }
      return;
    }

    console.log('Launching Doubao browser...');
    browser = await chromium.launchPersistentContext(DOUBAO_DATA, {
      executable: DOUBAO,
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 20000,
    });

    const page = browser.pages()[0] || (await browser.newPage());
    console.log('Navigating to Supabase...');
    await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
      timeout: 20000,
      waitUntil: 'networkidle2',
    });
    await page.waitForTimeout(3000);

    const url = page.url();
    console.log('URL:', url);

    if (url.includes('sign-in')) {
      console.log('Not logged in to Supabase in Doubao.');
    } else {
      console.log('Already logged in! Extracting keys...');
      const result = await extractKeys(page);
      if (result.serviceRoleKey) {
        console.log('\n=== SERVICE ROLE KEY ===');
        console.log(result.serviceRoleKey);
        fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, result.serviceRoleKey);
      }
    }

    await page.screenshot({ path: `${OUT_DIR}/doubao-supabase.png` });
    console.log('Screenshot saved.');

  } catch (err) {
    console.error('Error:', err.message.substring(0, 300));
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function extractKeys(page) {
  const result = { anonKey: null, serviceRoleKey: null };
  const allText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts = [];
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent || '';
      if (text.match(/eyJ[A-Za-z0-9_=-]+\./)) {
        texts.push(text.trim());
      }
    }
    return texts;
  });

  for (const text of allText) {
    const matches = text.match(/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+/g) || [];
    for (const m of matches) {
      try {
        const parts = m.split('.');
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
        console.log(`  JWT role=${payload.role} preview="${m.substring(0,30)}..."`);
        if (payload.role === 'service_role') result.serviceRoleKey = m;
        if (payload.role === 'anon') result.anonKey = m;
      } catch (e) {}
    }
  }
  return result;
}

main().catch(console.error);
