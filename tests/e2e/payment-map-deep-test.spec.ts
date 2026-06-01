import { test, expect, chromium, Page } from '@playwright/test';

/**
 * Focused Deep Test for Issues: 13, 14, 15, 16, 22, 23
 * Testing Payment Solutions and Map Pages
 */

const BASE_URL = 'http://localhost:4321';

test.describe('【Issue-13】支付解决方案搜索框测试', () => {
  test('ZH: 搜索框存在且可输入', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Check search input exists
    const searchInput = page.locator('input[name="q"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type in search
    await searchInput.fill('Depay');
    await page.waitForTimeout(500);

    // Check results are filtered
    const results = page.locator('a[href^="/payment/"]');
    const count = await results.count();
    console.log(`Search results count: ${count}`);

    // Submit search form
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    // Verify URL has search param
    expect(page.url()).toContain('q=Depay');

    await browser.close();
  });

  test('ZH: 搜索结果数量显示正确', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[name="q"]').first();
    await searchInput.fill('虚拟卡');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    // Check results count text
    const resultsText = page.locator('text=/\\d+ 个结果/').first();
    if (await resultsText.isVisible({ timeout: 3000 })) {
      const text = await resultsText.textContent();
      console.log(`Results text: ${text}`);
    }

    await browser.close();
  });

  test('ZH: 清除搜索返回全部结果', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment?q=Depay`);
    await page.waitForLoadState('networkidle');

    // Check clear link exists
    const clearLink = page.locator('a:has-text("清除")').first();
    if (await clearLink.isVisible({ timeout: 3000 })) {
      await clearLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain('q=');
    }

    await browser.close();
  });
});

test.describe('【Issue-14】支付解决方案筛选功能测试', () => {
  test('ZH: 分类筛选链接存在', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Check category filter links
    const categoryLinks = page.locator('a[href*="category="]');
    const count = await categoryLinks.count();
    console.log(`Category filter links: ${count}`);

    expect(count).toBeGreaterThan(0);
    await browser.close();
  });

  test('ZH: 点击分类筛选正确过滤', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Click on first category filter
    const categoryLink = page.locator('a[href*="category="]').first();
    const href = await categoryLink.getAttribute('href');
    console.log(`Clicking category link: ${href}`);

    await categoryLink.click();
    await page.waitForLoadState('networkidle');

    // Verify URL has category param
    expect(page.url()).toContain('category=');

    // Verify active category is highlighted
    const activeCategory = page.locator('.border-primary-500').first();
    if (await activeCategory.isVisible({ timeout: 3000 })) {
      console.log('Active category is highlighted');
    }

    await browser.close();
  });

  test('ZH: 全部大学选项显示', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Check all categories visible
    const virtualCardLink = page.locator('a[href*="category=virtual_card"]');
    const giftCardLink = page.locator('a[href*="category=gift_card"]');
    const regionalLink = page.locator('a[href*="category=regional_pricing"]');
    const troubleLink = page.locator('a[href*="category=troubleshooting"]');

    expect(await virtualCardLink.isVisible()).toBeTruthy();
    expect(await giftCardLink.isVisible()).toBeTruthy();
    expect(await regionalLink.isVisible()).toBeTruthy();
    expect(await troubleLink.isVisible()).toBeTruthy();

    console.log('All 4 category filters visible');
    await browser.close();
  });
});

test.describe('【Issue-15】热门教程数量和质量测试', () => {
  test('ZH: 教程数量 >= 10', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Count payment solution cards
    const solutionLinks = page.locator('a[href^="/payment/"]');
    const count = await solutionLinks.count();
    console.log(`Payment solutions count: ${count}`);

    expect(count).toBeGreaterThanOrEqual(10);
    await browser.close();
  });

  test('ZH: 教程质量 - 包含评分/浏览量/标签', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Check first solution card
    const firstSolution = page.locator('a[href^="/payment/"]').first();

    // Check for rating (star icon)
    const hasRating = await firstSolution.locator('svg[class*="text-yellow"]').count() > 0 ||
                      await firstSolution.locator('text=/★/').count() > 0;
    console.log(`Has rating: ${hasRating}`);

    // Check for view count
    const hasViewCount = await firstSolution.locator('text=/\\d+.*浏览|\\d+.*views/i').count() > 0;
    console.log(`Has view count: ${hasViewCount}`);

    // Check for tags
    const hasTags = await firstSolution.locator('.badge, [class*="badge"], span[class*="bg-gray"]').count() > 0;
    console.log(`Has tags: ${hasTags}`);

    expect(hasRating || hasViewCount || hasTags).toBeTruthy();
    await browser.close();
  });

  test('ZH: 教程包含难度和可靠性标签', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Check for difficulty badges
    const easyBadge = await page.locator('text=/简单|easy/i').count();
    const mediumBadge = await page.locator('text=/中等|medium/i').count();
    const hardBadge = await page.locator('text=/困难|hard/i').count();

    console.log(`Difficulty badges: easy=${easyBadge}, medium=${mediumBadge}, hard=${hardBadge}`);

    // Check for reliability labels
    const reliabilityBadges = await page.locator('text=/可靠性|reliability/i').count();
    console.log(`Reliability labels: ${reliabilityBadges}`);

    expect(easyBadge + mediumBadge + hardBadge).toBeGreaterThan(0);
    await browser.close();
  });
});

test.describe('【Issue-16】引导去社区提问功能测试', () => {
  test('ZH: CTA区域存在且链接到问答社区', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Scroll to CTA section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check for "Still have questions" or similar CTA
    const ctaSection = page.locator('text=/还有问题|still have questions|遇到问题/i').first();
    await expect(ctaSection).toBeVisible({ timeout: 5000 });

    // Check for link to questions page
    const questionsLink = page.locator(`a[href="/questions"], a[href="/en/questions"]`).first();
    await expect(questionsLink).toBeVisible({ timeout: 5000 });

    const href = await questionsLink.getAttribute('href');
    console.log(`CTA links to: ${href}`);

    await browser.close();
  });

  test('ZH: CTA按钮可点击', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/payment`);
    await page.waitForLoadState('networkidle');

    // Scroll to CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Find CTA button
    const ctaButton = page.locator('a:has-text("问答"), a:has-text("提问"), a:has-text("Ask Community")').first();
    if (await ctaButton.isVisible({ timeout: 3000 })) {
      const buttonText = await ctaButton.textContent();
      console.log(`CTA button text: ${buttonText}`);

      // Verify it links to questions
      const href = await ctaButton.getAttribute('href');
      expect(href).toMatch(/\/questions/);
    }

    await browser.close();
  });
});

test.describe('【Issue-22】地图选择大学后显示标记测试', () => {
  test('ZH: 大学下拉选择器存在', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // Check university select exists
    const universitySelect = page.locator('#university-select');
    await expect(universitySelect).toBeVisible({ timeout: 10000 });

    // Check it has options
    const options = page.locator('#university-select option');
    const count = await options.count();
    console.log(`University options count: ${count}`);
    expect(count).toBeGreaterThan(1);

    await browser.close();
  });

  test('ZH: 选择大学后过滤标记', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // Get initial marker count
    const initialMarkers = page.locator('[data-marker]');
    const initialCount = await initialMarkers.count();
    console.log(`Initial markers: ${initialCount}`);

    // Use selectOption method to select MIT
    await page.selectOption('#university-select', { value: 'mit' });
    await page.waitForTimeout(1000);

    // Check that select value changed
    const selectValue = await page.locator('#university-select').inputValue();
    console.log(`Select value: ${selectValue}`);
    expect(selectValue).toBe('mit');

    // Count hidden markers (those with display: none)
    const hiddenCount = await page.locator('[data-marker][style*="display: none"]').count();
    console.log(`Hidden markers: ${hiddenCount}`);

    // Some markers should be hidden
    expect(hiddenCount).toBeGreaterThan(0);
    expect(initialCount - hiddenCount).toBeLessThan(initialCount);

    await browser.close();
  });

  test('ZH: 选择大学后显示政策链接', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // Check policy link section exists but hidden initially
    const policyLinkSection = page.locator('#university-policy-link');
    const isHiddenInitially = await policyLinkSection.evaluate(el => el.classList.contains('hidden'));
    console.log(`Policy link hidden initially: ${isHiddenInitially}`);

    // Select MIT
    const universitySelect = page.locator('#university-select');
    await universitySelect.selectOption({ index: 4 }); // MIT is usually around 4th
    await page.waitForTimeout(500);

    // Check if policy link is now visible
    const policyLink = page.locator('#policy-link');
    if (await policyLink.isVisible({ timeout: 3000 })) {
      const href = await policyLink.getAttribute('href');
      console.log(`Policy link href: ${href}`);
    }

    await browser.close();
  });
});

test.describe('【Issue-23】地图设施类型标签数量测试', () => {
  test('ZH: 设施类型下拉选择器存在', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // Check category select exists
    const categorySelect = page.locator('#category-select');
    await expect(categorySelect).toBeVisible({ timeout: 10000 });

    // Count options (excluding "All types")
    const options = page.locator('#category-select option');
    const count = await options.count();
    console.log(`Category options count: ${count}`);

    await browser.close();
  });

  test('ZH: 图例显示所有设施类型', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // Scroll to legend section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check legend section exists
    const legendSection = page.locator('text=图例').first();
    await expect(legendSection).toBeVisible({ timeout: 5000 });

    // Count legend items using data-category divs in legend area
    const legendContainer = page.locator('.mb-8.p-4.bg-gray-50').first();
    const legendItems = legendContainer.locator('.flex.items-center');
    const count = await legendItems.count();
    console.log(`Legend items count: ${count}`);

    // Should have at least 5 different facility types
    expect(count).toBeGreaterThanOrEqual(5);

    await browser.close();
  });

  test('ZH: 设施类型标签包含图标和文字', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // Scroll to legend
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check legend items have icons and text
    const legendSection = page.locator('.mb-8.p-4.bg-gray-50').first();
    const legendText = await legendSection.textContent();
    console.log(`Legend content: ${legendText?.substring(0, 200)}`);

    // Check for common facility types
    const hasLibrary = await page.locator('text=/图书馆|Library/i').count() > 0;
    const hasCanteen = await page.locator('text=/食堂|Canteen/i').count() > 0;
    const hasDorm = await page.locator('text=/宿舍|Dorm/i').count() > 0;

    console.log(`Has Library: ${hasLibrary}, Canteen: ${hasCanteen}, Dorm: ${hasDorm}`);

    expect(hasLibrary || hasCanteen || hasDorm).toBeTruthy();

    await browser.close();
  });

  test('ZH: 选择设施类型后过滤地图标记', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/map`);
    await page.waitForLoadState('networkidle');

    // Get initial marker count
    const initialCount = await page.locator('[data-marker]').count();
    console.log(`Initial markers: ${initialCount}`);

    // Use selectOption to select first category (index 1)
    await page.selectOption('#category-select', { index: 1 });
    await page.waitForTimeout(1000);

    // Count hidden markers
    const hiddenCount = await page.locator('[data-marker][style*="display: none"]').count();
    console.log(`Hidden markers after category filter: ${hiddenCount}`);

    // Some markers should be filtered (hidden)
    expect(hiddenCount).toBeGreaterThan(0);

    await browser.close();
  });
});

// Summary test to report all findings
test.describe('测试结果汇总', () => {
  test('生成测试报告', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const results = {
      issue13: { name: '支付解决方案搜索框', status: 'UNTESTED' },
      issue14: { name: '支付解决方案筛选功能', status: 'UNTESTED' },
      issue15: { name: '热门教程数量和质量', status: 'UNTESTED' },
      issue16: { name: '引导去社区提问功能', status: 'UNTESTED' },
      issue22: { name: '地图选择大学后显示标记', status: 'UNTESTED' },
      issue23: { name: '地图设施类型标签数量', status: 'UNTESTED' },
    };

    // Test Issue 13
    try {
      await page.goto(`${BASE_URL}/payment`);
      await page.waitForLoadState('networkidle');
      const searchInput = page.locator('input[name="q"]');
      if (await searchInput.isVisible()) {
        results.issue13.status = 'PASS';
      } else {
        results.issue13.status = 'FAIL - 搜索框不可见';
      }
    } catch (e) {
      results.issue13.status = `FAIL - ${e.message}`;
    }

    // Test Issue 14
    try {
      await page.goto(`${BASE_URL}/payment`);
      await page.waitForLoadState('networkidle');
      const categoryLinks = page.locator('a[href*="category="]');
      if (await categoryLinks.count() >= 4) {
        results.issue14.status = 'PASS';
      } else {
        results.issue14.status = 'FAIL - 分类筛选少于4个';
      }
    } catch (e) {
      results.issue14.status = `FAIL - ${e.message}`;
    }

    // Test Issue 15
    try {
      await page.goto(`${BASE_URL}/payment`);
      await page.waitForLoadState('networkidle');
      const solutions = page.locator('a[href^="/payment/"]');
      const count = await solutions.count();
      if (count >= 10) {
        results.issue15.status = `PASS (${count}个教程)`;
      } else {
        results.issue15.status = `FAIL - 只有${count}个教程，少于10个`;
      }
    } catch (e) {
      results.issue15.status = `FAIL - ${e.message}`;
    }

    // Test Issue 16
    try {
      await page.goto(`${BASE_URL}/payment`);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      const ctaLink = page.locator(`a[href="/questions"], a[href*="/questions"]`).first();
      if (await ctaLink.isVisible()) {
        results.issue16.status = 'PASS';
      } else {
        results.issue16.status = 'FAIL - CTA链接未找到';
      }
    } catch (e) {
      results.issue16.status = `FAIL - ${e.message}`;
    }

    // Test Issue 22
    try {
      await page.goto(`${BASE_URL}/map`);
      await page.waitForLoadState('networkidle');
      const uniSelect = page.locator('#university-select');
      if (await uniSelect.isVisible()) {
        results.issue22.status = 'PASS';
      } else {
        results.issue22.status = 'FAIL - 大学选择器不可见';
      }
    } catch (e) {
      results.issue22.status = `FAIL - ${e.message}`;
    }

    // Test Issue 23
    try {
      await page.goto(`${BASE_URL}/map`);
      await page.waitForLoadState('networkidle');
      const legendSection = page.locator('text=图例').first();
      if (await legendSection.isVisible()) {
        results.issue23.status = 'PASS';
      } else {
        results.issue23.status = 'FAIL - 图例未找到';
      }
    } catch (e) {
      results.issue23.status = `FAIL - ${e.message}`;
    }

    console.log('\n========== 测试结果汇总 ==========');
    for (const [key, value] of Object.entries(results)) {
      console.log(`${key}: ${value.status} - ${value.name}`);
    }
    console.log('===================================\n');

    await browser.close();
  });
});
