const { chromium } = require('playwright');

(async () => {
  console.log('=== Cloudflare Domain Binding via Chrome ===\n');

  // Connect to Chrome with your profile (logged in to Cloudflare)
  const browser = await chromium.launchPersistentContext(
    process.env.LOCALAPPDATA + '/Google/Chrome/User Data',
    {
      headless: false,
      args: ['--profile-directory=Default', '--disable-blink-features=AutomationControlled'],
      viewport: { width: 1400, height: 900 }
    }
  );

  const page = browser.pages()[0] || await browser.newPage();
  console.log('Connected to Chrome. Current URL:', page.url());

  // Step 1: Navigate to Pages project settings
  console.log('\n[1/3] Navigating to Cloudflare Pages project...');
  await page.goto('https://dash.cloudflare.com/d6d81a527b2e9b2620245bfa56711398/pages/view/bd97200c/ai-student-survival', {
    timeout: 30000,
    waitUntil: 'networkidle'
  });
  await page.screenshot({ path: 'cf-pages-project.png', fullPage: false });
  console.log('Screenshot: cf-pages-project.png');
  console.log('Current URL:', page.url());

  // Wait for manual login if needed
  await page.waitForTimeout(3000);

  // Check if we need to login
  if (page.url().includes('login')) {
    console.log('LOGIN REQUIRED: Please log in to Cloudflare in the Chrome window, then come back here.');
    console.log('Press Enter in this terminal when done...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  }

  // Step 2: Navigate to Custom Domains settings
  console.log('\n[2/3] Navigating to Custom Domains settings...');
  await page.goto('https://dash.cloudflare.com/d6d81a527b2e9b2620245bfa56711398/pages/view/bd97200c/ai-student-survival/settings/custom-domains', {
    timeout: 30000,
    waitUntil: 'networkidle'
  });
  await page.screenshot({ path: 'cf-custom-domains.png', fullPage: false });
  console.log('Screenshot: cf-custom-domains.png');
  console.log('Current URL:', page.url());

  await page.waitForTimeout(2000);

  // Step 3: Check for and click "Add custom domain" button
  const addBtn = page.locator('button:has-text("Add custom domain"), button:has-text("Add domain"), button:has-text("Custom domain")').first();
  if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('\n[3/3] Found "Add custom domain" button, clicking...');
    await addBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'cf-add-domain.png', fullPage: false });
    console.log('Clicked add button. Screenshot: cf-add-domain.png');

    // Try to fill in domain
    const input = page.locator('input[placeholder*="domain"], input[placeholder*="Domain"], input[placeholder*="mi-to"]').first();
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('www.mi-to-ai.com');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'cf-domain-filled.png', fullPage: false });
      console.log('Filled www.mi-to-ai.com. Screenshot: cf-domain-filled.png');

      // Find and click confirm button
      const confirmBtn = page.locator('button:has-text("Add"), button:has-text("Confirm"), button:has-text("Save")').first();
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmBtn.click();
        console.log('Confirmed domain addition.');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'cf-domain-added.png', fullPage: false });
      }
    }
  } else {
    console.log('Could not find "Add custom domain" button.');
    console.log('Please manually:');
    console.log('  1. Go to Custom Domains tab');
    console.log('  2. Click "Add custom domain"');
    console.log('  3. Enter: www.mi-to-ai.com');
    console.log('  4. Click Add');
    console.log('  5. Repeat for: mi-to-ai.com');
    await page.screenshot({ path: 'cf-settings-page.png', fullPage: false });
  }

  console.log('\nDone. Screenshots saved.');
  console.log('Keep the Chrome window open for further operations if needed.');

  // Don't close - let user see the result
  await page.waitForTimeout(5000);
  await browser.close();
})();
