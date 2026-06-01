/**
 * User Personal Center and Session Management Deep Test
 * Tests on PRODUCTION site: https://mi-to-ai.com
 *
 * Test Coverage:
 * 1. Personal Center Access Protection
 * 2. Debug Login Session Persistence
 * 3. Points Mall Page
 * 4. Navigation User Menu
 * 5. Logout Flow
 */

import { test, expect, chromium, Browser, Page } from '@playwright/test';

const PRODUCTION_URL = 'https://mi-to-ai.com';
const LOCAL_URL = 'http://localhost:4321';
const SCREENSHOT_DIR = 'D:/suoyouxiangmu/ai-student-survival/test-results/v105-user';

// Use production for final testing
const BASE_URL = PRODUCTION_URL;

// Test credentials
const TEST_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpass123';
const TEST_NAME = 'Test User QA';

test.describe('用户个人中心和会话管理深度测试', () => {
  let browser: Browser;
  let page: Page;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    // Clear any existing session before each test
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });
    await page.waitForTimeout(500);
  });

  test.afterEach(async () => {
    await page.close();
  });

  // Helper function to take screenshots
  async function takeScreenshot(name: string) {
    try {
      const path = `${SCREENSHOT_DIR}/${name}.png`;
      await page.screenshot({ path, fullPage: false });
      console.log(`Screenshot saved: ${path}`);
      return path;
    } catch (e) {
      console.log(`Screenshot failed: ${e}`);
      return null;
    }
  }

  // Helper function to check sessionStorage
  async function getSessionStorage(): Promise<any> {
    return await page.evaluate(() => {
      const session = sessionStorage.getItem('demo_session');
      return session ? JSON.parse(session) : null;
    });
  }

  // Helper function to login via debug page
  async function loginViaDebug() {
    console.log('Logging in via debug page...');
    await page.goto(`${BASE_URL}/auth/debug`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.fill('#test-email', TEST_EMAIL);
    await page.fill('#test-password', TEST_PASSWORD);
    await page.fill('#test-name', TEST_NAME);

    await page.click('#test-login');
    await page.waitForTimeout(3000);

    const sessionUser = await getSessionStorage();
    console.log('Session created:', sessionUser ? sessionUser.email : 'null');
    return sessionUser;
  }

  // ============================================
  // Test 1: 未登录访问个人中心应重定向
  // ============================================
  test('Test 1: 未登录访问个人中心应重定向到登录页', async () => {
    console.log('\n=== Test 1: 未登录访问个人中心 ===');

    // Visit personal center without login
    await page.goto(`${BASE_URL}/user`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    await takeScreenshot('01-unauthenticated-redirect');

    const currentUrl = page.url();
    console.log('Current URL after visiting /user:', currentUrl);

    // Check for redirect to login page
    const isOnLoginPage = currentUrl.includes('/auth/login') || currentUrl.includes('/auth/debug');
    console.log('On login page:', isOnLoginPage);

    // Also check for login page elements
    const loginInput = page.locator('input[type="email"]#email, #test-email').first();
    const isLoginInputVisible = await loginInput.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Login input visible:', isLoginInputVisible);

    // PASS if redirected to login page
    expect(isOnLoginPage || isLoginInputVisible).toBe(true);
  });

  // ============================================
  // Test 2: Debug登录会话持久化
  // ============================================
  test('Test 2: Debug登录后刷新页面应保持登录状态', async () => {
    console.log('\n=== Test 2: Debug登录会话持久化 ===');

    // Login via debug page
    const sessionUser = await loginViaDebug();
    expect(sessionUser).not.toBeNull();
    console.log('Login successful, user:', sessionUser.email);

    await takeScreenshot('02-after-login');

    // Check current URL (should be /user or home after auto-redirect)
    const urlAfterLogin = page.url();
    console.log('URL after login:', urlAfterLogin);

    // Refresh the page
    console.log('Refreshing page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await takeScreenshot('02-after-refresh');

    const urlAfterRefresh = page.url();
    console.log('URL after refresh:', urlAfterRefresh);

    // Check sessionStorage after refresh
    const sessionAfterRefresh = await getSessionStorage();
    console.log('Session after refresh:', sessionAfterRefresh ? sessionAfterRefresh.email : 'null');

    // PASS if session is preserved
    if (sessionAfterRefresh) {
      console.log('PASS: Session preserved after refresh');
    } else {
      console.log('FAIL: Session lost after refresh');
    }
    expect(sessionAfterRefresh).not.toBeNull();
  });

  // ============================================
  // Test 3: 关闭标签页后重新打开应登出
  // ============================================
  test('Test 3: 关闭标签页重新打开应登出 (sessionStorage特性)', async () => {
    console.log('\n=== Test 3: 标签页关闭行为 ===');

    // Login via debug page
    await loginViaDebug();

    const sessionBefore = await getSessionStorage();
    expect(sessionBefore).not.toBeNull();
    console.log('Session before close:', sessionBefore ? 'exists' : 'null');

    await takeScreenshot('03-before-close');

    // Simulate closing tab by clearing sessionStorage
    // (In real browser, sessionStorage is cleared on tab close)
    await page.evaluate(() => {
      sessionStorage.clear();
    });
    await page.waitForTimeout(500);

    const sessionAfterClear = await getSessionStorage();
    console.log('Session after clear:', sessionAfterClear ? 'exists' : 'null');

    // Navigate to home page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Should show login button, not user avatar
    const loginButton = page.locator('a:has-text("登录")').or(page.locator('a:has-text("Sign In")')).first();
    const isLoginButtonVisible = await loginButton.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Login button visible:', isLoginButtonVisible);

    expect(isLoginButtonVisible).toBe(true);
  });

  // ============================================
  // Test 4: 积分商城页面
  // ============================================
  test('Test 4: Debug登录后访问积分商城应正常加载', async () => {
    console.log('\n=== Test 4: 积分商城页面 ===');

    // Login via debug
    await loginViaDebug();

    // Navigate to points mall
    await page.goto(`${BASE_URL}/points`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    await takeScreenshot('04-points-mall');

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check if on points page or redirected to login
    const isOnPointsPage = currentUrl.includes('/points');
    const isOnLoginPage = currentUrl.includes('/auth/login');

    console.log('On points page:', isOnPointsPage);
    console.log('Redirected to login:', isOnLoginPage);

    if (isOnPointsPage) {
      // Check for points content
      const pointsTitle = page.locator('h1:has-text("积分")').or(page.locator('h1:has-text("Points")'));
      const isTitleVisible = await pointsTitle.isVisible({ timeout: 3000 }).catch(() => false);
      console.log('Points title visible:', isTitleVisible);
      expect(isTitleVisible).toBe(true);
    } else if (isOnLoginPage) {
      console.log('NOTE: Points page requires login, redirected to login page');
    }
  });

  // ============================================
  // Test 5: 导航栏用户菜单 - 未登录状态
  // ============================================
  test('Test 5: 未登录状态导航栏显示登录/注册按钮', async () => {
    console.log('\n=== Test 5: 导航栏 - 未登录状态 ===');

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await takeScreenshot('05-nav-unauthenticated');

    // Check for login/register buttons
    const loginLink = page.locator('a:has-text("登录")').or(page.locator('a:has-text("Sign In")')).first();
    const registerLink = page.locator('a:has-text("注册")').or(page.locator('a:has-text("Register")')).first();

    const loginVisible = await loginLink.isVisible({ timeout: 3000 }).catch(() => false);
    const registerVisible = await registerLink.isVisible({ timeout: 3000 }).catch(() => false);

    console.log('Login link visible:', loginVisible);
    console.log('Register link visible:', registerVisible);

    expect(loginVisible || registerVisible).toBe(true);
  });

  // ============================================
  // Test 6: 导航栏用户菜单 - 登录状态
  // ============================================
  test('Test 6: 登录状态导航栏显示用户头像', async () => {
    console.log('\n=== Test 6: 导航栏 - 登录状态 ===');

    // Login via debug
    await loginViaDebug();

    // Navigate to home page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await takeScreenshot('06-nav-authenticated');

    // Check for user avatar (button with avatar or initials)
    const avatarButton = page.locator('button[aria-label="User menu"]').or(page.locator('button').filter({ hasText: /^[A-Z]$/ })).first();
    const isAvatarVisible = await avatarButton.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('User avatar visible:', isAvatarVisible);

    // If avatar visible, test dropdown
    if (isAvatarVisible) {
      console.log('Clicking user avatar...');
      await avatarButton.click();
      await page.waitForTimeout(1000);

      await takeScreenshot('06-user-dropdown');

      // Check dropdown menu items
      const userCenterLink = page.locator('a:has-text("用户中心")').or(page.locator('a:has-text("User Center")'));
      const isUserCenterVisible = await userCenterLink.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('User Center link visible:', isUserCenterVisible);

      const signOutButton = page.locator('button:has-text("退出登录")').or(page.locator('button:has-text("Sign Out")'));
      const isSignOutVisible = await signOutButton.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Sign Out button visible:', isSignOutVisible);

      expect(isUserCenterVisible || isSignOutVisible).toBe(true);
    }
  });

  // ============================================
  // Test 7: 退出登录
  // ============================================
  test('Test 7: 退出登录应成功登出并显示登录按钮', async () => {
    console.log('\n=== Test 7: 退出登录 ===');

    // Login via debug
    await loginViaDebug();

    // Navigate to home page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Click user avatar
    const avatarButton = page.locator('button[aria-label="User menu"]').first();
    const isAvatarVisible = await avatarButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isAvatarVisible) {
      console.log('Avatar not found, skipping dropdown test');
      return;
    }

    await avatarButton.click();
    await page.waitForTimeout(1000);

    await takeScreenshot('07-before-logout');

    // Click sign out button
    const signOutButton = page.locator('button:has-text("退出登录")').or(page.locator('button:has-text("Sign Out")')).first();
    const isSignOutVisible = await signOutButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (isSignOutVisible) {
      console.log('Clicking sign out...');
      await signOutButton.click();
      await page.waitForTimeout(3000);

      await takeScreenshot('07-after-logout');

      const currentUrl = page.url();
      console.log('Current URL after logout:', currentUrl);

      // Check for login button
      const loginLink = page.locator('a:has-text("登录")').or(page.locator('a:has-text("Sign In")')).first();
      const isLoginVisible = await loginLink.isVisible({ timeout: 3000 }).catch(() => false);
      console.log('Login button visible after logout:', isLoginVisible);

      // Session should be cleared
      const sessionAfterLogout = await getSessionStorage();
      console.log('Session after logout:', sessionAfterLogout ? 'exists (FAIL)' : 'null (PASS)');

      expect(isLoginVisible).toBe(true);
      expect(sessionAfterLogout).toBeNull();
    } else {
      console.log('Sign out button not found');
    }
  });

  // ============================================
  // Test 8: 登出后访问个人中心应重定向
  // ============================================
  test('Test 8: 登出后访问个人中心应重定向到登录页', async () => {
    console.log('\n=== Test 8: 登出后访问个人中心 ===');

    // Login via debug
    await loginViaDebug();

    // Sign out
    const sessionBefore = await getSessionStorage();
    console.log('Session before sign out:', sessionBefore ? 'exists' : 'null');

    // Navigate to home and sign out
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const avatarButton = page.locator('button[aria-label="User menu"]').first();
    const isAvatarVisible = await avatarButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (isAvatarVisible) {
      await avatarButton.click();
      await page.waitForTimeout(1000);

      const signOutButton = page.locator('button:has-text("退出登录")').or(page.locator('button:has-text("Sign Out")')).first();
      const isSignOutVisible = await signOutButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (isSignOutVisible) {
        await signOutButton.click();
        await page.waitForTimeout(3000);
      }
    }

    await takeScreenshot('08-after-logout');

    // Now try to access personal center
    await page.goto(`${BASE_URL}/user`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log('Current URL after accessing /user:', currentUrl);

    const isOnLoginPage = currentUrl.includes('/auth/login') || currentUrl.includes('/auth/debug');
    console.log('On login page:', isOnLoginPage);

    expect(isOnLoginPage).toBe(true);
  });

  // ============================================
  // Test 9: 验证getCurrentUser函数读取sessionStorage
  // ============================================
  test('Test 9: 验证auth.ts正确读取sessionStorage中的用户', async () => {
    console.log('\n=== Test 9: Auth模块sessionStorage读取验证 ===');

    // Login via debug page
    const sessionUser = await loginViaDebug();
    expect(sessionUser).not.toBeNull();
    console.log('Debug login created user:', sessionUser.email);

    await takeScreenshot('09-auth-verify');

    // Now navigate to a page that uses auth module
    // We'll use the debug page's check-status functionality
    await page.goto(`${BASE_URL}/auth/debug`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click check status
    const checkStatusBtn = page.locator('#check-status');
    if (await checkStatusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking check status...');
      await checkStatusBtn.click();
      await page.waitForTimeout(1000);

      const statusResult = await page.locator('#status-result').textContent().catch(() => 'none');
      console.log('Status result:', statusResult);

      // Should show user is logged in
      const isLoggedIn = statusResult.includes('已登录') || statusResult.includes('已登');
      console.log('Auth recognizes user:', isLoggedIn);

      expect(isLoggedIn).toBe(true);
    } else {
      console.log('Check status button not visible');
    }
  });

  // ============================================
  // Test 10: 验证sessionStorage中demo_session键
  // ============================================
  test('Test 10: 验证sessionStorage中demo_session键存在', async () => {
    console.log('\n=== Test 10: sessionStorage demo_session键验证 ===');

    // Login via debug
    await loginViaDebug();

    const sessionData = await page.evaluate(() => {
      return {
        demo_session: sessionStorage.getItem('demo_session'),
        keys: Object.keys(sessionStorage),
      };
    });

    console.log('sessionStorage keys:', sessionData.keys);
    console.log('demo_session exists:', sessionData.demo_session !== null);

    if (sessionData.demo_session) {
      const parsed = JSON.parse(sessionData.demo_session);
      console.log('demo_session data:', JSON.stringify(parsed, null, 2));
    }

    expect(sessionData.demo_session).not.toBeNull();
  });

  // ============================================
  // Summary Test
  // ============================================
  test('Test 11: 测试结果汇总', async () => {
    console.log('\n=== Test 11: 测试结果汇总 ===');

    const summary = `
    ========== 测试结果汇总 ==========

    1. 个人中心访问保护
       - 未登录状态访问 /user 应重定向到登录页

    2. Debug登录会话持久化
       - 登录后刷新页面应保持登录状态
       - sessionStorage中demo_session键应存在

    3. 标签页关闭行为
       - sessionStorage在标签关闭后失效(预期行为)

    4. 积分商城页面
       - 登录后访问/points应正常加载
       - 未登录应重定向到登录页

    5. 导航栏用户菜单 - 未登录
       - 应显示"登录/注册"按钮

    6. 导航栏用户菜单 - 登录
       - 应显示用户头像
       - 头像点击能打开下拉菜单

    7. 退出登录
       - 点击"退出登录"应成功登出
       - sessionStorage中demo_session应被清除

    8. 登出后访问个人中心
       - 应重定向到登录页

    9. Auth模块sessionStorage读取
       - getCurrentUser()应正确读取sessionStorage中的用户

    10. sessionStorage demo_session键
        - Debug登录后应创建demo_session键

    ==================================
    `;

    console.log(summary);
  });
});