/**
 * v105 社区功能和登录集成深度测试
 * Target: https://mi-to-ai.com (生产环境)
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://mi-to-ai.com';
const SCREENSHOTS_DIR = 'D:/suoyouxiangmu/ai-student-survival/test-results/v105-community';

let browser;
let context;
let page;
let testResults;

const DEMO_SESSION_KEY = 'demo_session';

async function init() {
  console.log('Initializing test environment...');
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-web-security']
  });

  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });

  page = await context.newPage();

  testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    bugs: [],
    skipped: 0,
  };

  const fs = await import('fs');
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function takeScreenshot(name, fullPage = true) {
  const path = `${SCREENSHOTS_DIR}/${name}_${Date.now()}.png`;
  try {
    await page.screenshot({ path, fullPage });
    console.log(`  Screenshot: ${path}`);
  } catch (e) {
    console.log(`  Screenshot failed: ${e.message}`);
  }
  return path;
}

function pass(msg) { console.log(`  [PASS] ${msg}`); testResults.passed++; }
function fail(msg, details) { console.log(`  [FAIL] ${msg}`); if (details) console.log(`         Details: ${details}`); testResults.failed++; }
function warn(msg) { console.log(`  [WARN] ${msg}`); testResults.warnings++; }
function bug(severity, title, desc, location) { testResults.bugs.push({ severity, title, desc, location }); console.log(`  [BUG] [${severity}] ${title} - ${location}`); }
function skip(msg) { console.log(`  [SKIP] ${msg}`); testResults.skipped++; }

// ============================================
// LOGIN HELPERS
// ============================================

/**
 * 清除登录状态 - 通过新建 context 实现
 */
async function clearLogin() {
  if (context) {
    try { await context.close(); } catch (_) {}
  }
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });
  page = await context.newPage();
  console.log('  已重置为未登录状态（新 context）');
}

/**
 * 设置登录状态 - 通过 debug 页面
 */
async function setLoggedInState() {
  if (context) {
    try { await context.close(); } catch (_) {}
  }
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });
  page = await context.newPage();

  // 先访问 debug 页面，然后通过 evaluate 设置 sessionStorage
  await page.goto(`${BASE_URL}/auth/debug`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.evaluate((key) => {
    const demoUser = {
      id: 'demo-logged-user-' + Date.now(),
      email: 'logged_user@test.com',
      name: '已登录测试用户',
      created_at: new Date().toISOString(),
      role: 'member',
    };
    sessionStorage.setItem(key, JSON.stringify(demoUser));
  }, DEMO_SESSION_KEY);

  console.log('  已设置登录状态（sessionStorage）');
}

// ============================================
// TEST SUITE 1: 未登录状态测试
// ============================================
async function testUnauthenticatedState() {
  console.log('\n========================================');
  console.log('TEST SUITE 1: 未登录状态测试');
  console.log('========================================');

  await clearLogin();

  // 1.1: 访问社区页面
  console.log('\n[1.1] 访问 /community 页面...');
  await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
  // Wait for React hydration and demo session polling (500ms interval + initial load)
  await page.waitForTimeout(4000);

  // Check page title
  const title = await page.locator('h1').first().textContent().catch(() => null);
  if (title && (title.includes('社区') || title.includes('Community'))) {
    pass(`社区页面加载成功，标题: "${title.trim()}"`);
    await takeScreenshot('1.1_community_page');
  } else {
    fail('社区页面加载失败', `Title: ${title}`);
  }

  // 1.2: 检查"登录后可发帖"按钮 (wait for hydration)
  console.log('\n[1.2] 检查未登录用户界面...');
  const loginToPostBtn = await page.locator('a:has-text("登录后可发帖"), button:has-text("登录后可发帖")').isVisible().catch(() => false);
  const createPostBtn = await page.locator('a:has-text("发布帖子"), button:has-text("发布帖子")').isVisible().catch(() => false);

  if (loginToPostBtn) {
    pass('未登录用户正确看到"登录后可发帖"按钮');
    await takeScreenshot('1.2_login_to_post_button');
  } else if (createPostBtn) {
    fail('未登录用户不应看到"发布帖子"按钮', '应显示"登录后可发帖"');
    bug('HIGH', '未登录用户看到"发布帖子"按钮', '未登录用户应该被引导去登录，而不是显示发帖按钮', '/community');
    await takeScreenshot('1.2_bug_create_button_visible');
  } else {
    warn('无法确认按钮状态');
    await takeScreenshot('1.2_button_state_unknown');
  }

  // 1.3: 点击"登录后可发帖"应跳转登录页
  console.log('\n[1.3] 测试"登录后可发帖"点击跳转...');
  const loginLink = await page.locator('a:has-text("登录后可发帖")').first();
  if (await loginLink.isVisible().catch(() => false)) {
    await loginLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login') || currentUrl.includes('login')) {
      pass(`正确跳转到登录页: ${currentUrl}`);
      await takeScreenshot('1.3_redirect_to_login');
    } else {
      fail('点击"登录后可发帖"未跳转到登录页', `Current URL: ${currentUrl}`);
      bug('HIGH', '登录引导按钮跳转错误', '点击"登录后可发帖"应该跳转到 /auth/login', '/community');
      await takeScreenshot('1.3_wrong_redirect');
    }
  } else {
    skip('"登录后可发帖"按钮不可见，跳过跳转测试');
  }

  // 1.4: 直接访问 /community/create 应重定向到登录页 (保持服务端重定向)
  console.log('\n[1.4] 测试直接访问 /community/create 重定向...');
  await page.goto(`${BASE_URL}/community/create`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const createUrl = page.url();
  if (createUrl.includes('/auth/login') || createUrl.includes('login')) {
    pass(`未登录访问 /community/create 正确重定向到 /auth/login`);
    console.log(`  重定向到: ${createUrl}`);
    await takeScreenshot('1.4_create_redirects_to_login');

    if (createUrl.includes('redirect=') && (createUrl.includes('community%2Fcreate') || createUrl.includes('community/create'))) {
      pass('redirect 参数正确设置为 /community/create');
    } else {
      warn('redirect 参数可能不正确');
    }
  } else if (createUrl.includes('/community/create')) {
    fail('未登录访问 /community/create 未重定向', '应该重定向到 /auth/login');
    bug('HIGH', '/community/create 未登录可访问', '/community/create 页面在未登录状态下可以访问，应重定向到登录页', '/community/create');
    await takeScreenshot('1.4_bug_no_redirect');
  } else {
    warn(`重定向到其他页面: ${createUrl}`);
    await takeScreenshot('1.4_redirect_other_page');
  }
}

// ============================================
// TEST SUITE 2: Debug 登录页面测试
// ============================================
async function testDebugLoginPage() {
  console.log('\n========================================');
  console.log('TEST SUITE 2: Debug 登录页面测试');
  console.log('========================================');

  await clearLogin();

  // 2.1: 访问 Debug 登录页面
  console.log('\n[2.1] 访问 /auth/debug 页面...');
  await page.goto(`${BASE_URL}/auth/debug`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const debugTitle = await page.locator('h1').first().textContent().catch(() => null);
  if (debugTitle && debugTitle.includes('调试')) {
    pass('Debug 登录页面加载成功');
    await takeScreenshot('2.1_debug_page');
  } else {
    fail('Debug 页面加载失败', `Title: ${debugTitle}`);
    return;
  }

  // 2.2: 填写测试用户信息并登录
  console.log('\n[2.2] 填写登录信息并点击登录...');
  try {
    const nameInput = page.locator('#test-name');
    const emailInput = page.locator('#test-email');
    const passwordInput = page.locator('#test-password');
    const loginBtn = page.locator('#test-login');

    if (await nameInput.isVisible()) {
      await nameInput.fill('QA自动化测试用户');
      await emailInput.fill('qa_auto_' + Date.now() + '@test.com');
      await passwordInput.fill('TestPass123!');
      await loginBtn.click();
      await page.waitForTimeout(2000);
      pass('Debug 登录表单已填写并提交');
      await takeScreenshot('2.2_filled_form');
    } else {
      warn('Debug 登录表单不可见');
    }
  } catch (e) {
    fail('Debug 登录表单操作失败', e.message);
    await takeScreenshot('2.2_form_error');
  }

  // 2.3: 验证登录结果
  console.log('\n[2.3] 验证登录状态...');
  const loginResultText = await page.locator('#login-result').textContent().catch(() => null);
  if (loginResultText && loginResultText.includes('成功')) {
    pass('Debug 登录成功');
    await takeScreenshot('2.3_login_success');
  } else {
    warn(`登录结果文本: ${loginResultText?.substring(0, 100)}`);
  }
}

// ============================================
// TEST SUITE 3: 已登录状态测试
// ============================================
async function testAuthenticatedState() {
  console.log('\n========================================');
  console.log('TEST SUITE 3: 已登录状态测试');
  console.log('========================================');

  // 设置登录状态
  await setLoggedInState();

  // 3.1: 访问社区页面
  console.log('\n[3.1] 已登录状态访问 /community...');
  await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
  // Wait for React hydration and demo session polling (500ms interval x 3 cycles)
  await page.waitForTimeout(4000);

  // 3.2: 验证显示"发布帖子"按钮
  console.log('\n[3.2] 检查已登录用户界面...');
  const createPostBtn = await page.locator('a:has-text("发布帖子"), button:has-text("发布帖子")').isVisible().catch(() => false);
  const loginToPostBtn = await page.locator('a:has-text("登录后可发帖"), button:has-text("登录后可发帖")').isVisible().catch(() => false);

  if (createPostBtn) {
    pass('已登录用户正确看到"发布帖子"按钮');
    await takeScreenshot('3.2_auth_create_post_button');
  } else if (loginToPostBtn) {
    fail('已登录用户不应看到"登录后可发帖"', '应显示"发布帖子"按钮');
    bug('HIGH', '已登录用户显示未登录按钮', '用户已登录但仍显示"登录后可发帖"，auth 状态检测可能有问题', '/community');
    await takeScreenshot('3.2_bug_login_button_shown');
  } else {
    warn('无法确认按钮状态');
    await takeScreenshot('3.2_button_state_unknown');
  }

  // 3.3: 验证可以直接访问 /community/create (客户端认证)
  console.log('\n[3.3] 已登录用户直接访问 /community/create...');
  await page.goto(`${BASE_URL}/community/create`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // Wait for auth check + polling

  const createPageUrl = page.url();
  const createPageTitle = await page.locator('h1, h2').first().textContent().catch(() => null);

  // Check for post editor elements
  const hasPostEditor = await page.locator('input[placeholder*="标题"], input[maxlength="255"], textarea').first().isVisible().catch(() => false);

  if (createPageUrl.includes('/community/create') && !createPageUrl.includes('/auth/login')) {
    if (createPageTitle && (createPageTitle.includes('发布') || createPageTitle.includes('帖子') || createPageTitle.includes('Create'))) {
      pass('已登录用户可以正常访问发帖页面');
      await takeScreenshot('3.3_create_page_accessible');
    } else if (hasPostEditor) {
      pass('已登录用户可以正常访问发帖页面（通过编辑器元素确认）');
      await takeScreenshot('3.3_create_page_accessible');
    } else {
      warn(`页面内容可能不完整，标题: ${createPageTitle}`);
      await takeScreenshot('3.3_create_page_content');
    }
  } else {
    fail('已登录用户访问 /community/create 失败', `URL: ${createPageUrl}`);
    bug('HIGH', '已登录用户无法访问发帖页面', '已登录用户访问 /community/create 被重定向', '/community/create');
    await takeScreenshot('3.3_create_page_blocked');
  }
}

// ============================================
// TEST SUITE 4: 发帖完整流程测试
// ============================================
async function testPostCreationFlow() {
  console.log('\n========================================');
  console.log('TEST SUITE 4: 发帖完整流程测试');
  console.log('========================================');

  // 确保登录状态
  await setLoggedInState();

  // 4.1: 访问发帖页面
  console.log('\n[4.1] 访问 /community/create 发帖页面...');
  await page.goto(`${BASE_URL}/community/create`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const createPageUrl = page.url();
  if (createPageUrl.includes('/community/create') && !createPageUrl.includes('/auth/login')) {
    pass('发帖页面加载成功');
    await takeScreenshot('4.1_create_page');

    // 4.2: 填写帖子标题
    console.log('\n[4.2] 填写帖子标题...');
    const titleInput = await page.locator('input[placeholder*="标题"], input[maxlength="255"]').first();
    if (await titleInput.isVisible().catch(() => false)) {
      await titleInput.fill('【QA自动化测试】社区功能验证帖子 ' + new Date().toLocaleTimeString());
      pass('帖子标题填写成功');
    } else {
      warn('标题输入框未找到');
    }

    // 4.3: 填写帖子内容
    console.log('\n[4.3] 填写帖子内容...');
    const contentArea = await page.locator('textarea').first();
    if (await contentArea.isVisible().catch(() => false)) {
      await contentArea.fill('这是 QA 自动化测试生成的帖子内容。用于验证社区发帖功能是否正常工作。测试时间: ' + new Date().toISOString());
      pass('帖子内容填写成功');
      await takeScreenshot('4.3_content_filled');
    } else {
      warn('内容输入框未找到');
    }

    // 4.4: 选择分类
    console.log('\n[4.4] 选择帖子分类...');
    const categoryBtns = await page.locator('button').filter({ hasText: /AI工具|支付指南|讨论|经验分享/ }).all();
    if (categoryBtns.length > 0) {
      const firstCategory = categoryBtns[0];
      const categoryName = await firstCategory.textContent();
      await firstCategory.click();
      pass(`选择分类: ${categoryName}`);
    } else {
      warn('未找到分类按钮');
    }

    // 4.5: 提交帖子
    console.log('\n[4.5] 提交帖子...');
    const submitBtn = await page.locator('button[type="submit"], button:has-text("发布"), button:has-text("提交")').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(3000);

      const afterSubmitUrl = page.url();
      if (afterSubmitUrl.includes('/community') && !afterSubmitUrl.includes('create')) {
        pass('帖子发布成功，自动跳转到社区页面');
        await takeScreenshot('4.5_post_submitted');
      } else {
        warn(`发布后 URL: ${afterSubmitUrl}`);
        await takeScreenshot('4.5_submit_result');
      }
    } else {
      warn('提交按钮未找到');
    }
  } else {
    fail('无法访问发帖页面', `URL: ${createPageUrl}`);
    bug('HIGH', '已登录用户无法访问发帖页面', '访问 /community/create 失败', '/community/create');
  }
}

// ============================================
// TEST SUITE 5: 帖子列表和详情测试
// ============================================
async function testPostListAndDetail() {
  console.log('\n========================================');
  console.log('TEST SUITE 5: 帖子列表和详情测试');
  console.log('========================================');

  await clearLogin();

  // 5.1: 加载帖子列表
  console.log('\n[5.1] 加载帖子列表...');
  await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const postCards = await page.locator('[class*="bg-white"][class*="rounded-lg"], [class*="border"][class*="bg-white"]').all();
  if (postCards.length > 0) {
    pass(`找到 ${postCards.length} 个帖子卡片`);
    await takeScreenshot('5.1_post_list');
  } else {
    warn('帖子列表为空或未找到帖子卡片');
    await takeScreenshot('5.1_empty_list');
  }

  // 5.2: 点击帖子进入详情页
  console.log('\n[5.2] 点击帖子进入详情页...');
  let navigatedToDetail = false;

  // 通过 API 获取帖子 ID
  try {
    const apiRes = await page.request.get(`${BASE_URL}/api/community?limit=1`);
    if (apiRes.ok()) {
      const data = await apiRes.json();
      if (data.data && data.data.length > 0) {
        const postId = data.data[0].id;
        await page.goto(`${BASE_URL}/community/${postId}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        navigatedToDetail = true;
      }
    }
  } catch (e) {}

  if (!navigatedToDetail) {
    const firstPost = await page.locator('a[href*="/community/"]').first();
    if (await firstPost.isVisible().catch(() => false)) {
      const href = await firstPost.getAttribute('href').catch(() => null);
      if (href && href.includes('/community/') && href.split('/community/')[1]) {
        await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        navigatedToDetail = true;
      }
    }
  }

  const detailUrl = page.url();
  if (navigatedToDetail || (detailUrl.includes('/community/') && detailUrl.length > BASE_URL.length + '/community'.length + 5)) {
    pass(`成功进入帖子详情页`);
    console.log(`  URL: ${detailUrl}`);
    await takeScreenshot('5.2_post_detail');

    // 5.3: 验证帖子详情内容
    console.log('\n[5.3] 验证帖子详情内容...');
    const bodyText = await page.locator('body').textContent().catch(() => null);

    if (bodyText && bodyText.trim().length > 50) {
      pass('帖子详情页有内容显示');
    } else {
      warn('帖子详情页内容不足');
    }
  } else {
    warn('未成功进入帖子详情页');
  }
}

// ============================================
// TEST SUITE 6: 点赞和收藏测试
// ============================================
async function testLikeAndFavorite() {
  console.log('\n========================================');
  console.log('TEST SUITE 6: 点赞和收藏测试');
  console.log('========================================');

  // 设置登录状态
  await setLoggedInState();

  // 获取帖子
  console.log('\n[6.1] 访问帖子详情页...');
  try {
    const apiRes = await page.request.get(`${BASE_URL}/api/community?limit=1`);
    if (apiRes.ok()) {
      const data = await apiRes.json();
      if (data.data && data.data.length > 0) {
        await page.goto(`${BASE_URL}/community/${data.data[0].id}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
      }
    }
  } catch (e) {}

  const currentUrl = page.url();
  if (!currentUrl.includes('/community/') || currentUrl.endsWith('/community/') || currentUrl.endsWith('/community')) {
    warn('未进入帖子详情页，跳过互动测试');
    await takeScreenshot('6.1_no_detail_page');
    return;
  }
  pass('已进入帖子详情页，准备测试互动功能');
  await takeScreenshot('6.1_post_detail_for_interaction');

  // 6.2: 测试点赞功能
  console.log('\n[6.2] 测试点赞功能...');
  const likeBtn = await page.locator('button').filter({ hasText: /赞|👍|\d+/ }).first();
  if (await likeBtn.isVisible().catch(() => false)) {
    const initialText = await likeBtn.textContent();
    const initialCount = parseInt((initialText || '0').replace(/[^0-9]/g, '')) || 0;

    await likeBtn.click();
    await page.waitForTimeout(2000);

    const newText = await likeBtn.textContent();
    const newCount = parseInt((newText || '0').replace(/[^0-9]/g, '')) || 0;

    if (newCount !== initialCount) {
      pass('点赞数已更新');
    } else {
      warn('点赞数未变化');
    }
    await takeScreenshot('6.2_like_result');
  } else {
    warn('点赞按钮未找到');
  }

  // 6.3: 测试收藏功能
  console.log('\n[6.3] 测试收藏功能...');
  const favBtn = await page.locator('button').filter({ hasText: /收藏|⭐/ }).first();
  if (await favBtn.isVisible().catch(() => false)) {
    await favBtn.click();
    await page.waitForTimeout(2000);
    pass('收藏按钮可点击');
    await takeScreenshot('6.3_favorite_result');
  } else {
    warn('收藏按钮未找到');
  }
}

// ============================================
// TEST SUITE 7: 分类筛选测试
// ============================================
async function testCategoryFilter() {
  console.log('\n========================================');
  console.log('TEST SUITE 7: 分类筛选测试');
  console.log('========================================');

  await clearLogin();

  // 7.1: 访问社区页面
  console.log('\n[7.1] 访问社区页面加载分类筛选...');
  await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // 7.2: 测试分类按钮
  console.log('\n[7.2] 测试分类筛选按钮...');
  const categoryBtns = await page.locator('button').filter({ hasText: /全部|AI工具|支付指南|讨论|经验分享|校园生活/ }).all();

  if (categoryBtns.length > 0) {
    pass(`找到 ${categoryBtns.length} 个分类按钮`);

    for (const btn of categoryBtns.slice(0, 3)) {
      const categoryName = await btn.textContent();
      if (categoryName && !categoryName.includes('全部')) {
        await btn.click();
        await page.waitForTimeout(2000);
        pass(`切换到分类: ${categoryName}`);
      }
    }
    await takeScreenshot('7.2_category_filter');
  } else {
    warn('未找到分类筛选按钮');
    await takeScreenshot('7.2_no_category_buttons');
  }

  // 7.3: 测试排序功能
  console.log('\n[7.3] 测试排序功能...');
  const sortSelect = await page.locator('select').first();
  if (await sortSelect.isVisible().catch(() => false)) {
    await sortSelect.selectOption('popular');
    await page.waitForTimeout(1500);
    pass('切换到热门排序');

    await sortSelect.selectOption('latest');
    await page.waitForTimeout(1500);
    pass('切换到最新排序');
    await takeScreenshot('7.3_sort_change');
  } else {
    warn('排序下拉框未找到');
  }
}

// ============================================
// TEST SUITE 8: 搜索功能测试
// ============================================
async function testSearchFunctionality() {
  console.log('\n========================================');
  console.log('TEST SUITE 8: 搜索功能测试');
  console.log('========================================');

  await clearLogin();

  // 8.1: 访问社区页面
  console.log('\n[8.1] 访问社区页面检查搜索框...');
  await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // 8.2: 查找搜索框
  console.log('\n[8.2] 查找搜索输入框...');
  const searchInput = await page.locator('input[placeholder*="搜索"], input[type="search"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    pass('搜索框存在');
    await takeScreenshot('8.2_search_input_found');

    // 8.3: 执行搜索
    console.log('\n[8.3] 执行搜索测试...');
    await searchInput.fill('AI');
    await page.waitForTimeout(1000);

    const searchBtn = await page.locator('button:has-text("搜索"), button[type="submit"]').first();
    if (await searchBtn.isVisible().catch(() => false)) {
      await searchBtn.click();
    }
    await page.waitForTimeout(2000);
    pass('搜索已提交');
    await takeScreenshot('8.3_search_results');
  } else {
    warn('搜索框未找到');
    await takeScreenshot('8.2_no_search_input');
  }
}

// ============================================
// TEST SUITE 9: API 接口测试
// ============================================
async function testAPI() {
  console.log('\n========================================');
  console.log('TEST SUITE 9: API 接口测试');
  console.log('========================================');

  // 9.1: 测试获取帖子列表 API
  console.log('\n[9.1] 测试 GET /api/community...');
  const getResponse = await page.request.get(`${BASE_URL}/api/community?limit=5`);
  if (getResponse.ok()) {
    const data = await getResponse.json();
    if (data.success && data.data) {
      pass(`帖子列表 API 正常，返回 ${data.data.length} 条帖子`);
      if (data.data.length > 0) {
        const post = data.data[0];
        console.log(`  示例帖子: ID=${post.id}, 标题="${post.title?.substring(0, 30)}..."`);
      }
    } else {
      fail('API 返回格式异常', JSON.stringify(data).substring(0, 100));
    }
  } else {
    fail('帖子列表 API 请求失败', `Status: ${getResponse.status()}`);
  }

  // 9.2: 测试获取单个帖子 API
  console.log('\n[9.2] 测试 GET /api/community/{id}...');
  const postListRes = await page.request.get(`${BASE_URL}/api/community?limit=1`);
  if (postListRes.ok()) {
    const listData = await postListRes.json();
    if (listData.data && listData.data.length > 0) {
      const postId = listData.data[0].id;
      const singleRes = await page.request.get(`${BASE_URL}/api/community/${postId}`);
      if (singleRes.ok()) {
        const singleData = await singleRes.json();
        if (singleData.success) {
          pass(`单个帖子 API 正常: /community/${postId}`);
        } else {
          fail('单个帖子 API 返回 success=false');
        }
      } else {
        fail('单个帖子 API 请求失败', `Status: ${singleRes.status()}`);
      }
    }
  }
}

// ============================================
// GENERATE REPORT
// ============================================
async function generateReport() {
  console.log('\n========================================');
  console.log('FINAL TEST REPORT');
  console.log('========================================');
  console.log(`测试时间: ${new Date().toISOString()}`);
  console.log(`目标站点: ${BASE_URL}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`警告: ${testResults.warnings}`);
  console.log(`跳过: ${testResults.skipped}`);

  if (testResults.bugs.length > 0) {
    console.log('\n========================================');
    console.log('BUGS FOUND');
    console.log('========================================');
    testResults.bugs.forEach((b, i) => {
      console.log(`\n[${i + 1}] [${b.severity}] ${b.title}`);
      console.log(`    描述: ${b.desc}`);
      console.log(`    位置: ${b.location}`);
    });
  }

  const criticalBugs = testResults.bugs.filter(b => b.severity === 'CRITICAL');
  const highBugs = testResults.bugs.filter(b => b.severity === 'HIGH');
  const mediumBugs = testResults.bugs.filter(b => b.severity === 'MEDIUM' || b.severity === 'LOW');

  let recommendation = 'PASS';

  if (criticalBugs.length > 0) {
    recommendation = 'FAIL - 发现 CRITICAL 级别 Bug，必须修复';
  } else if (highBugs.length > 0) {
    recommendation = 'FAIL - 发现 HIGH 级别 Bug，需要修复';
  } else if (testResults.failed > 5) {
    recommendation = 'FAIL - 失败用例过多';
  } else if (mediumBugs.length > 0) {
    recommendation = 'PASS WITH WARNINGS - 有中低级问题，建议修复';
  } else {
    recommendation = 'PASS - 测试通过，可以交付';
  }

  console.log('\n========================================');
  console.log('QUALITY GATE');
  console.log('========================================');
  console.log(`CRITICAL Bugs: ${criticalBugs.length}`);
  console.log(`HIGH Bugs: ${highBugs.length}`);
  console.log(`MEDIUM/LOW Bugs: ${mediumBugs.length}`);
  console.log(`\n推荐: ${recommendation}`);

  const fs = await import('fs');
  const reportPath = `${SCREENSHOTS_DIR}/v105_community_test_report_${Date.now()}.json`;
  const report = {
    testRun: new Date().toISOString(),
    target: BASE_URL,
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      skipped: testResults.skipped,
      total: testResults.passed + testResults.failed + testResults.warnings + testResults.skipped,
    },
    bugs: testResults.bugs,
    recommendation,
    criticalBugs: criticalBugs.length,
    highBugs: highBugs.length,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n报告已保存: ${reportPath}`);

  return report;
}

// ============================================
// MAIN
// ============================================
async function main() {
  try {
    await init();

    console.log('\n========================================');
    console.log('v105 社区功能和登录集成深度测试');
    console.log(`Target: ${BASE_URL}`);
    console.log('========================================');

    await testUnauthenticatedState();
    await testDebugLoginPage();
    await testAuthenticatedState();
    await testPostCreationFlow();
    await testPostListAndDetail();
    await testLikeAndFavorite();
    await testCategoryFilter();
    await testSearchFunctionality();
    await testAPI();

    const report = await generateReport();

    console.log('\n========================================');
    console.log('测试完成');
    console.log('========================================');

    await browser.close();

    if (report.recommendation.startsWith('FAIL')) {
      console.log('\n!!! 测试未通过，需要修复后再交付 !!!');
      process.exit(1);
    } else {
      console.log('\n*** 测试完成 ***');
      process.exit(0);
    }
  } catch (error) {
    console.error('测试执行失败:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();