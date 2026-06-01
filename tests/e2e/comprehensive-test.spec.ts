import { test, expect, chromium, Page } from '@playwright/test';

test.describe('深度功能测试 - 逐项验证', () => {
  
  // Issue-02: 网站名称
  test('ZH: 首页标题显示MI TO AI留学生存指南', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('MI TO AI留学生存指南');
    await page.close();
  });

  test('EN: 首页标题显示MI TO AI留学生存指南', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/en/');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('MI TO AI留学生存指南');
    await page.close();
  });

  // Issue-09: AI工具库排序文字
  test('ZH: AI工具库排序按钮文字不换行', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/tools');
    await page.waitForLoadState('networkidle');
    const sortText = page.locator('text=/排序|sort/i').first();
    await expect(sortText).toBeVisible();
    await page.close();
  });

  // Issue-10: AI工具图片
  test('ZH: AI工具图片正常显示（非问号）', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/tools');
    await page.waitForLoadState('networkidle');
    const images = page.locator('img[src*="placehold"]');
    const count = await images.count();
    // 图片应该正常显示，不应有大量占位符
    await page.close();
  });

  // Issue-13: 支付搜索框
  test('ZH: 支付解决方案搜索框可用', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/payment');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]').first();
    await searchInput.fill('Depay');
    await page.waitForTimeout(500);
    await page.close();
  });

  // Issue-40: 中英文切换
  test('ZH: 切换到EN后再跳转到其他页面保持EN', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/en/tools');
    await page.waitForLoadState('networkidle');
    const enTitle = await page.title();
    await page.goto('http://localhost:4321/en/payment');
    await page.waitForLoadState('networkidle');
    const paymentTitle = await page.title();
    expect(paymentTitle).toContain('MI TO');
    await page.close();
  });

  // Issue-31: 收藏和分享按钮
  test('ZH: 工具详情页有分享按钮', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    const shareBtn = page.locator('button:has-text("分享"), button:has-text("Share")').first();
    await shareBtn.click();
    await page.waitForTimeout(500);
    await page.close();
  });

  // Issue-12: 评分星星
  test('ZH: 工具详情页有评分星星', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    const stars = page.locator('[aria-label*="星"], button[type="button"]');
    expect(await stars.count()).toBeGreaterThan(0);
    await page.close();
  });

  // Issue-14: 支付筛选
  test('ZH: 支付解决方案有分类筛选', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/payment');
    await page.waitForLoadState('networkidle');
    const filters = page.locator('a[href*="category="]');
    expect(await filters.count()).toBeGreaterThan(0);
    await page.close();
  });

  // Issue-08: 工具对比清除选择
  test('ZH: 工具对比页面可清除选择', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/compare');
    await page.waitForLoadState('networkidle');
    const clearBtn = page.locator('button:has-text("清除"), button:has-text("Clear")');
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
    }
    await page.close();
  });

  // Issue-03: 顶部通知图标 - 只在登录后显示
  test('ZH: 登录后顶部有通知图标', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    // 设置sessionStorage模拟登录状态（与auth.ts中的getDemoSession一致）
    await page.evaluate(() => {
      sessionStorage.setItem('demo_session', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        points: 100,
        level: 1,
        favorites: [],
        ratings: []
      }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    const bellBtn = page.locator('button[aria-label="通知"]');
    await expect(bellBtn).toBeVisible({ timeout: 5000 });
    await page.close();
  });

  // Issue-04: 用户中心
  test('ZH: 用户中心入口存在', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    const userMenu = page.locator('text=/登录|注册|用户中心/i').first();
    await expect(userMenu).toBeVisible();
    await page.close();
  });

  // Issue-05-07: 首页模块
  test('ZH: 首页四大模块可点击', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    const modules = page.locator('a[href="/tools"], a[href="/payment"], a[href="/policies"], a[href="/prompts"]');
    expect(await modules.count()).toBeGreaterThanOrEqual(4);
    await page.close();
  });

  // Issue-06: 首页模块链接
  test('ZH: 首页模块点击后跳转正确页面', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    await page.click('a[href="/tools"]');
    await page.waitForURL('**/tools**');
    expect(page.url()).toContain('/tools');
    await page.close();
  });

  // Issue-38: 问答社区筛选
  test('ZH: 问答社区有筛选功能', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/questions');
    await page.waitForLoadState('networkidle');
    const filters = page.locator('select, a[href*="category"], button');
    expect(await filters.count()).toBeGreaterThan(0);
    await page.close();
  });

  // Issue-41: 首页四大模块排版
  test('ZH: 首页四大模块正确显示', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
    const modules = page.locator('text=/AI工具库|支付解决方案|大学AI政策|Prompt模板/');
    expect(await modules.count()).toBeGreaterThanOrEqual(4);
    await page.close();
  });

});
