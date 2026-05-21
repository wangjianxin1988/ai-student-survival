const { chromium } = require('playwright');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('Launching Edge...');

  // Launch Edge
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: false,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Browser launched');

  // Navigate to Cloudflare
  console.log('Navigating to Cloudflare...');
  await page.goto('https://dash.cloudflare.com', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  // Take screenshot
  await page.screenshot({ path: 'cloudflare.png', fullPage: false });
  console.log('Screenshot: cloudflare.png');

  // Keep browser open for user to interact
  console.log('\n✓ Browser opened');
  console.log('Please login to Cloudflare and create API Token');
  console.log('The script will wait 120 seconds for you to work...');

  await page.waitForTimeout(120000);

  // Check final state
  console.log('\nFinal URL:', page.url());
  await page.screenshot({ path: 'cloudflare-final.png', fullPage: false });

  const content = await page.content();
  if (content.includes('Create Token') || content.includes('API token')) {
    console.log('\n✓ API Token page reached!');
  }

  await browser.close();
  console.log('\nDone!');
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
