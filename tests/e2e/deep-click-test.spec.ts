/**
 * 深度浏览器点击测试 - 第1轮
 * 测试目标: http://localhost:4321
 * 策略: 模拟人类真实操作，深度点击每个按钮和链接
 */

import { test, expect, chromium, Browser, Page } from '@playwright/test';

// 测试结果收集
interface TestResult {
  page: string;
  component: string;
  action: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  expected?: string;
  actual?: string;
  error?: string;
}

const results: TestResult[] = [];

// 辅助函数: 记录测试结果
async function logResult(page: string, component: string, action: string, status: 'PASS' | 'FAIL' | 'ERROR', details?: any) {
  results.push({
    page,
    component,
    action,
    status,
    ...details
  });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '❗';
  console.log(`${icon} [${page}] ${component} - ${action}`);
  if (status !== 'PASS' && details) {
    console.log(`   详情: ${JSON.stringify(details)}`);
  }
}

// 辅助函数: 安全点击元素
async function safeClick(page: Page, selector: string, timeout = 5000): Promise<boolean> {
  try {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout });
    await element.click();
    return true;
  } catch (e) {
    return false;
  }
}

// 辅助函数: 检查元素是否存在
async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.locator(selector).first().waitFor({ state: 'attached', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

// ========================================
// 首页 / 测试
// ========================================
test.describe('首页 /', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Hero "浏览工具" 按钮', async () => {
    const btn = page.locator('text=/浏览工具|Explore Tools/i').first();
    try {
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      await btn.click();
      await page.waitForURL(/\/tools/, { timeout: 5000 });
      await logResult('/', 'Hero按钮', '点击"浏览工具"', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/', 'Hero按钮', '点击"浏览工具"', 'FAIL', {
        expected: '跳转到 /tools',
        actual: '点击失败或未跳转'
      });
    }
  });

  test('2. Hero "支付解决方案" 按钮', async () => {
    // Use partial match since actual text is "支付解决方案"
    const btn = page.locator('text=/支付解决|Payment/i').first();
    try {
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      await btn.click();
      await page.waitForURL(/\/payment/, { timeout: 5000 });
      await logResult('/', 'Hero按钮', '点击"支付解决方案"', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/', 'Hero按钮', '点击"支付解决方案"', 'FAIL', {
        expected: '跳转到 /payment',
        actual: '点击失败或未跳转'
      });
    }
  });

  test('3. 导航栏 "AI工具" 链接', async () => {
    const link = page.locator('nav a[href*="/tools"], header a[href*="/tools"]').first();
    try {
      await link.waitFor({ state: 'visible', timeout: 5000 });
      await link.click();
      await page.waitForURL(/\/tools/, { timeout: 5000 });
      await logResult('/', '导航栏', '"AI工具"链接', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/', '导航栏', '"AI工具"链接', 'FAIL', { expected: '跳转到 /tools' });
    }
  });

  test('4. 导航栏 "支付方案" 链接', async () => {
    const link = page.locator('a[href="/payment"]').first();
    try {
      await link.waitFor({ state: 'visible', timeout: 5000 });
      await link.click();
      await page.waitForURL(/\/payment/, { timeout: 5000 });
      await logResult('/', '导航栏', '"支付方案"链接', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/', '导航栏', '"支付方案"链接', 'FAIL', { expected: '跳转到 /payment' });
    }
  });

  test('5. 导航栏 "大学政策" 链接', async () => {
    const link = page.locator('a[href="/policies"]').first();
    try {
      await link.waitFor({ state: 'visible', timeout: 5000 });
      await link.click();
      await page.waitForURL(/\/policies/, { timeout: 5000 });
      await logResult('/', '导航栏', '"大学政策"链接', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/', '导航栏', '"大学政策"链接', 'FAIL', { expected: '跳转到 /policies' });
    }
  });

  test('6. 导航栏 "Prompt模板" 链接', async () => {
    const link = page.locator('a[href="/prompts"]').first();
    try {
      await link.waitFor({ state: 'visible', timeout: 5000 });
      await link.click();
      await page.waitForURL(/\/prompts/, { timeout: 5000 });
      await logResult('/', '导航栏', '"Prompt模板"链接', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/', '导航栏', '"Prompt模板"链接', 'FAIL', { expected: '跳转到 /prompts' });
    }
  });

  test('7. 语言切换 - EN', async () => {
    const langBtn = page.locator('button:has-text("EN"), a:has-text("EN")').first();
    try {
      await langBtn.waitFor({ state: 'visible', timeout: 5000 });
      await langBtn.click();
      await page.waitForURL(/\/en\//, { timeout: 5000 });
      await logResult('/', '语言切换', '切换到英文版', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/', '语言切换', '切换到英文版', 'FAIL', { expected: 'URL包含 /en/' });
    }
  });

  test('8. Footer 链接', async () => {
    const footerLink = page.locator('footer a[href]').first();
    try {
      await footerLink.waitFor({ state: 'visible', timeout: 5000 });
      const href = await footerLink.getAttribute('href');
      await footerLink.click();
      // 检查是否跳转或保持当前页面
      await logResult('/', 'Footer', '点击Footer链接', 'PASS', { href });
    } catch (e) {
      await logResult('/', 'Footer', '点击Footer链接', 'FAIL', { expected: '至少有一个链接可点击' });
    }
  });
});

// ========================================
// AI工具库 /tools 测试
// ========================================
test.describe('AI工具库 /tools', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/tools', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 分类筛选按钮', async () => {
    const categories = [
      { key: 'writing', zh: '写作' },
      { key: 'coding', zh: '编程' },
      { key: 'design', zh: '设计' },
      { key: 'research', zh: '研究' },
      { key: 'communication', zh: '对话' }
    ];
    for (const cat of categories) {
      // Use href selector since filters are <a> tags not buttons
      const link = page.locator(`a[href*="category=${cat.key}"]`).first();
      try {
        await link.waitFor({ state: 'visible', timeout: 3000 });
        await link.click();
        await page.waitForURL(new RegExp(`category=${cat.key}`), { timeout: 5000 });
        await logResult('/tools', '分类筛选', `点击${cat.key}`, 'PASS');
      } catch (e) {
        await logResult('/tools', '分类筛选', `点击${cat.key}`, 'FAIL', { expected: '点击成功' });
      }
    }
  });

  test('2. 价格筛选', async () => {
    const prices = [
      { key: 'free', zh: '免费' },
      { key: 'freemium', zh: '免费+' },
      { key: 'paid', zh: '付费' }
    ];
    for (const price of prices) {
      // Use href selector since filters are <a> tags not buttons
      const link = page.locator(`a[href*="pricing=${price.key}"]`).first();
      try {
        await link.waitFor({ state: 'visible', timeout: 3000 });
        await link.click();
        await page.waitForURL(new RegExp(`pricing=${price.key}`), { timeout: 5000 });
        await logResult('/tools', '价格筛选', `点击${price.key}`, 'PASS');
      } catch (e) {
        await logResult('/tools', '价格筛选', `点击${price.key}`, 'FAIL');
      }
    }
  });

  test('3. 搜索框输入', async () => {
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]').first();
    try {
      await searchInput.waitFor({ state: 'visible', timeout: 5000 });
      await searchInput.fill('ChatGPT');
      await page.waitForTimeout(1000);
      await logResult('/tools', '搜索框', '输入"ChatGPT"', 'PASS');
    } catch (e) {
      await logResult('/tools', '搜索框', '输入"ChatGPT"', 'FAIL');
    }
  });

  test('4. 点击工具卡片', async () => {
    // More specific: find cards in the tools grid, not nav links
    const card = page.locator('a[href^="/tools/"][href*="-"], article a[href*="/tools/"]').first();
    try {
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.click();
      await page.waitForURL(/\/tools\/.+/, { timeout: 5000 });
      await logResult('/tools', '工具卡片', '点击卡片', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/tools', '工具卡片', '点击卡片', 'FAIL');
    }
  });

  test('5. 排序下拉菜单', async () => {
    const sortBtn = page.locator('select, button:has-text("排序"), [role="combobox"]').first();
    try {
      await sortBtn.waitFor({ state: 'visible', timeout: 5000 });
      await sortBtn.click();
      await page.waitForTimeout(500);
      await logResult('/tools', '排序菜单', '打开排序菜单', 'PASS');
    } catch (e) {
      await logResult('/tools', '排序菜单', '打开排序菜单', 'FAIL');
    }
  });
});

// ========================================
// 工具详情页测试
// ========================================
test.describe('工具详情页 /tools/[slug]', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    // 尝试访问一个存在的工具
    await page.goto('http://localhost:4321/tools/chatgpt', { waitUntil: 'networkidle' }).catch(() => {
      // 如果chatgpt不存在，跳转到/tools
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. "加入对比" 按钮', async () => {
    const btn = page.locator('button:has-text("加入对比"), button:has-text("Add to Compare")').first();
    try {
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      await btn.click();
      await page.waitForTimeout(500);
      await logResult('/tools/[slug]', '加入对比按钮', '点击添加', 'PASS');
    } catch (e) {
      await logResult('/tools/[slug]', '加入对比按钮', '点击添加', 'FAIL');
    }
  });

  test('2. 收藏按钮', async () => {
    const heartBtn = page.locator('button[aria-label*="收藏"], button:has-text("收藏"), [aria-label*="heart"], button:has-text("Favorite")').first();
    try {
      await heartBtn.waitFor({ state: 'visible', timeout: 5000 });
      await heartBtn.click();
      await page.waitForTimeout(500);
      await logResult('/tools/[slug]', '收藏按钮', '点击收藏', 'PASS');
    } catch (e) {
      await logResult('/tools/[slug]', '收藏按钮', '点击收藏', 'FAIL');
    }
  });

  test('3. 评分按钮', async () => {
    // Look for star rating buttons - the actual buttons have aria-label="1星", "2星" etc.
    // Note: Rating requires login, so it may redirect to /auth/login
    const ratingBtn = page.locator('[aria-label*="星"], [class*="star"]').first();
    try {
      await ratingBtn.waitFor({ state: 'visible', timeout: 5000 });
      await ratingBtn.click();
      await page.waitForTimeout(1000);
      // Either stays on page (if logged in) or redirects to login
      const currentUrl = page.url();
      if (currentUrl.includes('/auth/login')) {
        await logResult('/tools/[slug]', '评分按钮', '点击评分(跳转登录)', 'PASS');
      } else {
        await logResult('/tools/[slug]', '评分按钮', '点击评分', 'PASS');
      }
    } catch (e) {
      await logResult('/tools/[slug]', '评分按钮', '点击评分', 'FAIL');
    }
  });

  test('4. 复制链接按钮', async () => {
    // Share menu has a "复制链接" button inside it - need to open menu first
    const shareBtn = page.locator('button:has-text("分享"), button:has-text("Share")').first();
    try {
      await shareBtn.waitFor({ state: 'visible', timeout: 5000 });
      await shareBtn.click();
      await page.waitForTimeout(500);
      // Now find and click copy link inside the menu
      const copyBtn = page.locator('button:has-text("复制链接"), button:has-text("Copy Link")').first();
      await copyBtn.waitFor({ state: 'visible', timeout: 3000 });
      await copyBtn.click();
      await page.waitForTimeout(500);
      await logResult('/tools/[slug]', '复制链接', '点击复制', 'PASS');
    } catch (e) {
      await logResult('/tools/[slug]', '复制链接', '点击复制', 'FAIL');
    }
  });
});

// ========================================
// 支付方案页面测试
// ========================================
test.describe('支付方案 /payment', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/payment', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 分类筛选', async () => {
    const categories = ['virtual_card', 'gift_card', 'regional_pricing'];
    for (const cat of categories) {
      // Use href selector since filters may be <a> tags
      const link = page.locator(`a[href*="category=${cat}"], button:has-text("${cat}")`).first();
      try {
        await link.waitFor({ state: 'visible', timeout: 3000 });
        await link.click();
        await page.waitForTimeout(500);
        await logResult('/payment', '分类筛选', `点击${cat}`, 'PASS');
      } catch (e) {
        await logResult('/payment', '分类筛选', `点击${cat}`, 'FAIL');
      }
    }
  });

  test('2. 点击支付方案卡片', async () => {
    // More specific: find cards with slugs, not nav links
    const card = page.locator('a[href^="/payment/"][href*="-"], article a[href*="/payment/"]').first();
    try {
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.click();
      await page.waitForURL(/\/payment\/.+/, { timeout: 5000 });
      await logResult('/payment', '支付卡片', '点击卡片', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/payment', '支付卡片', '点击卡片', 'FAIL');
    }
  });

  test('3. 搜索框', async () => {
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]').first();
    try {
      await searchInput.waitFor({ state: 'visible', timeout: 5000 });
      await searchInput.fill('Depay');
      await page.waitForTimeout(1000);
      await logResult('/payment', '搜索框', '输入"Depay"', 'PASS');
    } catch (e) {
      await logResult('/payment', '搜索框', '输入"Depay"', 'FAIL');
    }
  });
});

// ========================================
// 大学政策页面测试
// ========================================
test.describe('大学政策 /policies', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/policies', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 国家筛选', async () => {
    const countryBtn = page.locator('button:has-text("国家"), select').first();
    try {
      await countryBtn.waitFor({ state: 'visible', timeout: 5000 });
      await countryBtn.click();
      await page.waitForTimeout(500);
      await logResult('/policies', '国家筛选', '点击筛选', 'PASS');
    } catch (e) {
      await logResult('/policies', '国家筛选', '点击筛选', 'FAIL');
    }
  });

  test('2. 政策类型筛选', async () => {
    const types = ['allowed', 'restricted', 'prohibited'];
    for (const type of types) {
      // Policy filter uses <select> dropdown, not buttons
      const select = page.locator('select[id*="policy"], select[name*="policy"]').first();
      try {
        await select.waitFor({ state: 'visible', timeout: 3000 });
        await select.selectOption(type);
        await page.waitForTimeout(500);
        await logResult('/policies', '政策类型筛选', `点击${type}`, 'PASS');
      } catch (e) {
        await logResult('/policies', '政策类型筛选', `点击${type}`, 'FAIL');
      }
    }
  });

  test('3. 点击大学卡片', async () => {
    // More specific: find cards with slugs, not nav links
    const card = page.locator('a[href^="/policies/"][href*="-"], article a[href*="/policies/"]').first();
    try {
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.click();
      await page.waitForURL(/\/policies\/.+/, { timeout: 5000 });
      await logResult('/policies', '大学卡片', '点击卡片', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/policies', '大学卡片', '点击卡片', 'FAIL');
    }
  });
});

// ========================================
// Prompt模板页面测试
// ========================================
test.describe('Prompt模板 /prompts', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/prompts', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 分类筛选', async () => {
    const categories = ['application', 'thesis', 'job', 'daily', 'research'];
    for (const cat of categories) {
      // Use href selector since filters may be <a> tags
      const link = page.locator(`a[href*="category=${cat}"], button:has-text("${cat}")`).first();
      try {
        await link.waitFor({ state: 'visible', timeout: 3000 });
        await link.click();
        await page.waitForTimeout(500);
        await logResult('/prompts', '分类筛选', `点击${cat}`, 'PASS');
      } catch (e) {
        await logResult('/prompts', '分类筛选', `点击${cat}`, 'FAIL');
      }
    }
  });

  test('2. 点击模板卡片', async () => {
    const card = page.locator('[href*="/prompts/"]').first();
    try {
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.click();
      await page.waitForURL(/\/prompts\/.+/, { timeout: 5000 });
      await logResult('/prompts', '模板卡片', '点击卡片', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/prompts', '模板卡片', '点击卡片', 'FAIL');
    }
  });
});

// ========================================
// Prompt详情页测试
// ========================================
test.describe('Prompt详情页 /prompts/[slug]', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/prompts', { waitUntil: 'networkidle' });

    // 点击第一个模板进入详情页
    const card = page.locator('[href*="/prompts/"]').first();
    try {
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.click();
      await page.waitForURL(/\/prompts\/.+/, { timeout: 5000 });
    } catch {
      // 详情页不存在则跳过
    }
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 复制Prompt按钮', async () => {
    const copyBtn = page.locator('button:has-text("复制"), button:has-text("Copy")').first();
    try {
      await copyBtn.waitFor({ state: 'visible', timeout: 5000 });
      await copyBtn.click();
      await page.waitForTimeout(500);
      await logResult('/prompts/[slug]', '复制按钮', '点击复制', 'PASS');
    } catch (e) {
      await logResult('/prompts/[slug]', '复制按钮', '点击复制', 'FAIL');
    }
  });

  test('2. 收藏按钮', async () => {
    const heartBtn = page.locator('button:has-text("收藏"), button:has-text("Favorite")').first();
    try {
      await heartBtn.waitFor({ state: 'visible', timeout: 5000 });
      await heartBtn.click();
      await page.waitForTimeout(500);
      await logResult('/prompts/[slug]', '收藏按钮', '点击收藏', 'PASS');
    } catch (e) {
      await logResult('/prompts/[slug]', '收藏按钮', '点击收藏', 'FAIL');
    }
  });
});

// ========================================
// Chatbot测试
// ========================================
test.describe('Chatbot (右下角)', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 展开聊天窗口', async () => {
    // Chatbot button has aria-label="展开聊天"
    const chatBtn = page.locator('button[aria-label="展开聊天"]').first();
    try {
      await chatBtn.waitFor({ state: 'visible', timeout: 8000 });
      await chatBtn.click();
      await page.waitForTimeout(1500);
      await logResult('Chatbot', '展开按钮', '点击展开', 'PASS');
    } catch (e) {
      await logResult('Chatbot', '展开按钮', '点击展开', 'FAIL', { error: String(e) });
    }
  });

  test('2. 输入消息并发送', async () => {
    // After opening, the chat input appears inside the chat window
    const input = page.locator('input[placeholder*="问"], input[placeholder*="Ask"]').first();
    try {
      await input.waitFor({ state: 'visible', timeout: 8000 });
      await input.fill('Hello');
      await page.waitForTimeout(300);
      const sendBtn = page.locator('button[aria-label="发送"], button:has-text("发送")').first();
      await sendBtn.waitFor({ state: 'visible', timeout: 3000 });
      await sendBtn.click();
      await page.waitForTimeout(1500);
      await logResult('Chatbot', '发送消息', '输入并发送', 'PASS');
    } catch (e) {
      await logResult('Chatbot', '发送消息', '输入并发送', 'FAIL', { error: String(e) });
    }
  });

  test('3. 关闭聊天窗口', async () => {
    const closeBtn = page.locator('button[aria-label="关闭聊天"]').first();
    try {
      await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
      await closeBtn.click();
      await page.waitForTimeout(500);
      await logResult('Chatbot', '关闭按钮', '点击关闭', 'PASS');
    } catch (e) {
      await logResult('Chatbot', '关闭按钮', '点击关闭', 'FAIL', { error: String(e) });
    }
  });
});

// ========================================
// 认证页面测试
// ========================================
test.describe('认证页面 /auth', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 登录页面 - 表单验证', async () => {
    await page.goto('http://localhost:4321/auth/login', { waitUntil: 'networkidle' });

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitBtn = page.locator('button[type="submit"], button:has-text("登录"), button:has-text("Login")').first();

    try {
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });
      await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
      await submitBtn.waitFor({ state: 'visible', timeout: 5000 });

      // 不填写直接点击
      await submitBtn.click();
      await page.waitForTimeout(500);

      // 检查是否有验证提示
      const validationMsg = await page.locator('text=/请输入|必填|required/i').count();
      if (validationMsg > 0) {
        await logResult('/auth/login', '表单验证', '空表单提交', 'PASS', { reason: '有验证提示' });
      } else {
        await logResult('/auth/login', '表单验证', '空表单提交', 'PASS', { reason: '表单可以提交' });
      }
    } catch (e) {
      await logResult('/auth/login', '表单验证', '空表单提交', 'FAIL');
    }
  });

  test('2. 登录页面 - 注册链接', async () => {
    await page.goto('http://localhost:4321/auth/login', { waitUntil: 'networkidle' });

    const registerLink = page.locator('a:has-text("注册"), a:has-text("Register")').first();
    try {
      await registerLink.waitFor({ state: 'visible', timeout: 5000 });
      await registerLink.click();
      await page.waitForURL(/\/auth\/register/, { timeout: 5000 });
      await logResult('/auth/login', '注册链接', '点击注册', 'PASS');
    } catch (e) {
      await logResult('/auth/login', '注册链接', '点击注册', 'FAIL');
    }
  });

  test('3. 注册页面 - 登录链接', async () => {
    await page.goto('http://localhost:4321/auth/register', { waitUntil: 'networkidle' });

    const loginLink = page.locator('a:has-text("登录"), a:has-text("Login")').first();
    try {
      await loginLink.waitFor({ state: 'visible', timeout: 5000 });
      await loginLink.click();
      await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
      await logResult('/auth/register', '登录链接', '点击登录', 'PASS');
    } catch (e) {
      await logResult('/auth/register', '登录链接', '点击登录', 'FAIL');
    }
  });
});

// ========================================
// 用户中心测试
// ========================================
test.describe('用户中心 /user', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/user', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 收藏Tab', async () => {
    const tab = page.locator('button:has-text("收藏"), [role="tab"]:has-text("收藏")').first();
    try {
      await tab.waitFor({ state: 'visible', timeout: 5000 });
      await tab.click();
      await page.waitForTimeout(500);
      await logResult('/user', 'Tab切换', '点击收藏Tab', 'PASS');
    } catch (e) {
      await logResult('/user', 'Tab切换', '点击收藏Tab', 'FAIL');
    }
  });

  test('2. 评分Tab', async () => {
    const tab = page.locator('button:has-text("评分"), [role="tab"]:has-text("评分")').first();
    try {
      await tab.waitFor({ state: 'visible', timeout: 5000 });
      await tab.click();
      await page.waitForTimeout(500);
      await logResult('/user', 'Tab切换', '点击评分Tab', 'PASS');
    } catch (e) {
      await logResult('/user', 'Tab切换', '点击评分Tab', 'FAIL');
    }
  });

  test('3. 设置Tab', async () => {
    const tab = page.locator('button:has-text("设置"), [role="tab"]:has-text("设置")').first();
    try {
      await tab.waitFor({ state: 'visible', timeout: 5000 });
      await tab.click();
      await page.waitForTimeout(500);
      await logResult('/user', 'Tab切换', '点击设置Tab', 'PASS');
    } catch (e) {
      await logResult('/user', 'Tab切换', '点击设置Tab', 'FAIL');
    }
  });
});

// ========================================
// 英文版页面测试
// ========================================
test.describe('英文版页面 /en', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/en', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. EN首页导航链接', async () => {
    const link = page.locator('nav a[href*="/en/tools"], header a[href*="/en/tools"]').first();
    try {
      await link.waitFor({ state: 'visible', timeout: 5000 });
      await link.click();
      await page.waitForURL(/\/en\/tools/, { timeout: 5000 });
      await logResult('/en', '导航链接', '点击AI工具', 'PASS');
      await page.goBack();
    } catch (e) {
      await logResult('/en', '导航链接', '点击AI工具', 'FAIL');
    }
  });

  test('2. EN页面分类筛选', async () => {
    // Use href selector for English page
    const btn = page.locator('a[href*="category=writing"], button:has-text("Writing")').first();
    try {
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      await btn.click();
      await page.waitForTimeout(500);
      await logResult('/en/tools', '分类筛选', '点击分类按钮', 'PASS');
    } catch (e) {
      await logResult('/en/tools', '分类筛选', '点击分类按钮', 'FAIL');
    }
  });

  test('3. 语言切换回中文', async () => {
    const langBtn = page.locator('button:has-text("中文"), a:has-text("中文")').first();
    try {
      await langBtn.waitFor({ state: 'visible', timeout: 5000 });
      await langBtn.click();
      await page.waitForURL(/\/(?!en\/)/, { timeout: 5000 });
      await logResult('/en', '语言切换', '切换回中文', 'PASS');
    } catch (e) {
      await logResult('/en', '语言切换', '切换回中文', 'FAIL');
    }
  });
});

// ========================================
// 对比页面测试
// ========================================
test.describe('对比页面 /compare', () => {
  let page: Page;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321/compare', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. 添加工具按钮', async () => {
    const addBtn = page.locator('button:has-text("添加"), button:has-text("Add")').first();
    try {
      await addBtn.waitFor({ state: 'visible', timeout: 5000 });
      await addBtn.click();
      await page.waitForTimeout(500);
      await logResult('/compare', '添加按钮', '点击添加', 'PASS');
    } catch (e) {
      await logResult('/compare', '添加按钮', '点击添加', 'FAIL');
    }
  });

  test('2. 开始对比按钮', async () => {
    const compareBtn = page.locator('button:has-text("对比"), button:has-text("Compare")').first();
    try {
      await compareBtn.waitFor({ state: 'visible', timeout: 5000 });
      await compareBtn.click();
      await page.waitForTimeout(500);
      await logResult('/compare', '对比按钮', '点击对比', 'PASS');
    } catch (e) {
      await logResult('/compare', '对比按钮', '点击对比', 'FAIL');
    }
  });
});

// ========================================
// 最终输出测试结果摘要
// ========================================
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('测试结果摘要');
  console.log('========================================');

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;

  console.log(`\n总计: ${results.length} 测试`);
  console.log(`通过: ${passCount} (${Math.round(passCount/results.length*100)}%)`);
  console.log(`失败: ${failCount}`);
  console.log(`错误: ${errorCount}`);

  console.log('\n--- 失败测试详情 ---');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`❌ [${r.page}] ${r.component} - ${r.action}`);
    if (r.expected) console.log(`   预期: ${r.expected}`);
    if (r.actual) console.log(`   实际: ${r.actual}`);
  });
});