/**
 * AI留学生存指南 - 无障碍和性能测试
 * QA-Expert 验证脚本
 */

import { chromium, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:4322';

interface Issue {
  category: string;
  severity: string;
  message: string;
  page?: string;
}

interface Results {
  performance_scores: Record<string, any>;
  accessibility_issues: Issue[];
  responsive_issues: Issue[];
  mobile_issues: Issue[];
  all_passed: boolean;
}

const results: Results = {
  performance_scores: {},
  accessibility_issues: [],
  responsive_issues: [],
  mobile_issues: [],
  all_passed: true,
};

function log(level: string, msg: string, data?: any) {
  const icon = level === 'PASS' ? '✅' : level === 'FAIL' ? '❌' : level === 'WARN' ? '⚠️' : '📊';
  const ts = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${ts}] ${icon} ${msg}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

function addIssue(list: Issue[], severity: string, message: string, page?: string) {
  list.push({ category: list === results.accessibility_issues ? 'accessibility' : list === results.responsive_issues ? 'responsive' : 'mobile', severity, message, page });
  if (severity === 'critical' || severity === 'high') {
    results.all_passed = false;
  }
}

async function testPerformance(page: any, url: string) {
  log('INFO', `性能测试: ${url}`);

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2000); // wait for LCP metrics

  const scores = await page.evaluate(() => {
    const perf = performance as any;
    const nav = perf.getEntriesByType('navigation')?.[0] || {};
    const paint = perf.getEntriesByType('paint') || [];
    const lcp = perf.getEntriesByType('largest-contentful-paint') || [];
    const cls = perf.getEntriesByType('layout-shift') || [];

    const fcpEntry = paint.find((e: any) => e.name === 'first-contentful-paint');
    const lcpEntry = lcp.length > 0 ? lcp[lcp.length - 1] : null;

    let clsValue = 0;
    cls.forEach((entry: any) => {
      if (!entry.hadRecentInput) clsValue += entry.value;
    });

    const resources = perf.getEntriesByType('resource') || [];
    const totalSize = resources.reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0);

    return {
      ttfb: Math.round(nav.responseStart || nav.responseEnd || 0),
      fcp: Math.round(fcpEntry?.startTime || 0),
      lcp: Math.round(lcpEntry?.startTime || 0),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      loadComplete: Math.round(nav.loadEventEnd || 0),
      cls: parseFloat(clsValue.toFixed(4)),
      resourceCount: resources.length,
      totalResourceSizeKB: Math.round(totalSize / 1024),
    };
  });

  // threshold checks
  if (scores.lcp > 2500) {
    addIssue(results.accessibility_issues, 'critical', `LCP 超过 2.5s: ${scores.lcp}ms > 2500ms`, url);
    log('FAIL', `LCP: ${scores.lcp}ms (threshold 2500ms)`);
  } else {
    log('PASS', `LCP: ${scores.lcp}ms (threshold 2500ms)`);
  }

  if (scores.fcp > 1800) {
    addIssue(results.accessibility_issues, 'medium', `FCP 超过 1.8s: ${scores.fcp}ms`, url);
  }

  results.performance_scores[url] = { ...scores, url };
  log('INFO', '性能指标', scores);
  return scores;
}

async function testAccessibility(page: any, pageName: string) {
  log('INFO', `无障碍测试: ${pageName}`);

  const checks = await page.evaluate(() => {
    const html = document.documentElement;

    const focusable = Array.from(document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea'
    ));

    const lang = html.lang || html.getAttribute('lang') || '';

    const imgs = Array.from(document.querySelectorAll('img'));
    const imgsWithoutAlt = imgs.filter(img => !img.alt && img.getAttribute('aria-hidden') !== 'true').length;

    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])'));
    const inputsWithoutLabel = inputs.filter(input => {
      const id = input.id;
      const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      return !hasAriaLabel && !hasLabel && !input.title && !input.placeholder;
    });

    const buttonsWithoutName = Array.from(document.querySelectorAll('button')).filter(btn => {
      return !btn.getAttribute('aria-label') && !btn.getAttribute('aria-labelledby') && !btn.textContent?.trim();
    });

    const linksWithoutName = Array.from(document.querySelectorAll('a[href]')).filter(a => {
      return !a.getAttribute('aria-label') && !a.getAttribute('aria-labelledby') &&
             !a.textContent?.trim() && !a.querySelector('img[alt]');
    });

    return {
      focusableCount: focusable.length,
      lang,
      imgsWithoutAlt,
      totalImgs: imgs.length,
      inputsWithoutLabel: inputsWithoutLabel.length,
      buttonsWithoutName: buttonsWithoutName.length,
      linksWithoutName: linksWithoutName.length,
    };
  });

  log('INFO', '无障碍检查', checks);

  if (checks.focusableCount === 0) {
    addIssue(results.accessibility_issues, 'high', '无可键盘导航的元素', pageName);
  } else {
    log('PASS', `焦点导航: ${checks.focusableCount} 个可聚焦元素`);
  }

  if (!checks.lang) {
    addIssue(results.accessibility_issues, 'medium', '<html> 缺少 lang 属性', pageName);
  } else {
    log('PASS', `语言: lang="${checks.lang}"`);
  }

  if (checks.imgsWithoutAlt > 0) {
    addIssue(results.accessibility_issues, 'medium', `${checks.imgsWithoutAlt}/${checks.totalImgs} 个图片缺少 alt`, pageName);
  } else if (checks.totalImgs > 0) {
    log('PASS', `图片alt: 全部 ${checks.totalImgs} 张有 alt`);
  }

  if (checks.inputsWithoutLabel > 0) {
    addIssue(results.accessibility_issues, 'medium', `${checks.inputsWithoutLabel} 个输入框缺少 label`, pageName);
  }

  if (checks.buttonsWithoutName > 0) {
    addIssue(results.accessibility_issues, 'low', `${checks.buttonsWithoutName} 个按钮缺少可访问名称`, pageName);
  }

  if (checks.linksWithoutName > 0) {
    addIssue(results.accessibility_issues, 'low', `${checks.linksWithoutName} 个链接缺少可访问名称`, pageName);
  }
}

async function testResponsive(page: any, url: string) {
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const issues: string[] = await page.evaluate(() => {
      const result: string[] = [];
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 5) {
        result.push(`出现水平滚动 (scrollWidth=${document.documentElement.scrollWidth}, clientWidth=${document.documentElement.clientWidth})`);
      }

      const header = document.querySelector('header');
      if (header) {
        const style = window.getComputedStyle(header);
        if ((style.position === 'fixed' || style.position === 'sticky') && header.getBoundingClientRect().height > 60) {
          result.push(`固定头部可能遮挡内容`);
        }
      }

      const overflowHidden = Array.from(document.querySelectorAll('*')).filter((el: any) => {
        const style = window.getComputedStyle(el);
        return style.overflow === 'hidden' && el.scrollWidth > el.clientWidth;
      });
      if (overflowHidden.length > 0) {
        result.push(`${overflowHidden.length} 个元素 overflow:hidden 但内容溢出`);
      }

      return result;
    });

    if (issues.length > 0) {
      issues.forEach(issue => {
        addIssue(results.responsive_issues, 'medium', `${vp.name} (${vp.width}px): ${issue}`, `${url} (${vp.name})`);
      });
    } else {
      log('PASS', `响应式 ${vp.name} ${vp.width}px: OK`);
    }
  }
}

async function testMobile(page: any, url: string) {
  await page.emulateMedia(devices['iPhone 12']);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const checks = await page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll('button, a, [role="button"]')).filter((el: any) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    });

    const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');

    return {
      smallTargetsCount: targets.length,
      smallTargetsSample: targets.slice(0, 5).map((el: any) => ({
        tag: el.tagName,
        cls: el.className.split(' ')[0],
        size: `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`,
        text: (el.textContent || '').trim().substring(0, 15) || '(empty)',
      })),
      modalCount: modals.length,
    };
  });

  if (checks.smallTargetsCount > 0) {
    addIssue(results.mobile_issues, 'medium', `${checks.smallTargetsCount} 个触摸目标 < 44x44px`, `${url} (mobile)`);
    log('WARN', `触摸目标过小:`, checks.smallTargetsSample);
  } else {
    log('PASS', '触摸目标大小: 全部 >= 44x44px');
  }

  if (checks.modalCount > 0) {
    log('INFO', `模态框: 检测到 ${checks.modalCount} 个`);
  }
}

async function runTests() {
  log('INFO', '========================================');
  log('INFO', 'AI留学生存指南 - 无障碍和性能测试');
  log('INFO', '========================================');

  const browser = await chromium.launch({ headless: true });

  const pages = [
    { url: '/', name: '首页' },
    { url: '/tools', name: 'AI工具库' },
    { url: '/payment', name: '支付方案' },
    { url: '/policies', name: '大学政策' },
    { url: '/map', name: '地图' },
    { url: '/offers', name: 'Offers' },
    { url: '/prompts', name: 'Prompt模板' },
    { url: '/questions', name: '问答社区' },
  ];

  for (const p of pages) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const fullUrl = `${BASE_URL}${p.url}`;
      log('INFO', `========== ${p.name} ==========`);

      await testPerformance(page, fullUrl);
      await testAccessibility(page, p.name);
      await testResponsive(page, fullUrl);
      await testMobile(page, fullUrl);

    } catch (err: any) {
      log('FAIL', `失败: ${p.name}`, { error: err.message });
      addIssue(results.accessibility_issues, 'critical', `页面测试异常: ${err.message}`, p.name);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  log('INFO', '========================================');
  log('INFO', '结果汇总');
  log('INFO', '========================================');

  log('INFO', '性能数据:');
  for (const [url, scores] of Object.entries(results.performance_scores)) {
    const path = url.replace(BASE_URL, '') || '/';
    log('INFO', `  ${path}: LCP=${scores.lcp}ms, FCP=${scores.fcp}ms, TTFB=${scores.ttfb}ms, DCL=${scores.domContentLoaded}ms, CLS=${scores.cls}`);
  }

  const totals = {
    accessibility: results.accessibility_issues.length,
    responsive: results.responsive_issues.length,
    mobile: results.mobile_issues.length,
  };
  log('INFO', '问题数量:', totals);

  if (results.accessibility_issues.length > 0) {
    log('WARN', '无障碍问题:');
    results.accessibility_issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.severity}] ${issue.message} ${issue.page ? `(${issue.page})` : ''}`);
    });
  }
  if (results.responsive_issues.length > 0) {
    log('WARN', '响应式问题:');
    results.responsive_issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.severity}] ${issue.message}`);
    });
  }
  if (results.mobile_issues.length > 0) {
    log('WARN', '移动端问题:');
    results.mobile_issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.severity}] ${issue.message}`);
    });
  }

  log('INFO', '========================================');
  if (results.all_passed) {
    log('PASS', '所有关键测试通过!');
  } else {
    log('FAIL', '存在未通过的关键测试项');
  }
  log('INFO', '========================================');

  return results;
}

runTests().then(r => {
  console.log('\n=== 最终 JSON 结果 ===');
  console.log(JSON.stringify({
    performance_scores: r.performance_scores,
    accessibility_issues: r.accessibility_issues,
    responsive_issues: r.responsive_issues,
    mobile_issues: r.mobile_issues,
    all_passed: r.all_passed,
  }, null, 2));
  process.exit(r.all_passed ? 0 : 1);
}).catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});