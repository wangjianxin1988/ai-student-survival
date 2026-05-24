// v104-regression-test.mjs - Comprehensive regression test for mi-to-ai.com
import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = 'D:/suoyouxiangmu/ai-student-survival/test-results/v104-regression';
const baseUrl = 'http://localhost:4328';
const productionUrl = 'https://mi-to-ai.com';

mkdirSync(baseDir, { recursive: true });

const results = {
  pages: [],
  apis: [],
  security: [],
  production: [],
  bugs: []
};

let browser;
let context;
let page;

async function screenshot(name) {
  const filename = path.join(baseDir, name);
  try {
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`  [OK] ${name}`);
    return filename;
  } catch (e) {
    console.log(`  [FAIL] ${name}: ${e.message}`);
    return null;
  }
}

async function testPage(pagePath, name) {
  const url = `${baseUrl}${pagePath}`;
  console.log(`[Page] ${pagePath}`);

  const startTime = Date.now();
  let consoleErrors = [];
  let failedResources = [];

  const errorHandler = msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  };
  const failedHandler = req => {
    // In Playwright 1.60, the requestfailed event gives a Request object with failure()
    try {
      const failure = req.failure();
      if (failure) failedResources.push(req.url());
    } catch {}
  };

  page.on('console', errorHandler);
  page.on('requestfailed', failedHandler);

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const status = response?.status() || 0;
    const loadTime = Date.now() - startTime;

    await page.waitForTimeout(1500);

    await screenshot(name);

    const result = {
      path: pagePath,
      name,
      status,
      loadTime,
      success: status >= 200 && status < 400,
      consoleErrors: [...consoleErrors],
      failedResources: [...failedResources]
    };

    results.pages.push(result);
    console.log(`  Status: ${status}, Load: ${loadTime}ms, Errors: ${consoleErrors.length}, Failed: ${failedResources.length}`);

    if (consoleErrors.length > 0) {
      console.log(`  Console errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
      results.bugs.push({ type: 'console_error', path: pagePath, errors: consoleErrors });
    }
    if (failedResources.length > 0) {
      results.bugs.push({ type: 'failed_resource', path: pagePath, resources: failedResources.slice(0, 5) });
    }

    return result;
  } catch (e) {
    console.log(`  [ERROR] ${e.message}`);
    results.pages.push({ path: pagePath, name, error: e.message, success: false });
    results.bugs.push({ type: 'navigation_error', path: pagePath, error: e.message });
    return null;
  } finally {
    page.off('console', errorHandler);
    page.off('requestfailed', failedHandler);
  }
}

async function testApi(apiPath) {
  console.log(`[API] ${apiPath}`);
  try {
    const response = await context.request.get(`${baseUrl}${apiPath}`);
    const status = response?.status() || 0;
    let bodyLen = 0;
    try {
      const body = await response?.text();
      bodyLen = body?.length || 0;
    } catch {}
    console.log(`  Status: ${status}, Body: ${bodyLen} bytes`);

    results.apis.push({
      path: apiPath,
      status,
      success: status >= 200 && status < 400
    });
    return { status };
  } catch (e) {
    console.log(`  [ERROR] ${e.message}`);
    results.apis.push({ path: apiPath, error: e.message, success: false });
    return null;
  }
}

async function testProduction(pagePath) {
  const url = `${productionUrl}${pagePath}`;
  console.log(`[PROD] ${pagePath}`);
  try {
    const response = await context.request.get(url);
    const status = response?.status() || 0;
    results.production.push({ path: pagePath, status, success: status === 200 });
    console.log(`  Status: ${status}`);
    return status;
  } catch (e) {
    console.log(`  [ERROR] ${e.message}`);
    results.production.push({ path: pagePath, error: e.message, success: false });
    return null;
  }
}

async function testXSS(searchPage, xssPayload) {
  console.log(`[XSS] ${searchPage}`);
  try {
    await page.goto(`${baseUrl}${searchPage}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const selectors = [
      'input[type="search"]',
      'input[placeholder*="搜索"]',
      'input[placeholder*="Search"]',
      'input[name*="search"]',
      'input[name*="q"]',
      'input[id*="search"]'
    ];

    let found = false;
    for (const sel of selectors) {
      const inp = page.locator(sel).first();
      if (await inp.isVisible({ timeout: 2000 }).catch(() => false)) {
        await inp.fill(xssPayload);
        await inp.press('Enter');
        await page.waitForTimeout(1000);
        const content = await page.content();
        const hasXSS = content.includes('<script>') && content.includes(xssPayload.slice(0, 15));
        console.log(`  XSS result: ${hasXSS ? 'VULNERABLE' : 'SAFE'}`);
        results.security.push({ type: 'xss', url: searchPage, payload: xssPayload, vulnerable: hasXSS });
        if (hasXSS) results.bugs.push({ type: 'xss_vulnerability', url: searchPage, payload: xssPayload });
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`  No search input found, skipping`);
      results.security.push({ type: 'xss', url: searchPage, payload: xssPayload, vulnerable: null, note: 'no search input' });
    }
  } catch (e) {
    console.log(`  [ERROR] ${e.message}`);
  }
}

async function main() {
  console.log('========================================');
  console.log('  mi-to-ai.com v1.0.4 Regression Test');
  console.log('========================================');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Base: ${baseUrl}`);

  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  page = await context.newPage();

  // --- Section 1: Main Pages ---
  console.log('\n========== SECTION 1: Main Pages ==========');
  await testPage('/', '01_homepage.png');
  await testPage('/tools', '03_tools.png');
  await testPage('/payment', '04_payment.png');
  await testPage('/policies', '05_policies.png');
  await testPage('/survival', '06_survival.png');
  await testPage('/community', '07_community.png');
  await testPage('/map', '08_map.png');
  await testPage('/points', '09_points.png');
  await testPage('/faq', '10_faq.png');
  await testPage('/about', '11_about.png');
  await testPage('/contact', '12_contact.png');

  // --- Section 2: English Pages ---
  console.log('\n========== SECTION 2: English Pages ==========');
  await testPage('/en/', '13_en_home.png');
  await testPage('/en/tools', '14_en_tools.png');
  await testPage('/en/payment', 'en_payment.png');
  await testPage('/en/policies', 'en_policies.png');
  await testPage('/en/survival', 'en_survival.png');
  await testPage('/en/community', 'en_community.png');
  await testPage('/en/map', 'en_map.png');
  await testPage('/en/points', 'en_points.png');

  // --- Section 3: Auth Pages ---
  console.log('\n========== SECTION 3: Auth Pages ==========');
  await testPage('/auth/login', '15_login.png');
  await testPage('/auth/register', '16_register.png');
  await testPage('/auth/forgot-password', '17_forgot_password.png');

  // --- Section 4: Detail Pages ---
  console.log('\n========== SECTION 4: Detail Pages ==========');
  try {
    const resp = await context.request.get(`${baseUrl}/api/tools`);
    const data = await resp.json();
    if (data?.data?.length > 0) {
      const slug = data.data[0].slug || data.data[0].id;
      await testPage(`/tools/${slug}`, '18_tool_detail.png');
    }
  } catch {}
  try {
    const resp = await context.request.get(`${baseUrl}/api/policies`);
    const data = await resp.json();
    if (data?.data?.length > 0) {
      const slug = data.data[0].slug || data.data[0].id;
      await testPage(`/policies/${slug}`, '19_policy_detail.png');
    }
  } catch {}

  // --- Section 5: API Tests ---
  console.log('\n========== SECTION 5: API Endpoints ==========');
  const apis = [
    '/api/community',
    '/api/tools',
    '/api/policies',
    '/api/payment-solutions',
    '/api/contact',
    '/api/points',
    '/api/favorites',
    '/api/ratings',
    '/api/survival-tips'
  ];
  for (const api of apis) {
    await testApi(api);
  }

  // --- Section 6: Production ---
  console.log('\n========== SECTION 6: Production ==========');
  await testProduction('/');
  await testProduction('/contact');
  await testProduction('/tools');
  await testProduction('/en/');

  // --- Section 7: Security ---
  console.log('\n========== SECTION 7: Security ==========');
  await testXSS('/tools', '<script>alert(1)</script>');
  await testXSS('/community', '<img src=x onerror=alert(1)>');

  // --- Section 8: Resource Check ---
  console.log('\n========== SECTION 8: Resource Check ==========');
  const failedOnHome = [];
  const fHandler = req => {
    try { if (req.failure()) failedOnHome.push(req.url()); } catch {}
  };
  page.on('requestfailed', fHandler);
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  page.off('requestfailed', fHandler);
  if (failedOnHome.length > 0) {
    console.log(`  Failed resources: ${failedOnHome.length}`);
    results.bugs.push({ type: 'failed_resources', path: '/', resources: failedOnHome.slice(0, 10) });
    failedOnHome.slice(0, 5).forEach(r => console.log(`    - ${r}`));
  } else {
    console.log(`  No failed resources`);
  }

  // --- Generate Report ---
  console.log('\n========== GENERATING REPORT ==========');

  const totalPages = results.pages.length;
  const passedPages = results.pages.filter(p => p.success && !p.error).length;
  const totalApis = results.apis.length;
  const passedApis = results.apis.filter(a => a.success).length;
  const totalProduction = results.production.length;
  const passedProduction = results.production.filter(p => p.success).length;
  const totalBugs = results.bugs.length;

  const report = `# v1.0.4 回归测试报告

## 测试概览

- **测试时间**: ${new Date().toISOString()}
- **测试环境**: ${baseUrl}
- **生产环境**: ${productionUrl}

## 测试结果摘要

| 类型 | 总数 | 通过 | 失败 | 通过率 |
|------|------|------|------|--------|
| 页面测试 | ${totalPages} | ${passedPages} | ${totalPages - passedPages} | ${totalPages > 0 ? Math.round(passedPages / totalPages * 100) : 0}% |
| API测试 | ${totalApis} | ${passedApis} | ${totalApis - passedApis} | ${totalApis > 0 ? Math.round(passedApis / totalApis * 100) : 0}% |
| 生产验证 | ${totalProduction} | ${passedProduction} | ${totalProduction - passedProduction} | ${totalProduction > 0 ? Math.round(passedProduction / totalProduction * 100) : 0}% |
| 安全检查 | ${results.security.length} | ${results.security.filter(s => s.vulnerable === false).length} | ${results.security.filter(s => s.vulnerable === true).length} | - |

## 发现的问题

### Bug 列表 (${totalBugs}个)

${totalBugs === 0 ? '无严重Bug' : results.bugs.map((bug, i) => `
#### Bug #${i + 1}: ${bug.type}

- **页面**: ${bug.path || bug.url || 'N/A'}
- **详情**: ${JSON.stringify(bug, null, 2)}
`).join('\n')}

## 页面测试详情

${results.pages.map(p => `
### ${p.path} (${p.name})

- **状态码**: ${p.status || p.error || 'ERROR'}
- **加载时间**: ${p.loadTime ? `${p.loadTime}ms` : 'N/A'}
- **通过**: ${p.success ? 'PASS' : 'FAIL'}
- **Console错误**: ${p.consoleErrors?.length || 0}
${p.consoleErrors?.length > 0 ? p.consoleErrors.slice(0, 3).map(e => `  - ${e}`).join('\n') : ''}
- **失败资源**: ${p.failedResources?.length || 0}
${p.failedResources?.length > 0 ? p.failedResources.slice(0, 5).map(r => `  - ${r}`).join('\n') : ''}
`).join('\n')}

## API 测试详情

${results.apis.map(a => `
- **${a.path}**: HTTP ${a.status || a.error} ${a.success ? 'PASS' : 'FAIL'}
`).join('\n')}

## 生产环境验证

${results.production.map(p => `
- **${p.path}**: HTTP ${p.status || p.error} ${p.success ? 'PASS' : 'FAIL'}
`).join('\n')}

## 安全检查

${results.security.map(s => `
- **${s.type}** on ${s.url}: ${s.vulnerable === true ? 'VULNERABLE' : s.vulnerable === false ? 'SAFE' : 'N/A (' + (s.note || 'unknown') + ')'}
`).join('\n')}

## 截图文件

所有截图保存在: \`${baseDir}/\`

## 结论

**整体状态**: ${passedPages === totalPages && totalBugs === 0 ? 'PASS - 所有核心功能测试通过' : `NEEDS ATTENTION - ${totalBugs}个问题待修复`}

${totalBugs > 0 ? `发现 ${totalBugs} 个问题，建议修复后重新测试。` : '所有核心功能测试通过。'}
`;

  writeFileSync(path.join(baseDir, 'TEST_REPORT.md'), report);
  console.log(`Report saved`);

  console.log('\n========================================');
  console.log('  TEST SUMMARY');
  console.log('========================================');
  console.log(`Pages: ${passedPages}/${totalPages} passed`);
  console.log(`APIs: ${passedApis}/${totalApis} passed`);
  console.log(`Production: ${passedProduction}/${totalProduction} passed`);
  console.log(`Bugs found: ${totalBugs}`);
  console.log('========================================');

  await browser.close();
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});