// Deep Community Testing Script
import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = 'D:/suoyouxiangmu/ai-student-survival/test-results/deep-community/';
const BASE_URL = 'http://localhost:4328';

// Ensure test directory exists
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

let browser: Browser;
let page: Page;
let screenshotCount = 0;

async function screenshot(name: string) {
  screenshotCount++;
  const filename = `${String(screenshotCount).padStart(3, '0')}_${name}.png`;
  const filepath = path.join(TEST_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  [Screenshot saved]: ${filename}`);
  return filename;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('========================================');
  console.log('  DEEP COMMUNITY TESTING - START');
  console.log('========================================\n');

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'zh-CN'
  });
  page = await context.newPage();

  // Enable console log interception
  const consoleLogs: { type: string; text: string }[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    }
  });

  try {
    // ========================================
    // STEP 1: Community Feed Page
    // ========================================
    console.log('STEP 1: Testing Community Feed Page');
    console.log('  URL: ' + BASE_URL + '/community');

    await page.goto(BASE_URL + '/community', { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot('01_community_feed_initial');

    // Check for page title
    const title = await page.title();
    console.log('  Page title: ' + title);

    // Wait for posts to load
    await sleep(2000);

    // Check if community heading exists
    const heading = await page.textContent('h1');
    console.log('  Heading: ' + heading);

    // Check for post cards
    const postCards = await page.$$('.bg-white.rounded-lg, [class*="post-card"], article');
    console.log('  Found ' + postCards.length + ' post cards');

    // Try category filter buttons
    const filterButtons = await page.$$('button, [role="button"], .cursor-pointer');
    console.log('  Found ' + filterButtons.length + ' interactive elements');

    // Try sort dropdown
    const sortSelect = await page.$('select');
    if (sortSelect) {
      console.log('  Found sort dropdown');
      await screenshot('02_community_feed_sort_dropdown');
    }

    // Check if "发布帖子" or login button exists
    const postButton = await page.$('a:has-text("发布帖子"), a:has-text("登录"), a:has-text("Login")');
    if (postButton) {
      const buttonText = await postButton.textContent();
      console.log('  Found CTA button: ' + buttonText?.trim());
    }

    // ========================================
    // STEP 2: Click a post and view detail
    // ========================================
    console.log('\nSTEP 2: Testing Post Detail Page');

    // Try to find and click a post card
    const clickablePost = await page.$('a[href*="/community/"], [data-post-id], .cursor-pointer');
    if (clickablePost) {
      // Navigate directly to a post if we can't find one to click
    }

    // Fetch posts via API to find a real post ID
    const postsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/community?limit=5');
      return res.json();
    });

    if (postsResponse.success && postsResponse.data.length > 0) {
      const firstPost = postsResponse.data[0];
      console.log('  Found post: ' + firstPost.title);

      // Navigate to post detail
      await page.goto(BASE_URL + '/community/' + firstPost.id, { waitUntil: 'networkidle', timeout: 30000 });
      await screenshot('03_post_detail_initial');

      // Check page content
      const postTitle = await page.textContent('h1');
      console.log('  Post title: ' + postTitle?.trim());

      // Check for content
      const content = await page.textContent('article, .prose, [class*="content"]');
      if (content) {
        console.log('  Content length: ' + content.trim().length + ' chars');
      }

      // Check for like button
      const likeButton = await page.$('button:has-text("点赞")');
      if (likeButton) {
        console.log('  Found like button');
        const isDisabled = await likeButton.isDisabled();
        console.log('  Like button disabled (needs login): ' + isDisabled);
      }

      // Check for favorite button
      const favoriteButton = await page.$('button:has-text("收藏")');
      if (favoriteButton) {
        console.log('  Found favorite button');
        const isDisabled = await favoriteButton.isDisabled();
        console.log('  Favorite button disabled (needs login): ' + isDisabled);
      }

      // Check for comment section
      const commentSection = await page.$('h3:has-text("评论"), section:has-text("评论")');
      if (commentSection) {
        console.log('  Found comment section');
        await screenshot('04_post_detail_comments');
      }

      // Check for heat progress bar
      const heatBar = await page.$('text=热度进度');
      if (heatBar) {
        console.log('  Found heat progress bar');
      }

    } else {
      console.log('  No posts found - empty community');
    }

    // ========================================
    // STEP 3: Login Flow
    // ========================================
    console.log('\nSTEP 3: Testing Login Flow');

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot('05_login_page');

    // Check if login form exists
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="邮箱"], input[placeholder*="email"]');
    if (emailInput) {
      console.log('  Found email input');
    }

    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      console.log('  Found password input');
    }

    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      console.log('  Found submit button');
    }

    // ========================================
    // STEP 4: Post Creation Page (if logged in)
    // ========================================
    console.log('\nSTEP 4: Testing Post Creation Page');

    await page.goto(BASE_URL + '/community/create', { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot('06_post_create_page');

    // Check where we ended up
    const currentUrl = page.url();
    console.log('  Current URL: ' + currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('  Redirected to login - user not authenticated');
    } else if (currentUrl.includes('/community/create')) {
      console.log('  On create page');

      // Check for category selection
      const categoryButtons = await page.$$('button[type="button"]');
      console.log('  Category buttons: ' + categoryButtons.length);

      // Check for title input
      const titleInput = await page.$('input[placeholder*="标题"], input[maxlength="255"]');
      if (titleInput) {
        console.log('  Found title input');
      }

      // Check for captcha
      const captcha = await page.$('[class*="captcha"], [class*="math"]');
      if (captcha) {
        console.log('  Found captcha');
      }
    }

    // ========================================
    // STEP 5: API Tests
    // ========================================
    console.log('\nSTEP 5: Testing Community APIs');

    // Test GET /api/community
    const apiResponse = await page.evaluate(async () => {
      const res = await fetch('/api/community?limit=3');
      return { status: res.status, data: await res.json() };
    });
    console.log('  GET /api/community: ' + apiResponse.status);
    if (apiResponse.data.success) {
      console.log('    Posts returned: ' + apiResponse.data.data.length);
      console.log('    Total posts: ' + apiResponse.data.meta.total);
    }

    // Test GET /api/community with sort
    const sortResponse = await page.evaluate(async () => {
      const res = await fetch('/api/community?sort=popular&limit=3');
      return { status: res.status, data: await res.json() };
    });
    console.log('  GET /api/community?sort=popular: ' + sortResponse.status);

    // Test GET /api/community with category filter
    const categoryResponse = await page.evaluate(async () => {
      const res = await fetch('/api/community?category=discussion&limit=3');
      return { status: res.status, data: await res.json() };
    });
    console.log('  GET /api/community?category=discussion: ' + categoryResponse.status);

    // Test POST /api/community (unauthorized)
    const postResponse = await page.evaluate(async () => {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', content: 'Test content', category: 'discussion' })
      });
      return { status: res.status, data: await res.json() };
    });
    console.log('  POST /api/community (unauthorized): ' + postResponse.status);
    console.log('    Error: ' + (postResponse.data.error?.message || 'none'));

    // Test POST /api/community/promote (unauthorized)
    const promoteResponse = await page.evaluate(async () => {
      const res = await fetch('/api/community/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: 'test-id' })
      });
      return { status: res.status, data: await res.json() };
    });
    console.log('  POST /api/community/promote (unauthorized): ' + promoteResponse.status);
    console.log('    Error: ' + (promoteResponse.data.error?.message || 'none'));

    // ========================================
    // Console Errors Check
    // ========================================
    console.log('\nCONSOLE ERRORS CHECK');
    if (consoleLogs.length > 0) {
      console.log('  Found ' + consoleLogs.length + ' console errors:');
      consoleLogs.forEach((log, i) => {
        console.log('    ' + (i + 1) + '. [' + log.type + '] ' + log.text.substring(0, 100));
      });
    } else {
      console.log('  No console errors detected');
    }

    // ========================================
    // Final Screenshot
    // ========================================
    await screenshot('99_final_state');

  } catch (error: any) {
    console.error('\nERROR DURING TESTING:');
    console.error('  ' + error.message);
    await screenshot('99_error_state');
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('  TESTING COMPLETE');
  console.log('  Screenshots saved to: ' + TEST_DIR);
  console.log('  Total screenshots: ' + screenshotCount);
  console.log('========================================\n');
}

runTests().catch(console.error);