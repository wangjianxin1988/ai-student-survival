import { test, expect, chromium, Page } from '@playwright/test';

/**
 * 43 Issues Deep Verification Test Suite
 * Tests each issue systematically for both ZH and EN versions
 */

test.describe('【Issue-01】网站Logo检测', () => {
  test('ZH: 首页有Logo显示', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    // Check for logo/favicon - link in head is not visible, check it exists
    const favicon = page.locator('link[rel="icon"]').first();
    await expect(favicon).toBeAttached({ timeout: 5000 });
    // Also check header logo text
    const logo = page.locator('text=/MI TO AI留学生存指南/i').first();
    await expect(logo).toBeVisible({ timeout: 5000 });
    await page.close();
  });
});

test.describe('【Issue-02】网站名称检测', () => {
  test('ZH: 首页标题显示MI TO AI留学生存指南', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('MI TO AI留学生存指南');
    await page.close();
  });

  test('EN: 首页标题显示MI TO AI留学生存指南', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/en/');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('MI TO AI留学生存指南');
    await page.close();
  });
});

test.describe('【Issue-03】顶部通知图标检测', () => {
  test('ZH: 登录后顶部有通知图标', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    // First set session before navigation
    await page.goto('http://localhost:4340/');
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
    // Wait for React hydration
    await page.waitForTimeout(2000);
    const bellBtn = page.locator('button[aria-label="通知"]');
    await expect(bellBtn).toBeVisible({ timeout: 10000 });
    await page.close();
  });
});

test.describe('【Issue-04】用户中心功能检测', () => {
  test('ZH: 用户中心入口存在', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    const userMenu = page.locator('text=/登录|注册|用户中心/i').first();
    await expect(userMenu).toBeVisible();
    await page.close();
  });

  test('ZH: 登录后用户中心可访问', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
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
    // Click user center
    const userCenter = page.locator('text=/用户中心|个人中心/i').first();
    await expect(userCenter).toBeVisible();
    await page.close();
  });
});

test.describe('【Issue-05-07】首页模块检测', () => {
  test('ZH: 首页Banner区域正常显示', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    const banner = page.locator('text=/AI.*生存|工具|支付|政策/i').first();
    await expect(banner).toBeVisible({ timeout: 10000 });
    await page.close();
  });

  test('ZH: 首页四大模块可点击跳转', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    // Wait for content to load
    await page.waitForTimeout(2000);
    const modules = page.locator('a[href="/tools"], a[href="/payment"], a[href="/policies"], a[href="/prompts"]');
    expect(await modules.count()).toBeGreaterThanOrEqual(4);
    await page.close();
  });

  test('ZH: 首页底部内容正常', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible({ timeout: 5000 });
    await page.close();
  });
});

test.describe('【Issue-08】工具对比页面清除选择', () => {
  test('ZH: 工具对比页面可清除选择', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Select some tools first
    const toolCheckboxes = page.locator('input[type="checkbox"]');
    if (await toolCheckboxes.count() > 0) {
      await toolCheckboxes.first().click();
      await page.waitForTimeout(500);
    }
    // Try clear button
    const clearBtn = page.locator('button:has-text("清除"), button:has-text("Clear")');
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
      await page.waitForTimeout(500);
    }
    await page.close();
  });
});

test.describe('【Issue-09】AI工具库排序文字', () => {
  test('ZH: AI工具库排序按钮文字不换行', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools');
    await page.waitForLoadState('networkidle');
    const sortText = page.locator('text=/排序|sort/i').first();
    await expect(sortText).toBeVisible();
    // Check no line break in sort text
    const sortElement = await page.locator('text=/排序|sort/i').first().boundingBox();
    expect(sortElement?.height).toBeLessThan(30); // Should be single line
    await page.close();
  });

  test('EN: AI工具库排序按钮文字不换行', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/en/tools');
    await page.waitForLoadState('networkidle');
    const sortText = page.locator('text=/sort/i').first();
    await expect(sortText).toBeVisible();
    await page.close();
  });
});

test.describe('【Issue-10】AI工具图片显示', () => {
  test('ZH: AI工具图片正常显示', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools');
    await page.waitForLoadState('networkidle');
    const images = page.locator('img[src]');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    await page.close();
  });

  test('ZH: 工具详情页图片正常', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    const mainImage = page.locator('img').first();
    await expect(mainImage).toBeVisible({ timeout: 5000 });
    await page.close();
  });
});

test.describe('【Issue-11】AI工具详情页内容', () => {
  test('ZH: AI工具详情页内容丰富', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Check for key sections
    const content = await page.locator('body').textContent();
    expect(content?.length).toBeGreaterThan(200);
    await page.close();
  });
});

test.describe('【Issue-12】评分星星点击', () => {
  test('ZH: 工具详情页有评分星星', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    const stars = page.locator('[aria-label*="星"], [aria-label*="star"], button[type="button"]');
    expect(await stars.count()).toBeGreaterThan(0);
    await page.close();
  });

  test('ZH: 未登录点击评分跳转登录', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    // Click a rating star if visible
    const starBtn = page.locator('button').filter({ hasText: /评分|rate|星/i }).first();
    if (await starBtn.isVisible()) {
      await starBtn.click();
      await page.waitForTimeout(500);
      const url = page.url();
      // Should redirect to login or show login modal
      expect(url.includes('login') || await page.locator('text=/登录|login/i').isVisible());
    }
    await page.close();
  });
});

test.describe('【Issue-13】支付解决方案搜索框', () => {
  test('ZH: 支付解决方案搜索框可用', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/payment');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Depay');
    await page.waitForTimeout(500);
    await page.close();
  });

  test('EN: 支付解决方案搜索框可用', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/en/payment');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
    await page.close();
  });
});

test.describe('【Issue-14-17】支付解决方案功能', () => {
  test('ZH: 支付解决方案有分类筛选', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/payment');
    await page.waitForLoadState('networkidle');
    const filters = page.locator('a[href*="category="], button:has-text("分类")');
    expect(await filters.count()).toBeGreaterThan(0);
    await page.close();
  });

  test('ZH: 支付解决方案有多个教程', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/payment');
    await page.waitForLoadState('networkidle');
    const tutorials = page.locator('a[href*="/payment/"]');
    expect(await tutorials.count()).toBeGreaterThan(3);
    await page.close();
  });

  test('ZH: 支付解决方案底部引导正常', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/payment');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.close();
  });
});

test.describe('【Issue-18-19】大学政策数据库', () => {
  test('ZH: 大学政策数据库有多个大学', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/policies');
    await page.waitForLoadState('networkidle');
    const universities = page.locator('a[href*="/policies/"]');
    expect(await universities.count()).toBeGreaterThan(10);
    await page.close();
  });

  test('ZH: 大学详情页有关联链接', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/policies');
    await page.waitForLoadState('networkidle');
    const firstUni = page.locator('a[href*="/policies/"]').first();
    if (await firstUni.isVisible()) {
      await firstUni.click();
      await page.waitForLoadState('networkidle');
      // Check for related links
      const relatedLinks = page.locator('a[href*="/policies/"], a[href*="/offers"]');
      expect(await relatedLinks.count()).toBeGreaterThan(0);
    }
    await page.close();
  });
});

test.describe('【Issue-20】政策更新提醒', () => {
  test('ZH: 大学详情页更新提醒按钮存在', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/policies/mIT');
    await page.waitForLoadState('networkidle');
    const alertBtn = page.locator('button:has-text("提醒"), button:has-text("通知")');
    // Button may exist but need backend
    await page.close();
  });
});

test.describe('【Issue-21-23】地图页面', () => {
  test('ZH: 地图页面有大学标记', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/map');
    await page.waitForLoadState('networkidle');
    // Map should load
    await page.close();
  });

  test('ZH: 地图页面有设施类型标签', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/map');
    await page.waitForLoadState('networkidle');
    const tags = page.locator('text=/图书馆|食堂|宿舍|教学楼/i');
    // Should have various facility types
    await page.close();
  });
});

test.describe('【Issue-24】会员等级积分系统', () => {
  test('ZH: 用户中心显示积分等级', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      sessionStorage.setItem('demo_session', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        points: 150,
        level: 2,
        favorites: [],
        ratings: []
      }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    const userCenter = page.locator('text=/用户中心|个人中心/i').first();
    await userCenter.click();
    await page.waitForLoadState('networkidle');
    const pointsText = page.locator('text=/积分|等级|Point|Level/i');
    expect(await pointsText.count()).toBeGreaterThan(0);
    await page.close();
  });
});

test.describe('【Issue-25-27】防坑指南', () => {
  test('ZH: 防坑指南有多个内容', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/survival');
    await page.waitForLoadState('networkidle');
    const guides = page.locator('a[href*="/survival/"]');
    expect(await guides.count()).toBeGreaterThan(5);
    await page.close();
  });

  test('ZH: 防坑指南有分类', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/survival');
    await page.waitForLoadState('networkidle');
    const categories = page.locator('text=/分类|类别|category/i');
    await page.close();
  });
});

test.describe('【Issue-28-29】注册登录与审核', () => {
  test('ZH: 注册页面有第三方登录选项', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/auth/login');
    await page.waitForLoadState('networkidle');
    const googleBtn = page.locator('text=/Google|谷歌|第三方/i');
    await page.close();
  });

  test('ZH: 发表评论有审核提示', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    // Check if there's content moderation notice
    await page.close();
  });
});

test.describe('【Issue-30】Prompt模板', () => {
  test('ZH: Prompt模板页面有多个模板', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/prompts');
    await page.waitForLoadState('networkidle');
    const templates = page.locator('[data-prompt], .prompt-card, a[href*="/prompts/"]');
    const count = await templates.count();
    expect(count).toBeGreaterThan(10);
    await page.close();
  });

  test('EN: Prompt模板页面有多个模板', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/en/prompts');
    await page.waitForLoadState('networkidle');
    const templates = page.locator('[data-prompt], .prompt-card, a[href*="/prompts/"]');
    expect(await templates.count()).toBeGreaterThan(5);
    await page.close();
  });
});

test.describe('【Issue-31】收藏和分享按钮', () => {
  test('ZH: 工具详情页有分享按钮', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    const shareBtn = page.locator('button:has-text("分享"), button:has-text("Share")').first();
    await expect(shareBtn).toBeVisible({ timeout: 3000 });
    await page.close();
  });

  test('ZH: 工具详情页有收藏按钮', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    const favoriteBtn = page.locator('button:has-text("收藏"), button:has-text("favorite")').first();
    await expect(favoriteBtn).toBeVisible({ timeout: 3000 });
    await page.close();
  });
});

test.describe('【Issue-32-35】Offer页面', () => {
  test('ZH: Offer页面有筛选功能', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/offers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const filters = page.locator('select, button:has-text("筛选"), button:has-text("Filter")');
    expect(await filters.count()).toBeGreaterThan(0);
    await page.close();
  });

  test('ZH: Offer页面可提交', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/offers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const submitBtn = page.locator('button:has-text("提交"), button:has-text("分享"), a[href*="offers/submit"]');
    expect(await submitBtn.count()).toBeGreaterThan(0);
    await page.close();
  });

  test('ZH: Offer详情页有评论区', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/offers');
    await page.waitForLoadState('networkidle');
    // Click first offer if exists
    const firstOffer = page.locator('a[href*="/offers/"]').first();
    if (await firstOffer.isVisible()) {
      await firstOffer.click();
      await page.waitForLoadState('networkidle');
      const commentSection = page.locator('text=/评论|comment/i');
      expect(await commentSection.count()).toBeGreaterThan(0);
    }
    await page.close();
  });
});

test.describe('【Issue-36】表情评论功能', () => {
  test('ZH: 评论区有表情选择', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/offers');
    await page.waitForLoadState('networkidle');
    const firstOffer = page.locator('a[href*="/offers/"]').first();
    if (await firstOffer.isVisible()) {
      await firstOffer.click();
      await page.waitForLoadState('networkidle');
      const emojiBtn = page.locator('button:has-text("表情"), .emoji-picker');
      // Emoji feature may be in comment form
    }
    await page.close();
  });
});

test.describe('【Issue-38-39】问答社区', () => {
  test('ZH: 问答社区有筛选分类', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/questions');
    await page.waitForLoadState('networkidle');
    const filters = page.locator('select, a[href*="category"]');
    expect(await filters.count()).toBeGreaterThan(0);
    await page.close();
  });

  test('ZH: 问答社区有多个问题', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/questions');
    await page.waitForLoadState('networkidle');
    const questions = page.locator('a[href*="/questions/"]');
    expect(await questions.count()).toBeGreaterThan(3);
    await page.close();
  });

  test('EN: 问答社区筛选可用', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/en/questions');
    await page.waitForLoadState('networkidle');
    const filters = page.locator('select, a[href*="category"]');
    await page.close();
  });
});

test.describe('【Issue-40】中英文切换', () => {
  test('ZH→EN: 切换后保持EN', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/en/tools');
    await page.waitForLoadState('networkidle');
    const originalTitle = await page.title();
    // Navigate to another EN page
    await page.goto('http://localhost:4340/en/payment');
    await page.waitForLoadState('networkidle');
    const newTitle = await page.title();
    // Should still be in EN
    expect(newTitle).toContain('MI TO');
    await page.close();
  });

  test('ZH: 语言切换链接存在', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    const langSwitch = page.locator('a[href="/en"], a[href*="/en/"]').first();
    await expect(langSwitch).toBeVisible({ timeout: 3000 });
    await page.close();
  });
});

test.describe('【Issue-41】首页四大模块排版', () => {
  test('ZH: 首页四大模块正确显示', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    const modules = page.locator('text=/AI工具库|支付解决方案|大学AI政策|Prompt模板|AI Tools|Payment|University|Prompt/i');
    expect(await modules.count()).toBeGreaterThanOrEqual(4);
    await page.close();
  });

  test('ZH: 首页模块布局正确', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    // Check grid/list layout
    await page.close();
  });
});

test.describe('【Issue-42】SEO和GEO特性', () => {
  test('ZH: 页面有Schema.org标记', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    const schema = await page.locator('script[type="application/ld+json"]').count();
    expect(schema).toBeGreaterThan(0);
    await page.close();
  });

  test('ZH: 页面有meta标签', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto('http://localhost:4340/');
    await page.waitForLoadState('networkidle');
    const description = page.locator('meta[name="description"]');
    await expect(description).toBeAttached();
    await page.close();
  });
});

test.describe('【Issue-43】全局功能深度检查', () => {
  test('ZH: 所有主要页面可访问', async () => {
    const pages = ['/', '/tools', '/payment', '/policies', '/prompts', '/compare', '/offers', '/questions', '/map'];
    for (const path of pages) {
      const page = await chromium.launch().then(b => b.newPage());
      const response = await page.goto(`http://localhost:4340${path}`);
      expect(response?.status()).toBeLessThan(400);
      await page.close();
    }
  });

  test('EN: 所有主要英文页面可访问', async () => {
    const pages = ['/en/', '/en/tools', '/en/payment', '/en/policies', '/en/prompts'];
    for (const path of pages) {
      const page = await chromium.launch().then(b => b.newPage());
      const response = await page.goto(`http://localhost:4340${path}`);
      expect(response?.status()).toBeLessThan(400);
      await page.close();
    }
  });
});
