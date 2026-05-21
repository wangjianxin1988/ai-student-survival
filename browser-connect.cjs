const { chromium } = require('playwright');

(async () => {
  // Connect to existing Edge browser
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  // Get all pages/tabs
  const context = browser.contexts()[0] || await browser.newContext();
  const pages = context.pages();

  console.log('Connected to Edge!');
  console.log('Existing pages:', pages.length);

  // List all tabs first
  console.log('\nAll tabs:');
  for (let i = 0; i < pages.length; i++) {
    const url = pages[i].url();
    console.log(`  Tab ${i}: ${url}`);
  }

  // Navigate to Cloudflare API Tokens in first page
  const page = pages[0];
  console.log('\nNavigating to Cloudflare...');
  await page.goto('https://dash.cloudflare.com/profile/api-tokens', { timeout: 15000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  // Take screenshot
  await page.screenshot({ path: 'cloudflare-tokens.png', fullPage: false });
  console.log('\nScreenshot saved: cloudflare-tokens.png');

  // Get visible elements
  const content = await page.content();
  if (content.includes('API Tokens')) {
    console.log('✓ API Tokens page loaded');
  } else {
    console.log('✗ May need to login');
  }

  await browser.close();
  console.log('\nDone!');
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
