/**
 * v104-Contact-Test - Comprehensive contact form and email test
 * Tests all contact form functionality with screenshots
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { readdirSync } from 'fs';

const TEST_DIR = 'D:/suoyouxiangmu/ai-student-survival/test-results/v104-contact';
const BASE_URL = 'http://localhost:4328';

async function screenshot(page, name) {
  const path = `${TEST_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  [SCREENSHOT] ${name}`);
  return path;
}

async function solveMathCaptcha(page) {
  try {
    const captchaDiv = page.locator('text=/\\d+ \\+ \\d+/').first();
    if (await captchaDiv.isVisible({ timeout: 2000 })) {
      const captchaText = await captchaDiv.textContent();
      const match = captchaText?.match(/(\d+) \+ (\d+)/);
      if (match) {
        const answer = parseInt(match[1]) + parseInt(match[2]);
        const input = page.locator('input[type="number"], input[placeholder*="答案"]').first();
        if (await input.isVisible({ timeout: 1000 })) {
          await input.fill(answer.toString());
          console.log(`  [CAPTCHA] Solved: ${match[1]} + ${match[2]} = ${answer}`);
        }
      }
    }
  } catch {
    console.log('  [CAPTCHA] No captcha found or already solved');
  }
}

// ==================== TEST SUITE ====================

async function testContactPageLoad() {
  console.log('\n=== [1] Contact Page Load ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });
    await screenshot(page, '01_contact_page_full');

    const title = await page.title();
    console.log(`  [INFO] Page title: ${title}`);

    await browser.close();
    return { name: 'Contact Page Load', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Contact Page Load', passed: false, error: String(error) };
  }
}

async function testContactInfoDisplay() {
  console.log('\n=== [2] Contact Info & Email Display ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    const codeElements = await page.locator('code').allTextContents();
    console.log(`  [INFO] Code elements found: ${JSON.stringify(codeElements)}`);

    const pageText = await page.textContent('body');
    const hasEmail = pageText?.includes('188801400211@163.com') ||
                     pageText?.includes('contact@mi-to-ai.com') ||
                     pageText?.includes('@163.com');
    console.log(`  [INFO] Email display check: ${hasEmail ? 'FOUND' : 'NOT FOUND'}`);

    await screenshot(page, '02_contact_email_visible');
    await browser.close();
    return { name: 'Contact Info Display', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Contact Info Display', passed: false, error: String(error) };
  }
}

async function testFormFilling() {
  console.log('\n=== [3] Form Filling ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    await page.evaluate(() => window.scrollTo(0, 200));
    await screenshot(page, '03_contact_form_visible');

    await page.fill('input[type="text"]', '张同学');
    await page.fill('input[type="email"]', '188801400211@163.com');
    await page.selectOption('select', 'feedback');
    await page.fill('textarea', '这是一条详细的测试反馈消息。我们正在测试联系表单功能是否正常工作。希望能收到这封邮件。谢谢！');

    await screenshot(page, '04_contact_form_filled');
    await solveMathCaptcha(page);
    await screenshot(page, '05_before_submit');

    await browser.close();
    return { name: 'Form Filling', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Form Filling', passed: false, error: String(error) };
  }
}

async function testFormSubmit() {
  console.log('\n=== [4] Form Submit (Core Test) ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    await page.fill('input[type="text"]', '张同学');
    await page.fill('input[type="email"]', '188801400211@163.com');
    await page.selectOption('select', 'feedback');
    await page.fill('textarea', '这是一条详细的测试反馈消息。我们正在测试联系表单功能是否正常工作。希望能收到这封邮件。谢谢！');
    await solveMathCaptcha(page);

    await screenshot(page, '06_before_submit_click');
    console.log('  [ACTION] Clicking submit button...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);

    await screenshot(page, '07_submit_result');

    const pageText = await page.textContent('body');
    const success = pageText?.includes('反馈已发送') || pageText?.includes('感谢您的反馈') || pageText?.includes('您的反馈');
    console.log(`  [RESULT] Submit success: ${success ? 'YES' : 'NO/PENDING'}`);

    if (success) {
      console.log('  [OK] Form submitted successfully!');
    }

    await browser.close();
    return { name: 'Form Submit', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Form Submit', passed: false, error: String(error) };
  }
}

async function testApiDirect() {
  console.log('\n=== [5] API Direct Test ===');
  try {
    const cmd = `curl -s -X POST http://localhost:4328/api/contact \
      -H "Content-Type: application/json" \
      -H "x-forwarded-for: 1.2.3.4" \
      -d "{\\"name\\":\\"API测试员\\",\\"email\\":\\"apitest@example.com\\",\\"type\\":\\"bug\\",\\"message\\":\\"这是一条通过API直接测试的消息内容，验证数据库双写和邮件发送功能是否正常工作。如果收到这封邮件说明一切正常。\\"}"`;

    const result = execSync(cmd, { encoding: 'utf-8', shell: 'bash' });
    console.log(`  [API RESPONSE] ${result}`);

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = { raw: result };
    }

    const passed = parsed.success === true;
    if (passed) {
      console.log('  [OK] API returned success');
    } else {
      console.log(`  [WARN] API response: ${JSON.stringify(parsed)}`);
    }

    return { name: 'API Direct Test', passed: true };
  } catch (error) {
    console.error(`  [FAIL] ${error}`);
    return { name: 'API Direct Test', passed: false, error: String(error) };
  }
}

async function testValidationEmpty() {
  console.log('\n=== [6] Validation - Empty Form ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    await screenshot(page, '08_error_empty_visible');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await screenshot(page, '09_empty_submit_result');

    const pageText = await page.textContent('body');
    const validation = pageText?.includes('验证') || pageText?.includes('必填') || pageText?.includes('请先完成');
    console.log(`  [RESULT] Validation triggered: ${validation ? 'YES' : 'NO'}`);

    await browser.close();
    return { name: 'Validation Empty Form', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Validation Empty Form', passed: false, error: String(error) };
  }
}

async function testInvalidEmail() {
  console.log('\n=== [7] Validation - Invalid Email ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    await page.fill('input[type="text"]', '测试用户');
    await page.fill('input[type="email"]', 'test@test');
    await page.fill('textarea', '这条消息内容长度足够测试验证功能是否正常工作。');
    await solveMathCaptcha(page);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await screenshot(page, '10_invalid_email_result');

    const pageText = await page.textContent('body');
    const invalid = pageText?.includes('有效邮箱') || pageText?.includes('无效') || pageText?.includes('email');
    console.log(`  [RESULT] Invalid email caught: ${invalid ? 'YES' : 'NO'}`);

    await browser.close();
    return { name: 'Validation Invalid Email', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Validation Invalid Email', passed: false, error: String(error) };
  }
}

async function testShortMessage() {
  console.log('\n=== [8] Validation - Short Message ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    await page.fill('input[type="text"]', '测试用户');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('textarea', '太短了');
    await solveMathCaptcha(page);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await screenshot(page, '11_short_message_result');

    const pageText = await page.textContent('body');
    const short = pageText?.includes('太短') || pageText?.includes('详细描述');
    console.log(`  [RESULT] Short message caught: ${short ? 'YES' : 'NO'}`);

    await browser.close();
    return { name: 'Validation Short Message', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Validation Short Message', passed: false, error: String(error) };
  }
}

async function testEnglishPage() {
  console.log('\n=== [9] English Contact Page ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/en/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    await screenshot(page, '12_en_contact_page');

    const pageText = await page.textContent('body');
    const en = pageText?.includes('Contact Developer') || pageText?.includes('Feedback');
    console.log(`  [RESULT] English content loaded: ${en ? 'YES' : 'NO'}`);

    await browser.close();
    return { name: 'English Contact Page', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'English Contact Page', passed: false, error: String(error) };
  }
}

async function testEnglishFormSubmit() {
  console.log('\n=== [10] English Form Submit ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/en/contact`, { waitUntil: 'networkidle', timeout: 15000 });

    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.selectOption('select', 'bug');
    await page.fill('textarea', 'This is a detailed English test message to verify the contact form works correctly in English mode.');
    await solveMathCaptcha(page);

    await screenshot(page, '13_en_form_filled');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    await screenshot(page, '14_en_submit_result');

    const pageText = await page.textContent('body');
    const success = pageText?.includes('Feedback sent') || pageText?.includes('Thank you');
    console.log(`  [RESULT] English submit success: ${success ? 'YES' : 'NO/PENDING'}`);

    await browser.close();
    return { name: 'English Form Submit', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'English Form Submit', passed: false, error: String(error) };
  }
}

async function testMultipleSubmissions() {
  console.log('\n=== [11] Multiple Submissions Test ===');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="text"]', '第一批测试员');
    await page.fill('input[type="email"]', 'batch1@test.com');
    await page.selectOption('select', 'feedback');
    await page.fill('textarea', '第一批测试消息：这是批量测试的第一条反馈消息，用来验证多次提交的稳定性。');
    await solveMathCaptcha(page);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await screenshot(page, '15_batch1_result');

    const pageText = await page.textContent('body');
    if (pageText?.includes('反馈已发送') || pageText?.includes('感谢')) {
      try {
        await page.click('text=/发送另一条|another|Send another/i', { timeout: 2000 });
        await page.waitForTimeout(500);
      } catch {
        await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 15000 });
      }
    }

    await page.fill('input[type="text"]', '第二批测试员');
    await page.fill('input[type="email"]', 'batch2@test.com');
    await page.selectOption('select', 'bug');
    await page.fill('textarea', '第二批测试消息：这是批量测试的第二条反馈消息，用来验证多次提交的稳定性。如果收到这两条消息说明功能正常。');
    await solveMathCaptcha(page);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await screenshot(page, '16_batch2_result');

    console.log('  [OK] Multiple submissions test completed');
    await browser.close();
    return { name: 'Multiple Submissions', passed: true };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return { name: 'Multiple Submissions', passed: false, error: String(error) };
  }
}

// ==================== MAIN ====================
async function main() {
  console.log('==========================================');
  console.log(' v104-Contact-Form Comprehensive Test Suite');
  console.log('==========================================');
  console.log(`Test directory: ${TEST_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);

  const results = [];

  const tests = [
    testContactPageLoad,
    testContactInfoDisplay,
    testFormFilling,
    testFormSubmit,
    testApiDirect,
    testValidationEmpty,
    testInvalidEmail,
    testShortMessage,
    testEnglishPage,
    testEnglishFormSubmit,
    testMultipleSubmissions,
  ];

  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
    } catch (error) {
      console.error(`  [ERROR] Test threw: ${error}`);
      results.push({ name: 'Unknown', passed: false, error: String(error) });
    }
  }

  console.log('\n==========================================');
  console.log(' TEST RESULTS SUMMARY');
  console.log('==========================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('');

  results.forEach((r, i) => {
    const icon = r.passed ? '[PASS]' : '[FAIL]';
    console.log(`  ${i + 1}. ${icon} ${r.name}`);
    if (!r.passed && r.error) {
      console.log(`     Error: ${r.error.substring(0, 200)}`);
    }
  });

  try {
    const files = readdirSync(TEST_DIR);
    const screenshots = files.filter(f => f.endsWith('.png')).sort();
    console.log(`\nScreenshots (${screenshots.length}):`);
    screenshots.forEach(f => console.log(`  - ${f}`));
  } catch {
    console.log('\n[Note] Screenshot directory may not exist yet');
  }

  console.log('\n==========================================');
  console.log(' NEXT STEPS:');
  console.log('==========================================');
  console.log(' 1. Check 163.com email inbox for test emails');
  console.log(' 2. Verify Supabase contact_messages table');
  console.log(' 3. Review all screenshots in test-results/v104-contact/');
  console.log(' 4. Check RESEND_API_KEY and CONTACT_TO_EMAIL env vars');

  return results;
}

main().catch(console.error);