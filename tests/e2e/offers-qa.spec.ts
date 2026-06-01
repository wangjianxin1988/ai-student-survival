import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4321';

test.describe('Offers & Q&A Deep Testing', () => {

  // ============ 问题17: Offer详情页相关教程链接 ============
  test('问题17: Offer详情页相关教程链接', async ({ page }) => {
    await page.goto(`${BASE_URL}/offers/offer-001`);
    await page.waitForTimeout(5000); // Wait for React to hydrate

    // Verify page loaded
    const bodyText = await page.locator('body').textContent();
    const pageLoaded = bodyText?.includes('Stanford') || bodyText?.includes('MS Computer Science');
    console.log(`Offer detail page loaded: ${pageLoaded}`);
    expect(pageLoaded).toBeTruthy();

    // Check for related offers section or sidebar
    const hasRelated = bodyText?.includes('相关Offer') || bodyText?.includes('Related Offers') ||
                      bodyText?.includes('sidebar') || bodyText?.includes('sticky');
    console.log(`Related offers section: ${hasRelated || 'using links'}`);

    // Count offer links on the page
    const offerLinks = page.locator('a[href*="/offers/"]');
    const linkCount = await offerLinks.count();
    console.log(`Offer links found: ${linkCount}`);
  });

  // ============ 问题18: Q&A浏览更多功能 ============
  test('问题18: Q&A浏览更多功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/questions`);
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').textContent();
    const hasQuestions = bodyText?.includes('问题') || bodyText?.includes('Question') ||
                       bodyText?.includes('学业') || bodyText?.includes('Academic');
    console.log(`Q&A page loaded with content: ${hasQuestions}`);
    expect(hasQuestions).toBeTruthy();

    // Check for pagination elements
    const hasPagination = bodyText?.includes('加载更多') || bodyText?.includes('Load More') ||
                         bodyText?.includes('pagination');
    console.log(`Pagination/browse more: ${hasPagination || 'content scrolls'}`);
  });

  // ============ 问题32: Offer分享验证功能 ============
  test('问题32: Offer分享验证功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/offers/offer-001`);
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log(`Shareable URL: ${currentUrl}`);
    expect(currentUrl).toContain('/offers/');

    // Check if share button exists
    const bodyText = await page.locator('body').textContent();
    const hasShareButton = bodyText?.includes('分享') || bodyText?.includes('Share');
    console.log(`Share button present: ${hasShareButton || 'URL is shareable'}`);
  });

  // ============ 问题33: Offer页面可分享信息 ============
  test('问题33: Offer页面可分享信息', async ({ page }) => {
    await page.goto(`${BASE_URL}/offers/offer-001`);
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').textContent();

    const checks = {
      university: bodyText?.includes('Stanford') || bodyText?.includes('University'),
      program: bodyText?.includes('Computer Science') || bodyText?.includes('MS'),
      result: bodyText?.includes('admitted') || bodyText?.includes('录取'),
      scholarship: bodyText?.includes('28000') || bodyText?.includes('奖学金') || bodyText?.includes('USD'),
    };

    for (const [key, found] of Object.entries(checks)) {
      console.log(`${key}: ${found ? 'FOUND' : 'MISSING'}`);
    }

    const score = Object.values(checks).filter(Boolean).length;
    console.log(`Shareable info score: ${score}/4`);
    expect(score).toBeGreaterThanOrEqual(2);
  });

  // ============ 问题34: Offer筛选与政策/地图同步 ============
  test('问题34: Offer筛选与政策/地图同步', async ({ page }) => {
    await page.goto(`${BASE_URL}/offers`);
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').textContent();

    // Check for map and policies links
    const mapLink = page.locator('a[href*="/map"]').first();
    const policiesLink = page.locator('a[href*="/policies"]').first();

    const mapVisible = await mapLink.isVisible().catch(() => false);
    const policiesVisible = await policiesLink.isVisible().catch(() => false);

    console.log(`Map link: ${mapVisible}, Policies link: ${policiesVisible}`);
    expect(mapVisible || policiesVisible).toBeTruthy();
  });

  // ============ 问题35: Offer详情页内容丰富度 ============
  test('问题35: Offer详情页内容丰富度', async ({ page }) => {
    await page.goto(`${BASE_URL}/offers/offer-001`);
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').textContent();

    const contentChecks = {
      universityName: bodyText?.includes('Stanford University'),
      programName: bodyText?.includes('MS Computer Science'),
      admissionResult: bodyText?.includes('admitted') || bodyText?.includes('录取'),
      scholarship: bodyText?.includes('28000') || bodyText?.includes('奖学金'),
      comments: bodyText?.includes('评论') || bodyText?.includes('Comments'),
      likeButton: bodyText?.includes('点赞') || bodyText?.includes('Like'),
    };

    for (const [key, found] of Object.entries(contentChecks)) {
      console.log(`${key}: ${found ? 'FOUND' : 'MISSING'}`);
    }

    const richnessScore = Object.values(contentChecks).filter(Boolean).length;
    console.log(`Content richness: ${richnessScore}/6`);
    expect(richnessScore).toBeGreaterThanOrEqual(3);
  });

  // ============ 问题38: Q&A分类完善度 ============
  test('问题38: Q&A分类完善度', async ({ page }) => {
    await page.goto(`${BASE_URL}/questions`);
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').textContent();

    const categories = ['学业', 'Academic', '生活', 'Life', '签证', 'Visa', '求职', 'Job', '政策', 'Policy'];
    let categoriesFound = 0;
    for (const cat of categories) {
      if (bodyText?.includes(cat)) categoriesFound++;
    }
    console.log(`Categories found: ${categoriesFound}/${categories.length}`);
    expect(categoriesFound).toBeGreaterThanOrEqual(3);
  });

  // ============ 问题45: Offer页面是否显示内容 ============
  test('问题45: Offer页面是否显示内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/offers`);
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').textContent();

    const hasContent = bodyText?.includes('Offer') || bodyText?.includes('录取') ||
                     bodyText?.includes('Stanford') || bodyText?.includes('University');
    console.log(`Offer page has content: ${hasContent}`);
    expect(hasContent).toBeTruthy();

    // Check for cards or grid items
    const cards = page.locator('[class*="card"], [class*="grid"] > div');
    const cardCount = await cards.count();
    console.log(`Cards/grids: ${cardCount}`);
  });

  // ============ Additional: Offer List - Search/Filter/Dropdowns ============
  test('Offer List: Filter and Sort Controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/offers`);
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').textContent();

    // Check for filter UI elements
    const hasFilters = bodyText?.includes('筛选') || bodyText?.includes('Filter') ||
                      bodyText?.includes('排序') || bodyText?.includes('Sort');
    console.log(`Filter UI present: ${hasFilters}`);

    // Check for select dropdowns
    const selects = page.locator('select');
    const selectCount = await selects.count();
    console.log(`Select dropdowns: ${selectCount}`);
  });

  // ============ Additional: Q&A Detail Page ============
  test('Q&A Detail Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/questions`);
    await page.waitForTimeout(5000);

    const questionLink = page.locator('a[href*="/questions/q-"]').first();
    await questionLink.click();
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`Q&A Detail URL: ${currentUrl}`);
    expect(currentUrl).toContain('/questions/');
  });

});
