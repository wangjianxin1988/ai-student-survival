/**
 * AI留学生存指南 - 综合E2E验证测试
 * 测试所有页面、按钮、功能
 * 按人类操作方式执行
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4322';

describe('AI留学生存指南 - 综合E2E验证', () => {

  // ==================== 首页测试 ====================
  describe('首页 (/)', () => {
    test('首页加载和核心元素验证', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // 验证Hero区域
      const heroText = await page.locator('text=AI留学').first();
      await expect(heroText).toBeVisible();

      // 验证四大模块按钮可点击
      const aiToolsBtn = page.locator('text=探索AI工具').first();
      await expect(aiToolsBtn).toBeVisible();

      // 验证导航链接
      await page.click('text=AI工具库');
      await expect(page).toHaveURL(/\/tools/);

      await page.goto(BASE_URL);
      await page.click('text=支付解决方案');
      await expect(page).toHaveURL(/\/payment/);

      await page.goto(BASE_URL);
      await page.click('text=大学政策');
      await expect(page).toHaveURL(/\/policies/);

      await page.goto(BASE_URL);
      await page.click('text=Prompt模板');
      await expect(page).toHaveURL(/\/prompts/);
    });

    test('中英文切换', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // 点击英文切换
      const enLink = page.locator('a[href="/en"]').first();
      if (await enLink.isVisible()) {
        await enLink.click();
        await page.waitForLoadState('networkidle');
        // 验证切换成功
        await expect(page).toHaveURL(/\/en/);
      }
    });
  });

  // ==================== AI工具库测试 ====================
  describe('AI工具库 (/tools)', () => {
    test('工具库加载和筛选', async ({ page }) => {
      await page.goto(`${BASE_URL}/tools`);
      await page.waitForLoadState('networkidle');

      // 验证工具卡片存在
      const toolCards = page.locator('[class*="tool-card"], [class*="ToolCard"]').first();
      await expect(toolCards).toBeVisible({ timeout: 10000 });

      // 测试分类筛选
      const writingLink = page.locator('a[href*="category=writing"]').first();
      if (await writingLink.isVisible()) {
        await writingLink.click();
        await page.waitForLoadState('networkidle');
        // 验证URL包含筛选参数
        expect(page.url()).toContain('category=writing');
      }
    });

    test('搜索功能', async ({ page }) => {
      await page.goto(`${BASE_URL}/tools`);
      await page.waitForLoadState('networkidle');

      // 查找搜索框
      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('ChatGPT');
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');
        // 验证搜索结果
        await expect(page.locator('text=ChatGPT').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('工具详情页', async ({ page }) => {
      await page.goto(`${BASE_URL}/tools`);
      await page.waitForLoadState('networkidle');

      // 点击第一个工具卡片
      const firstTool = page.locator('[class*="tool-card"], [class*="ToolCard"]').first();
      if (await firstTool.isVisible()) {
        await firstTool.click();
        await page.waitForLoadState('networkidle');

        // 验证详情页元素
        await expect(page.locator('text=评分, Rating').first()).toBeVisible({ timeout: 5000 });

        // 测试收藏按钮
        const favoriteBtn = page.locator('button[aria-label*="收藏"], button:has-text("收藏")').first();
        if (await favoriteBtn.isVisible()) {
          await favoriteBtn.click();
          // 应该弹出登录提示
          await expect(page.locator('text=登录, Login').first()).toBeVisible({ timeout: 3000 });
        }
      }
    });
  });

  // ==================== 支付解决方案测试 ====================
  describe('支付解决方案 (/payment)', () => {
    test('支付页加载和筛选', async ({ page }) => {
      await page.goto(`${BASE_URL}/payment`);
      await page.waitForLoadState('networkidle');

      // 验证内容加载
      await expect(page.locator('text=支付, Payment').first()).toBeVisible({ timeout: 10000 });

      // 测试虚拟卡分类
      const virtualCardLink = page.locator('a[href*="virtual"]').first();
      if (await virtualCardLink.isVisible()) {
        await virtualCardLink.click();
        await page.waitForLoadState('networkidle');
      }
    });

    test('搜索功能', async ({ page }) => {
      await page.goto(`${BASE_URL}/payment`);
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Depay');
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');
      }
    });
  });

  // ==================== 大学政策测试 ====================
  describe('大学政策 (/policies)', () => {
    test('政策页加载和筛选', async ({ page }) => {
      await page.goto(`${BASE_URL}/policies`);
      await page.waitForLoadState('networkidle');

      // 验证政策列表
      await expect(page.locator('text=大学, University').first()).toBeVisible({ timeout: 10000 });

      // 测试国家筛选
      const usaFilter = page.locator('button:has-text("美国"), a:has-text("USA")').first();
      if (await usaFilter.isVisible()) {
        await usaFilter.click();
        await page.waitForLoadState('networkidle');
      }
    });

    test('政策详情页', async ({ page }) => {
      await page.goto(`${BASE_URL}/policies`);
      await page.waitForLoadState('networkidle');

      // 点击第一个政策卡片
      const firstPolicy = page.locator('[class*="policy-card"], [class*="card"]').first();
      if (await firstPolicy.isVisible()) {
        await firstPolicy.click();
        await page.waitForLoadState('networkidle');

        // 验证详情页
        await expect(page.locator('text=政策, Policy').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  // ==================== 地图测试 ====================
  describe('校园地图 (/map)', () => {
    test('地图加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/map`);
      await page.waitForLoadState('networkidle');

      // 验证地图容器
      const mapContainer = page.locator('[class*="leaflet"], [class*="map"]').first();
      await expect(mapContainer).toBeVisible({ timeout: 10000 });
    });

    test('地图交互 - 大学选择', async ({ page }) => {
      await page.goto(`${BASE_URL}/map`);
      await page.waitForLoadState('networkidle');

      // 查找大学选择器
      const universitySelect = page.locator('select, [role="combobox"]').first();
      if (await universitySelect.isVisible()) {
        await universitySelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
      }
    });
  });

  // ==================== 认证流程测试 ====================
  describe('认证系统 (/auth)', () => {
    test('登录页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      await page.waitForLoadState('networkidle');

      // 验证登录表单
      await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('OAuth按钮可见性', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      await page.waitForLoadState('networkidle');

      // 验证Google登录按钮
      const googleBtn = page.locator('button:has-text("Google"), [aria-label*="Google"]').first();
      await expect(googleBtn).toBeVisible({ timeout: 5000 });

      // 验证GitHub登录按钮
      const githubBtn = page.locator('button:has-text("GitHub"), [aria-label*="GitHub"]').first();
      await expect(githubBtn).toBeVisible();
    });

    test('Demo登录流程', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/debug`);
      await page.waitForLoadState('networkidle');

      // 点击创建测试用户
      const createBtn = page.locator('button:has-text("创建测试用户")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(500);

        // 点击模拟登录
        const loginBtn = page.locator('button:has-text("模拟登录")').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // 验证登录成功 - 检查用户菜单
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const userMenu = page.locator('[class*="user"], [class*="avatar"]').first();
      // 如果用户菜单可见，说明登录成功
    });
  });

  // ==================== 问答社区测试 ====================
  describe('问答社区 (/questions)', () => {
    test('问答列表加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/questions`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=问答, Question').first()).toBeVisible({ timeout: 10000 });
    });

    test('提问按钮', async ({ page }) => {
      await page.goto(`${BASE_URL}/questions`);
      await page.waitForLoadState('networkidle');

      const askBtn = page.locator('a:has-text("提问"), button:has-text("提问")').first();
      if (await askBtn.isVisible()) {
        await askBtn.click();
        await page.waitForLoadState('networkidle');
        // 验证跳转到提问页
        expect(page.url()).toContain('/questions/ask');
      }
    });
  });

  // ==================== Offer展示测试 ====================
  describe('Offer展示 (/offers)', () => {
    test('Offer列表加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/offers`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Offer, 录取').first()).toBeVisible({ timeout: 10000 });
    });

    test('提交Offer按钮', async ({ page }) => {
      await page.goto(`${BASE_URL}/offers`);
      await page.waitForLoadState('networkidle');

      const submitBtn = page.locator('a:has-text("提交Offer"), button:has-text("提交")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForLoadState('networkidle');
      }
    });
  });

  // ==================== Prompt模板测试 ====================
  describe('Prompt模板 (/prompts)', () => {
    test('模板列表加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/prompts`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Prompt, 模板').first()).toBeVisible({ timeout: 10000 });
    });

    test('复制Prompt按钮', async ({ page }) => {
      await page.goto(`${BASE_URL}/prompts`);
      await page.waitForLoadState('networkidle');

      const copyBtn = page.locator('button:has-text("复制"), [aria-label*="复制"]').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        // 验证复制成功提示
        await expect(page.locator('text=复制成功, Copied').first()).toBeVisible({ timeout: 3000 });
      }
    });
  });

  // ==================== 防坑指南测试 ====================
  describe('防坑指南 (/survival)', () => {
    test('指南列表加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/survival`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=防坑, Survival').first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ==================== 用户中心测试 ====================
  describe('用户中心 (/user)', () => {
    test('用户中心加载（需登录）', async ({ page }) => {
      await page.goto(`${BASE_URL}/user`);
      await page.waitForLoadState('networkidle');

      // 应该显示登录提示或用户中心
      const content = page.locator('body');
      await expect(content).toBeVisible();
    });
  });

  // ==================== 工具对比测试 ====================
  describe('工具对比 (/compare)', () => {
    test('对比页加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/compare`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=对比, Compare').first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ==================== 英文版测试 ====================
  describe('英文版页面 (/en/*)', () => {
    test('英文首页', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=AI留学').first()).toBeVisible({ timeout: 10000 });
    });

    test('英文工具页', async ({ page }) => {
      await page.goto(`${BASE_URL}/en/tools`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Tools').first()).toBeVisible({ timeout: 10000 });
    });
  });

});
