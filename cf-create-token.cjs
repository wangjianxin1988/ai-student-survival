// Programmatically create a Cloudflare API token with Pages + DNS permissions
const { chromium } = require('./node_modules/playwright');

const EDGE_EXE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const EDGE_DATA = 'C:/Users/Administrator/AppData/Local/Microsoft/Edge/User Data/AutomationEdge';
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';
const fs = require('fs');

async function main() {
  console.log('=== Cloudflare API Token Creator ===\n');
  let browser;

  try {
    browser = await chromium.launchPersistentContext(EDGE_DATA, {
      executable: EDGE_EXE,
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 30000,
    });

    const page = browser.pages()[0] || (await browser.newPage());

    // Navigate to Cloudflare API tokens page
    console.log('Navigating to Cloudflare API tokens...');
    await page.goto('https://dash.cloudflare.com/profile/api-tokens', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log('URL:', url);

    if (url.includes('login')) {
      console.log('NOT logged in - waiting for manual login (10 min)...');
      const loginStart = Date.now();
      while (Date.now() - loginStart < 600000) {
        if (!page.url().includes('login')) {
          console.log('Login detected!');
          break;
        }
        await page.waitForTimeout(3000);
      }
      await page.waitForTimeout(3000);
    } else {
      console.log('Already logged in!');
    }

    await page.screenshot({ path: `${OUT_DIR}/cf-token-start.png` });

    // Check if we can see the API tokens page
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      console.log('ERROR: Cannot reach API tokens page');
      await browser.close();
      return;
    }

    // Look for "Create Token" button
    console.log('\nLooking for Create Token button...');

    // Try to find and click "Create Token" button
    const createBtn = page.locator('button:has-text("Create Token"), a:has-text("Create Token"), [data-testid="create-token"]').first();
    const createBtnVisible = await createBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (createBtnVisible) {
      console.log('Found Create Token button, clicking...');
      await createBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${OUT_DIR}/cf-token-template.png` });

      // Look for template options - "Create Custom Token" is usually available
      const customBtn = page.locator('button:has-text("Create Custom Token"), a:has-text("Custom Token")').first();
      const customVisible = await customBtn.isVisible({ timeout: 3000 }).catch(() => false);

      if (customVisible) {
        console.log('Clicking Custom Token...');
        await customBtn.click();
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: `${OUT_DIR}/cf-token-form.png` });

      // Fill in token name
      const nameInput = page.locator('input[name="name"], input[placeholder*="Token name" i]').first();
      if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nameInput.fill('GitHub Actions - ai-student-survival');
        console.log('Filled token name');
      }

      // Look for Pages permission checkbox
      console.log('\nLooking for Pages permission...');

      // Scroll down and look for Pages
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Try to find Pages section
      const pagesSection = page.locator('text=Cloudflare Pages').first();
      if (await pagesSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('Found Pages section!');
        // Look for checkbox nearby
        const pagesCheckbox = page.locator('[data-testid="pages-edit"] input[type="checkbox"], input[type="checkbox"][data-testid*="pages"]').first();
        if (await pagesCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
          await pagesCheckbox.check();
          console.log('Checked Pages edit permission');
        }
      }

      // Also look for Account > Pages > Edit
      const accountPagesEdit = page.locator('text=Account').locator('..').locator('text=Pages').locator('..').locator('input[type="checkbox"]').first();
      if (await accountPagesEdit.isVisible({ timeout: 2000 }).catch(() => false)) {
        await accountPagesEdit.check();
        console.log('Checked Account > Pages');
      }

      await page.screenshot({ path: `${OUT_DIR}/cf-token-permissions.png` });

      // Look for Zone > DNS > Edit
      console.log('\nLooking for DNS permission...');
      const dnsSection = page.locator('text=DNS').first();
      if (await dnsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Found DNS section!');
        await dnsSection.scrollIntoViewIfNeeded();
        const dnsCheckbox = page.locator('text=DNS').locator('..').locator('input[type="checkbox"]').first();
        if (await dnsCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dnsCheckbox.check();
          console.log('Checked DNS permission');
        }
      }

      await page.screenshot({ path: `${OUT_DIR}/cf-token-dns.png` });

      // Continue button
      const continueBtn = page.locator('button:has-text("Continue to Summary"), button:has-text("Continue")').first();
      if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('\nClicking Continue to Summary...');
        await continueBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${OUT_DIR}/cf-token-summary.png` });
      }

      // Create token button
      const createTokenBtn = page.locator('button:has-text("Create Token")').first();
      if (await createTokenBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('\nClicking Create Token...');
        await createTokenBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${OUT_DIR}/cf-token-created.png` });

        // Look for the token value
        const tokenValue = await page.locator('code, [data-testid="token-value"], .token-value').first().textContent({ timeout: 5000 }).catch(() => null);
        if (tokenValue && tokenValue.trim()) {
          console.log('\n=== API TOKEN CREATED ===');
          console.log('Token:', tokenValue.trim());

          // Save to file
          fs.writeFileSync(`${OUT_DIR}/.new_cf_token.txt`, tokenValue.trim());
          console.log(`\nToken saved to ${OUT_DIR}/.new_cf_token.txt`);

          // Also try to update GitHub secret directly
          console.log('\nAttempting to update GitHub secret...');
          const { execSync } = require('child_process');
          try {
            execSync(`gh secret set CLOUDFLARE_API_TOKEN --repo wangjianxin1988/ai-student-survival -b "${tokenValue.trim()}"`, {
              cwd: OUT_DIR,
              stdio: 'inherit'
            });
            console.log('GitHub secret updated successfully!');
          } catch (e) {
            console.log('Could not update GitHub secret automatically. Token saved to file.');
            console.log('Please run: gh secret set CLOUDFLARE_API_TOKEN --repo wangjianxin1988/ai-student-survival');
          }
        } else {
          console.log('Token value not found on page. Please copy manually from the browser.');
        }
      } else {
        console.log('Create Token button not found. Check the screenshots.');
      }
    } else {
      console.log('Could not find Create Token button. Check the screenshots.');
      await page.screenshot({ path: `${OUT_DIR}/cf-token-no-button.png` });
    }

    console.log('\nAll screenshots saved. Please complete the remaining steps in the browser.');

  } catch (err) {
    console.error('Error:', err.message.substring(0, 500));
    if (browser) {
      await page.screenshot({ path: `${OUT_DIR}/cf-token-error.png` }).catch(() => {});
    }
  } finally {
    if (browser) {
      console.log('\nBrowser open. Close manually when done.');
      setTimeout(() => {
        if (browser) browser.close().catch(() => {});
      }, 600000);
    }
  }
}

main().catch(console.error);
