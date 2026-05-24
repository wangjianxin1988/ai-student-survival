// Deep Community Testing Script - v2 with Auth Support
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
  console.log('  DEEP COMMUNITY TESTING v2 - START');
  console.log('========================================\n');

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'zh-CN'
  });
  page = await context.newPage();

  const consoleErrors: { type: string; text: string }[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ type: msg.type(), text: msg.text() });
    }
  });

  try {
    // ========================================
    // STEP 1: Community Feed - Initial Load
    // ========================================
    console.log('STEP 1: Community Feed - Initial Load');
    console.log('  URL: ' + BASE_URL + '/community');

    await page.goto(BASE_URL + '/community', { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot('01_community_feed_initial');

    const heading = await page.textContent('h1');
    console.log('  Heading: ' + heading);

    // Wait for React hydration
    await sleep(2000);

    // Check posts
    const postsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/community?limit=5');
      return res.json();
    });

    if (postsResponse.success) {
      console.log('  Posts from API: ' + postsResponse.data.length);
      console.log('  Total posts: ' + postsResponse.meta.total);

      if (postsResponse.data.length > 0) {
        const firstPost = postsResponse.data[0];
        console.log('  First post: ' + firstPost.title);

        // ========================================
        // STEP 2: Post Detail Page
        // ========================================
        console.log('\nSTEP 2: Post Detail Page');

        await page.goto(BASE_URL + '/community/' + firstPost.id, { waitUntil: 'networkidle', timeout: 30000 });
        await screenshot('02_post_detail_initial');

        const postTitle = await page.textContent('h1');
        console.log('  Post title: ' + postTitle?.trim());

        // Check for key elements
        const likeButton = await page.$('button:has-text("点赞")');
        const favoriteButton = await page.$('button:has-text("收藏")');
        const commentSection = await page.$('h3:has-text("评论")');
        const heatProgress = await page.$('text=热度进度');

        console.log('  Like button: ' + (likeButton ? 'FOUND' : 'NOT FOUND'));
        console.log('  Favorite button: ' + (favoriteButton ? 'FOUND' : 'NOT FOUND'));
        console.log('  Comment section: ' + (commentSection ? 'FOUND' : 'NOT FOUND'));
        console.log('  Heat progress: ' + (heatProgress ? 'FOUND' : 'NOT FOUND'));

        // Try clicking like (should fail without login)
        if (likeButton) {
          const beforeClick = await likeButton.textContent();
          console.log('  Like count before: ' + beforeClick);

          const isDisabled = await likeButton.isDisabled();
          console.log('  Like button disabled: ' + isDisabled);

          if (!isDisabled) {
            await likeButton.click();
            await sleep(500);
            const afterClick = await likeButton.textContent();
            console.log('  Like count after click: ' + afterClick);
          }
        }

        // Test comments API
        const commentsResponse = await page.evaluate(async (postId) => {
          const res = await fetch('/api/community/' + postId + '/comments');
          return res.json();
        }, firstPost.id);

        console.log('  Comments API: ' + (commentsResponse.success ? 'OK' : 'FAILED'));
        if (commentsResponse.success) {
          console.log('    Comments count: ' + commentsResponse.data.length);
        }

      } else {
        console.log('  No posts in database - testing empty state');
        await screenshot('02_empty_community');
      }
    }

    // ========================================
    // STEP 3: Category Filter Test
    // ========================================
    console.log('\nSTEP 3: Category Filter Test');

    await page.goto(BASE_URL + '/community', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(1000);
    await screenshot('03_category_filter');

    // Test each category
    const categories = ['AI工具', '支付指南', '政策', 'Prompt', '妙妙贴', '讨论', '问答'];
    for (const cat of categories) {
      const catBtn = await page.$(`button:has-text("${cat}")`);
      if (catBtn) {
        await catBtn.click();
        await sleep(500);

        const apiRes = await page.evaluate(async (category) => {
          const res = await fetch('/api/community?category=' + category + '&limit=3');
          return res.json();
        }, cat === 'AI工具' ? 'tools' : cat === '支付指南' ? 'payment' : cat === '政策' ? 'policy' : cat === 'Prompt' ? 'prompt' : cat === '妙妙贴' ? 'survival' : cat === '讨论' ? 'discussion' : 'qa');

        console.log('  Category ' + cat + ': ' + apiRes.data.length + ' posts');
      }
    }

    // Test sort dropdown
    const sortSelect = await page.$('select');
    if (sortSelect) {
      await sortSelect.selectOption('popular');
      await sleep(1000);
      await screenshot('04_sorted_by_popular');

      const popularRes = await page.evaluate(async () => {
        const res = await fetch('/api/community?sort=popular&limit=5');
        return res.json();
      });
      console.log('  Sorted by popular: ' + popularRes.data.length + ' posts');
    }

    // ========================================
    // STEP 4: Login Flow
    // ========================================
    console.log('\nSTEP 4: Login Flow');

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot('05_login_page');

    // Check login form elements
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="邮箱"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"]');

    console.log('  Email input: ' + (emailInput ? 'FOUND' : 'NOT FOUND'));
    console.log('  Password input: ' + (passwordInput ? 'FOUND' : 'NOT FOUND'));
    console.log('  Login button: ' + (loginButton ? 'FOUND' : 'NOT FOUND'));

    // Try to login with test credentials
    if (emailInput && passwordInput) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword123');
      await screenshot('06_login_filled');

      if (loginButton) {
        await loginButton.click();
        await sleep(3000);
        await screenshot('07_after_login_attempt');
        console.log('  Current URL after login: ' + page.url());
      }
    }

    // ========================================
    // STEP 5: Post Creation Page (if logged in)
    // ========================================
    console.log('\nSTEP 5: Post Creation Page');

    await page.goto(BASE_URL + '/community/create', { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot('08_create_page');

    const currentUrl = page.url();
    console.log('  Current URL: ' + currentUrl);

    if (currentUrl.includes('/community/create')) {
      console.log('  SUCCESS: On create page');

      // Check for category buttons
      const categoryBtns = await page.$$('button[type="button"]');
      console.log('  Category buttons: ' + categoryBtns.length);

      // Fill in form
      const titleInput = await page.$('input[maxlength="255"]');
      if (titleInput) {
        await titleInput.fill('测试帖子 - Playwright自动化测试');
        console.log('  Filled title');
      }

      // Select a category
      const discussionBtn = await page.$('button:has-text("讨论")');
      if (discussionBtn) {
        await discussionBtn.click();
        await sleep(500);
        console.log('  Selected discussion category');
      }

      // Check for meta fields (content textarea)
      const contentArea = await page.$('textarea[placeholder*="话题"], textarea[placeholder*="问题"]');
      if (contentArea) {
        await contentArea.fill('这是Playwright自动化测试生成的帖子内容。用于验证社区发帖功能是否正常工作。');
        console.log('  Filled content');
      }

      // Check for captcha
      const captcha = await page.$('[class*="captcha"], [class*="math"]');
      console.log('  Captcha present: ' + (captcha ? 'YES' : 'NO'));

      await screenshot('09_create_form_filled');

    } else if (currentUrl.includes('/login')) {
      console.log('  Redirected to login - need valid credentials');

      // Check for demo user credentials
      const demoLoginSection = await page.$('text=测试账号, text=demo, text=Demo');
      if (demoLoginSection) {
        console.log('  Found demo login section');
      }
    }

    // ========================================
    // STEP 6: API Comprehensive Tests
    // ========================================
    console.log('\nSTEP 6: API Comprehensive Tests');

    // Test 1: GET community posts
    const getPosts = await page.evaluate(async () => {
      const res = await fetch('/api/community?limit=10');
      const data = await res.json();
      return { status: res.status, count: data.data?.length || 0, total: data.meta?.total || 0 };
    });
    console.log('  [GET] /api/community: ' + getPosts.status + ', posts=' + getPosts.count + ', total=' + getPosts.total);

    // Test 2: GET with category filter
    const getByCategory = await page.evaluate(async () => {
      const res = await fetch('/api/community?category=tools&limit=5');
      return res.status;
    });
    console.log('  [GET] /api/community?category=tools: ' + getByCategory);

    // Test 3: GET with sort=popular
    const getPopular = await page.evaluate(async () => {
      const res = await fetch('/api/community?sort=popular&limit=5');
      return res.status;
    });
    console.log('  [GET] /api/community?sort=popular: ' + getPopular);

    // Test 4: GET featured posts
    const getFeatured = await page.evaluate(async () => {
      const res = await fetch('/api/community?auto_promoted=true&limit=3');
      return res.status;
    });
    console.log('  [GET] /api/community?auto_promoted=true: ' + getFeatured);

    // Test 5: POST create (unauthorized)
    const postCreate = await page.evaluate(async () => {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Test content for API validation',
          category: 'discussion'
        })
      });
      const data = await res.json();
      return { status: res.status, error: data.error?.message || 'none' };
    });
    console.log('  [POST] /api/community (unauth): ' + postCreate.status + ', error="' + postCreate.error + '"');

    // Test 6: POST promote (unauthorized)
    const postPromote = await page.evaluate(async () => {
      const res = await fetch('/api/community/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: 'test-id' })
      });
      const data = await res.json();
      return { status: res.status, error: data.error?.message || 'none' };
    });
    console.log('  [POST] /api/community/promote (unauth): ' + postPromote.status + ', error="' + postPromote.error + '"');

    // Test 7: GET post comments
    const getComments = await page.evaluate(async () => {
      // Get first post
      const res = await fetch('/api/community?limit=1');
      const data = await res.json();
      if (data.data?.length > 0) {
        const postId = data.data[0].id;
        const commentsRes = await fetch('/api/community/' + postId + '/comments');
        const commentsData = await commentsRes.json();
        return { status: commentsRes.status, count: commentsData.data?.length || 0 };
      }
      return { status: 0, count: 0 };
    });
    console.log('  [GET] /api/community/{id}/comments: ' + getComments.status + ', count=' + getComments.count);

    // Test 8: POST like (unauthorized)
    const postLike = await page.evaluate(async () => {
      const res = await fetch('/api/community/test-post-id/like', { method: 'POST' });
      const data = await res.json();
      return { status: res.status, error: data.error?.message || 'none' };
    });
    console.log('  [POST] /api/community/{id}/like (unauth): ' + postLike.status + ', error="' + postLike.error + '"');

    // ========================================
    // STEP 7: Console Errors Summary
    // ========================================
    console.log('\nSTEP 7: Console Errors Summary');
    if (consoleErrors.length > 0) {
      console.log('  Total errors: ' + consoleErrors.length);
      const uniqueErrors = [...new Set(consoleErrors.map(e => e.text.substring(0, 80)))];
      uniqueErrors.forEach((err, i) => {
        console.log('    ' + (i + 1) + '. ' + err);
      });
    } else {
      console.log('  No console errors detected');
    }

    // ========================================
    // Final screenshot
    // ========================================
    await screenshot('99_final_state');

  } catch (error: any) {
    console.error('\nERROR DURING TESTING:');
    console.error('  ' + error.message);
    console.error('  ' + error.stack?.substring(0, 300));
    await screenshot('99_error_state');
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('  TESTING COMPLETE');
  console.log('  Screenshots: ' + TEST_DIR);
  console.log('  Total screenshots: ' + screenshotCount);
  console.log('========================================\n');
}

runTests().catch(console.error);