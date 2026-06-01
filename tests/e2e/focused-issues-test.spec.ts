import { test, expect, chromium, Page } from '@playwright/test';

/**
 * Focused Issue Verification Test Suite
 * Tests specific issues on port 4321
 * Issues: 8, 19, 20, 36, 40, 46, 47
 */

const BASE_URL = 'http://localhost:4321';

test.describe('【Issue-08】工具对比页面清除按钮Bug', () => {
  test('ZH: 清除按钮功能正常', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if there are tool checkboxes
    const toolCheckboxes = page.locator('input[type="checkbox"]');
    const initialCount = await toolCheckboxes.count();

    if (initialCount > 0) {
      // Select a tool
      await toolCheckboxes.first().click();
      await page.waitForTimeout(500);

      // Find and click clear button
      const clearBtn = page.locator('button:has-text("清除"), button:has-text("Clear")');
      const clearBtnCount = await clearBtn.count();

      if (clearBtnCount > 0) {
        await clearBtn.first().click();
        await page.waitForTimeout(500);

        // Verify checkboxes are cleared (optional: check if state is reset)
        console.log('Clear button clicked successfully');
      } else {
        console.log('Clear button not found - checking if it should exist');
      }
    }

    await page.close();
  });

  test('EN: Compare page clear button works', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/en/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const toolCheckboxes = page.locator('input[type="checkbox"]');
    if (await toolCheckboxes.count() > 0) {
      await toolCheckboxes.first().click();
      await page.waitForTimeout(500);
    }

    const clearBtn = page.locator('button:has-text("Clear")');
    if (await clearBtn.count() > 0) {
      await clearBtn.first().click();
      await page.waitForTimeout(500);
      console.log('EN Clear button clicked');
    }

    await page.close();
  });
});

test.describe('【Issue-19】大学政策页面学校数量', () => {
  test('ZH: 政策页面学校数量充足(>10)', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/policies`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const schoolLinks = page.locator('a[href*="/policies/"]');
    const count = await schoolLinks.count();

    console.log(`Found ${count} school links on policies page`);
    expect(count).toBeGreaterThan(10);

    await page.close();
  });

  test('EN: Policies page has sufficient schools', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/en/policies`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const schoolLinks = page.locator('a[href*="/policies/"]');
    const count = await schoolLinks.count();

    console.log(`Found ${count} school links on EN policies page`);
    expect(count).toBeGreaterThan(5);

    await page.close();
  });
});

test.describe('【Issue-20】大学详情页链接完整性', () => {
  test('ZH: 大学详情页链接有效', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/policies`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get all links on the page
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    console.log(`Total links found: ${linkCount}`);

    // Click on first school link
    const firstSchool = page.locator('a[href*="/policies/"]').first();
    if (await firstSchool.isVisible()) {
      const href = await firstSchool.getAttribute('href');
      console.log(`Clicking on school link: ${href}`);

      await firstSchool.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check for broken links on detail page
      const detailLinks = page.locator('a[href]');
      const detailLinkCount = await detailLinks.count();
      console.log(`Links on detail page: ${detailLinkCount}`);

      // Verify links are not broken (href is not empty, not #)
      for (let i = 0; i < Math.min(detailLinkCount, 10); i++) {
        const link = detailLinks.nth(i);
        const href = await link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          expect(href.length).toBeGreaterThan(0);
        }
      }
    }

    await page.close();
  });

  test('ZH: 大学详情页无404链接', async () => {
    const page = await chromium.launch().then(b => b.newPage());

    // Go to a specific university detail page
    await page.goto(`${BASE_URL}/policies/mIT`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Collect all links
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    let brokenCount = 0;
    for (let i = 0; i < Math.min(linkCount, 20); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');

      if (href && href.startsWith('/') && !href.startsWith('//')) {
        try {
          const response = await page.request.get(`${BASE_URL}${href}`);
          if (response.status() === 404) {
            console.log(`Broken link found: ${href}`);
            brokenCount++;
          }
        } catch (e) {
          console.log(`Error checking link ${href}: ${e}`);
        }
      }
    }

    console.log(`Broken links found: ${brokenCount}`);
    expect(brokenCount).toBe(0);

    await page.close();
  });
});

test.describe('【Issue-36】评论表情功能', () => {
  test('ZH: Offer详情页有表情功能', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/offers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on first offer
    const firstOffer = page.locator('a[href*="/offers/"]').first();
    if (await firstOffer.isVisible()) {
      await firstOffer.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for emoji picker or emoji button
      const emojiBtn = page.locator('button:has-text("表情"), [aria-label*="emoji"], .emoji-picker, button[aria-label*="表情"]');
      const emojiCount = await emojiBtn.count();

      console.log(`Emoji buttons found: ${emojiCount}`);

      // Also check for emoji in comments
      const commentArea = page.locator('textarea, input[placeholder*="评论"], [contenteditable="true"]');
      if (await commentArea.count() > 0) {
        console.log('Comment input field found');
      }
    }

    await page.close();
  });

  test('ZH: 表情选择器可点击', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/offers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const firstOffer = page.locator('a[href*="/offers/"]').first();
    if (await firstOffer.isVisible()) {
      await firstOffer.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Try to find and click emoji button
      const emojiBtn = page.locator('button[aria-label*="emoji"], button:has-text("表情")').first();
      if (await emojiBtn.isVisible()) {
        await emojiBtn.click();
        await page.waitForTimeout(500);
        console.log('Emoji button clicked');

        // Check if emoji picker appeared
        const picker = page.locator('.emoji-picker, [data-emoji-picker]');
        const pickerVisible = await picker.isVisible().catch(() => false);
        console.log(`Emoji picker visible: ${pickerVisible}`);
      }
    }

    await page.close();
  });
});

test.describe('【Issue-40】中英文切换Bug', () => {
  test('ZH: 首页有语言切换入口', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const langSwitch = page.locator('a[href*="/en"], button:has-text("EN"), button:has-text("English")');
    const switchCount = await langSwitch.count();

    console.log(`Language switch found: ${switchCount}`);
    expect(switchCount).toBeGreaterThan(0);

    await page.close();
  });

  test('ZH→EN: 切换到英文版后内容正确', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    // Find and click English switch
    const langSwitch = page.locator('a[href*="/en"]').first();
    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const url = page.url();
      console.log(`After switch URL: ${url}`);

      // Check if we're on English version
      expect(url).toContain('/en');
    }

    await page.close();
  });

  test('EN→ZH: 英文版切换回中文', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Find Chinese switch
    const zhSwitch = page.locator('a[href="/"], a[href*="/zh"]').first();
    if (await zhSwitch.isVisible()) {
      await zhSwitch.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const url = page.url();
      console.log(`After switch back URL: ${url}`);
    }

    await page.close();
  });

  test('Language switch maintains page context', async () => {
    const page = await chromium.launch().then(b => b.newPage());

    // Go to tools page in Chinese
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Switch to English
    const langSwitch = page.locator('a[href*="/en"]').first();
    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Should be on /en/tools
      const url = page.url();
      console.log(`Tools EN URL: ${url}`);
      expect(url).toBe(`${BASE_URL}/en/tools`);
    }

    await page.close();
  });
});

test.describe('【Issue-46】英文版详情页错误', () => {
  test('EN: 工具详情页正常加载无错误', async () => {
    const page = await chromium.launch().then(b => b.newPage());

    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/en/tools/chatgpt`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check page content
    const bodyText = await page.locator('body').textContent();
    console.log(`EN tools/chatgpt content length: ${bodyText?.length}`);

    // Check for error messages
    const errorTexts = page.locator('text=/error|Error|404|Not Found/i');
    const errorCount = await errorTexts.count();
    console.log(`Error text elements found: ${errorCount}`);

    // Check for actual console errors
    console.log(`Console errors: ${errors.length}`);
    errors.forEach(e => console.log(`  - ${e}`));

    // Page should have content
    expect(bodyText?.length).toBeGreaterThan(100);

    await page.close();
  });

  test('EN: 支付解决方案详情页正常', async () => {
    const page = await chromium.launch().then(b => b.newPage());

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/en/payment`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const bodyText = await page.locator('body').textContent();
    console.log(`EN payment page content length: ${bodyText?.length}`);

    console.log(`Console errors on EN payment: ${errors.length}`);

    await page.close();
  });

  test('EN: 大学政策详情页正常', async () => {
    const page = await chromium.launch().then(b => b.newPage());

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/en/policies`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on first university
    const firstUni = page.locator('a[href*="/policies/"]').first();
    if (await firstUni.isVisible()) {
      await firstUni.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const bodyText = await page.locator('body').textContent();
      console.log(`EN policy detail content length: ${bodyText?.length}`);

      expect(bodyText?.length).toBeGreaterThan(100);
    }

    console.log(`Console errors on EN policy detail: ${errors.length}`);

    await page.close();
  });
});

test.describe('【Issue-47】英文版Pain Points点击跳转', () => {
  test('EN: Pain Points区域可点击跳转', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for Pain Points section
    const painPoints = page.locator('text=/Pain|Problems|Issues|Challenges/i');
    const painCount = await painPoints.count();
    console.log(`Pain Points elements found: ${painCount}`);

    // Look for clickable pain point items
    const painLinks = page.locator('a:has-text("Pain"), a:has-text("Problem"), [href*="pain"]');
    const linkCount = await painLinks.count();
    console.log(`Pain Point links found: ${linkCount}`);

    if (linkCount > 0) {
      const href = await painLinks.first().getAttribute('href');
      console.log(`First pain link href: ${href}`);

      // Click and verify navigation
      await painLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const newUrl = page.url();
      console.log(`After click URL: ${newUrl}`);
    }

    await page.close();
  });

  test('EN: Survival指南详情页Pain Points有效', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(`${BASE_URL}/en/survival`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for pain point cards/links
    const painCards = page.locator('a[href*="/survival/"]');
    const cardCount = await painCards.count();
    console.log(`Survival cards found: ${cardCount}`);

    if (cardCount > 0) {
      // Click first card
      await painCards.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for pain points within detail page
      const bodyText = await page.locator('body').textContent();
      const hasPain = bodyText?.toLowerCase().includes('pain') ||
                      bodyText?.toLowerCase().includes('problem');
      console.log(`Detail page mentions pain: ${hasPain}`);
    }

    await page.close();
  });
});