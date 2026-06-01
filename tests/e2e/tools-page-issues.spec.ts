import { test, expect } from '@playwright/test';

test.describe('Tools Page Issues Verification - Simplified', () => {
  const BASE_URL = 'http://localhost:4321';

  test('Issue #9: Sorting label display check - PASS condition: text flows horizontally', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('networkidle');

    // Get the sort label specifically (first one with "排序:")
    const sortLabel = page.getByText('排序:', { exact: true });
    await expect(sortLabel).toBeVisible();

    // Get bounding box to verify aspect ratio
    const box = await sortLabel.boundingBox();
    console.log(`Sort label box: ${JSON.stringify(box)}`);

    if (box) {
      const ratio = box.width / box.height;
      console.log(`Aspect ratio (w/h): ${ratio.toFixed(2)}`);
      // For horizontal text, ratio should be > 1 (width > height)
      // For vertical stacking, ratio would be < 1
      expect(ratio).toBeGreaterThan(1);
    }

    // Screenshot for visual evidence
    await page.screenshot({ path: 'issue-9-sort-label-check.png', fullPage: true });
  });

  test('Issue #10: Model images load without encoding issues - PASS condition: all images have valid dimensions', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for images

    const images = page.locator('.tool-card img');
    const count = await images.count();
    console.log(`Total images: ${count}`);

    let failedImages = 0;
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const w = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
      const h = await img.evaluate((el) => (el as HTMLImageElement).naturalHeight);
      if (w === 0 || h === 0) {
        failedImages++;
        const src = await img.getAttribute('src');
        console.log(`FAILED image ${i}: src=${src}`);
      }
    }

    console.log(`Failed images: ${failedImages}/${count}`);
    expect(failedImages).toBe(0);

    await page.screenshot({ path: 'issue-10-images-check.png', fullPage: true });
  });

  test('Issue #11: Detail page has quality content - PASS condition: all sections visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/chatgpt`);
    await page.waitForLoadState('networkidle');

    // Check h1 title
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const title = await h1.innerText();
    console.log(`Title: ${title}`);
    expect(title).toContain('ChatGPT');

    // Check description paragraph (first one only)
    const desc = page.locator('p.text-lg.text-gray-600').first();
    await expect(desc).toBeVisible();
    const descText = await desc.innerText();
    expect(descText.length).toBeGreaterThan(20);
    console.log(`Description length: ${descText.length}`);

    // Check features section
    const features = page.getByText('核心功能');
    await expect(features).toBeVisible();

    // Check rating section
    const rating = page.getByText('评分详情');
    await expect(rating).toBeVisible();

    // Check hero image
    const heroImg = page.locator('.rounded-xl img').first();
    await expect(heroImg).toBeVisible();
    const imgLoaded = await heroImg.evaluate((el) =>
      (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0
    );
    expect(imgLoaded).toBe(true);

    await page.screenshot({ path: 'issue-11-detail-check.png', fullPage: true });
  });

  test('Issue #12: Star rating click functionality - PASS condition: click triggers login redirect', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/chatgpt`);
    await page.waitForLoadState('networkidle');

    // Find the rating section and its buttons
    const ratingDiv = page.locator('.rating').first();
    await expect(ratingDiv).toBeVisible();

    const stars = ratingDiv.locator('button');
    const starCount = await stars.count();
    console.log(`Star count: ${starCount}`);
    expect(starCount).toBe(5);

    // Click 4th star
    await stars.nth(3).click();
    await page.waitForTimeout(1000);

    // Verify redirect to login
    const url = page.url();
    console.log(`After click URL: ${url}`);
    expect(url).toContain('/auth/login');

    await page.screenshot({ path: 'issue-12-stars-check.png', fullPage: true });
  });
});
