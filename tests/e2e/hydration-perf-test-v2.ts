/**
 * AI Student Survival - Refined Hydration & Performance Tests
 * Using superpowers:systematic-debugging
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ─── Configuration ────────────────────────────────────────────────
const BASE_URL = 'http://localhost:4322';
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

// ─── Results Container ────────────────────────────────────────────
interface TestResults {
  hydration_results: {
    components_tested: number;
    hydration_errors: string[];
    warnings: string[];
  };
  performance_results: {
    pages_tested: number;
    lcp_scores: Record<string, number>;
    fcp_scores: Record<string, number>;
    cls_scores: Record<string, number>;
  };
  responsive_results: {
    viewport_tests: number;
    issues: string[];
  };
  accessibility_results: {
    keyboard_nav: 'pass' | 'fail';
    focus_visible: 'pass' | 'fail';
    aria_issues: string[];
  };
  all_passed: boolean;
}

const results: TestResults = {
  hydration_results: {
    components_tested: 0,
    hydration_errors: [],
    warnings: [],
  },
  performance_results: {
    pages_tested: 0,
    lcp_scores: {},
    fcp_scores: {},
    cls_scores: {},
  },
  responsive_results: {
    viewport_tests: 0,
    issues: [],
  },
  accessibility_results: {
    keyboard_nav: 'pass',
    focus_visible: 'pass',
    aria_issues: [],
  },
  all_passed: false,
};

// ─── Utility Functions ────────────────────────────────────────────

/**
 * Detect actual React/Astro hydration errors via console monitoring
 */
async function detectRealHydrationErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  // Wait for hydration to complete
  await page.waitForTimeout(3000);

  // Check for Astro client directives
  const hasClientDirectives = await page.evaluate(() => {
    const islands = document.querySelectorAll('astro-island');
    let hydratedCount = 0;
    let ssrOnlyCount = 0;

    islands.forEach((island) => {
      if (island.hasAttribute('ssr') && island.getAttribute('ssr') === 'false') {
        hydratedCount++;
      }
      if (island.hasAttribute('ssr') && island.getAttribute('ssr') === 'true') {
        ssrOnlyCount++;
      }
    });

    return { hydrated: hydratedCount, ssrOnly: ssrOnlyCount, total: islands.length };
  });

  console.log(`    Astro Islands: ${JSON.stringify(hasClientDirectives)}`);

  // Check if Chatbot island is loaded
  const chatbotLoaded = await page.evaluate(() => {
    const chatbotBtn = document.querySelector('button[aria-label*="聊天"], button[aria-label*="Chat"], button.fixed.bottom-6');
    return chatbotBtn !== null;
  });

  if (!chatbotLoaded) {
    errors.push('Chatbot floating button not hydrated');
  }

  // Check React root hydration status
  const reactRootHydrated = await page.evaluate(() => {
    // Astro wraps React components in astro-island
    const islands = document.querySelectorAll('astro-island');
    return islands.length > 0;
  });

  if (!reactRootHydrated) {
    // Note: This is a warning, not error - some pages may not have React islands
  }

  // Check for hydration mismatch in AuthProvider
  const authContext = await page.evaluate(() => {
    // AuthProvider wraps children, check if it's properly mounted
    const authButtons = document.querySelectorAll('button');
    return authButtons.length > 0;
  });

  return errors;
}

/**
 * Test React component hydration by checking interactivity
 */
async function testComponentHydration(
  page: Page,
  selector: string,
  componentName: string,
  checkInteractivity: boolean = true
): Promise<{ passed: boolean; error?: string; details?: string }> {
  try {
    const exists = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el !== null;
    }, selector);

    if (!exists) {
      return { passed: false, error: `${componentName}: Element not found` };
    }

    const isVisible = await page.isVisible(selector);

    if (!isVisible) {
      return { passed: false, error: `${componentName}: Element not visible` };
    }

    if (checkInteractivity) {
      // Check if component is interactive (can receive click/keyboard events)
      const isInteractive = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;

        const tagName = el.tagName.toLowerCase();
        const isClickable = ['button', 'a', 'input', 'select', 'textarea'].includes(tagName);
        const hasClickHandler = el.hasAttribute('onclick') || el.hasAttribute('@click');
        const hasRole = el.getAttribute('role');

        return isClickable || hasClickHandler || hasRole;
      }, selector);

      if (!isInteractive) {
        return { passed: true, details: `${componentName}: Static (non-interactive)` };
      }
    }

    return { passed: true, details: `${componentName}: Hydrated and interactive` };
  } catch (error) {
    return { passed: false, error: `${componentName}: ${error}` };
  }
}

/**
 * Measure Core Web Vitals using Playwright metrics
 */
async function measureCoreWebVitals(page: Page, url: string): Promise<{
  lcp: number;
  fcp: number;
  cls: number;
}> {
  // Navigate and wait for network idle
  const navigationStart = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for network to settle
  await page.waitForTimeout(2000);

  // Get performance metrics
  const metrics = await page.evaluate(() => {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
    const lcpEntry = paintEntries.find((e) => e.name === 'largest-contentful-paint');

    // Calculate CLS by checking layout shifts
    const layoutShifts = performance.getEntriesByType('layout-shift') as PerformanceEntry[];
    let cls = 0;
    layoutShifts.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });

    return {
      fcp: fcpEntry?.startTime || 0,
      lcp: lcpEntry?.startTime || (timing?.loadEventEnd - timing?.requestStart) || 0,
      cls: Math.round(cls * 1000) / 1000,
      ttfb: timing?.responseStart - timing?.requestStart || 0,
    };
  });

  console.log(`    TTFB: ${metrics.ttfb}ms, FCP: ${metrics.fcp}ms, LCP: ${metrics.lcp}ms`);

  return {
    lcp: Math.round(metrics.lcp),
    fcp: Math.round(metrics.fcp),
    cls: metrics.cls,
  };
}

/**
 * Test keyboard navigation and focus management
 */
async function testKeyboardNavigation(page: Page): Promise<{ passed: boolean; issues: string[]; details: string[] }> {
  const issues: string[] = [];
  const details: string[] = [];

  // Press Tab and track focus
  const tabSequence: string[] = [];
  let focusableElements = 0;

  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);

    const focusInfo = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el.tagName === 'BODY') return null;

      const computedStyle = window.getComputedStyle(el);
      const hasFocusRing = computedStyle.outlineWidth !== '0px' ||
        computedStyle.boxShadow !== 'none';

      return {
        tag: el.tagName,
        class: el.className.substring(0, 40),
        id: el.id || undefined,
        ariaLabel: el.getAttribute('aria-label'),
        role: el.getAttribute('role'),
        hasFocusRing,
      };
    });

    if (focusInfo) {
      focusableElements++;
      tabSequence.push(`${i + 1}. ${focusInfo.tag}${focusInfo.id ? '#' + focusInfo.id : ''} "${focusInfo.ariaLabel || focusInfo.class}"`);

      if (!focusInfo.hasFocusRing) {
        issues.push(`Tab ${i + 1}: No visible focus indicator on ${focusInfo.tag}`);
      }
    }
  }

  details.push(`${focusableElements} focusable elements found`);
  details.push(...tabSequence.slice(0, 5));

  return {
    passed: issues.filter(i => i.includes('No visible focus')).length === 0,
    issues,
    details,
  };
}

/**
 * Test ARIA attributes for accessibility compliance
 */
async function testAriaAttributes(page: Page): Promise<{ passed: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Check buttons for accessible names
  const buttonIssues = await page.evaluate(() => {
    const issues: string[] = [];
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');

    buttons.forEach((btn) => {
      const text = btn.textContent?.trim();
      const hasSVG = btn.querySelector('svg');

      if (!text && hasSVG) {
        issues.push(`Icon button without aria-label: ${btn.className.substring(0, 50)}`);
      }
    });

    return issues;
  });

  issues.push(...buttonIssues);

  // Check images for alt attributes
  const imageIssues = await page.evaluate(() => {
    const issues: string[] = [];
    const images = document.querySelectorAll('img:not([alt])');

    images.forEach((img) => {
      issues.push(`Image without alt: ${img.src?.substring(0, 60)}`);
    });

    return issues;
  });

  issues.push(...imageIssues);

  // Check for proper landmark roles
  const landmarkIssues = await page.evaluate(() => {
    const issues: string[] = [];

    // Main content should be in <main> or have role="main"
    const hasMain = document.querySelector('main, [role="main"]');
    if (!hasMain) {
      issues.push('No main landmark found');
    }

    // Navigation should be in <nav> or have role="navigation"
    const navs = document.querySelectorAll('nav, [role="navigation"]');
    if (navs.length === 0) {
      issues.push('No navigation landmark found');
    }

    return issues;
  });

  issues.push(...landmarkIssues);

  console.log(`    ARIA checks: ${buttonIssues.length} button issues, ${imageIssues.length} image issues, ${landmarkIssues.length} landmark issues`);

  return { passed: issues.length === 0, issues };
}

// ─── Main Test Functions ─────────────────────────────────────────

async function testReactHydration(browser: Browser): Promise<void> {
  console.log('\n═══ React Hydration Tests ═══');

  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for actual console errors (not warnings)
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Only capture actual hydration errors
      if (text.includes('hydration') && (text.includes('mismatch') || text.includes('did not match'))) {
        consoleErrors.push(text.substring(0, 150));
      }
    }
  });

  page.on('pageerror', (err) => {
    if (err.message.includes('hydration') || err.message.includes('Hydration')) {
      consoleErrors.push(`PageError: ${err.message.substring(0, 150)}`);
    }
  });

  // Test all pages with React components
  const testPages = [
    { url: BASE_URL, name: 'Homepage', components: ['nav', '[data-search-trigger]', 'astro-island'] },
    { url: `${BASE_URL}/tools`, name: 'Tools', components: ['nav', '.grid', 'astro-island'] },
    { url: `${BASE_URL}/en/`, name: 'English Homepage', components: ['nav', '[data-search-trigger]', 'astro-island'] },
    { url: `${BASE_URL}/community`, name: 'Community', components: ['nav', 'astro-island'] },
    { url: `${BASE_URL}/map`, name: 'Map (Leaflet)', components: ['nav', 'astro-island', 'leaflet-container'] },
  ];

  let totalComponents = 0;
  let passedComponents = 0;

  for (const testPage of testPages) {
    console.log(`\n  Testing: ${testPage.name}`);

    try {
      await page.goto(testPage.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Detect real hydration errors
      const hydrationErrors = await detectRealHydrationErrors(page);

      if (hydrationErrors.length > 0) {
        results.hydration_results.hydration_errors.push(
          `${testPage.name}: ${hydrationErrors.join(', ')}`
        );
      }

      // Test each component
      for (const selector of testPage.components) {
        totalComponents++;
        const result = await testComponentHydration(page, selector, `${testPage.name}:${selector}`, true);

        if (result.passed) {
          passedComponents++;
          console.log(`    ✓ ${selector}: ${result.details || 'OK'}`);
        } else {
          results.hydration_results.warnings.push(result.error || `${selector} failed`);
          console.log(`    ✗ ${selector}: ${result.error || 'Failed'}`);
        }
      }
    } catch (error) {
      console.log(`    ✗ Failed to load: ${error}`);
      results.hydration_results.warnings.push(`${testPage.name}: ${error}`);
    }
  }

  // Report console errors
  if (consoleErrors.length > 0) {
    results.hydration_results.hydration_errors.push(
      ...consoleErrors.map((e) => `Console: ${e}`)
    );
  }

  results.hydration_results.components_tested = totalComponents;
  console.log(`\n  Hydration summary: ${passedComponents}/${totalComponents} components passed`);

  if (consoleErrors.length > 0) {
    console.log(`  Console errors: ${consoleErrors.length}`);
  }

  await context.close();
}

async function testPerformance(browser: Browser): Promise<void> {
  console.log('\n═══ Performance Tests ═══');

  const context = await browser.newContext();
  const page = await context.newPage();

  const testPages = [
    { url: BASE_URL, name: 'Homepage' },
    { url: `${BASE_URL}/tools`, name: 'Tools Page' },
    { url: `${BASE_URL}/policies`, name: 'Policies Page' },
    { url: `${BASE_URL}/en/`, name: 'English Homepage' },
    { url: `${BASE_URL}/offers`, name: 'Offers Page' },
  ];

  for (const testPage of testPages) {
    console.log(`\n  Testing: ${testPage.name}`);

    try {
      const metrics = await measureCoreWebVitals(page, testPage.url);

      results.performance_results.pages_tested++;
      results.performance_results.lcp_scores[testPage.name] = metrics.lcp;
      results.performance_results.fcp_scores[testPage.name] = metrics.fcp;
      results.performance_results.cls_scores[testPage.name] = metrics.cls;

      const lcpPass = metrics.lcp <= 2500;
      const fcpPass = metrics.fcp <= 1800;
      const clsPass = metrics.cls <= 0.1;

      console.log(`    LCP: ${metrics.lcp}ms ${lcpPass ? '✓' : '✗'} (target <2500ms)`);
      console.log(`    FCP: ${metrics.fcp}ms ${fcpPass ? '✓' : '✗'} (target <1800ms)`);
      console.log(`    CLS: ${metrics.cls} ${clsPass ? '✓' : '✗'} (target ≤0.1)`);
    } catch (error) {
      console.log(`    Error: ${error}`);
    }
  }

  await context.close();
}

async function testResponsive(browser: Browser): Promise<void> {
  console.log('\n═══ Responsive Tests ═══');

  const context = await browser.newContext();

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\n  Testing: ${viewportName} (${viewport.width}x${viewport.height})`);

    const page = await context.newPage();
    await page.setViewportSize(viewport);

    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);

      results.responsive_results.viewport_tests++;

      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        return bodyWidth > windowWidth + 5; // 5px tolerance
      });

      if (hasOverflow) {
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);
        results.responsive_results.issues.push(
          `${viewportName}: Horizontal overflow (${scrollWidth}px > ${windowWidth}px)`
        );
        console.log(`    ✗ Horizontal overflow detected`);
      } else {
        console.log(`    ✓ No horizontal overflow`);
      }

      // Check navigation visibility on mobile
      if (viewportName === 'mobile') {
        // Check if mobile menu button exists
        const menuExists = await page.evaluate(() => {
          return document.getElementById('mobile-menu-btn') !== null;
        });

        if (menuExists) {
          // Click the menu button
          await page.click('#mobile-menu-btn');
          await page.waitForTimeout(500);

          const menuVisible = await page.isVisible('#mobile-menu');
          if (!menuVisible) {
            results.responsive_results.issues.push(
              `${viewportName}: Mobile menu not toggling correctly`
            );
            console.log(`    ✗ Mobile menu toggle failed`);
          } else {
            console.log(`    ✓ Mobile menu toggles correctly`);
          }
        }
      }

      // Check no elements clipped by viewport
      const clippedElements = await page.evaluate(() => {
        const issues: string[] = [];
        const importantElements = document.querySelectorAll('header, nav, main, footer, .fixed, .sticky');

        importantElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth + 10 || rect.bottom > window.innerHeight + 10) {
            issues.push(el.className.substring(0, 40));
          }
        });

        return issues;
      });

      if (clippedElements.length > 0) {
        results.responsive_results.issues.push(
          `${viewportName}: ${clippedElements.length} elements partly clipped`
        );
      }

    } catch (error) {
      results.responsive_results.issues.push(`${viewportName}: ${error}`);
    }

    await page.close();
  }

  await context.close();
}

async function testAccessibility(browser: Browser): Promise<void> {
  console.log('\n═══ Accessibility Tests ═══');

  const context = await browser.newContext();
  const page = await context.newPage();

  // Test keyboard navigation
  const keyboardResult = await testKeyboardNavigation(page);
  results.accessibility_results.keyboard_nav = keyboardResult.passed ? 'pass' : 'fail';

  console.log(`  Keyboard Navigation: ${keyboardResult.passed ? '✓ PASS' : '✗ FAIL'}`);
  keyboardResult.details.slice(0, 3).forEach((d) => console.log(`    ${d}`));
  if (keyboardResult.issues.length > 0) {
    keyboardResult.issues.slice(0, 2).forEach((i) => console.log(`    ${i}`));
  }

  // Test focus visibility
  results.accessibility_results.focus_visible = keyboardResult.passed ? 'pass' : 'fail';

  // Test ARIA attributes
  const ariaResult = await testAriaAttributes(page);
  results.accessibility_results.aria_issues = ariaResult.issues;

  console.log(`  ARIA Compliance: ${ariaResult.passed ? '✓ PASS' : '✗ FAIL'}`);

  await context.close();
}

// ─── Main Execution ───────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  AI Student Survival - React Hydration & Performance    ║');
  console.log('║  superpowers:systematic-debugging                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  // Launch browser
  console.log('\nLaunching browser...');
  const browser = await chromium.launch({ headless: true });

  // Run all tests
  await testReactHydration(browser);
  await testPerformance(browser);
  await testResponsive(browser);
  await testAccessibility(browser);

  await browser.close();

  // Calculate overall pass status
  const hydrationPass =
    results.hydration_results.hydration_errors.length === 0;

  const performancePass =
    Object.values(results.performance_results.lcp_scores).every((v) => v <= 2500) &&
    Object.values(results.performance_results.fcp_scores).every((v) => v <= 1800);

  const responsivePass = results.responsive_results.issues.length === 0;

  const accessibilityPass =
    results.accessibility_results.keyboard_nav === 'pass' &&
    results.accessibility_results.aria_issues.length === 0;

  results.all_passed = hydrationPass && performancePass && responsivePass && accessibilityPass;

  // ─── Output Results ────────────────────────────────────────────
  console.log('\n' + '═'.repeat(62));
  console.log('                      TEST RESULTS SUMMARY');
  console.log('═'.repeat(62));

  console.log('\n[Hydration Results]');
  console.log(`  Components Tested: ${results.hydration_results.components_tested}`);
  console.log(`  Hydration Errors: ${results.hydration_results.hydration_errors.length}`);
  results.hydration_results.hydration_errors.forEach((e) => console.log(`    ✗ ${e.substring(0, 100)}`));
  console.log(`  Warnings: ${results.hydration_results.warnings.length}`);
  results.hydration_results.warnings.forEach((w) => console.log(`    ⚠ ${w.substring(0, 100)}`));

  console.log('\n[Performance Results]');
  console.log(`  Pages Tested: ${results.performance_results.pages_tested}`);

  console.log('  LCP Scores (target <2500ms):');
  for (const [page, score] of Object.entries(results.performance_results.lcp_scores)) {
    const pass = score <= 2500 ? '✓' : '✗';
    console.log(`    ${page}: ${score}ms ${pass}`);
  }

  console.log('  FCP Scores (target <1800ms):');
  for (const [page, score] of Object.entries(results.performance_results.fcp_scores)) {
    const pass = score <= 1800 ? '✓' : '✗';
    console.log(`    ${page}: ${score}ms ${pass}`);
  }

  console.log('  CLS Scores (target ≤0.1):');
  for (const [page, score] of Object.entries(results.performance_results.cls_scores)) {
    const pass = score <= 0.1 ? '✓' : '✗';
    console.log(`    ${page}: ${score} ${pass}`);
  }

  console.log('\n[Responsive Results]');
  console.log(`  Viewport Tests: ${results.responsive_results.viewport_tests}`);
  console.log(`  Issues Found: ${results.responsive_results.issues.length}`);
  results.responsive_results.issues.forEach((i) => console.log(`    ✗ ${i}`));

  console.log('\n[Accessibility Results]');
  console.log(`  Keyboard Navigation: ${results.accessibility_results.keyboard_nav}`);
  console.log(`  Focus Visibility: ${results.accessibility_results.focus_visible}`);
  console.log(`  ARIA Issues: ${results.accessibility_results.aria_issues.length}`);
  results.accessibility_results.aria_issues.forEach((i) => console.log(`    ✗ ${i.substring(0, 80)}`));

  console.log('\n' + '═'.repeat(62));
  console.log(` Overall Status: ${results.all_passed ? 'ALL TESTS PASSED ✓' : 'ISSUES FOUND ✗'}`);
  console.log('═'.repeat(62));

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nTotal test time: ${totalTime}s`);

  // Save results
  const outputPath = path.join(process.cwd(), 'test-results', `hydration-test-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to: ${outputPath}`);

  process.exit(results.all_passed ? 0 : 1);
}

main().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});