const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== Cloudflare Domain Binding ===\n');

  // Use a separate profile directory to avoid conflicts with running Chrome
  const profileDir = path.join(__dirname, '.chrome-profile');
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

  console.log('Launching Chrome with Cloudflare profile...');
  const browser = await chromium.launchPersistentContext(
    process.env.LOCALAPPDATA + '/Google/Chrome/User Data',
    {
      headless: false,
      args: [
        '--profile-directory=Default',
        '--disable-blink-features=AutomationControlled',
        '--user-data-dir=' + process.env.LOCALAPPDATA + '/Google/Chrome/User Data'
      ],
      viewport: { width: 1400, height: 900 },
      ignoreHTTPSErrors: true
    }
  );

  const page = browser.pages()[0] || await browser.newPage();
  console.log('Chrome launched. Current URL:', page.url());

  // Navigate to the custom domains page
  console.log('\nNavigating to Custom Domains settings...');
  try {
    await page.goto(
      'https://dash.cloudflare.com/d6d81a527b2e9b2620245bfa56711398/pages/view/bd97200c/ai-student-survival/settings/custom-domains',
      { timeout: 60000, waitUntil: 'domcontentloaded' }
    );
  } catch (e) {
    console.log('Navigation error:', e.message.slice(0, 100));
  }

  await page.waitForTimeout(5000);
  const url = page.url();
  const title = await page.title();
  console.log('URL:', url);
  console.log('Title:', title);

  if (url.includes('login')) {
    console.log('\n=== LOGIN REQUIRED ===');
    console.log('Please log in to Cloudflare in the Chrome window.');
    console.log('Then tell me what you see, or take a screenshot.\n');
  } else {
    console.log('\nLogged in! Looking for domain binding UI...');
    await page.screenshot({ path: 'D:/suoyouxiangmu/ai-student-survival/cf-domains-page.png', fullPage: false });
    console.log('Screenshot saved: cf-domains-page.png');

    // Try to find the add button
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.innerText().catch(() => '');
      if (text.toLowerCase().includes('add') || text.toLowerCase().includes('custom')) {
        console.log('Found button:', text.trim());
      }
    }

    // Try clicking "Add custom domain"
    const addBtn = page.locator('button').filter({ hasText: /add custom domain/i }).first();
    if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('\nClicking "Add custom domain"...');
      await addBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'D:/suoyouxiangmu/ai-student-survival/cf-add-domain.png', fullPage: false });

      // Type the domain
      const input = page.locator('input[type="text"], input[type="domain"], input').first();
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        await input.fill('www.mi-to-ai.com');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'D:/suoyouxiangmu/ai-student-survival/cf-domain-typed.png', fullPage: false });

        // Find and click confirm
        const confirm = page.locator('button').filter({ hasText: /add|confirm|save/i }).last();
        if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirm.click();
          console.log('Clicked confirm!');
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'D:/suoyouxiangmu/ai-student-survival/cf-domain-result.png', fullPage: false });
        }
      }
    } else {
      console.log('\nCould not find "Add custom domain" button automatically.');
      console.log('Please manually click "Add custom domain" and enter: www.mi-to-ai.com');
    }
  }

  console.log('\nKeeping browser open. Press Ctrl+C to exit.');
  await new Promise(() => {}); // keep open
})();
