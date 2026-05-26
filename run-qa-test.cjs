/**
 * QA Test: User Profile Center - Comprehensive Testing
 * Site: https://mi-to-ai.com
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'D:/suoyouxiangmu/ai-student-survival/test-results/qa-user-center';

// Ensure screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TEST_RESULTS = [];

function log(label, value) {
  const msg = `[${label}] ${value}`;
  console.log(msg);
  TEST_RESULTS.push(msg);
}

function screenshot(name) {
  const p = path.join(SCREENSHOT_DIR, `${name}.png`);
  return page.screenshot({ path: p, fullPage: true }).then(() => log('SCREENSHOT', p));
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const isVisible = async (selector, timeout) => { try { return await page.locator(selector).first().isVisible({ timeout: timeout || 2000 }); } catch(e) { return false; } };
  const getText = async (selector) => { try { return await page.locator(selector).first().innerText(); } catch(e) { return 'none'; } };
  const screenshot = async (name) => { const p = path.join(SCREENSHOT_DIR, name + '.png'); await page.screenshot({ path: p, fullPage: true }); log('SCREEN', p); };
  const consoleLogs = [];
  const consoleErrors = [];
  const networkRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', res => {
    if (res.url().includes('supabase') || res.url().includes('mi-to-ai.com/api')) {
      networkRequests.push(`${res.status()} ${res.url().substring(0, 120)}`);
    }
  });

  // Generate test credentials
  const timestamp = Date.now();
  const testEmail = `qa_full_${timestamp}@example.com`;
  const testPassword = 'TestPass123!';
  const testNickname = `QAUser${timestamp}`;

  try {
    // ===== STEP 1: Register Test User =====
    log('TEST', '=== STEP 1: Register Test User ===');
    await page.goto('https://mi-to-ai.com/auth/register', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await screenshot('01-register-page');

    await page.fill('input#name', testNickname);
    await page.fill('input#email', testEmail);
    const pwFields = await page.locator('input[type="password"]').all();
    await pwFields[0].fill(testPassword);
    await pwFields[1].fill(testPassword);
    await screenshot('02-register-filled');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(6000);

    log('REGISTER', `URL after register: ${page.url()}`);
    log('REGISTER', `Email used: ${testEmail}`);

    // Close onboarding modal
    const skipBtn = page.locator('button:has-text("跳过")').first();
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(1000);
    }
    for (let i = 0; i < 6; i++) {
      const nextBtn = page.locator('button:has-text("下一步")').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(500);
      }
    }
    const closeBtn = page.locator('button:has-text("关闭"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    await screenshot('03-after-onboarding');
    log('REGISTER', 'Onboarding dismissed');

    // ===== STEP 2: User Overview Page =====
    log('TEST', '=== STEP 2: User Overview Page ===');
    await page.goto('https://mi-to-ai.com/user', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('04-user-overview');

    const currentUrl = page.url();
    log('OVERVIEW', `URL: ${currentUrl}`);
    const onUserPage = currentUrl.includes('/user') && !currentUrl.includes('/auth');
    log('OVERVIEW', `On user page: ${onUserPage}`);

    // Check key elements
    const userNameVisible = await page.locator(`text=${testNickname}`).isVisible().catch(() => false);
    log('OVERVIEW', `Username visible: ${userNameVisible}`);
    const levelVisible = await page.locator('text=Lv1').isVisible().catch(() => false);
    log('OVERVIEW', `Level badge visible: ${levelVisible}`);
    const joinDateVisible = await page.locator('text=加入于').isVisible().catch(() => false);
    log('OVERVIEW', `Join date visible: ${joinDateVisible}`);
    const pointsVisible = await page.locator('text=积分').isVisible().catch(() => false);
    log('OVERVIEW', `Points visible: ${pointsVisible}`);
    const statsVisible = await page.locator('text=数据统计').isVisible().catch(() => false);
    log('OVERVIEW', `Stats section visible: ${statsVisible}`);
    const badgesVisible = await page.locator('text=徽章').isVisible().catch(() => false);
    log('OVERVIEW', `Badges section visible: ${badgesVisible}`);
    const rankVisible = await page.locator('text=排名').isVisible().catch(() => false);
    log('OVERVIEW', `Ranking section visible: ${rankVisible}`);

    // Check tab navigation
    const tabLabels = ['概览', '收藏', 'Offer', '评分', '关注', '设置', '徽章', '排行榜', '积分历史'];
    for (const label of tabLabels) {
      const visible = await page.locator(`text=${label}`).first().isVisible({ timeout: 1000 }).catch(() => false);
      log('OVERVIEW', `Tab "${label}" visible: ${visible}`);
    }

    // Check avatar display
    const avatarImg = await page.locator('img[alt*="avatar"], img[src*="avatar"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    log('OVERVIEW', `Avatar image visible: ${avatarImg}`);
    const userInitial = await page.locator('text=/^[A-Z]$/').first().isVisible({ timeout: 1000 }).catch(() => false);
    log('OVERVIEW', `User initial visible: ${userInitial}`);

    // ===== STEP 3: Favorites Tab =====
    log('TEST', '=== STEP 3: Favorites Tab ===');
    await page.goto('https://mi-to-ai.com/user/favorites', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('05-user-favorites');

    const favUrl = page.url();
    log('FAVORITES', `URL: ${favUrl}`);
    const favOnPage = favUrl.includes('/user/favorites');
    log('FAVORITES', `On favorites page: ${favOnPage}`);
    const favHeading = await page.locator('h1, h2').first().innerText().catch(() => 'none');
    log('FAVORITES', `Heading: ${favHeading}`);
    const emptyFav = await page.locator('text=暂无收藏, text=还没有收藏, text=No favorites yet').isVisible({ timeout: 2000 }).catch(() => false);
    log('FAVORITES', `Empty state: ${emptyFav}`);
    const addFavBtn = await page.locator('text=添加收藏, text=去收藏, text=浏览工具').isVisible({ timeout: 2000 }).catch(() => false);
    log('FAVORITES', `Add favorites CTA: ${addFavBtn}`);

    // Test add to favorites - go to tools page
    await page.goto('https://mi-to-ai.com/tools', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('06-tools-page');

    const toolCards = await page.locator('[class*="card"], [class*="Card"]').all();
    log('TOOLS', `Tool cards found: ${toolCards.length}`);
    if (toolCards.length > 0) {
      // Find and click a favorite/bookmark button
      const favBtn = page.locator('button[aria-label*="收藏"], button[aria-label*="favorite"], button[aria-label*="Favorite"]').first();
      const favBtnVisible = await favBtn.isVisible({ timeout: 2000 }).catch(() => false);
      log('TOOLS', `Favorite button visible: ${favBtnVisible}`);
      if (favBtnVisible) {
        await favBtn.click();
        await page.waitForTimeout(2000);
        await screenshot('07-after-favorite-click');
        log('TOOLS', 'Clicked favorite button');
      }
    }

    // ===== STEP 4: Offers Tab =====
    log('TEST', '=== STEP 4: Offers Tab ===');
    await page.goto('https://mi-to-ai.com/user/offers', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('08-user-offers');

    const offersUrl = page.url();
    log('OFFERS', `URL: ${offersUrl}`);
    const offersOnPage = offersUrl.includes('/user/offers');
    log('OFFERS', `On offers page: ${offersOnPage}`);
    const offersHeading = await page.locator('h1, h2').first().innerText().catch(() => 'none');
    log('OFFERS', `Heading: ${offersHeading}`);
    const emptyOffers = await page.locator('text=暂无Offer, text=还没有Offer, text=No offers').isVisible({ timeout: 2000 }).catch(() => false);
    log('OFFERS', `Empty state: ${emptyOffers}`);
    const createOfferBtn = await page.locator('text=发布Offer, text=创建Offer, text=分享Offer').isVisible({ timeout: 2000 }).catch(() => false);
    log('OFFERS', `Create offer button: ${createOfferBtn}`);

    // ===== STEP 5: Ratings Tab =====
    log('TEST', '=== STEP 5: Ratings Tab ===');
    await page.goto('https://mi-to-ai.com/user/ratings', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('09-user-ratings');

    const ratingsUrl = page.url();
    log('RATINGS', `URL: ${ratingsUrl}`);
    const ratingsOnPage = ratingsUrl.includes('/user/ratings');
    log('RATINGS', `On ratings page: ${ratingsOnPage}`);
    const ratingsHeading = await page.locator('h1, h2').first().innerText().catch(() => 'none');
    log('RATINGS', `Heading: ${ratingsHeading}`);
    const emptyRatings = await page.locator('text=暂无评分, text=还没有评分, text=No ratings').isVisible({ timeout: 2000 }).catch(() => false);
    log('RATINGS', `Empty state: ${emptyRatings}`);

    // ===== STEP 6: Settings Tab =====
    log('TEST', '=== STEP 6: Settings Tab ===');
    await page.goto('https://mi-to-ai.com/user/settings', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('10-user-settings');

    const settingsUrl = page.url();
    log('SETTINGS', `URL: ${settingsUrl}`);
    const settingsOnPage = settingsUrl.includes('/user/settings');
    log('SETTINGS', `On settings page: ${settingsOnPage}`);
    const settingsHeading = await page.locator('h1, h2').first().innerText().catch(() => 'none');
    log('SETTINGS', `Heading: ${settingsHeading}`);

    // Check settings sections
    const nickInputVisible = await page.locator('input').filter({ hasText: '' }).first().isVisible({ timeout: 2000 }).catch(() => false);
    log('SETTINGS', `Nickname input visible: ${nickInputVisible}`);
    const avatarSectionVisible = await page.locator('text=头像, text=Avatar').isVisible({ timeout: 2000 }).catch(() => false);
    log('SETTINGS', `Avatar section visible: ${avatarSectionVisible}`);
    const securitySectionVisible = await page.locator('text=账户安全, text=Security, text=密码').isVisible({ timeout: 2000 }).catch(() => false);
    log('SETTINGS', `Security section visible: ${securitySectionVisible}`);
    const deleteBtnVisible = await page.locator('button:has-text("删除账户"), button:has-text("Delete Account")').isVisible({ timeout: 2000 }).catch(() => false);
    log('SETTINGS', `Delete account button visible: ${deleteBtnVisible}`);
    const logoutBtnVisible = await page.locator('button:has-text("退出登录"), button:has-text("Sign Out")').isVisible({ timeout: 2000 }).catch(() => false);
    log('SETTINGS', `Logout button visible: ${logoutBtnVisible}`);

    // ===== STEP 7: Profile Edit Test =====
    log('TEST', '=== STEP 7: Profile Edit Test ===');

    // Go back to overview and check if profile editing is available
    await page.goto('https://mi-to-ai.com/user', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('11-user-before-edit');

    // Look for edit profile button
    const editProfileBtn = page.locator('button:has-text("编辑资料"), button:has-text("Edit Profile"), button:has-text("修改资料")').first();
    const editBtnVisible = await editProfileBtn.isVisible({ timeout: 2000 }).catch(() => false);
    log('EDIT', `Edit profile button visible: ${editBtnVisible}`);

    if (editBtnVisible) {
      await editProfileBtn.click();
      await page.waitForTimeout(2000);
      await screenshot('12-edit-profile-modal');
      log('EDIT', 'Opened edit profile');

      // Check modal form fields
      const editNickInput = page.locator('input[value*="' + testNickname.substring(0, 6) + '"]').first();
      const editNickVisible = await editNickInput.isVisible({ timeout: 2000 }).catch(() => false);
      log('EDIT', `Edit nickname field visible: ${editNickVisible}`);

      // Change nickname
      const nickField = page.locator('input[type="text"]').first();
      if (await nickField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nickField.clear();
        await nickField.fill('Edited_' + testNickname);
        log('EDIT', 'Changed nickname');
        await screenshot('13-nickname-changed');

        // Save
        const saveBtn = page.locator('button:has-text("保存"), button:has-text("Save")').first();
        if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveBtn.click();
          await page.waitForTimeout(3000);
          await screenshot('14-after-save');
          log('EDIT', 'Clicked save');

          // Verify change
          const newNickVisible = await page.locator('text=Edited_' + testNickname).isVisible({ timeout: 3000 }).catch(() => false);
          log('EDIT', `New nickname visible after save: ${newNickVisible}`);
          if (!newNickVisible) {
            // Try refreshing
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            const afterReloadVisible = await page.locator('text=Edited_' + testNickname).isVisible({ timeout: 2000 }).catch(() => false);
            log('EDIT', `New nickname visible after reload: ${afterReloadVisible}`);
          }
        }
      }
    } else {
      // No edit button - check if nickname can be edited from settings
      log('EDIT', 'No edit button on overview, checking settings');
    }

    // ===== STEP 8: Account Security Tab =====
    log('TEST', '=== STEP 8: Account Security ===');
    await page.goto('https://mi-to-ai.com/user/settings', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await screenshot('15-security-page');

    // Look for security tab within settings
    const secTab = page.locator('text=账户安全, text=Security, text=安全').first();
    if (await secTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await secTab.click();
      await page.waitForTimeout(2000);
      await screenshot('16-security-tab');
      log('SECURITY', 'Clicked security tab');
    }

    // Check for password change
    const pwChangeVisible = await page.locator('text=修改密码, text=Change Password').isVisible({ timeout: 2000 }).catch(() => false);
    log('SECURITY', `Password change visible: ${pwChangeVisible}`);
    const emailVisible = await page.locator('text=' + testEmail.split('@')[0].substring(0, 5)).isVisible({ timeout: 2000 }).catch(() => false);
    log('SECURITY', `Email shown in security: ${emailVisible}`);

    // ===== STEP 9: Logout Test =====
    log('TEST', '=== STEP 9: Logout Test ===');
    await page.goto('https://mi-to-ai.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await screenshot('17-before-logout');

    // Find user avatar/menu
    const avatarBtn = page.locator('button[aria-label="User menu"], button').filter({ hasText: /^[A-Z]$/ }).first();
    if (await avatarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await avatarBtn.click();
      await page.waitForTimeout(1000);
      await screenshot('18-user-dropdown');
      log('LOGOUT', 'Clicked user avatar');

      // Check dropdown
      const dropdown = await page.locator('text=用户中心, text=个人中心, text=退出登录').first().isVisible({ timeout: 2000 }).catch(() => false);
      log('LOGOUT', `User dropdown visible: ${dropdown}`);

      // Click logout
      const logoutBtn = page.locator('button:has-text("退出登录"), button:has-text("Sign Out")').first();
      if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await logoutBtn.click();
        await page.waitForTimeout(3000);
        await screenshot('19-after-logout');
        log('LOGOUT', 'Clicked logout');

        // Verify logged out
        const loginLinkVisible = await page.locator('a:has-text("登录"), a:has-text("Sign In")').first().isVisible({ timeout: 3000 }).catch(() => false);
        log('LOGOUT', `Login link visible after logout: ${loginLinkVisible}`);

        // Check session cleared
        const sessionCleared = await page.evaluate(() => {
          const supabaseToken = localStorage.getItem('sb-giynvpfnzzelzwpmsgtf-auth-token');
          return supabaseToken === null;
        });
        log('LOGOUT', `Supabase session cleared: ${sessionCleared}`);

        // Try accessing /user after logout
        await page.goto('https://mi-to-ai.com/user', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        const postLogoutUrl = page.url();
        const redirectedToLogin = postLogoutUrl.includes('/auth/login');
        log('LOGOUT', `After logout, /user redirected to login: ${redirectedToLogin}`);
      }
    } else {
      log('LOGOUT', 'User avatar not found');
    }

    // ===== STEP 10: Supabase Data Verification =====
    log('TEST', '=== STEP 10: Supabase Data Verification ===');
    // Network requests to Supabase
    const supabaseRequests = networkRequests.filter(r => r.includes('supabase'));
    log('SUPABASE', `Total Supabase requests: ${supabaseRequests.length}`);
    const failedRequests = supabaseRequests.filter(r => r.startsWith('4') || r.startsWith('5'));
    log('SUPABASE', `Failed Supabase requests: ${failedRequests.length}`);
    failedRequests.forEach(r => log('SUPABASE', `  FAILED: ${r}`));

    // ===== Summary =====
    log('SUMMARY', '=== TEST SUMMARY ===');
    log('SUMMARY', `Total test results: ${TEST_RESULTS.length}`);

    // Console errors
    log('ERRORS', `Total console errors: ${consoleErrors.length}`);
    const sslErrors = consoleErrors.filter(e => e.includes('ERR_SSL_PROTOCOL_ERROR'));
    const realErrors = consoleErrors.filter(e => !e.includes('ERR_SSL_PROTOCOL_ERROR'));
    log('ERRORS', `SSL errors (known CDN issue): ${sslErrors.length}`);
    log('ERRORS', `Real errors: ${realErrors.length}`);
    realErrors.forEach(e => log('ERRORS', `  ${e.substring(0, 200)}`));

  } catch (e) {
    log('FATAL', `Error: ${e.message}`);
    await screenshot('99-fatal-error');
  }

  await browser.close();
  log('DONE', '=== ALL TESTS COMPLETE ===');

  // Write results to file
  const resultsPath = path.join(SCREENSHOT_DIR, 'test-results.txt');
  fs.writeFileSync(resultsPath, TEST_RESULTS.join('\n'), 'utf8');
  log('SAVED', `Results written to: ${resultsPath}`);
  console.log('\n=== All screenshots in:', SCREENSHOT_DIR);
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
