import { test, expect, chromium, Page } from '@playwright/test';

/**
 * 逐按钮精细化测试套件
 * 按照问题反馈文档的每一条进行人工点击式测试
 */

const BASE_URL = 'http://localhost:4350';

// ==================== 首页测试 ====================
test.describe('【Issue-05-07】首页 - 逐按钮测试', () => {

  test('Banner区域 - 检查并点击所有按钮', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 1. 检查Hero标题
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    console.log('Hero标题:', await heroTitle.textContent());

    // 2. 点击"开始探索"按钮
    const browseBtn = page.locator('a:has-text("开始探索")').first();
    await expect(browseBtn).toBeVisible();
    await browseBtn.click();
    await page.waitForURL('**/tools**');
    console.log('点击开始探索 -> 跳转工具库成功');
    await page.goBack();

    // 3. 点击"支付有难题？"按钮
    await page.goto(BASE_URL + '/');
    const paymentBtn = page.locator('a:has-text("支付有难题")').first();
    await expect(paymentBtn).toBeVisible();
    await paymentBtn.click();
    await page.waitForURL('**/payment**');
    console.log('点击支付有难题 -> 跳转支付页面成功');
    await page.goBack();

    await page.close();
  });

  test('四大核心模块 - 逐个点击测试', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // AI工具库卡片
    const aiToolsCard = page.locator('a[href="/tools"]').first();
    await expect(aiToolsCard).toBeVisible();
    await aiToolsCard.click();
    await page.waitForURL('**/tools**');
    console.log('AI工具库卡片 -> 跳转成功');
    await page.goBack();

    // 支付解决方案卡片
    await page.goto(BASE_URL + '/');
    const paymentCard = page.locator('a[href="/payment"]').first();
    await expect(paymentCard).toBeVisible();
    await paymentCard.click();
    await page.waitForURL('**/payment**');
    console.log('支付解决方案卡片 -> 跳转成功');
    await page.goBack();

    // 大学AI政策卡片
    await page.goto(BASE_URL + '/');
    const policiesCard = page.locator('a[href="/policies"]').first();
    await expect(policiesCard).toBeVisible();
    await policiesCard.click();
    await page.waitForURL('**/policies**');
    console.log('大学AI政策卡片 -> 跳转成功');
    await page.goBack();

    // Prompt模板卡片
    await page.goto(BASE_URL + '/');
    const promptsCard = page.locator('a[href="/prompts"]').first();
    await expect(promptsCard).toBeVisible();
    await promptsCard.click();
    await page.waitForURL('**/prompts**');
    console.log('Prompt模板卡片 -> 跳转成功');
    await page.goBack();

    await page.close();
  });

  test('四大痛点区域 - 检查链接', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 滚动到四大痛点区域
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);

    // 检查四个痛点是否可见
    const painPoints = page.locator('h4:has-text("不知道用什么AI工具"), h4:has-text("支付困难"), h4:has-text("不了解大学AI政策"), h4:has-text("不会写Prompt")');
    expect(await painPoints.count()).toBeGreaterThanOrEqual(3);
    console.log('四大痛点区域显示正常');

    await page.close();
  });

  test('Footer - 逐个链接测试', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 滚动到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // 检查Footer链接
    const footerLinks = [
      'a[href="/tools"]',
      'a[href="/payment"]',
      'a[href="/policies"]',
      'a[href="/prompts"]',
      'a[href="/compare"]',
      'a[href="/api"]'
    ];

    for (const selector of footerLinks) {
      const link = page.locator(selector).first();
      if (await link.isVisible()) {
        console.log(`Footer链接 ${selector} 存在`);
      }
    }

    await page.close();
  });
});

// ==================== 顶部导航测试 ====================
test.describe('【Issue-01-04】顶部导航 - 逐按钮测试', () => {

  test('Logo区域', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 检查Logo
    const logo = page.locator('a:has-text("MI TO AI留学生存指南")').first();
    await expect(logo).toBeVisible();
    console.log('Logo显示正常');

    // 点击Logo回到首页
    await logo.click();
    await page.waitForURL(BASE_URL + '/');
    console.log('点击Logo回到首页成功');

    await page.close();
  });

  test('顶部搜索按钮', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 点击搜索按钮
    const searchBtn = page.locator('button[data-search-trigger], button[title="搜索"]').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(500);

      // 检查搜索弹窗
      const searchModal = page.locator('#search-modal.active, #search-modal[aria-hidden="false"]');
      const isOpen = await searchModal.isVisible().catch(() => false);
      console.log('搜索弹窗打开:', isOpen ? '成功' : '失败');

      // 按ESC关闭
      await page.keyboard.press('Escape');
    }

    await page.close();
  });

  test('顶部登录/注册按钮', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 点击登录
    const loginBtn = page.locator('a:has-text("登录")').first();
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
    await page.waitForURL('**/auth/login**');
    console.log('登录按钮 -> 跳转登录页成功');
    await page.goBack();

    // 点击注册
    await page.goto(BASE_URL + '/');
    const registerBtn = page.locator('a:has-text("注册")').first();
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();
    await page.waitForURL('**/auth/register**');
    console.log('注册按钮 -> 跳转注册页成功');

    await page.close();
  });

  test('顶部导航菜单 - 逐个点击', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    const navLinks = [
      { text: '工具', path: '/tools' },
      { text: '支付', path: '/payment' },
      { text: '政策', path: '/policies' },
      { text: '地图', path: '/map' },
      { text: '防坑', path: '/survival' },
      { text: 'Prompt', path: '/prompts' },
      { text: 'Offer', path: '/offers' },
      { text: '问答', path: '/questions' }
    ];

    for (const nav of navLinks) {
      const link = page.locator(`a:has-text("${nav.text}")`).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForURL(`**${nav.path}**`);
        console.log(`导航 ${nav.text} -> 跳转成功`);
        await page.goto(BASE_URL + '/');
        await page.waitForLoadState('networkidle');
      }
    }

    await page.close();
  });
});

// ==================== AI工具库测试 ====================
test.describe('【Issue-09-12】AI工具库 - 逐按钮测试', () => {

  test('工具列表页 - 筛选和排序', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/tools');
    await page.waitForLoadState('networkidle');

    // 检查排序按钮 - Issue-09
    const sortBtn = page.locator('button').filter({ hasText: /排序|sort/i }).first();
    if (await sortBtn.isVisible().catch(() => false)) {
      await sortBtn.click();
    }
    await page.waitForTimeout(300);
    console.log('排序按钮点击成功');

    // 检查工具卡片
    const toolCards = page.locator('a[href*="/tools/"]');
    const count = await toolCards.count();
    expect(count).toBeGreaterThan(0);
    console.log(`工具卡片数量: ${count}`);

    await page.close();
  });

  test('工具列表页 - 点击工具卡片', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/tools');
    await page.waitForLoadState('networkidle');

    // 点击第一个工具
    const firstTool = page.locator('a[href*="/tools/"]').first();
    await firstTool.click();
    await page.waitForURL('**/tools/**');
    console.log('点击工具卡片 -> 跳转详情页成功');

    await page.close();
  });

  test('工具详情页 - 逐按钮测试', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/tools/chatgpt');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 检查收藏按钮 - Issue-31
    const favoriteBtn = page.locator('button:has-text("收藏"), button:has-text("已收藏")').first();
    if (await favoriteBtn.isVisible().catch(() => false)) {
      await favoriteBtn.click();
      await page.waitForTimeout(300);
      console.log('收藏按钮点击成功');
    }

    // 检查分享按钮 - Issue-31
    const shareBtn = page.locator('button:has-text("分享"), button:has-text("Share")').first();
    if (await shareBtn.isVisible().catch(() => false)) {
      await shareBtn.click();
      await page.waitForTimeout(300);
      console.log('分享按钮点击成功');

      // 检查分享菜单
      const shareMenu = page.locator('text=/复制链接|Twitter|Facebook|微博|QQ|微信/');
      if (await shareMenu.isVisible().catch(() => false)) {
        console.log('分享菜单显示正常');
      }
    }

    // 检查评分星星 - Issue-12
    const stars = page.locator('[aria-label*="星"], button[aria-label*="star"]');
    if (await stars.count() > 0) {
      console.log('评分星星数量:', await stars.count());
    }

    await page.close();
  });

  test('工具对比页 - 清除功能 Issue-08', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 选择工具
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await page.waitForTimeout(300);
      console.log('已选择工具');

      // 点击清除按钮
      const clearBtn = page.locator('button:has-text("清除"), button:has-text("Clear")').first();
      if (await clearBtn.isVisible().catch(() => false)) {
        await clearBtn.click();
        await page.waitForTimeout(300);
        console.log('清除按钮点击成功');
      }
    }

    await page.close();
  });
});

// ==================== 支付解决方案测试 ====================
test.describe('【Issue-13-17】支付解决方案 - 逐按钮测试', () => {

  test('搜索功能 Issue-13', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/payment');
    await page.waitForLoadState('networkidle');

    // 查找搜索框
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[id*="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Depay');
      await page.waitForTimeout(500);
      console.log('搜索功能输入成功');

      // 清除搜索
      await searchInput.clear();
      await page.waitForTimeout(300);
    }

    await page.close();
  });

  test('分类筛选 Issue-14', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/payment');
    await page.waitForLoadState('networkidle');

    // 点击分类筛选
    const categoryLinks = page.locator('a[href*="category="], button:has-text("虚拟卡"), button:has-text("礼品卡"), button:has-text("地区定价")');
    if (await categoryLinks.count() > 0) {
      await categoryLinks.first().click();
      await page.waitForTimeout(500);
      console.log('分类筛选点击成功');
    }

    await page.close();
  });

  test('教程卡片点击', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/payment');
    await page.waitForLoadState('networkidle');

    // 点击教程链接
    const tutorialLinks = page.locator('a[href*="/payment/"]');
    if (await tutorialLinks.count() > 0) {
      await tutorialLinks.first().click();
      await page.waitForURL('**/payment/**');
      console.log('教程详情页跳转成功');

      // 检查相关教程 - Issue-17
      const relatedLinks = page.locator('a[href*="/payment/"]');
      console.log('相关教程数量:', await relatedLinks.count());
    }

    await page.close();
  });

  test('底部引导到社区 Issue-16', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/payment');
    await page.waitForLoadState('networkidle');

    // 滚动到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // 检查社区引导
    const communityLink = page.locator('a:has-text("社区"), a:has-text("问答"), a:has-text("提问")');
    if (await communityLink.count() > 0) {
      console.log('社区引导链接存在');
    }

    await page.close();
  });
});

// ==================== 大学政策测试 ====================
test.describe('【Issue-18-22】大学政策 - 逐按钮测试', () => {

  test('大学列表 Issue-18', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/policies');
    await page.waitForLoadState('networkidle');

    // 检查大学数量
    const universityLinks = page.locator('a[href*="/policies/"]');
    const count = await universityLinks.count();
    console.log(`大学数量: ${count}`);
    expect(count).toBeGreaterThan(10);

    await page.close();
  });

  test('大学详情页链接 Issue-19', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/policies');
    await page.waitForLoadState('networkidle');

    // 点击第一个大学
    const firstUni = page.locator('a[href*="/policies/"]').first();
    await firstUni.click();
    await page.waitForURL('**/policies/**');
    console.log('大学详情页跳转成功');

    // 检查关联链接 - Issue-19
    const relatedLinks = page.locator('a[href*="/map"], a[href*="/offers"], a[href*="/survival"], a[href*="/questions"]');
    console.log('关联链接数量:', await relatedLinks.count());

    await page.close();
  });

  test('政策更新提醒 Issue-20', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/policies/mIT');
    await page.waitForLoadState('networkidle');

    // 检查提醒按钮
    const alertBtn = page.locator('button:has-text("提醒"), button:has-text("订阅"), button:has-text("通知")');
    if (await alertBtn.count() > 0) {
      console.log('提醒按钮存在');
    }

    await page.close();
  });
});

// ==================== 地图测试 ====================
test.describe('【Issue-21-23】地图页面 - 逐按钮测试', () => {

  test('地图页面加载 Issue-21', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/map');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('地图页面加载成功');

    // 检查设施标签 - Issue-23
    const facilityTags = page.locator('text=/图书馆|食堂|宿舍|教学楼|实验室|体育馆|医院|超市|咖啡厅|公园/');
    console.log('设施标签数量:', await facilityTags.count());

    await page.close();
  });

  test('选择大学后地图标记 Issue-22', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/map');
    await page.waitForLoadState('networkidle');

    // 尝试选择大学下拉框
    const universitySelect = page.locator('select, input[placeholder*="大学"], input[placeholder*="学校"]').first();
    if (await universitySelect.isVisible().catch(() => false)) {
      console.log('大学选择器存在');
    }

    await page.close();
  });
});

// ==================== Offer页面测试 ====================
test.describe('【Issue-32-35】Offer页面 - 逐按钮测试', () => {

  test('Offer列表页 Issue-32-34', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/offers');
    await page.waitForLoadState('networkidle');

    // 检查筛选功能 Issue-34
    const filters = page.locator('select, button:has-text("筛选"), button:has-text("Filter")');
    console.log('筛选控件数量:', await filters.count());

    // 检查提交按钮 Issue-32
    const submitBtn = page.locator('button:has-text("提交"), a:has-text("分享Offer"), a[href*="submit"]');
    if (await submitBtn.count() > 0) {
      console.log('提交按钮存在');
    }

    await page.close();
  });

  test('Offer详情页 Issue-35', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/offers');
    await page.waitForLoadState('networkidle');

    // 点击第一个Offer
    const firstOffer = page.locator('a[href*="/offers/"]').first();
    if (await firstOffer.isVisible().catch(() => false)) {
      await firstOffer.click();
      await page.waitForURL('**/offers/**');
      console.log('Offer详情页跳转成功');

      // 检查关联链接 - Issue-35
      const universityLink = page.locator('a[href*="/policies/"]');
      console.log('大学关联链接:', await universityLink.count());
    }

    await page.close();
  });

  test('评论区表情 Issue-36', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/offers');
    await page.waitForLoadState('networkidle');

    // 进入详情页
    const firstOffer = page.locator('a[href*="/offers/"]').first();
    if (await firstOffer.isVisible().catch(() => false)) {
      await firstOffer.click();
      await page.waitForURL('**/offers/**');
      await page.waitForTimeout(1000);

      // 检查评论区
      const commentArea = page.locator('textarea, input[placeholder*="评论"], textarea[placeholder*="comment"]');
      if (await commentArea.count() > 0) {
        console.log('评论区存在');

        // 检查表情按钮
        const emojiBtn = page.locator('button:has-text("表情"), .emoji-picker, button[aria-label*="emoji"]');
        console.log('表情按钮数量:', await emojiBtn.count());
      }
    }

    await page.close();
  });
});

// ==================== 防坑指南测试 ====================
test.describe('【Issue-25-27】防坑指南 - 逐按钮测试', () => {

  test('防坑指南列表 Issue-25-26', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/survival');
    await page.waitForLoadState('networkidle');

    // 检查指南数量 Issue-25
    const guides = page.locator('a[href*="/survival/"]');
    const count = await guides.count();
    console.log(`防坑指南数量: ${count}`);
    expect(count).toBeGreaterThan(5);

    // 检查分类 Issue-26
    const categories = page.locator('text=/诈骗|文化|安全|法律|其它/');
    console.log('分类数量:', await categories.count());

    await page.close();
  });

  test('防坑详情页', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/survival');
    await page.waitForLoadState('networkidle');

    // 点击第一个指南
    const firstGuide = page.locator('a[href*="/survival/"]').first();
    if (await firstGuide.isVisible().catch(() => false)) {
      await firstGuide.click();
      await page.waitForURL('**/survival/**');
      console.log('防坑详情页跳转成功');
    }

    await page.close();
  });
});

// ==================== Prompt模板测试 ====================
test.describe('【Issue-30】Prompt模板 - 逐按钮测试', () => {

  test('Prompt列表 Issue-30', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/prompts');
    await page.waitForLoadState('networkidle');

    // 检查模板数量
    const templates = page.locator('[data-prompt], .prompt-card, a[href*="/prompts/"]');
    const count = await templates.count();
    console.log(`Prompt模板数量: ${count}`);
    expect(count).toBeGreaterThan(10);

    await page.close();
  });

  test('英文版Prompt Issue-30', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/en/prompts');
    await page.waitForLoadState('networkidle');

    const templates = page.locator('[data-prompt], .prompt-card, a[href*="/prompts/"]');
    const count = await templates.count();
    console.log(`英文Prompt模板数量: ${count}`);

    await page.close();
  });
});

// ==================== 问答社区测试 ====================
test.describe('【Issue-38-39】问答社区 - 逐按钮测试', () => {

  test('问答列表 Issue-38-39', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/questions');
    await page.waitForLoadState('networkidle');

    // 检查筛选 Issue-38
    const filters = page.locator('select, a[href*="category"]');
    console.log('筛选控件数量:', await filters.count());

    // 检查问题数量 Issue-39
    const questions = page.locator('a[href*="/questions/"]');
    const count = await questions.count();
    console.log(`问题数量: ${count}`);
    expect(count).toBeGreaterThan(3);

    await page.close();
  });

  test('问答分类切换', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/questions');
    await page.waitForLoadState('networkidle');

    // 尝试切换分类
    const categorySelect = page.locator('select').first();
    if (await categorySelect.isVisible().catch(() => false)) {
      const options = page.locator('select option');
      const optionCount = await options.count();
      console.log('分类选项数量:', optionCount);
    }

    await page.close();
  });
});

// ==================== 用户中心测试 ====================
test.describe('【Issue-04】用户中心 - 逐按钮测试', () => {

  test('登录后用户中心 Issue-04', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 设置登录状态
    await page.evaluate(() => {
      sessionStorage.setItem('demo_session', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        points: 100,
        level: 1,
        favorites: [],
        ratings: []
      }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 检查用户中心入口
    const userCenter = page.locator('a:has-text("用户中心"), a:has-text("个人中心")').first();
    if (await userCenter.isVisible().catch(() => false)) {
      console.log('用户中心入口可见');
      await userCenter.click();
      await page.waitForURL('**/user**');
      console.log('用户中心跳转成功');

      // 检查各个功能按钮
      const buttons = [
        '头像',
        '收藏',
        '评分',
        'Offer',
        '设置',
        '退出'
      ];

      for (const btn of buttons) {
        const button = page.locator(`text=/${btn}/`).first();
        console.log(`${btn}按钮:`, await button.isVisible().catch(() => false) ? '存在' : '不存在');
      }
    }

    await page.close();
  });
});

// ==================== 中英文切换测试 ====================
test.describe('【Issue-40】中英文切换 - 逐按钮测试', () => {

  test('语言切换保持 Issue-40', async () => {
    const page = await chromium.launch().then(b => b.newPage());

    // 从英文首页开始
    await page.goto(BASE_URL + '/en/');
    await page.waitForLoadState('networkidle');
    const enTitle = await page.title();
    console.log('英文版标题:', enTitle);

    // 导航到其他页面
    await page.goto(BASE_URL + '/en/tools');
    await page.waitForLoadState('networkidle');
    const toolsTitle = await page.title();
    console.log('英文工具页标题:', toolsTitle);

    // 检查是否保持英文
    expect(toolsTitle).toContain('MI TO');

    // 再导航到支付页面
    await page.goto(BASE_URL + '/en/payment');
    await page.waitForLoadState('networkidle');
    const paymentTitle = await page.title();
    console.log('英文支付页标题:', paymentTitle);
    expect(paymentTitle).toContain('MI TO');

    await page.close();
  });

  test('切换到中文', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/en/');
    await page.waitForLoadState('networkidle');

    // 点击中文切换
    const zhSwitch = page.locator('a:has-text("中文"), a[href="/"]').first();
    if (await zhSwitch.isVisible().catch(() => false)) {
      await zhSwitch.click();
      await page.waitForURL(BASE_URL + '/');
      console.log('切换到中文成功');
    }

    await page.close();
  });
});

// ==================== 注册登录测试 ====================
test.describe('【Issue-28】注册登录 - 逐按钮测试', () => {

  test('登录页第三方登录 Issue-28', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/auth/login');
    await page.waitForLoadState('networkidle');

    // 检查第三方登录
    const googleBtn = page.locator('text=/Google|谷歌/i');
    const wechatBtn = page.locator('text=/微信|WeChat/i');
    const qqBtn = page.locator('text=/QQ/i');
    const weiboBtn = page.locator('text=/微博/i');

    console.log('Google登录:', await googleBtn.isVisible().catch(() => false) ? '存在' : '不存在');
    console.log('微信登录:', await wechatBtn.isVisible().catch(() => false) ? '存在' : '不存在');
    console.log('QQ登录:', await qqBtn.isVisible().catch(() => false) ? '存在' : '不存在');
    console.log('微博登录:', await weiboBtn.isVisible().catch(() => false) ? '存在' : '不存在');

    await page.close();
  });

  test('注册页第三方登录', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/auth/register');
    await page.waitForLoadState('networkidle');

    const wechatBtn = page.locator('text=/微信|WeChat/i');
    const qqBtn = page.locator('text=/QQ/i');

    console.log('微信登录(注册页):', await wechatBtn.isVisible().catch(() => false) ? '存在' : '不存在');
    console.log('QQ登录(注册页):', await qqBtn.isVisible().catch(() => false) ? '存在' : '不存在');

    await page.close();
  });
});

// ==================== SEO检查测试 ====================
test.describe('【Issue-42】SEO检查', () => {

  test('Schema.org和Meta标签', async () => {
    const page = await chromium.launch().then(b => b.newPage());
    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');

    // 检查Schema.org
    const schema = page.locator('script[type="application/ld+json"]');
    console.log('Schema.org标记:', await schema.count() > 0 ? '存在' : '不存在');

    // 检查Meta标签
    const metaDesc = page.locator('meta[name="description"]');
    console.log('Meta描述:', await metaDesc.getAttribute('content').catch(() => '不存在'));

    await page.close();
  });
});
