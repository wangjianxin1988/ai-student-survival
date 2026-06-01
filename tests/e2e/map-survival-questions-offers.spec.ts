import { test, expect, chromium, Page, Browser } from '@playwright/test';

/**
 * E2E Deep Testing for: Map, Survival, Questions, Offers
 * Target: http://localhost:4322
 */

const BASE = 'http://localhost:4322';

// ──────────────────────────────────────────────
// SHARED HELPERS
// ──────────────────────────────────────────────
async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `D:/suoyouxiangmu/ai-student-survival/test-results/${name}.png`, fullPage: true });
}

async function countVisible(page: Page, selector: string): Promise<number> {
  let c = 0;
  for (const el of await page.locator(selector).all()) {
    if (await el.isVisible()) c++;
  }
  return c;
}

// ──────────────────────────────────────────────
// MODULE 1: 校园地图 (/map)
// ──────────────────────────────────────────────
test.describe('【地图模块】校园地图深度测试', () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('M1-T1: 地图页面加载', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(`Map page title: ${title}`);

    const body = await page.locator('body').textContent();
    const loaded = !!(body?.includes('地图') || body?.includes('Map') || body?.includes('campus'));
    console.log(`Map page loaded: ${loaded}`);
    expect(loaded).toBeTruthy();

    await screenshot(page, 'map-page-load');
    await page.close();
  });

  test('M1-T2: 地图标记显示测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for Leaflet map container
    const mapContainer = page.locator('#map, [id*="map"], .leaflet-container');
    const mapExists = await mapContainer.count() > 0;
    console.log(`Map container found: ${mapExists}, count: ${await mapContainer.count()}`);

    // Check for any markers on the map (Leaflet uses specific class names)
    const markers = await page.locator('.leaflet-marker-icon, .marker, [data-marker], .custom-marker').all();
    const markerCount = markers.length;
    console.log(`Map markers found: ${markerCount}`);

    // Check for popup elements
    const popups = await page.locator('.leaflet-popup').all();
    console.log(`Popups found: ${popups.length}`);

    // Take screenshot of map
    await screenshot(page, 'map-markers');

    if (markerCount === 0) {
      console.log('WARNING: No markers found on map');
    }

    await page.close();
  });

  test('M1-T3: 地图标记点击弹窗测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Try to find and click a marker
    const marker = page.locator('.leaflet-marker-icon, .marker, [data-marker], .custom-marker').first();
    const markerExists = await marker.count() > 0;
    console.log(`Marker element exists: ${markerExists}`);

    if (markerExists) {
      await marker.click({ force: true });
      await page.waitForTimeout(1500);

      // Check if popup appeared
      const popupVisible = await page.locator('.leaflet-popup, .leaflet-popup-content, [class*="popup"]').first().isVisible().catch(() => false);
      console.log(`Popup visible after click: ${popupVisible}`);

      // Check for popup content
      const popupContent = await page.locator('.leaflet-popup-content').textContent().catch(() => '');
      console.log(`Popup content: ${popupContent?.substring(0, 100) || 'empty'}`);

      await screenshot(page, 'map-marker-click-popup');
    } else {
      console.log('No markers to click - map may not have markers or uses different selector');
      await screenshot(page, 'map-no-markers');
    }

    await page.close();
  });

  test('M1-T4: 大学下拉筛选功能', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for university select
    const uniSelect = page.locator('#university-select, select[name*="university"], select').first();
    const selectExists = await uniSelect.count() > 0;
    console.log(`University select exists: ${selectExists}`);

    if (selectExists) {
      const options = await uniSelect.locator('option').all();
      const optionCount = options.length;
      console.log(`University select options: ${optionCount}`);

      if (optionCount > 1) {
        // Get first option value
        const firstValue = await options[0].getAttribute('value');
        console.log(`First option value: ${firstValue}`);

        // Select second option (first non-"all" option)
        if (optionCount > 1) {
          await uniSelect.selectOption({ index: 1 });
          await page.waitForTimeout(1000);
          const selectedValue = await uniSelect.inputValue();
          console.log(`Selected university: ${selectedValue}`);
        }
      }

      await screenshot(page, 'map-university-select');
    } else {
      console.log('No university select found - may use different UI');
    }

    await page.close();
  });

  test('M1-T5: 设施类型筛选功能', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for category/type select
    const catSelect = page.locator('#category-select, select[name*="category"], select[name*="type"]').first();
    const catExists = await catSelect.count() > 0;
    console.log(`Category select exists: ${catExists}`);

    if (catExists) {
      const options = await catSelect.locator('option').all();
      console.log(`Category options: ${options.length}`);

      // Select each type and check
      for (let i = 1; i < Math.min(options.length, 4); i++) {
        await catSelect.selectOption({ index: i });
        await page.waitForTimeout(500);
        const val = await catSelect.inputValue();
        console.log(`Selected category[${i}]: ${val}`);
      }
    } else {
      // Check for filter buttons/pills
      const filterPills = await page.locator('[class*="filter"], button:has-text("图书馆"), button:has-text("食堂")').all();
      console.log(`Filter pills/buttons found: ${filterPills.length}`);

      if (filterPills.length > 0) {
        await filterPills[0].click();
        await page.waitForTimeout(500);
        console.log('Clicked first filter');
      }
    }

    await screenshot(page, 'map-category-filter');
    await page.close();
  });

  test('M1-T6: 图例显示测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Scroll to bottom to find legend
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const legendSection = page.locator('text=/图例|Legend/i').first();
    const legendVisible = await legendSection.isVisible().catch(() => false);
    console.log(`Legend section visible: ${legendVisible}`);

    if (legendVisible) {
      const legendItems = await page.locator('.flex.items-center, [class*="legend"] [class*="flex"]').all();
      console.log(`Legend items: ${legendItems.length}`);
    }

    await screenshot(page, 'map-legend');
    await page.close();
  });
});

// ──────────────────────────────────────────────
// MODULE 2: 防坑指南 (/survival)
// ──────────────────────────────────────────────
test.describe('【防坑指南模块】survival页面深度测试', () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('M2-T1: 防坑指南页面加载', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/survival`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const body = await page.locator('body').textContent();
    const loaded = !!(body?.includes('指南') || body?.includes('Survival') ||
                     body?.includes('防坑') || body?.includes('生存'));
    console.log(`Survival page loaded: ${loaded}`);
    expect(loaded).toBeTruthy();

    await screenshot(page, 'survival-page-load');
    await page.close();
  });

  test('M2-T2: 指南列表显示测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/survival`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find guide cards/list items
    const cards = await page.locator('a[href*="/survival/"], [class*="card"], article').all();
    const cardCount = cards.length;
    console.log(`Guide cards found: ${cardCount}`);

    // Check for grid/list layout
    const gridItems = await page.locator('[class*="grid"] > div, [class*="grid"] > a').all();
    console.log(`Grid items: ${gridItems.length}`);

    // Get first card text
    if (cards.length > 0) {
      const firstText = await cards[0].textContent();
      console.log(`First card text: ${firstText?.substring(0, 100)}`);
    }

    expect(cardCount).toBeGreaterThan(0);
    await screenshot(page, 'survival-guide-list');
    await page.close();
  });

  test('M2-T3: 指南详情页测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/survival`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click first guide link
    const firstGuide = page.locator('a[href*="/survival/"]').first();
    const href = await firstGuide.getAttribute('href').catch(() => null);
    console.log(`First guide href: ${href}`);

    if (href && href !== '#') {
      await firstGuide.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const detailUrl = page.url();
      console.log(`Detail page URL: ${detailUrl}`);

      const body = await page.locator('body').textContent();
      const hasContent = !!(body && body.length > 100);
      console.log(`Detail page has content: ${hasContent}, length: ${body?.length}`);

      await screenshot(page, 'survival-guide-detail');
    } else {
      console.log('No guide links found to click');
    }

    await page.close();
  });

  test('M2-T4: 指南筛选/分类功能', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/survival`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for filter UI
    const filterLinks = await page.locator('a[href*="category="], a[href*="tag="]').all();
    const filterCount = filterLinks.length;
    console.log(`Filter links: ${filterCount}`);

    // Check for category buttons
    const categoryBtns = await page.locator('button, [role="button"]').all();
    console.log(`Button elements: ${categoryBtns.length}`);

    // Try clicking a category filter if exists
    if (filterLinks.length > 0) {
      const firstFilterHref = await filterLinks[0].getAttribute('href');
      console.log(`First filter: ${firstFilterHref}`);

      await filterLinks[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`URL after filter: ${currentUrl}`);
    }

    await screenshot(page, 'survival-guide-filter');
    await page.close();
  });
});

// ──────────────────────────────────────────────
// MODULE 3: 问答社区 (/questions)
// ──────────────────────────────────────────────
test.describe('【问答社区模块】questions页面深度测试', () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('M3-T1: 问答页面加载', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const body = await page.locator('body').textContent();
    const loaded = !!(body?.includes('问答') || body?.includes('Question') ||
                     body?.includes('问题') || body?.includes('社区'));
    console.log(`Questions page loaded: ${loaded}`);
    expect(loaded).toBeTruthy();

    await screenshot(page, 'questions-page-load');
    await page.close();
  });

  test('M3-T2: 问题列表显示测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find question items
    const questions = await page.locator('a[href*="/questions/q-"], [class*="question"]').all();
    const qCount = questions.length;
    console.log(`Question items found: ${qCount}`);

    if (qCount > 0) {
      const firstQ = await questions[0].textContent();
      console.log(`First question: ${firstQ?.substring(0, 80)}`);
    }

    await screenshot(page, 'questions-list');
    await page.close();
  });

  test('M3-T3: 发布问题按钮测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find ask button
    const askBtn = page.locator('a:has-text("提问"), a:has-text("发布"), button:has-text("提问"), button:has-text("发布")').first();
    const btnExists = await askBtn.count() > 0;
    console.log(`Ask button exists: ${btnExists}`);

    if (btnExists) {
      const btnText = await askBtn.textContent();
      console.log(`Ask button text: ${btnText}`);
      const btnHref = await askBtn.getAttribute('href').catch(() => 'no href (button)');
      console.log(`Ask button href: ${btnHref}`);
    }

    await screenshot(page, 'questions-ask-button');
    await page.close();
  });

  test('M3-T4: 问题详情页与回复功能', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find first question link
    const qLink = page.locator('a[href*="/questions/q-"]').first();
    const qHref = await qLink.getAttribute('href').catch(() => null);
    console.log(`First question link: ${qHref}`);

    if (qHref && qHref !== '#') {
      await qLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const detailUrl = page.url();
      console.log(`Question detail URL: ${detailUrl}`);

      // Check for reply form
      const replyForm = page.locator('textarea, [placeholder*="回复"], [placeholder*="comment"]').first();
      const formExists = await replyForm.count() > 0;
      console.log(`Reply form exists: ${formExists}`);

      if (formExists) {
        const placeholder = await replyForm.getAttribute('placeholder').catch(() => '');
        console.log(`Reply form placeholder: ${placeholder}`);
      }

      // Check for existing answers
      const answers = await page.locator('[class*="answer"], [class*="reply"]').all();
      console.log(`Answers/replies found: ${answers.length}`);

      await screenshot(page, 'questions-detail-reply');
    } else {
      console.log('No question links found - may be empty state');
      await screenshot(page, 'questions-empty-state');
    }

    await page.close();
  });

  test('M3-T5: 问答分类筛选', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for category filter links
    const catLinks = await page.locator('a[href*="/questions?category="], a[href*="/questions?tag="]').all();
    console.log(`Category filter links: ${catLinks.length}`);

    // Check for tab-style category buttons
    const tabs = await page.locator('[role="tab"], .tab, button:has-text("学业"), button:has-text("签证")').all();
    console.log(`Category tabs found: ${tabs.length}`);

    if (tabs.length > 0) {
      const firstTab = await tabs[0].textContent();
      console.log(`First tab: ${firstTab}`);
      await tabs[0].click();
      await page.waitForTimeout(500);
    }

    await screenshot(page, 'questions-category-filter');
    await page.close();
  });
});

// ──────────────────────────────────────────────
// MODULE 4: Offers展示 (/offers)
// ──────────────────────────────────────────────
test.describe('【Offers模块】offers页面深度测试', () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('M4-T1: Offers页面加载', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/offers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const body = await page.locator('body').textContent();
    const loaded = !!(body?.includes('Offer') || body?.includes('录取') ||
                     body?.includes('Stanford') || body?.includes('University'));
    console.log(`Offers page loaded: ${loaded}`);
    expect(loaded).toBeTruthy();

    await screenshot(page, 'offers-page-load');
    await page.close();
  });

  test('M4-T2: Offer卡片列表显示', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/offers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find offer cards
    const offerCards = await page.locator('a[href*="/offers/offer-"], [class*="card"]').all();
    const cardCount = offerCards.length;
    console.log(`Offer cards found: ${cardCount}`);

    // Check for grid layout
    const gridCards = await page.locator('[class*="grid"] > div, [class*="grid"] > a').all();
    console.log(`Grid layout cards: ${gridCards.length}`);

    if (offerCards.length > 0) {
      const firstCard = await offerCards[0].textContent();
      console.log(`First offer card: ${firstCard?.substring(0, 100)}`);
    }

    expect(cardCount).toBeGreaterThan(0);
    await screenshot(page, 'offers-card-list');
    await page.close();
  });

  test('M4-T3: Offer详情页测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/offers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find first offer link
    const offerLink = page.locator('a[href*="/offers/offer-"]').first();
    const href = await offerLink.getAttribute('href').catch(() => null);
    console.log(`First offer link: ${href}`);

    if (href && href !== '#') {
      await offerLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const detailUrl = page.url();
      console.log(`Offer detail URL: ${detailUrl}`);

      const body = await page.locator('body').textContent();

      // Check key info elements
      const checks = {
        university: body?.includes('University') || body?.includes('大学'),
        program: body?.includes('MS') || body?.includes('Master') || body?.includes('硕士'),
        result: body?.includes('admitted') || body?.includes('录取') || body?.includes('offer'),
        scholarship: body?.includes('奖学金') || body?.includes('USD') || body?.includes('$'),
      };
      console.log('Shareable info checks:', checks);

      // Check for related offers
      const relatedLinks = await page.locator('a[href*="/offers/"]').all();
      console.log(`Related offer links: ${relatedLinks.length}`);

      await screenshot(page, 'offers-detail-page');
    } else {
      console.log('No offer links found');
    }

    await page.close();
  });

  test('M4-T4: Offer筛选功能', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/offers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for filter dropdowns
    const selects = await page.locator('select').all();
    console.log(`Select dropdowns: ${selects.length}`);

    for (let i = 0; i < selects.length; i++) {
      const options = await selects[i].locator('option').all();
      console.log(`Select[${i}] options: ${options.length}`);
    }

    // Check for filter buttons
    const filterBtns = await page.locator('a[href*="filter"], button:has-text("筛选")').all();
    console.log(`Filter buttons: ${filterBtns.length}`);

    // Try filter if dropdown exists
    if (selects.length > 0) {
      const firstSelect = selects[0];
      const opts = await firstSelect.locator('option').all();
      if (opts.length > 1) {
        await firstSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        const selected = await firstSelect.inputValue();
        console.log(`Filter selected: ${selected}`);
      }
    }

    await screenshot(page, 'offers-filter');
    await page.close();
  });

  test('M4-T5: Offer提交表单测试', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/offers/submit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check form fields
    const form = page.locator('form');
    const formExists = await form.count() > 0;
    console.log(`Submit form exists: ${formExists}`);

    if (formExists) {
      // Check for input fields
      const inputs = await page.locator('input, textarea').all();
      console.log(`Form inputs: ${inputs.length}`);

      // Check for submit button
      const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
      const submitExists = await submitBtn.count() > 0;
      console.log(`Submit button exists: ${submitExists}`);

      if (submitExists) {
        const btnText = await submitBtn.textContent().catch(() => '');
        console.log(`Submit button text: ${btnText}`);
      }
    } else {
      // Check for link to submit page
      const submitLink = page.locator('a:has-text("提交"), a:has-text("Submit"), a:has-text("分享Offer")').first();
      const linkExists = await submitLink.count() > 0;
      console.log(`Submit link exists: ${linkExists}`);
    }

    await screenshot(page, 'offers-submit-form');
    await page.close();
  });
});

// ──────────────────────────────────────────────
// COMPREHENSIVE SUMMARY
// ──────────────────────────────────────────────
test.describe('综合测试结果汇总', () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('生成综合测试报告', async () => {
    const page = await browser.newPage();
    const results: Record<string, { module: string; working_features: string[]; broken_features: string[] }> = {};

    const modules = [
      { name: 'map', url: '/map' },
      { name: 'survival', url: '/survival' },
      { name: 'questions', url: '/questions' },
      { name: 'offers', url: '/offers' },
    ];

    for (const mod of modules) {
      const working: string[] = [];
      const broken: string[] = [];

      try {
        await page.goto(`${BASE}${mod.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const body = await page.locator('body').textContent() || '';
        const hasContent = body.length > 50;

        if (hasContent) {
          working.push('Page loads with content');
        } else {
          broken.push('Page empty or not loading');
        }

        // Module-specific checks
        if (mod.name === 'map') {
          const mapContainer = await page.locator('#map, [id*="map"], .leaflet-container').count();
          const markers = await page.locator('.leaflet-marker-icon, .marker, [data-marker]').count();
          const uniSelect = await page.locator('#university-select, select').count();

          if (mapContainer > 0) working.push('Map container renders');
          else broken.push('Map container missing');

          if (markers > 0) working.push(`Map markers display (${markers} found)`);
          else broken.push('No map markers visible');

          if (uniSelect > 0) working.push('University select filter exists');
          else broken.push('University filter missing');
        }

        if (mod.name === 'survival') {
          const cards = await page.locator('a[href*="/survival/"]').count();
          if (cards > 0) working.push(`Guide list displays (${cards} items)`);
          else broken.push('No guide cards found');
        }

        if (mod.name === 'questions') {
          const questions = await page.locator('a[href*="/questions/q-"]').count();
          const askBtn = await page.locator('a:has-text("提问"), button:has-text("提问")').count();
          if (questions > 0) working.push(`Question list displays (${questions} items)`);
          else broken.push('No question items found');
          if (askBtn > 0) working.push('Ask/Post button present');
          else broken.push('Ask button missing');
        }

        if (mod.name === 'offers') {
          const cards = await page.locator('a[href*="/offers/offer-"]').count();
          const selects = await page.locator('select').count();
          if (cards > 0) working.push(`Offer cards display (${cards} items)`);
          else broken.push('No offer cards found');
          if (selects > 0) working.push(`Filter dropdowns exist (${selects})`);
          else broken.push('No filter dropdowns');
        }

        // Take summary screenshot
        await page.screenshot({
          path: `D:/suoyouxiangmu/ai-student-survival/test-results/summary-${mod.name}.png`,
          fullPage: true,
        });

      } catch (err: unknown) {
        broken.push(`Error: ${(err as Error).message}`);
      }

      results[mod.name] = {
        module: mod.name,
        working_features: working,
        broken_features: broken,
      };

      console.log(`\n========== ${mod.name.toUpperCase()} RESULTS ==========`);
      console.log(`WORKING: ${working.join(', ')}`);
      console.log(`BROKEN: ${broken.join(', ')}`);
      console.log('=============================================\n');
    }

    // Print final JSON report
    const jsonReport = JSON.stringify(results, null, 2);
    console.log('\n========== FINAL JSON REPORT ==========');
    console.log(jsonReport);
    console.log('========================================\n');

    await page.close();
  });
});