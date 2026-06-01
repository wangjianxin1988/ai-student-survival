/**
 * Debug mobile menu toggle issue
 */

import { chromium } from 'playwright';

async function main() {
  console.log('Testing mobile menu toggle...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });

  const page = await context.newPage();

  // Capture all console messages
  page.on('console', msg => {
    console.log(`[Console ${msg.type()}]: ${msg.text().substring(0, 150)}`);
  });

  await page.goto('http://localhost:4322', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('\n--- Checking initial state ---');

  const initialState = await page.evaluate(() => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    return {
      btnExists: !!btn,
      menuExists: !!menu,
      btnVisible: btn ? window.getComputedStyle(btn).display !== 'none' : false,
      menuVisible: menu ? !menu.classList.contains('hidden') : false,
      menuClasses: menu ? menu.className : 'null',
      bodyWidth: document.body.scrollWidth,
      windowWidth: window.innerWidth,
    };
  });

  console.log('Initial state:', JSON.stringify(initialState, null, 2));

  // Try clicking the button via JavaScript
  console.log('\n--- Clicking via JavaScript ---');

  await page.evaluate(() => {
    const btn = document.getElementById('mobile-menu-btn');
    if (btn) {
      console.log('Found button, clicking...');
      btn.click();
    } else {
      console.log('Button not found!');
    }
  });

  await page.waitForTimeout(500);

  const afterClickJS = await page.evaluate(() => {
    const menu = document.getElementById('mobile-menu');
    return {
      menuExists: !!menu,
      menuVisible: menu ? !menu.classList.contains('hidden') : false,
      menuClasses: menu ? menu.className : 'null',
    };
  });

  console.log('After JS click:', JSON.stringify(afterClickJS, null, 2));

  // Try clicking via Playwright
  console.log('\n--- Clicking via Playwright ---');

  const btn = page.locator('#mobile-menu-btn');
  const isBtnVisible = await btn.isVisible();
  console.log('Button visible to Playwright:', isBtnVisible);

  if (isBtnVisible) {
    await btn.click({ force: true });
    await page.waitForTimeout(500);

    const afterPlaywrightClick = await page.evaluate(() => {
      const menu = document.getElementById('mobile-menu');
      return {
        menuExists: !!menu,
        menuVisible: menu ? !menu.classList.contains('hidden') : false,
        menuClasses: menu ? menu.className : 'null',
      };
    });

    console.log('After Playwright click:', JSON.stringify(afterPlaywrightClick, null, 2));
  }

  // Check if React has hydrated the click handler
  console.log('\n--- Checking React hydration ---');

  const reactHydration = await page.evaluate(() => {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');

    // Check if astro-island has hydrated
    const islands = document.querySelectorAll('astro-island');
    const hydratedIslands = Array.from(islands).filter(island =>
      !island.hasAttribute('ssr') || island.getAttribute('ssr') === 'false'
    );

    return {
      btnInDOM: !!btn,
      btnParent: btn?.parentElement?.className,
      navInDOM: !!nav,
      totalIslands: islands.length,
      hydratedIslands: hydratedIslands.length,
    };
  });

  console.log('React hydration:', JSON.stringify(reactHydration, null, 2));

  // Try manually dispatching click event
  console.log('\n--- Dispatching click event ---');

  await page.evaluate(() => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
      // Manually toggle to test
      menu.classList.toggle('hidden');
      console.log('Manually toggled menu, now visible:', !menu.classList.contains('hidden'));
    }
  });

  const afterManualToggle = await page.evaluate(() => {
    const menu = document.getElementById('mobile-menu');
    return {
      menuVisible: menu ? !menu.classList.contains('hidden') : false,
      menuClasses: menu ? menu.className : 'null',
    };
  });

  console.log('After manual toggle:', JSON.stringify(afterManualToggle, null, 2));

  // Check if button click listener is attached
  const hasClickListener = await page.evaluate(() => {
    const btn = document.getElementById('mobile-menu-btn');
    if (!btn) return false;

    // Check for onclick attribute
    const hasOnClickAttr = btn.hasAttribute('onclick');

    // Check for event listeners using getEventListeners (Chrome only)
    const listeners = (window as any).getEventListeners?.(btn);
    const hasListeners = listeners && Object.keys(listeners).length > 0;

    return { hasOnClickAttr, hasListeners, listenerTypes: listeners ? Object.keys(listeners) : [] };
  });

  console.log('Click listeners:', JSON.stringify(hasClickListener, null, 2));

  await browser.close();
}

main().catch(console.error);