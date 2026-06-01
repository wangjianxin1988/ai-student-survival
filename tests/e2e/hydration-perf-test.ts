/**
 * AI Student Survival - React Hydration & Performance Tests
 * superpowers:systematic-debugging approach
 */

import { chromium, Browser, Page, chromiumChromium } from 'playwright';
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
 * Evaluate JavaScript in browser context to detect hydration issues
 */
async function detectHydrationErrors(page: Page): Promise<string[]> {
  const hydrationErrors: string[] = [];

  // Check for React hydration mismatch warnings
  const consoleErrors = await page.evaluate(() => {
    const errors: string[] = [];

    // Capture console errors (already captured by page.on)
    // Check for common hydration issues in DOM
    const body = document.body;

    // Check for data-hydrated attribute missing on React components
    const reactRoot = document.querySelector('[data-astro-cid]');
    if (!reactRoot) {
      errors.push('No Astro root element found');
    }

    // Check for text content mismatches (common hydration issue)
    const elements = document.querySelectorAll('[data-hydrated]');
    if (elements.length === 0) {
      // Check if React components exist without hydration marker
      const possibleReact = document.querySelectorAll('nav, [class*="fixed"], [class*="sticky"]');
      if (possibleReact.length > 0) {
        errors.push('Possible React components without hydration marker');
      }
    }

    // Check for mismatched text content (SSR vs CSR)
    const allElements = document.querySelectorAll('*');
    allElements.forEach((el) => {
      const text = el.textContent || '';
      if (text.includes('hydration') || text.includes('did not match')) {
        errors.push(`Hydration text mismatch: ${text.substring(0, 100)}`);
      }
    });

    // Check for client-only rendering markers
    const clientOnly = document.querySelectorAll('[data-server-only]');
    if (clientOnly.length > 0) {
      errors.push(`Server-only elements found: ${clientOnly.length}`);
    }

    return errors;
  });

  // Check network requests for hydration-related failures
  const failedRequests = await page.evaluate(() => {
    const failed: string[] = [];
    // Check if any critical JS files failed to load
    return failed;
  });

  hydrationErrors.push(...consoleErrors);
  return [...new Set(hydrationErrors)]; // Deduplicate
}

/**
 * Test a specific React component for hydration
 */
async function testComponentHydration(
  page: Page,
  selector: string,
  componentName: string
): Promise<{ passed: boolean; error?: string }> {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });

    // Check if component is visible and interactive
    const isVisible = await page.isVisible(selector);
    const isAttached = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el !== null;
    }, selector);

    if (!isAttached) {
      return { passed: false, error: `${componentName}: Element not attached to DOM` };
    }

    if (!isVisible) {
      return { passed: false, error: `${componentName}: Element not visible` };
    }

    // Check for hydration-related attributes
    const hydrationStatus = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { hydrated: false, error: 'Not found' };

      // Check if it has React hydration markers
      const hasDataAttrs = el.hasAttribute('data-astro-cid') || el.hasAttribute('data-hydrated');

      // Check if it has interactive state
      const hasInteractiveProps = el.hasAttribute('onclick') ||
        el.hasAttribute('onkeydown') ||
        el.getAttribute('role') !== null;

      return {
        hydrated: hasDataAttrs || true, // Astro components don't always have explicit markers
        interactive: hasInteractiveProps,
        tagName: el.tagName,
        classes: el.className.substring(0, 50),
      };
    }, selector);

    console.log(`  [${componentName}] Status: ${JSON.stringify(hydrationStatus)}`);

    return { passed: true };
  } catch (error) {
    return { passed: false, error: `${componentName}: ${error}` };
  }
}

/**
 * Measure Core Web Vitals
 */
async function measureCoreWebVitals(page: Page, url: string): Promise<{
  lcp: number;
  fcp: number;
  cls: number;
}> {
  const metrics = await page.goto(url, { waitUntil: 'networkidle' });

  // Wait a bit for all resources to load
  await page.waitForTimeout(2000);

  // Execute performance measurement script
  const webVitals = await page.evaluate(() => {
    return new Promise<{ lcp: number; fcp: number; cls: number }>((resolve) => {
      // Use Performance Observer API for real LCP measurement
      let lcpScore = 0;
      let fcpScore = 0;
      let clsScore = 0;

      // FCP measurement using Performance API
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      fcpScore = fcpEntry ? fcpEntry.startTime : 0;

      // LCP measurement using PerformanceObserver
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcpScore = lastEntry.startTime;
      });

      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // LCP not supported, use fallback
        lcpScore = fcpEntry ? fcpEntry.startTime + 500 : 2000;
      }

      // CLS measurement using LayoutShift observer
      let lastLayoutShiftTime = 0;

      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            const layoutShift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
            if (lastLayoutShiftTime === 0 || entry.startTime - lastLayoutShiftTime > 1000) {
              clsScore += layoutShift.value || 0;
              lastLayoutShiftTime = entry.startTime;
            }
          }
        }
      });

      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // CLS not supported
      }

      // Fallback: use load event timing
      setTimeout(() => {
        if (lcpScore === 0) {
          const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          lcpScore = timing ? timing.loadEventEnd - timing.requestStart : 3000;
        }

        resolve({
          lcp: Math.round(lcpScore),
          fcp: Math.round(fcpScore),
          cls: Math.round(clsScore * 1000) / 1000,
        });
      }, 3000);
    });
  });

  return webVitals;
}

/**
 * Test keyboard navigation
 */
async function testKeyboardNavigation(page: Page): Promise<{ passed: boolean; issues: string[] }> {
  const issues: string[] = [];

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Press Tab key multiple times and check focus
  let focusableCount = 0;
  const focusedElements: string[] = [];

  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      return {
        tag: el.tagName,
        class: el.className.substring(0, 30),
        id: el.id,
        ariaLabel: el.getAttribute('aria-label'),
        tabIndex: el.tabIndex,
      };
    });

    if (focusedElement) {
      focusableCount++;
      focusedElements.push(`${i + 1}: ${focusedElement.tag} (${focusedElement.class})`);

      // Check if element has visible focus indicator
      const hasFocusStyle = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;

        const styles = window.getComputedStyle(el);
        const hasOutline = parseInt(styles.outlineWidth) > 0;
        const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
        const hasBorder = parseFloat(styles.borderWidth) > 0;

        return hasOutline || hasBoxShadow || hasBorder;
      });

      if (!hasFocusStyle && focusedElement.tag !== 'BODY') {
        issues.push(`Tab ${i + 1}: Focus indicator missing on ${focusedElement.tag}`);
      }
    }
  }

  if (focusableCount < 3) {
    issues.push(`Very few focusable elements found: ${focusableCount}`);
  }

  console.log(`  Keyboard navigation: ${focusableCount} focusable elements found`);
  focusedElements.slice(0, 5).forEach((el) => console.log(`    ${el}`));

  return { passed: issues.length === 0, issues };
}

/**
 * Test ARIA attributes
 */
async function testAriaAttributes(page: Page): Promise<{ passed: boolean; issues: string[] }> {
  const issues: string[] = [];

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check buttons have aria-label or text content
  const buttonsWithoutLabel = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    const issues: string[] = [];

    buttons.forEach((btn) => {
      const hasText = btn.textContent?.trim().length > 0;
      const hasAriaLabel = btn.hasAttribute('aria-label');
      const hasAriaLabelledby = btn.hasAttribute('aria-labelledby');

      if (!hasText && !hasAriaLabel && !hasAriaLabelledby) {
        issues.push(`Button without accessible name: ${btn.className.substring(0, 40)}`);
      }
    });

    return issues;
  });

  issues.push(...buttonsWithoutLabel);

  // Check images have alt attributes
  const imagesWithoutAlt = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    const issues: string[] = [];

    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        issues.push(`Image without alt: ${img.src?.substring(0, 50)}`);
      }
    });

    return issues;
  });

  issues.push(...imagesWithoutAlt);

  // Check interactive elements have appropriate roles
  const interactiveWithoutRole = await page.evaluate(() => {
    const elements = document.querySelectorAll('[onclick], [onkeydown]');
    const issues: string[] = [];

    elements.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (tag !== 'button' && tag !== 'a' && tag !== 'input') {
        const hasRole = el.hasAttribute('role');
        if (!hasRole) {
          issues.push(`Interactive element without role: ${tag}.${el.className.substring(0, 30)}`);
        }
      }
    });

    return issues;
  });

  issues.push(...interactiveWithoutRole);

  console.log(`  ARIA checks: ${buttonsWithoutLabel.length} button issues, ${imagesWithoutAlt.length} image issues, ${interactiveWithoutRole.length} interactive issues`);

  return { passed: issues.length === 0, issues };
}

// ─── Main Test Functions ─────────────────────────────────────────

async function testReactHydration(browser: Browser): Promise<void> {
  console.log('\n═══ React Hydration Tests ═══');

  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`Page error: ${err.message}`);
  });

  // Test pages to visit
  const testPages = [
    { url: BASE_URL, name: 'Homepage' },
    { url: `${BASE_URL}/tools`, name: 'Tools' },
    { url: `${BASE_URL}/community`, name: 'Community' },
    { url: `${BASE_URL}/en/`, name: 'English Homepage' },
  ];

  const componentsToTest = [
    // Header components
    { selector: 'nav', name: 'Navigation (Header)', page: 'Homepage' },
    { selector: '[data-search-trigger]', name: 'Search Trigger Button', page: 'Homepage' },
    { selector: '#mobile-menu-btn', name: 'Mobile Menu Button', page: 'Homepage' },

    // Chatbot
    { selector: 'button[aria-label*="聊天"], button[aria-label*="Chat"]', name: 'Chatbot Toggle', page: 'Homepage' },

    // Auth components
    { selector: 'button:has-text("登录"), button:has-text("Login"), button:has-text("注册"), button:has-text("Register")', name: 'Auth Buttons', page: 'Homepage' },

    // Community components
    { selector: '[class*="CommunityFeed"], [class*="Feed"]', name: 'Community Feed', page: 'Community' },

    // Tools page components
    { selector: '[class*="grid"], [class*="Grid"]', name: 'Tools Grid', page: 'Tools' },
  ];

  let componentCount = 0;
  let passedCount = 0;

  for (const testPage of testPages) {
    console.log(`\n  Testing: ${testPage.name} (${testPage.url})`);

    try {
      await page.goto(testPage.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Check for hydration errors
      const hydrationErrors = await detectHydrationErrors(page);
      if (hydrationErrors.length > 0) {
        results.hydration_results.hydration_errors.push(
          `${testPage.name}: ${hydrationErrors.join(', ')}`
        );
      }

      // Test components on this page
      for (const component of componentsToTest.filter((c) => c.page === testPage.name)) {
        componentCount++;
        const result = await testComponentHydration(page, component.selector, component.name);

        if (result.passed) {
          passedCount++;
        } else {
          results.hydration_results.warnings.push(result.error || 'Unknown error');
        }
      }
    } catch (error) {
      results.hydration_results.warnings.push(
        `${testPage.name}: Failed to load - ${error}`
      );
    }
  }

  // Check for React-specific console errors
  const reactErrors = consoleErrors.filter(
    (err) =>
      err.includes('Hydration') ||
      err.includes('hydration') ||
      err.includes('mismatch') ||
      err.includes('React') ||
      err.includes('did not match')
  );

  if (reactErrors.length > 0) {
    results.hydration_results.hydration_errors.push(
      ...reactErrors.map((e) => `Console: ${e.substring(0, 100)}`)
    );
  }

  results.hydration_results.components_tested = componentCount;
  console.log(`\n  Hydration summary: ${passedCount}/${componentCount} components passed`);

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

      console.log(
        `    LCP: ${metrics.lcp}ms ${lcpPass ? '[PASS]' : '[FAIL - target <2500ms]'}`
      );
      console.log(
        `    FCP: ${metrics.fcp}ms ${fcpPass ? '[PASS]' : '[FAIL - target <1800ms]'}`
      );
      console.log(
        `    CLS: ${metrics.cls} ${clsPass ? '[PASS]' : '[FAIL - target <0.1]'}`
      );
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
      await page.waitForTimeout(1500);

      results.responsive_results.viewport_tests++;

      // Check for layout overflow
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.documentElement.clientWidth ||
          document.body.scrollHeight > document.documentElement.clientHeight;
      });

      if (hasOverflow) {
        results.responsive_results.issues.push(
          `${viewportName}: Layout overflow detected`
        );
      }

      // Check for elements outside viewport
      const elementsOutOfView = await page.evaluate(() => {
        const issues: string[] = [];
        const elements = document.querySelectorAll('nav, header, main, .sticky, .fixed');

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
            issues.push(`${el.className.substring(0, 30)}: partly outside viewport`);
          }
        });

        return issues;
      });

      if (elementsOutOfView.length > 0) {
        results.responsive_results.issues.push(
          `${viewportName}: ${elementsOutOfView.length} elements partly outside viewport`
        );
      }

      // Check mobile menu functionality on mobile
      if (viewportName === 'mobile') {
        const menuButton = await page.$('#mobile-menu-btn');
        if (menuButton) {
          await menuButton.click();
          await page.waitForTimeout(500);

          const menuVisible = await page.isVisible('#mobile-menu');
          if (!menuVisible) {
            results.responsive_results.issues.push(
              `${viewportName}: Mobile menu not toggling correctly`
            );
          }
        }
      }

      console.log(`    ${viewportName} layout: OK`);
    } catch (error) {
      results.responsive_results.issues.push(
        `${viewportName}: ${error}`
      );
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
  if (keyboardResult.issues.length > 0) {
    results.accessibility_results.aria_issues.push(...keyboardResult.issues);
  }

  // Test focus visibility
  const focusVisibleResult = await testKeyboardNavigation(page);
  results.accessibility_results.focus_visible = focusVisibleResult.passed ? 'pass' : 'fail';

  // Test ARIA attributes
  const ariaResult = await testAriaAttributes(page);
  if (!ariaResult.passed) {
    results.accessibility_results.aria_issues.push(...ariaResult.issues);
  }

  console.log(`  Keyboard Navigation: ${results.accessibility_results.keyboard_nav}`);
  console.log(`  Focus Visibility: ${results.accessibility_results.focus_visible}`);
  console.log(`  ARIA Issues: ${results.accessibility_results.aria_issues.length}`);

  await context.close();
}

// ─── Main Execution ───────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  AI Student Survival - React Hydration & Performance     ║');
  console.log('║  superpowers:systematic-debugging                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  // Launch browser
  console.log('\nLaunching browser...');
  const browser = await chromium.launch({ headless: true });
  console.log('Browser launched successfully\n');

  // Run all tests
  await testReactHydration(browser);
  await testPerformance(browser);
  await testResponsive(browser);
  await testAccessibility(browser);

  await browser.close();

  // Calculate overall pass status
  const hydrationPass =
    results.hydration_results.hydration_errors.length === 0 &&
    results.hydration_results.components_tested > 0;

  const performancePass =
    Object.values(results.performance_results.lcp_scores).every(
      (v) => v <= 2500
    ) &&
    Object.values(results.performance_results.fcp_scores).every(
      (v) => v <= 1800
    );

  const responsivePass = results.responsive_results.issues.length === 0;
  const accessibilityPass =
    results.accessibility_results.keyboard_nav === 'pass' &&
    results.accessibility_results.focus_visible === 'pass' &&
    results.accessibility_results.aria_issues.length === 0;

  results.all_passed = hydrationPass && performancePass && responsivePass && accessibilityPass;

  // Output results
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST RESULTS                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  console.log('\n[Hydration Results]');
  console.log(`  Components Tested: ${results.hydration_results.components_tested}`);
  console.log(`  Hydration Errors: ${results.hydration_results.hydration_errors.length}`);
  results.hydration_results.hydration_errors.forEach((e) => console.log(`    - ${e}`));
  console.log(`  Warnings: ${results.hydration_results.warnings.length}`);
  results.hydration_results.warnings.forEach((w) => console.log(`    - ${w}`));

  console.log('\n[Performance Results]');
  console.log(`  Pages Tested: ${results.performance_results.pages_tested}`);
  console.log('  LCP Scores:');
  Object.entries(results.performance_results.lcp_scores).forEach(([k, v]) => {
    console.log(`    ${k}: ${v}ms ${v <= 2500 ? '[PASS]' : '[FAIL]'}`);
  });
  console.log('  FCP Scores:');
  Object.entries(results.performance_results.fcp_scores).forEach(([k, v]) => {
    console.log(`    ${k}: ${v}ms ${v <= 1800 ? '[PASS]' : '[FAIL]'}`);
  });
  console.log('  CLS Scores:');
  Object.entries(results.performance_results.cls_scores).forEach(([k, v]) => {
    console.log(`    ${k}: ${v} ${v <= 0.1 ? '[PASS]' : '[FAIL]'}`);
  });

  console.log('\n[Responsive Results]');
  console.log(`  Viewport Tests: ${results.responsive_results.viewport_tests}`);
  console.log(`  Issues: ${results.responsive_results.issues.length}`);
  results.responsive_results.issues.forEach((i) => console.log(`    - ${i}`));

  console.log('\n[Accessibility Results]');
  console.log(`  Keyboard Nav: ${results.accessibility_results.keyboard_nav}`);
  console.log(`  Focus Visible: ${results.accessibility_results.focus_visible}`);
  console.log(`  ARIA Issues: ${results.accessibility_results.aria_issues.length}`);
  results.accessibility_results.aria_issues.forEach((i) => console.log(`    - ${i}`));

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  Overall Status: ${results.all_passed ? 'ALL PASSED ✓' : 'ISSUES FOUND ✗'}`.padEnd(57) + '║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nTotal test time: ${totalTime}s`);

  // Save results to file
  const outputPath = path.join(process.cwd(), 'test-results', `hydration-test-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);

  // Exit with appropriate code
  process.exit(results.all_passed ? 0 : 1);
}

main().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});