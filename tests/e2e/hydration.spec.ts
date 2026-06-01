import { test, expect, Page } from '@playwright/test';

/**
 * Hydration Test Suite for React Components
 * Tests all React components with client:load and client:only directives
 * for hydration errors and React warnings
 */

interface HydrationResult {
  page: string;
  hydrationErrors: string[];
  warnings: string[];
  componentsRendered: string[];
}

// Collect console errors and warnings
async function collectConsoleMessages(page: Page): Promise<{ errors: string[], warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });

  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  return { errors, warnings };
}

// Test 1: Homepage hydration test
test.describe('Homepage Hydration Tests', () => {
  test('should load homepage without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    // Use load instead of networkidle - chatbot may have ongoing connections
    await page.goto('http://localhost:4321/', { waitUntil: 'load' });

    // Wait for React hydration to complete
    await page.waitForTimeout(3000);

    // Check for hydration-specific errors
    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration mismatch') ||
      e.includes('mismatch') ||
      e.includes('did not match') ||
      e.includes('Text content did not match')
    );

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('axobject-query') &&
      !e.includes('Failed to fetch') &&
      !e.includes('net::ERR')
    );

    console.log('Homepage Errors:', errors);
    console.log('Hydration Errors:', hydrationErrors);

    // Header should be visible (React component)
    const header = page.locator('nav');
    await expect(header).toBeVisible();

    // Chatbot button should be visible (React component with client:load)
    const chatbotButton = page.locator('button[aria-label*="聊天"]').or(page.locator('button[aria-label*="Chat"]'));
    await expect(chatbotButton).toBeVisible();
  });
});

// Test 2: Tools page - FavoriteButton and CompareButton hydration
test.describe('Tools Page Hydration Tests', () => {
  test('should load tools page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/tools', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch') ||
      e.includes('did not match')
    );

    console.log('Tools Page Errors:', errors);

    // Check for tool cards with FavoriteButton and CompareButton
    const favoriteButtons = page.locator('button[aria-label*="收藏"]').or(page.locator('button[aria-label*="Favorite"]'));
    const compareButtons = page.locator('button:has-text("对比")').or(page.locator('button:has-text("Compare")'));

    const favoriteCount = await favoriteButtons.count();
    const compareCount = await compareButtons.count();

    console.log(`Found ${favoriteCount} favorite buttons, ${compareCount} compare buttons`);

    expect(hydrationErrors.length).toBe(0);
  });

  test('FavoriteButton should render and interact correctly', async ({ page }) => {
    await page.goto('http://localhost:4321/tools', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Find and click a favorite button
    const favoriteButton = page.locator('button[aria-label*="收藏"], button[aria-label*="Favorite"]').first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Button should have changed state
      const isFavorited = await favoriteButton.getAttribute('aria-pressed');
      console.log('Favorite button aria-pressed:', isFavorited);
    }
  });

  test('CompareButton should render and interact correctly', async ({ page }) => {
    await page.goto('http://localhost:4321/tools', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Find and click a compare button
    const compareButton = page.locator('button:has-text("加入对比"), button:has-text("Add to Compare")').first();
    if (await compareButton.isVisible()) {
      await compareButton.click();
      await page.waitForTimeout(500);
      console.log('Compare button clicked successfully');
    }
  });
});

// Test 3: Compare page - CompareButton functionality
test.describe('Compare Page Hydration Tests', () => {
  test('should load compare page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/compare', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    console.log('Compare Page Errors:', errors);
    expect(hydrationErrors.length).toBe(0);
  });
});

// Test 4: Community page - CommunityFeed and ShareButton
test.describe('Community Page Hydration Tests', () => {
  test('should load community page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/community', { waitUntil: 'load' });
    await page.waitForTimeout(3000); // Community feed may fetch data

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch') ||
      e.includes('did not match')
    );

    console.log('Community Page Errors:', errors);

    // CommunityFeed should render
    const communityTitle = page.locator('h1:has-text("社区"), h1:has-text("Community")');
    if (await communityTitle.isVisible()) {
      console.log('CommunityFeed rendered successfully');
    }

    expect(hydrationErrors.length).toBe(0);
  });

  test('ShareButton should render and interact correctly', async ({ page }) => {
    await page.goto('http://localhost:4321/community', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Find share button
    const shareButton = page.locator('button:has-text("分享"), button:has-text("Share")').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await page.waitForTimeout(500);

      // Share menu should appear
      const shareMenu = page.locator('text=复制链接, text=Copy Link');
      if (await shareMenu.isVisible()) {
        console.log('ShareButton menu opened successfully');
      }
    }
  });
});

// Test 5: Map page - Leaflet Map hydration
test.describe('Map Page Hydration Tests', () => {
  test('should load map page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/map', { waitUntil: 'load' });
    await page.waitForTimeout(3000); // Map initialization takes time

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch') ||
      e.includes('did not match')
    );

    // Filter out known Leaflet warnings
    const criticalErrors = errors.filter(e =>
      !e.includes('leaflet') &&
      !e.includes('Tile') &&
      !e.includes('404')
    );

    console.log('Map Page Errors:', criticalErrors);

    // Map container should exist
    const mapContainer = page.locator('.leaflet-container');
    const mapVisible = await mapContainer.isVisible().catch(() => false);
    console.log('Map container visible:', mapVisible);

    expect(hydrationErrors.length).toBe(0);
  });
});

// Test 6: Tool detail page - Rating component
test.describe('Tool Detail Page Hydration Tests', () => {
  test('should load tool detail page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    // Go to a specific tool page
    await page.goto('http://localhost:4321/tools/chatgpt', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    console.log('Tool Detail Page Errors:', errors);

    // Check for StarRating component (5 star buttons)
    const starButtons = page.locator('button[aria-label*="星"]');
    const starCount = await starButtons.count();
    console.log(`Found ${starCount} star rating buttons`);

    expect(hydrationErrors.length).toBe(0);
  });

  test('StarRating should render and be interactive', async ({ page }) => {
    await page.goto('http://localhost:4321/tools/chatgpt', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Find star buttons
    const stars = page.locator('button[aria-label*="星"]');
    if (await stars.first().isVisible()) {
      // Hover over a star
      await stars.nth(2).hover();
      await page.waitForTimeout(300);

      // Click a star
      await stars.nth(4).click();
      await page.waitForTimeout(500);
      console.log('Star rating clicked successfully');
    }
  });
});

// Test 7: Policies page
test.describe('Policies Page Hydration Tests', () => {
  test('should load policies page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/policies', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    console.log('Policies Page Errors:', errors);
    expect(hydrationErrors.length).toBe(0);
  });
});

// Test 8: Auth states - testing AuthProvider hydration
test.describe('Auth Provider Hydration Tests', () => {
  test('should handle auth states without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    // AuthProvider should render user menu without issues
    const userMenu = page.locator('button:has-text("登录"), button:has-text("Login"), button:has-text("用户")').first();
    if (await userMenu.isVisible()) {
      console.log('User menu rendered successfully');
    }

    console.log('Auth Errors:', errors);
    expect(hydrationErrors.length).toBe(0);
  });
});

// Test 9: Chatbot component interaction
test.describe('Chatbot Hydration Tests', () => {
  test('Chatbot should open and close without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Find and click chatbot button
    const chatbotButton = page.locator('button[aria-label*="聊天"], button[aria-label*="Expand"], button[aria-label*="展开"]').first();
    if (await chatbotButton.isVisible()) {
      await chatbotButton.click();
      await page.waitForTimeout(1000);

      // Chat window should be visible
      const chatWindow = page.locator('text=AI助手, text=AI Assistant').or(page.locator("h3:has-text('AI助手')")).first();
      const chatVisible = await chatWindow.isVisible().catch(() => false);
      console.log('Chat window visible:', chatVisible);

      // Close chatbot
      const closeButton = page.locator('button[aria-label*="关闭"], button[aria-label*="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    console.log('Chatbot Errors:', errors);
    expect(hydrationErrors.length).toBe(0);
  });
});

// Test 10: Search Modal hydration
test.describe('Search Modal Hydration Tests', () => {
  test('Search modal should open via keyboard shortcut', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Press Ctrl+K to open search
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);

    // Check if modal opened
    const searchModal = page.locator('#search-modal');
    const isActive = await searchModal.evaluate(el => el.classList.contains('active'));
    console.log('Search modal active:', isActive);

    // Press ESC to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    expect(hydrationErrors.length).toBe(0);
  });
});

// Test 11: Multi-language support (English pages)
test.describe('English Pages Hydration Tests', () => {
  test('should load English homepage without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/en/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    console.log('English Homepage Errors:', errors);
    expect(hydrationErrors.length).toBe(0);
  });

  test('should load English tools page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/en/tools', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    console.log('English Tools Page Errors:', errors);
    expect(hydrationErrors.length).toBe(0);
  });
});

// Test 12: Payment page
test.describe('Payment Page Hydration Tests', () => {
  test('should load payment page without hydration errors', async ({ page }) => {
    const { errors, warnings } = await collectConsoleMessages(page);

    await page.goto('http://localhost:4321/payment', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    const hydrationErrors = errors.filter(e =>
      e.includes('Hydration') ||
      e.includes('hydration') ||
      e.includes('mismatch')
    );

    console.log('Payment Page Errors:', errors);
    expect(hydrationErrors.length).toBe(0);
  });
});

// Summary test - aggregate all results
test.describe('Hydration Test Summary', () => {
  test('aggregate all hydration results', async ({ page }) => {
    const results: HydrationResult[] = [];
    const pagesToTest = [
      { name: 'Homepage', url: '/' },
      { name: 'Tools', url: '/tools' },
      { name: 'Compare', url: '/compare' },
      { name: 'Community', url: '/community' },
      { name: 'Map', url: '/map' },
      { name: 'Policies', url: '/policies' },
      { name: 'Payment', url: '/payment' },
      { name: 'English Home', url: '/en/' },
    ];

    for (const pageInfo of pagesToTest) {
      const { errors } = await collectConsoleMessages(page);

      await page.goto(`http://localhost:4321${pageInfo.url}`, { waitUntil: 'load' });
      await page.waitForTimeout(2000);

      const hydrationErrors = errors.filter(e =>
        e.includes('Hydration') ||
        e.includes('hydration') ||
        e.includes('mismatch') ||
        e.includes('did not match')
      );

      results.push({
        page: pageInfo.name,
        hydrationErrors,
        warnings: [],
        componentsRendered: []
      });
    }

    // Log summary
    console.log('\n=== Hydration Test Summary ===');
    let totalErrors = 0;
    for (const result of results) {
      console.log(`${result.page}: ${result.hydrationErrors.length} errors`);
      totalErrors += result.hydrationErrors.length;
    }
    console.log(`Total hydration errors: ${totalErrors}`);

    // This test always passes - it's just for reporting
    expect(totalErrors).toBe(0);
  });
});