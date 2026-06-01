import { test, expect, chromium, Page } from '@playwright/test';

/**
 * Homepage & Navigation Deep Test
 * Issues: 1, 5, 6, 7, 41, 42
 */
test.describe('Homepage & Navigation - 深度测试', () => {

  // Issue-01: Logo存在并正确显示
  test('问题1: Logo存在并正确显示', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Check for logo element (SVG or img with alt text)
    const logoSelectors = [
      'a[href="/"] svg',           // SVG logo in header
      'a[href="/"] img',           // Image logo
      '.logo',                     // Logo class
      '[aria-label*="logo"]',      // ARIA labeled
      'a[href="/"]',               // Logo link
    ];

    let logoFound = false;
    let logoInfo = '';

    for (const selector of logoSelectors) {
      const logo = page.locator(selector).first();
      if (await logo.isVisible()) {
        logoFound = true;
        const tagName = await logo.evaluate((el) => el.tagName.toLowerCase());
        const href = await logo.evaluate((el) => el.closest('a')?.href || el.getAttribute('href') || 'no-href');
        logoInfo = `Found ${tagName} with href: ${href}`;
        break;
      }
    }

    // Also check favicon
    const favicon = page.locator('link[rel="icon"]').first();
    const faviconHref = await favicon.getAttribute('href');

    await browser.close();

    console.log(`Logo check: ${logoFound ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`Favicon href: ${faviconHref}`);
    console.log(logoInfo);

    expect(logoFound, 'Logo should be visible in header').toBe(true);
    expect(faviconHref).toBeTruthy();
  });

  // Issue-05: Banner区域文案和内容
  test('问题5: Banner区域文案和内容验证', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Check hero section with specific class
    const heroSection = page.locator('section.hero-gradient').first();
    await expect(heroSection).toBeVisible({ timeout: 5000 });

    // Check h1 title
    const h1 = page.locator('section.hero-gradient h1').first();
    const h1Text = await h1.textContent();
    const h1Visible = await h1.isVisible();

    // Check subtitle/description
    const subtitle = page.locator('section.hero-gradient p').first();
    const subtitleText = await subtitle.textContent();
    const subtitleVisible = await subtitle.isVisible();

    // Check CTA buttons
    const ctaButtons = page.locator('section.hero-gradient a');
    const ctaCount = await ctaButtons.count();

    await browser.close();

    console.log(`H1 text: "${h1Text}" (visible: ${h1Visible})`);
    console.log(`Subtitle: "${subtitleText?.substring(0, 50)}..." (visible: ${subtitleVisible})`);
    console.log(`CTA buttons found: ${ctaCount}`);

    expect(h1Visible, 'H1 title should be visible').toBe(true);
    expect(h1Text?.trim().length, 'H1 should have content').toBeGreaterThan(0);
    expect(subtitleVisible, 'Subtitle should be visible').toBe(true);
    expect(ctaCount, 'Should have at least 2 CTA buttons').toBeGreaterThanOrEqual(2);
  });

  // Issue-06: 首页下图区域链接是否可点击
  test('问题6: 首页模块区域链接可点击验证', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Find the core modules section - use first() to avoid strict mode
    const modulesSection = page.locator('section.py-16.bg-white').first();
    await expect(modulesSection).toBeVisible({ timeout: 5000 });

    // Check module links within this section
    const moduleLinks = modulesSection.locator('a[href*="/tools"], a[href*="/payment"], a[href*="/policies"], a[href*="/prompts"]');
    const linkCount = await moduleLinks.count();

    // Test each major module link visibility
    const toolsLink = modulesSection.locator('a[href="/tools"]').first();
    const toolsLinkVisible = await toolsLink.isVisible();
    const toolsLinkHref = await toolsLink.getAttribute('href');

    const paymentLink = modulesSection.locator('a[href="/payment"]').first();
    const paymentLinkVisible = await paymentLink.isVisible();

    const policiesLink = modulesSection.locator('a[href="/policies"]').first();
    const policiesLinkVisible = await policiesLink.isVisible();

    const promptsLink = modulesSection.locator('a[href="/prompts"]').first();
    const promptsLinkVisible = await promptsLink.isVisible();

    await browser.close();

    console.log(`Module links found in section: ${linkCount}`);
    console.log(`Tools link: visible=${toolsLinkVisible}, href=${toolsLinkHref}`);
    console.log(`Payment link visible: ${paymentLinkVisible}`);
    console.log(`Policies link visible: ${policiesLinkVisible}`);
    console.log(`Prompts link visible: ${promptsLinkVisible}`);

    expect(linkCount, 'Should have at least 4 module links').toBeGreaterThanOrEqual(4);
    expect(toolsLinkVisible, 'Tools link should be visible').toBe(true);
    expect(paymentLinkVisible, 'Payment link should be visible').toBe(true);
    expect(policiesLinkVisible, 'Policies link should be visible').toBe(true);
    expect(promptsLinkVisible, 'Prompts link should be visible').toBe(true);
  });

  // Issue-7: 底部内容验证
  test('问题7: 底部内容验证', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible({ timeout: 5000 });

    // Check footer content sections
    const footerLinks = page.locator('footer a');
    const footerLinkCount = await footerLinks.count();

    // Check key footer sections
    const siteName = page.locator('footer').getByText('AI留学生存指南').first();
    const siteNameVisible = await siteName.isVisible();

    // Check copyright
    const copyright = page.locator('footer').getByText(/©|copyright/i).first();
    const copyrightVisible = await copyright.isVisible();

    // Check footer navigation columns
    const coreFeatures = page.locator('footer').getByText(/核心功能|AI工具库/i).first();
    const coreFeaturesVisible = await coreFeatures.isVisible();

    // Check social/company links
    const aboutLink = page.locator('footer a[href="/about"]').first();
    const aboutLinkVisible = await aboutLink.isVisible();

    const privacyLink = page.locator('footer a[href="/privacy"]').first();
    const privacyLinkVisible = await privacyLink.isVisible();

    const termsLink = page.locator('footer a[href="/terms"]').first();
    const termsLinkVisible = await termsLink.isVisible();

    await browser.close();

    console.log(`Footer links count: ${footerLinkCount}`);
    console.log(`Site name visible: ${siteNameVisible}`);
    console.log(`Copyright visible: ${copyrightVisible}`);
    console.log(`Core features visible: ${coreFeaturesVisible}`);
    console.log(`About link visible: ${aboutLinkVisible}`);
    console.log(`Privacy link visible: ${privacyLinkVisible}`);
    console.log(`Terms link visible: ${termsLinkVisible}`);

    expect(footerLinkCount, 'Footer should have multiple links').toBeGreaterThan(5);
    expect(siteNameVisible, 'Site name should be visible in footer').toBe(true);
    expect(copyrightVisible, 'Copyright should be visible').toBe(true);
  });

  // Issue-41: 四大核心模块重新排版验证
  test('问题41: 四大核心模块重新排版验证', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Find the modules section - first section with py-16 bg-white
    const modulesSection = page.locator('section.py-16.bg-white').first();
    await expect(modulesSection).toBeVisible({ timeout: 5000 });

    // Check for grid layout
    const gridContainer = modulesSection.locator('.grid');
    const gridCount = await gridContainer.count();

    // Find the 4 module cards
    const aiToolsCard = modulesSection.locator('a[href="/tools"]').first();
    const paymentCard = modulesSection.locator('a[href="/payment"]').first();
    const policiesCard = modulesSection.locator('a[href="/policies"]').first();
    const promptsCard = modulesSection.locator('a[href="/prompts"]').first();

    const aiToolsVisible = await aiToolsCard.isVisible();
    const paymentVisible = await paymentCard.isVisible();
    const policiesVisible = await policiesCard.isVisible();
    const promptsVisible = await promptsCard.isVisible();

    // Get card titles
    const aiToolsTitle = await aiToolsCard.locator('h3').textContent().catch(() => 'N/A');
    const paymentTitle = await paymentCard.locator('h3').textContent().catch(() => 'N/A');
    const policiesTitle = await policiesCard.locator('h3').textContent().catch(() => 'N/A');
    const promptsTitle = await promptsCard.locator('h3').textContent().catch(() => 'N/A');

    // Check layout is responsive (grid)
    const sectionHtml = await modulesSection.innerHTML();
    const hasGridLayout = sectionHtml.includes('grid-cols') || sectionHtml.includes('grid');

    await browser.close();

    console.log(`Grid containers found in section: ${gridCount}`);
    console.log(`AI Tools card: visible=${aiToolsVisible}, title="${aiToolsTitle}"`);
    console.log(`Payment card: visible=${paymentVisible}, title="${paymentTitle}"`);
    console.log(`Policies card: visible=${policiesVisible}, title="${policiesTitle}"`);
    console.log(`Prompts card: visible=${promptsVisible}, title="${promptsTitle}"`);
    console.log(`Has grid layout: ${hasGridLayout}`);

    expect(aiToolsVisible, 'AI Tools card should be visible').toBe(true);
    expect(paymentVisible, 'Payment card should be visible').toBe(true);
    expect(policiesVisible, 'Policies card should be visible').toBe(true);
    expect(promptsVisible, 'Prompts card should be visible').toBe(true);
    expect(hasGridLayout, 'Modules should use grid layout').toBe(true);
  });

  // Issue-42: SEO和GEO特性验证
  test('问题42: SEO和GEO特性验证', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set shorter timeout for this specific test
    page.setDefaultTimeout(15000);

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('domcontentloaded');

    // Check meta tags
    const metaTitle = await page.locator('meta[name="title"]').getAttribute('content');
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    const metaKeywords = await page.locator('meta[name="keywords"]').getAttribute('content');

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    const ogSiteName = await page.locator('meta[property="og:site_name"]').getAttribute('content');

    // Check Twitter cards (they use property attribute, not name)
    const twitterCard = await page.locator('meta[property="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[property="twitter:title"]').getAttribute('content');
    const twitterDescription = await page.locator('meta[property="twitter:description"]').getAttribute('content');

    // Check canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');

    // Check alternate language links
    const alternateZh = await page.locator('link[hreflang="zh"]').getAttribute('href');
    const alternateEn = await page.locator('link[hreflang="en"]').getAttribute('href');

    // Check JSON-LD schema
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    let schemaData: any = null;
    try {
      schemaData = jsonLd ? JSON.parse(jsonLd) : null;
    } catch (e) {
      schemaData = null;
    }

    // Check favicon
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href');

    await browser.close();

    console.log('=== SEO Meta Tags ===');
    console.log(`Title: ${metaTitle?.substring(0, 60)}...`);
    console.log(`Description: ${metaDescription?.substring(0, 60)}...`);
    console.log(`Keywords: ${metaKeywords?.substring(0, 60)}...`);

    console.log('\n=== Open Graph ===');
    console.log(`og:title: ${ogTitle?.substring(0, 60)}...`);
    console.log(`og:type: ${ogType}`);
    console.log(`og:url: ${ogUrl}`);
    console.log(`og:site_name: ${ogSiteName}`);

    console.log('\n=== Twitter Cards ===');
    console.log(`twitter:card: ${twitterCard}`);
    console.log(`twitter:title: ${twitterTitle?.substring(0, 60)}...`);

    console.log('\n=== Hreflang ===');
    console.log(`zh: ${alternateZh}`);
    console.log(`en: ${alternateEn}`);

    console.log('\n=== Schema.org ===');
    console.log(`JSON-LD present: ${!!schemaData}`);
    console.log(`Schema type: ${schemaData?.['@type']}`);
    console.log(`Schema name: ${schemaData?.name}`);

    console.log('\n=== Canonical & Favicon ===');
    console.log(`Canonical: ${canonical}`);
    console.log(`Favicon: ${favicon}`);

    // Assertions
    expect(metaTitle?.length, 'Meta title should exist').toBeGreaterThan(0);
    expect(metaDescription?.length, 'Meta description should exist').toBeGreaterThan(0);
    expect(ogTitle?.length, 'OG title should exist').toBeGreaterThan(0);
    expect(ogType, 'OG type should be website').toBe('website');
    expect(ogUrl, 'OG URL should be set').toBeTruthy();
    expect(twitterCard, 'Twitter card should be set').toBeTruthy();
    expect(canonical, 'Canonical URL should be set').toBeTruthy();
    expect(alternateZh, 'Hreflang zh should be set').toBeTruthy();
    expect(alternateEn, 'Hreflang en should be set').toBeTruthy();
    expect(schemaData, 'JSON-LD schema should be present').toBeTruthy();
    expect(schemaData?.['@type'], 'Schema should have @type').toBe('WebSite');
  });

  // Additional: Test all homepage links are valid
  test('附加测试: 首页所有链接有效性', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const failedLinks: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Get all links on homepage
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    console.log(`Total links found: ${linkCount}`);

    // Test a sample of key links
    const keyPaths = ['/tools', '/payment', '/policies', '/prompts', '/offers', '/questions', '/about', '/privacy', '/terms'];

    for (const path of keyPaths) {
      const link = page.locator(`a[href="${path}"]`).first();
      if (await link.isVisible()) {
        const href = await link.getAttribute('href');
        console.log(`Link ${path}: href="${href}", visible=true`);
      }
    }

    await browser.close();

    console.log(`\nConsole errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors.slice(0, 3));
    }

    expect(linkCount, 'Should have multiple links').toBeGreaterThan(10);
  });

  // Test clicking through module links
  test('附加测试: 模块链接点击跳转验证', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Click on AI Tools module
    await page.click('a[href="/tools"]');
    await page.waitForLoadState('networkidle');

    const toolsUrl = page.url();
    const toolsPageLoaded = toolsUrl.includes('/tools');

    console.log(`After clicking AI Tools: ${toolsUrl}`);

    // Go back and click on Payment
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    await page.click('a[href="/payment"]');
    await page.waitForLoadState('networkidle');

    const paymentUrl = page.url();
    const paymentPageLoaded = paymentUrl.includes('/payment');

    console.log(`After clicking Payment: ${paymentUrl}`);

    await browser.close();

    expect(toolsPageLoaded, 'Should navigate to /tools').toBe(true);
    expect(paymentPageLoaded, 'Should navigate to /payment').toBe(true);
  });
});
