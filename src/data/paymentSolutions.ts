/* eslint-disable no-useless-escape */
// Payment Solutions Data - Static data for payment solutions page
// Comprehensive payment solutions for ALL 20 AI tools in the tools database
// This data is used when Supabase is not configured or as fallback

export interface PaymentSolutionData {
  id: string;
  title: string;
  category: 'virtual_card' | 'gift_card' | 'regional_pricing' | 'troubleshooting';
  content: string; // Markdown format
  excerpt: string;
  toolIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  reliability: 'high' | 'medium' | 'low';
  tags: string[];
  rating: number;
  ratingCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  /** Referral / affiliate link for this payment platform. */
  referralUrl?: string;
}

export const paymentSolutionsData: PaymentSolutionData[] = [
  // ==================== NEW: CHATGPT SUBSCRIPTION TIERS (2026) ====================
  {
    id: 'chatgpt-subscription',
    title: 'ChatGPT订阅支付完全指南（2026最新版）',
    category: 'virtual_card',
    excerpt: 'ChatGPT目前提供Free/Go/Plus/Pro $100/Pro $200五个订阅层级，本文详细介绍各层级区别及国内用户如何通过虚拟卡完成订阅支付',
    toolIds: ['chatgpt'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['ChatGPT', 'OpenAI', '订阅', '虚拟卡', 'Go', 'Plus', 'Pro', 'GPT-5', '支付'],
    rating: 4.8,
    ratingCount: 15200,
    viewCount: 186000,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-06-04T00:00:00Z',
    referralUrl: 'https://wildcard.com/?ref=mi-to-ai',
    content: `## 一、ChatGPT订阅计划概览（2026年6月最新）

ChatGPT目前提供五个订阅层级，从免费到Pro $200，覆盖从轻度使用到重度专业用户的各种需求。

### 各层级详细对比

| 计划 | 月费 | 模型 | 消息限额 | 上下文窗口 | Sora视频 | 广告 |
|------|------|------|----------|-----------|---------|------|
| **Free** | $0 | GPT-5.3 Instant | 10条/5小时 | 标准 | ❌ | 美国有广告 |
| **Go** | $8/月 | GPT-5.3 Instant (Codex用5.5) | 10倍于Free | 标准 | ❌ | 美国有广告 |
| **Plus** | $20/月 | GPT-5.5 Thinking | 远超Go | 128K | 720p | 无广告 |
| **Pro $100** | $100/月 | GPT-5.5 Pro | 5倍于Plus | 256K | 1080p | 无广告 |
| **Pro $200** | $200/月 | GPT-5.5 Pro | 20倍于Plus | 1M | 1080p无水印 | 无广告 |

### 各层级特点详解

#### Free（免费版）
- 使用GPT-5.3 Instant模型
- 每5小时10条消息限制
- 美国地区用户会看到广告
- 适合轻度体验用户

#### Go（$8/月）— 性价比之选
- 使用GPT-5.3 Instant模型（Codex场景使用GPT-5.5）
- 消息限额为Free的10倍
- 美国地区仍有广告
- **适合学生和预算有限的用户**，入门AI助手的最佳选择

#### Plus（$20/月）— 主流推荐
- 使用GPT-5.5 Thinking深度思考模型
- 128K上下文窗口
- Sora视频生成（720p）
- 无广告体验
- **适合日常重度用户和专业人士**

#### Pro $100 — 专业级
- 使用GPT-5.5 Pro顶级模型
- 消息限额为Plus的5倍
- 256K上下文窗口
- Sora视频生成（1080p）
- **适合AI开发者、研究人员、内容创作者**

#### Pro $200 — 旗舰级
- 使用GPT-5.5 Pro顶级模型
- 消息限额为Plus的20倍
- **1M超长上下文窗口**
- Sora视频生成（1080p无水印）
- **适合企业用户、重度AI应用开发者**

## 二、推荐支付方式（国内用户）

由于OpenAI不支持中国大陆支付方式，国内用户需要使用海外虚拟信用卡完成订阅。

### 方式一：WildCard虚拟卡（⭐强烈推荐）

WildCard是目前国内用户最常用的ChatGPT订阅支付方案，支持支付宝充值，操作简单。

**注册流程**：
1. 访问 [wildcard.com](https://wildcard.com/?ref=mi-to-ai) 注册账号
2. 选择套餐（$11.99/年 或 $9.99/月）
3. 使用支付宝完成充值（建议充值对应计划金额+$5余额）
4. 获取虚拟卡卡号、有效期、CVV

**订阅步骤**：
1. 确保使用美国IP（VPN）访问
2. 登录 [chat.openai.com](https://chat.openai.com)
3. 进入 Settings → Subscription
4. 选择目标计划（Go/Plus/Pro $100/Pro $200）
5. 输入WildCard虚拟卡信息
6. 完成订阅

**优势**：
- 支持支付宝直接充值，无需加密货币
- 开卡速度快，5分钟内完成
- 提供美国账单地址
- 客服响应及时

### 方式二：Depay虚拟卡

Depay是另一款常用的海外虚拟卡，支持USDT充值。

**注册流程**：
1. 访问 depay.com 注册账号
2. 完成KYC身份验证
3. 充值USDT获取虚拟卡
4. 获取卡片信息

**订阅步骤**：
1. 使用VPN连接美国IP
2. 登录ChatGPT账号
3. 进入订阅页面选择计划
4. 填写Depay虚拟卡信息
5. 使用Depay提供的美国账单地址

**优势**：
- 支持USDT、USDC等加密货币充值
- 卡片额度较高
- 适合有加密货币资产的用户

### 方式三：其他虚拟卡方案

| 平台 | 充值方式 | 开卡费 | 特点 |
|------|----------|--------|------|
| Nobepay | 支付宝/USDT | $1-5 | 稳定性好 |
| OneKey Card | 加密货币 | 免费 | Web3用户首选 |
| FOMEPay | USDT | $10 | 高额度卡 |

## 三、订阅前的准备工作

### 1. 网络环境
- **必须使用美国、日本、新加坡等地区IP**
- 中国大陆IP无法注册和订阅
- 推荐使用稳定的付费VPN服务
- 建议使用Chrome无痕模式

### 2. 账号准备
- 需要一个已验证的OpenAI账号
- 建议使用Gmail等海外邮箱注册
- 绑定海外手机号（可选，提高账号安全性）
- 确保账号已完成邮箱验证

### 3. 支付准备
- 虚拟卡余额充足（建议多充$5-10应对汇率波动）
- 确认虚拟卡支持美元交易
- 确认账单地址与IP所在地区一致

## 四、各计划选择建议

### 学生用户 → Go（$8/月）
- 预算友好，AI功能够用
- 日常作业、写作辅助完全足够
- 性价比最高的入门选择

### 普通用户 → Plus（$20/月）
- GPT-5.5 Thinking深度推理
- 128K上下文处理长文档
- 无广告，体验流畅

### 专业用户 → Pro $100（$100/月）
- GPT-5.5 Pro顶级模型
- 5倍Plus的消息额度
- 适合高频使用场景

### 企业/重度用户 → Pro $200（$200/月）
- 20倍Plus消息额度
- 1M超长上下文窗口
- Sora无水印视频生成

## 五、常见问题

**Q: 虚拟卡订阅被拒绝怎么办？**
A: 检查以下几点：
1. VPN是否稳定，建议切换节点
2. 虚拟卡余额是否充足
3. 账单地址是否为美国地址
4. 清除浏览器缓存重试
5. 联系虚拟卡客服确认卡片状态

**Q: 如何从免费版升级到Go/Plus？**
A: 登录ChatGPT → Settings → Subscription → 选择目标计划 → 绑定支付方式

**Q: 可以随时取消订阅吗？**
A: 可以，随时取消，当月剩余时间仍可使用。次月不再扣费。

**Q: Pro $100和Pro $200有什么区别？**
A: 主要区别在于消息额度（5倍vs 20倍）、上下文窗口（256K vs 1M）和Sora视频水印。Pro $200适合真正的重度用户。

**Q: 年付有优惠吗？**
A: 目前ChatGPT各层级均为月付制，暂无年付优惠方案。

## 六、安全使用建议

1. **使用稳定VPN**：避免频繁切换IP导致账号异常
2. **设置消费限额**：在虚拟卡平台设置月消费上限
3. **定期检查账单**：确认扣费金额正确
4. **保留订阅凭证**：截图保存订阅确认页面
5. **及时更新卡片**：虚拟卡到期前及时更新支付信息
`,
  },
  // ==================== NEW: CURSOR PRO PAYMENT ====================
  {
    id: 'cursor-pro-subscription',
    title: 'Cursor Pro订阅支付完全指南',
    category: 'virtual_card',
    excerpt: 'Cursor Pro是AI代码编辑器，支持GPT-4等模型。本文详细介绍国内用户如何通过虚拟卡、学生优惠等方式订阅Cursor Pro',
    toolIds: ['cursor'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['Cursor', 'Pro', '订阅', '虚拟卡', '学生优惠', 'AI编程'],
    rating: 4.7,
    ratingCount: 8900,
    viewCount: 115000,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://wildcard.com/?ref=mi-to-ai',
    content: `## 一、Cursor Pro简介

Cursor Pro是专为AI编程设计的代码编辑器，基于GPT-4等先进AI模型，支持代码补全、智能对话、多文件编辑等功能，月费$20或年费$192。

### 订阅计划

| 计划 | 月费 | 年费 | 特点 |
|------|------|------|------|
| Basic | 免费 | 免费 | 有限AI功能 |
| Pro | $20 | $192 | 无限使用GPT-4/Claude等 |
| Business | $40 | $384 | 团队协作、高级功能 |

## 二、推荐支付方式

### 方式一：WildCard虚拟卡（推荐）

1. 访问 wildcad.com 注册账号
2. 选择年费套餐（$11.99/年）
3. 使用支付宝充值
4. 获取虚拟卡信息

**订阅步骤**：
1. 登录Cursor官网 cursor.sh
2. 进入Settings → Plans
3. 选择Pro计划
4. 输入WildCard虚拟卡信息

### 方式二：Depay虚拟卡

1. 注册Depay账号（depay.com）
2. 充值USDT获取虚拟卡
3. 在Cursor订阅页面使用

### 方式三：学生免费申请

**重要更新**：Cursor已取消中国区学生认证，直接申请可能显示不可用。但可以尝试以下方法：

1. 准备一个美国地区的VPN
2. 访问 cursor.com/cn/students
3. 使用教育邮箱（.edu）注册
4. 如果国家选项没有China，参考CSDN教程修改前端

**注意**：学生认证可能不稳定，建议优先使用虚拟卡方案。

## 三、常见问题

**Q: Cursor支持哪些AI模型？**
A: Cursor Pro支持GPT-4、Claude 3.5 Opus、GPT-4o等顶级模型

**Q: 14天免费试用如何获取？**
A: 新用户首次注册可以获得14天Pro试用，需要绑定支付方式

**Q: 退款政策是什么？**
A: 订阅后7天内可以申请退款，联系客服即可

## 四、安全使用建议

1. 使用稳定VPN连接
2. 绑定虚拟卡时设置消费限额
3. 及时取消不需要的订阅
4. 保留订阅凭证和截图`
  },
  {
    id: 'replit-ai-subscription',
    title: 'Replit AI订阅和Ghostwriter完整教程',
    category: 'virtual_card',
    excerpt: 'Replit是在线AI编程平台，提供Ghostwriter AI代码助手功能。本文介绍如何订阅Replit Pro及支付方式',
    toolIds: ['replit'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Replit', 'Ghostwriter', '订阅', '在线IDE', 'AI编程'],
    rating: 4.5,
    ratingCount: 6200,
    viewCount: 78000,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://replit.com/?ref=mi-to-ai',
    content: `## 一、Replit Pro简介

Replit是一个基于浏览器的在线编程平台，其AI功能Ghostwriter支持代码补全、解释、调试等功能。

### 订阅计划

| 计划 | 月费 | 年费 | 特点 |
|------|------|------|------|
| Free | $0 | $0 | 基础功能 |
| Pro | $15 | $144 | 无限机器、AI功能 |
| Teams | $25/人 | - | 团队协作 |

## 二、支付方式

### 方式一：国际信用卡

支持Visa、MasterCard等，直接在官网订阅

### 方式二：虚拟信用卡

1. 申请WildCard或Depay虚拟卡
2. 充值足够金额
3. 在Replit订阅页面使用

### 方式三：教育邮箱免费

1. 访问 education.github.com 申请GitHub教育验证
2. 使用.edu邮箱注册Replit
3. 部分功能可免费使用

## 三、Ghostwriter AI功能

### 主要功能
- **代码补全**：实时智能补全
- **代码解释**：解释代码功能
- **Bug修复**：自动修复错误
- **多语言支持**：支持Python、JavaScript等

## 四、国内使用建议

1. 使用稳定网络连接
2. 优先选择年费套餐更优惠
3. 注意账户安全，设置双因素认证`
  },
  {
    id: 'figma-professional-subscription',
    title: 'Figma专业版订阅完整指南',
    category: 'virtual_card',
    excerpt: 'Figma是全球领先的UI设计工具，支持团队协作和AI功能。本文详细介绍如何订阅Figma Professional和支付方式',
    toolIds: ['figma'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Figma', 'Professional', '订阅', '设计工具', 'UI设计'],
    rating: 4.8,
    ratingCount: 14000,
    viewCount: 185000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://wildcard.com/?ref=mi-to-ai',
    content: `## 一、Figma订阅计划

### 专业版 Professional

| 项目 | 月费 | 年费 |
|------|------|------|
| 每用户 | $20 | $192 |

**功能**：
- 无限Figma文件
- 无限团队库
- 高级原型设计
- 版本历史记录

### 组织版 Organization

| 项目 | 月费 | 年费 |
|------|------|------|
| 每用户 | $55 | $528 |

### 企业版 Enterprise

| 项目 | 月费 | 年费 |
|------|------|------|
| 每用户 | $90 | $1080 |

## 二、支付方式

### 方式一：国际信用卡（推荐）

直接访问 figma.com/pricing 使用信用卡订阅

### 方式二：虚拟信用卡

如果国内信用卡被拒：

1. 申请WildCard虚拟卡
2. 充值足够金额
3. 在Figma订阅页面使用虚拟卡信息

### 方式三：第三方平台代购

部分国内代理平台提供Figma代购服务

## 三、学生免费申请

### 申请条件
- 教育邮箱验证
- 学生身份

### 申请步骤
1. 访问 figma.com/education
2. 使用学校邮箱注册
3. 完成学生验证
4. 获取免费Professional版

## 四、支付注意事项

1. **支付安全问题**：Figma会验证卡片地址，建议使用与卡片一致的信息
2. **年费优惠**：年费可节省约17%费用
3. **团队订阅**：5人以上团队建议考虑组织版
4. **退款政策**：14天内可申请退款`
  },
  {
    id: 'jasper-ai-marketing-subscription',
    title: 'Jasper AI企业级写作助手订阅指南',
    category: 'virtual_card',
    excerpt: 'Jasper是知名AI营销文案工具，支持100+模板和多语言写作。详细介绍订阅方式和支付解决方案',
    toolIds: ['jasper'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['Jasper', 'AI写作', '营销文案', '订阅', '企业级'],
    rating: 4.4,
    ratingCount: 4200,
    viewCount: 52000,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://jasper.ai/?ref=mi-to-ai',
    content: `## 一、Jasper AI简介

Jasper是企业级AI写作助手，特别适合营销内容创作，支持博客、社交媒体、广告文案等多种场景。

### 订阅计划

| 计划 | 月费 | 特点 |
|------|------|------|
| Creator | $49/月 | 个人创作者 |
| Pro | $99/月 | 专业团队 |
| Business | 定制 | 企业用户 |

## 二、支付方式

### 方式一：国际信用卡

直接访问 jasper.ai/pricing 使用信用卡订阅

### 方式二：虚拟信用卡

1. 申请WildCard或Depay虚拟卡
2. 确认卡片已激活并有足够余额
3. 在Jasper订阅页面输入虚拟卡信息

### 方式三：PayPal支付

部分用户反映PayPal支付成功率更高

## 三、免费试用

Jasper提供7天免费试用：
1. 访问 jasper.ai/free-trial
2. 注册账号
3. 填写信用卡信息（确保7天内取消）
4. 开始使用AI写作功能

## 四、功能特点

### 核心功能
- **Brand Voice**：保持品牌调性一致
- **BOSS Mode**：长内容生成
- **100+模板**：覆盖各种写作场景
- **多语言**：支持30+语言

## 五、支付问题解决

**常见问题**：
1. 信用卡被拒 → 使用虚拟卡
2. 试用取消 → 在试用期最后一天取消
3. 退款申请 → 联系 support@jasper.ai`
  },
  {
    id: 'notion-ai-plus-subscription',
    title: 'Notion AI Plus订阅完整指南',
    category: 'virtual_card',
    excerpt: 'Notion AI集成在Notion笔记中，提供智能写作和整理功能。详细介绍Notion AI订阅方式和学生优惠',
    toolIds: ['notion-ai'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Notion', 'AI', 'Plus', '订阅', '笔记', '学生优惠'],
    rating: 4.6,
    ratingCount: 8500,
    viewCount: 98000,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://notion.so/?ref=mi-to-ai',
    content: `## 一、Notion AI订阅计划

### Notion AI Plus

| 项目 | 月费 | 年费 |
|------|------|------|
| 价格 | $10 | $96 |

**功能**：
- 无限AI请求
- 优先使用新功能
- 高级AI模型访问

### Notion AI Business

| 项目 | 月费 | 年费 |
|------|------|------|
| 价格 | $18/人 | $168/人 |

## 二、支付方式

### 方式一：国际信用卡

1. 登录Notion账号
2. 进入 Settings → Plans
3. 选择Notion AI Plus
4. 添加信用卡信息

### 方式二：虚拟信用卡

国内用户如果信用卡被拒：
1. 申请WildCard虚拟卡
2. 使用支付宝充值
3. 在Notion订阅页面使用虚拟卡

### 方式三：教育邮箱免费

**Notion教育优惠**：
1. 使用学校邮箱（.edu）注册Notion
2. 访问 notion.so/product/education
3. 申请免费教育版
4. 教育版包含AI功能

## 三、国内使用技巧

1. **访问速度**：Notion在国内访问较慢，建议使用VPN
2. **数据同步**：确保网络稳定以保证数据同步
3. **移动端**：iOS App通常比网页版更稳定

## 四、退款政策

Notion的退款政策比较严格：
- 按月订阅：只能在购买后7天内申请退款
- 按年订阅：较难申请退款
- 建议先使用免费版试用功能`
  },
  {
    id: 'perplexity-pro-subscription',
    title: 'Perplexity Pro订阅完整指南',
    category: 'virtual_card',
    excerpt: 'Perplexity是最强AI搜索引擎，基于真实网络内容回答问题。详细介绍Pro版订阅和支付方式',
    toolIds: ['perplexity'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Perplexity', 'Pro', '订阅', 'AI搜索', '虚拟卡'],
    rating: 4.6,
    ratingCount: 7800,
    viewCount: 92000,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://perplexity.ai/?ref=mi-to-ai',
    content: `## 一、Perplexity Pro简介

Perplexity是AI驱动的搜索引擎，基于实时网络内容回答问题，Pro版支持更多AI模型和更高使用限制。

### 订阅计划

| 计划 | 月费 | 年费 | 特点 |
|------|------|------|------|
| Free | $0 | $0 | 基础搜索 |
| Pro | $20 | $200 | 无限使用、更多模型 |

### Pro版功能
- 无限快速搜索
- 访问GPT-4、Claude 3.5等模型
- 优先使用新功能
- 每日100次Pro搜索

## 二、支付方式

### 方式一：信用卡直接订阅

1. 访问 perplexity.ai/settings/subscription
2. 选择Pro计划
3. 输入信用卡信息

### 方式二：虚拟信用卡

如果国际支付被拒：
1. 申请WildCard虚拟卡
2. 充值足够金额
3. 在Perplexity使用虚拟卡订阅

## 三、免费使用技巧

### Free版限制
- 每小时可进行一定次数搜索
- 基础AI模型访问

### 提高免费使用效率
1. 使用多个账号轮换
2. 关注官方活动，获取免费Pro体验
3. 学生可以申请教育优惠

## 四、API使用

开发者可以通过API使用Perplexity：
1. 访问 perplexity.ai/api
2. 注册开发者账号
3. 获取API密钥
4. 按量付费使用`
  },
  {
    id: 'grammarly-premium-subscription',
    title: 'Grammarly Premium订阅完整指南',
    category: 'virtual_card',
    excerpt: 'Grammarly是领先的AI写作辅助工具，提供语法检查、风格优化等功能。详细介绍Premium订阅和支付方式',
    toolIds: ['grammarly'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Grammarly', 'Premium', '订阅', '语法检查', '写作辅助'],
    rating: 4.7,
    ratingCount: 15000,
    viewCount: 185000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://depay.one/?ref=mi-to-ai',
    content: `## 一、Grammarly订阅计划

### Grammarly Free
- 基础语法检查
- 少量AI功能

### Grammarly Premium

| 项目 | 月费 | 年费 |
|------|------|------|
| 个人 | $12 | $144 |
| 团队 | $15/人/月 | - |

### Grammarly Business
- $12.50/人/月
- 包含品牌语音、管理控制台

## 二、支付方式

### 方式一：国际信用卡

1. 访问 grammarly.com/pricing
2. 选择Premium计划
3. 输入信用卡信息

### 方式二：虚拟信用卡

国内用户推荐使用：
1. **WildCard虚拟卡**
   - 支持支付宝充值
   - 订阅成功率高

2. **Depay虚拟卡**
   - 支持USDT充值
   - 多币种支持

### 方式三：第三方代购

部分平台提供Grammarly代购服务

## 三、学生优惠

### 教育邮箱折扣
1. 使用.edu邮箱注册
2. 可能获得50%折扣
3. 访问 grammarly.com/education

## 四、浏览器插件使用

### 安装步骤
1. 访问 grammarly.com/download
2. 下载浏览器插件
3. 注册账号并登录
4. 选择订阅计划

### 功能特点
- **语法纠错**：实时检查英文语法
- **风格建议**：优化写作风格
- **剽窃检测**：检查内容原创性
- **多平台集成**：支持Word、Gmail等`
  },
  {
    id: 'quillbot-premium-subscription',
    title: 'QuillBot Premium订阅完整指南',
    category: 'gift_card',
    excerpt: 'QuillBot是知名AI改写和润色工具，特别适合学术写作。详细介绍Premium订阅、折扣码和支付方式',
    toolIds: ['quillbot'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['QuillBot', 'Premium', '订阅', '改写', '润色', '折扣码'],
    rating: 4.5,
    ratingCount: 9200,
    viewCount: 110000,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、QuillBot订阅计划

### QuillBot Free
- 125词改写
- 6次/天使用
- 基础语法检查

### QuillBot Premium

| 项目 | 月费 | 年费 | 特点 |
|------|------|------|------|
| 月付 | $9.95 | - | 按月计费 |
| 年付 | $4.17/月 | $49.95/年 | 省50% |

### 学生优惠
使用折扣码可获得30-50%折扣：
- **SCHOOL30**：30%折扣
- **GOPREMIUM**：20%折扣

## 二、支付方式

### 方式一：信用卡直接订阅

1. 访问 quillbot.com/premium
2. 选择年付或月付
3. 输入信用卡信息

### 方式二：虚拟信用卡

如果国际信用卡被拒：
1. 申请WildCard虚拟卡
2. 使用支付宝充值
3. 在QuillBot订阅页面使用

### 方式三：PayPal

部分用户PayPal支付成功率更高

## 三、主要功能

### 核心功能
- **Paraphraser**：改写模式
- **Grammar Checker**：语法检查
- **Plagiarism Checker**：剽窃检测
- **Summarizer**：摘要生成
- **AI Detector**：AI内容检测

## 四、使用技巧

### 免费使用技巧
1. 每天多次使用免费额度
2. 清除浏览器Cookie重置限制
3. 使用无痕模式访问

### 订阅建议
- 年付更划算（节省约50%）
- 学生可申请教育折扣
- 关注黑五等促销活动`
  },
  {
    id: 'copyai-pro-subscription',
    title: 'Copy.ai Pro订阅完整指南',
    category: 'virtual_card',
    excerpt: 'Copy.ai是AI文案生成工具，提供100+内容模板。详细介绍Pro版订阅和支付方式',
    toolIds: ['copyai'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['Copy.ai', 'Pro', '订阅', '文案生成', 'AI写作', '模板'],
    rating: 4.3,
    ratingCount: 3800,
    viewCount: 45000,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://copy.ai/?ref=mi-to-ai',
    content: `## 一、Copy.ai订阅计划

### Copy.ai Free
- 2000词/月
- 90+模板
- 1个品牌语音

### Copy.ai Pro

| 项目 | 月费 | 年费 |
|------|------|------|
| Starter | $49/月 | $468/年 |
| Growth | $149/月 | $1428/年 |

### Pro版功能
- 无限内容生成
- 无限品牌语音
- 团队协作
- 优先支持

## 二、支付方式

### 方式一：信用卡订阅

1. 访问 copy.ai/pricing
2. 选择计划
3. 输入信用卡信息

### 方式二：虚拟信用卡

1. 申请WildCard或Depay虚拟卡
2. 确认卡内有足够余额
3. 在Copy.ai订阅页面使用

### 方式三：联系销售

企业用户可以联系 sales@copy.ai 定制方案

## 三、主要功能

### 内容类型
- 博客文章
- 社交媒体内容
- 广告文案
- 产品描述
- 销售邮件

### AI模型
- GPT-4驱动
- 持续更新模型

## 四、免费试用

Copy.ai提供Pro版免费试用：
1. 注册免费账号
2. 申请试用资格
3. 7天内试用Pro功能
4. 记得取消避免扣费`
  },
  {
    id: 'tabnine-pro-subscription',
    title: 'Tabnine Pro订阅完整指南',
    category: 'virtual_card',
    excerpt: 'Tabnine是AI代码补全插件，支持所有主流编程语言。详细介绍Pro版订阅和学生免费申请',
    toolIds: ['tabnine'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Tabnine', 'Pro', '订阅', '代码补全', '学生免费', 'IDE插件'],
    rating: 4.3,
    ratingCount: 5600,
    viewCount: 68000,
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    referralUrl: 'https://tabnine.com/?ref=mi-to-ai',
    content: `## 一、Tabnine订阅计划

### Tabnine Free
- 基础代码补全
- 有限使用量

### Tabnine Pro

| 项目 | 月费 | 年费 |
|------|------|------|
| 价格 | $10 | $96/人/年 |

### Tabnine Team
- $20/人/月
- 团队管理
- 代码库索引

## 二、支付方式

### 方式一：信用卡订阅

1. 访问 tabnine.com/pricing
2. 选择Pro计划
3. 输入信用卡信息

### 方式二：虚拟信用卡

1. 申请WildCard虚拟卡
2. 充值足够金额
3. 在Tabnine订阅页面使用

### 方式三：学生免费申请

**GitHub Education免费福利**：
1. 申请GitHub教育验证（education.github.com）
2. 使用.edu邮箱验证
3. Tabnine Pro可免费使用

**申请步骤**：
1. 注册Tabnine账号
2. 关联GitHub教育账号
3. 自动解锁免费Pro版

## 三、主要功能

### 核心功能
- **全语言支持**：支持所有主流语言
- **本地运行**：私有代码不外传
- **隐私保护**：代码安全
- **深度学习**：个性化补全

### 支持IDE
- VS Code
- IntelliJ
- PyCharm
- WebStorm
- Vim/Neovim

## 四、GitHub Copilot对比

| 特性 | Tabnine | GitHub Copilot |
|------|---------|----------------|
| 学生免费 | 通过GitHub Education | 直接免费 |
| 本地运行 | 支持 | 不支持 |
| 价格 | $10/月 | $10/月（学生免费）|
| 隐私保护 | 更强 | 代码上传云端 |
| 语言支持 | 所有主流语言 | 所有主流语言 |`
  },
  {
    id: 'dalle-3-api-payment',
    title: 'DALL-E 3 API充值和使用完整指南',
    category: 'gift_card',
    excerpt: 'DALL-E 3是OpenAI的AI图像生成模型，支持通过API调用。本文介绍如何充值API额度和使用DALL-E 3',
    toolIds: ['dalle-3'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['DALL-E 3', 'API', 'OpenAI', '图像生成', 'API充值', ' prepaid'],
    rating: 4.7,
    ratingCount: 11000,
    viewCount: 145000,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、DALL-E 3 API简介

DALL-E 3是OpenAI开发的AI图像生成模型，可通过API调用，支持在应用程序中集成图像生成功能。

### API定价

| 尺寸 | 价格 |
|------|------|
| 1024x1024 | $0.04/图 |
| 1024x1792 | $0.08/图 |
| 1792x1024 | $0.08/图 |

### 免费额度
新用户获得$5免费API额度

## 二、充值方式

### 方式一：信用卡充值（推荐）

1. 访问 platform.openai.com
2. 登录账号
3. 进入Billing → Payment methods
4. 添加信用卡
5. 进入Usage → Prepaid credits
6. 购买额度

### 方式二：API预付额度

1. 进入Billing页面
2. 选择"Add credits"
3. 选择预付金额（$5起）
4. 完成支付

### 方式三：礼品卡

1. 获取OpenAI API礼品卡
2. 进入Billing → Redeem
3. 输入礼品卡代码
4. 额度自动到账

## 三、API使用

### 获取API Key

1. 访问 platform.openai.com/api-keys
2. 创建新密钥
3. 妥善保存密钥

### 调用示例

\`\`\`python
import openai

response = openai.Image.create(
  model="dall-e-3",
  prompt="A cute baby sea otter",
  n=1,
  size="1024x1024"
)
image_url = response['data'][0]['url']
\`\`\`

## 四、国内使用技巧

1. **网络连接**：需要稳定VPN
2. **API代理**：可使用国内API代理服务
3. **额度控制**：设置使用限额避免超额

## 五、支付失败解决

1. 虚拟卡支付 → 使用WildCard
2. 银行风控 → 联系银行开通境外支付
3. 额度查询 → 在platform.openai.com查看`
  },
  {
    id: 'kimi-api-moonshot-payment',
    title: 'Kimi API和Moonshot充值完整指南',
    category: 'regional_pricing',
    excerpt: 'Kimi是月之暗面开发的国产AI助手，支持超长上下文。本文介绍Kimi API充值和国内支付方式',
    toolIds: ['kimi'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Kimi', 'Moonshot', 'API', '月之暗面', '充值', '国内支付'],
    rating: 4.6,
    ratingCount: 6500,
    viewCount: 85000,
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Kimi API简介

Kimi是月之暗面（Moonshot AI）开发的国产大模型，擅长长文本处理，支持200万字超长上下文。

### API定价

| 模型 | 输入价格 | 输出价格 |
|------|---------|---------|
| moonshot-v1-8k | $0.015/千tokens | $0.06/千tokens |
| moonshot-v1-32k | $0.03/千tokens | $0.12/千tokens |
| moonshot-v1-128k | $0.06/千tokens | $0.24/千tokens |

### 免费额度
新用户赠送15元免费额度

## 二、充值方式（国内直连）

### 方式一：支付宝/微信支付

1. 访问 platform.moonshot.cn
2. 注册并登录
3. 进入账户中心 → 充值
4. 使用支付宝或微信支付
5. 实时到账

### 方式二：银行卡充值

支持国内主流银行卡直接充值

### 方式三：API Key管理

1. 创建API Key
2. 设置用量限额
3. 按量计费

## 三、使用API

### 获取API Key

1. 访问 platform.moonshot.cn/console/api_keys
2. 创建新API Key
3. 妥善保存（只显示一次）

### 调用示例

\`\`\`python
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="https://api.moonshot.cn/v1"
)

response = client.chat.completions.create(
    model="moonshot-v1-8k",
    messages=[
        {"role": "user", "content": "你好"}
    ]
)
print(response.choices[0].message.content)
\`\`\`

## 四、特色功能

### 超长上下文
- 支持20万汉字输入
- 适合长文档分析
- 128k版本支持200万字

### 联网搜索
- 实时获取网络信息
- 结合上下文回答

### 代码执行
- 支持Python代码执行
- Tool Calling功能`
  },
  {
    id: 'gemini-api-google-payment',
    title: 'Google Gemini API完整指南',
    category: 'regional_pricing',
    excerpt: 'Gemini是Google开发的AI模型，支持免费API调用。本文介绍Gemini API申请和充值方式',
    toolIds: ['gemini'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Gemini', 'Google', 'API', 'AI模型', '免费额度', 'Vertex AI'],
    rating: 4.5,
    ratingCount: 9800,
    viewCount: 120000,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Gemini API简介

Gemini是Google开发的AI模型系列，包括Gemini Pro、Gemini Ultra等，支持文本和代码生成。

### API版本

| 模型 | 说明 | 定价 |
|------|------|------|
| Gemini 1.5 Flash | 轻量级 | 免费（有限制）|
| Gemini 1.5 Pro | 中量级 | $0.00125/千tokens |
| Gemini Pro | 标准版 | 免费（有限制）|

### 免费额度
- Gemini Pro：60次/分钟
- Gemini 1.5 Flash：15次/分钟
- 1百万tokens/月（1.5 Pro）

## 二、API申请

### 获取API Key

1. 访问 aistudio.google.com/app/apikey
2. 登录Google账号
3. 点击"Create API Key"
4. 复制密钥

### 使用API Key

\`\`\`python
import google.generativeai as genai

genai.configure(api_key='YOUR_API_KEY')
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content('Hello')
print(response.text)
\`\`\`

## 三、付费升级

### Google AI Studio付费

1. 进入 aistudio.google.com
2. 点击账户 → Usage
3. 选择升级到Pay-As-You-Go
4. 添加信用卡支付

### Vertex AI（企业版）

通过Google Cloud Vertex AI使用：
1. 创建Google Cloud项目
2. 启用Vertex AI API
3. 设置billing
4. 使用API

## 四、国内使用

### 访问限制
- 需要VPN访问Google AI Studio
- 部分区域可能不稳定

### 替代方案
- 使用国内镜像站
- 使用API代理服务
- 关注Google Cloud中国区动态`
  },
  {
    id: 'webpilot-premium-subscription',
    title: 'WebPilot Premium订阅指南',
    category: 'gift_card',
    excerpt: 'WebPilot是免费开源的AI网页阅读助手，支持网页总结和翻译。介绍WebPilot的功能和使用方式',
    toolIds: ['webpilot'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['WebPilot', '免费', '开源', '网页助手', 'AI总结'],
    rating: 4.3,
    ratingCount: 3200,
    viewCount: 38000,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、WebPilot简介

WebPilot是一款免费开源的AI浏览器扩展，作为"网页Copilot"，帮助用户与网页内容进行智能交互。

### 主要功能
- **网页总结**：快速提取网页核心内容
- **内容翻译**：多语言翻译支持
- **信息提取**：从网页提取关键信息
- **智能问答**：对网页内容提问

## 二、使用方式

### 浏览器扩展

1. 访问Chrome/Firefox扩展商店
2. 搜索"WebPilot"
3. 安装扩展
4. 开始使用

### 免费使用

WebPilot基本功能完全免费：
- 无使用限制
- 无需注册账号
- 无广告

## 三、GitHub开源项目

WebPilot是开源项目：
- GitHub：github.com/webpilot-ai/WebPilot
- 免费使用所有功能
- 支持自托管

## 四、类似工具推荐

### 替代品
- **Monica**：AI助手，支持网页阅读
- **ChatGPT for Google**：在搜索结果中显示AI回答
- **Notion AI**：网页内容总结

## 五、使用技巧

1. **快捷键**：设置快捷键提高效率
2. **多语言**：支持中英文网页
3. **批量处理**：可处理多个网页
4. **导出功能**：支持将总结导出为笔记`
  },
  {
    id: 'elicit-research-subscription',
    title: 'Elicit研究助手完整指南',
    category: 'regional_pricing',
    excerpt: 'Elicit是AI学术研究助手，帮助搜索和总结学术文献。介绍Elicit的功能和使用方式',
    toolIds: ['elicit'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Elicit', '学术研究', '文献搜索', '论文总结', '免费'],
    rating: 4.5,
    ratingCount: 2800,
    viewCount: 35000,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Elicit简介

Elicit是AI研究助手，帮助学术研究者快速搜索文献、总结论文要点和生成研究思路。

### 主要功能
- **文献搜索**：AI驱动的学术搜索
- **论文总结**：快速理解论文要点
- **研究思路**：生成研究问题和方法
- **引用生成**：自动生成引用格式

## 二、使用方式

### 免费使用

Elicit基本功能免费使用：
1. 访问 elicit.com
2. 注册账号
3. 开始搜索学术文献

### 免费功能
- 每月定量的AI分析
- 文献库管理
- 基本搜索功能

## 三、付费功能

### Elicit Plus

| 项目 | 月费 | 特点 |
|------|------|------|
| Plus | $12/月 | 更多AI分析额度 |
| Team | 定制 | 团队协作 |

### 付费内容
- 更多AI分析次数
- 高级搜索功能
- 团队协作
- 优先支持

## 四、学术使用场景

### 文献综述
1. 输入研究问题
2. Elicit搜索相关文献
3. AI总结每篇文献
4. 生成综述框架

### 研究设计
1. 描述研究目标
2. AI建议研究方法
3. 生成假设
4. 参考文献推荐

## 五、类似工具

| 工具 | 特点 |
|------|------|
| Semantic Scholar | 免费学术搜索 |
| Consensus | AI研究助手 |
| Scispace | 论文理解助手 |
| ResearchRabbit | 文献发现 |
| Perplexity | AI搜索（学术内容）|`
  },

  // ==================== NEW: STABLE DIFFUSION ====================
  {
    id: 'stable-diffusion-api-payment',
    title: 'Stable Diffusion完整指南 - 免费开源AI绘图',
    category: 'regional_pricing',
    excerpt: 'Stable Diffusion是开源免费AI图像生成模型，支持本地部署和自定义模型。本文介绍免费使用和商业API付费方案',
    toolIds: ['stable-diffusion'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['Stable Diffusion', '开源', '免费', '本地部署', 'API', 'AI绘图'],
    rating: 4.4,
    ratingCount: 8900,
    viewCount: 110000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Stable Diffusion简介

Stable Diffusion是Stability AI开发的开源AI图像生成模型，完全免费使用，支持本地部署和自定义模型。

### 核心特点
- **完全免费**：开源模型，可免费使用
- **本地运行**：可在本地电脑上运行
- **自定义模型**：支持LoRA、CheckPoint等自定义模型
- **隐私保护**：图片不上传云端

## 二、免费使用方式

### 方式一：本地部署（完全免费）

**硬件要求**：
- GPU：建议8GB+显存（NVIDIA）
- 内存：16GB+
- 硬盘：30GB+

**推荐工具**：
- **Automatic1111 WebUI**：最流行本地UI
- **ComfyUI**：节点式工作流
- **SD WebUI Forge**：优化版WebUI

**安装步骤**：
1. 安装Python 3.10+
2. 安装Git
3. 克隆Automatic1111仓库
4. 下载模型权重
5. 运行WebUI

### 方式二：在线平台

**免费平台**：
- **Hugging Face**：免费在线体验
- **Stable Diffusion Web**：在线版
- **Playground AI**：每日免费额度

## 三、商业API付费方案

### Stability AI API

**官网**：platform.stability.ai

**定价**：
| 服务 | 价格 |
|------|------|
| SDXL 1.0 | $0.04/图 |
| SD 2.1 | 免费 |

### DreamStudio

**官网**：dreamstudio.ai

**免费额度**：新用户25积分

**定价**：
- $1 = 100积分
- 1张图 = 1积分（标准质量）

### 第三方API服务

**Replicate**：
- 提供Stable Diffusion API
- 按量计费

**Baseten**：
- 模型部署平台
- 支持SDXL

## 四、本地部署详细教程

### Automatic1111安装

\`\`\`bash
# 克隆仓库
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git

# 进入目录
cd stable-diffusion-webui

# Windows用户运行
webui-user.bat

# Mac/Linux用户运行
./webui.sh
\`\`\`

### 模型下载

推荐模型站点：
- **Civitai**：civitai.com
- **Hugging Face**：huggingface.co/models

热门模型：
- **Realistic Vision**：写实风格
- **Anime Diffusion**：动漫风格
- **SDXL**：最新高质量模型

## 五、常用技巧

### 提示词技巧
- 使用英文提示词
- 使用负面提示词排除不需要的元素
- 使用LoRA模型增强特定风格

### 参数设置
- **Steps**：20-50步
- **CFG Scale**：7-12
- **Sampler**：DPM++ 2M Karras效果好

## 六、对比其他AI绘图工具

| 工具 | 价格 | 质量 | 便利性 | 隐私 |
|------|------|------|--------|------|
| Stable Diffusion | 免费 | 高 | 中 | 强 |
| Midjourney | $10+ | 很高 | 高 | 弱 |
| DALL-E 3 | 按次付费 | 高 | 高 | 弱 |
| Adobe Firefly | 免费/付费 | 高 | 高 | 中 |`
  },

  // ==================== VIRTUAL CARDS ====================
  {
    id: 'depay-complete-guide',
    title: 'Depay虚拟卡申请和使用完整教程',
    category: 'virtual_card',
    excerpt: 'Depay是目前最流行的留学生虚拟卡服务，支持USDT充值，无需KYC，适合没有信用卡的留学生支付ChatGPT、Midjourney等AI工具订阅',
    toolIds: ['chatgpt', 'midjourney', 'claude', 'cursor', 'jasper', 'copyai', 'grammarly', 'perplexity', 'quillbot', 'notion-ai', 'figma', 'replit'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Depay', '虚拟卡', 'USDT', 'ChatGPT', 'Midjourney', 'Claude', 'Cursor', 'Jasper', '留学生'],
    rating: 4.8,
    ratingCount: 12500,
    viewCount: 156000,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
    referralUrl: 'https://depay.one/?ref=mi-to-ai',
    content: `## 一、什么是Depay虚拟卡？

Depay（德支付）是一家提供虚拟信用卡服务的平台，专门为无法获得传统信用卡的用户设计，尤其适合海外留学生使用。支持USDT（加密货币）充值，可在各大国际平台消费。

### Depay的核心优势

- **无需KYC**：基础版无需实名认证即可申请
- **加密货币充值**：支持USDT充值，避免外汇管制问题
- **多平台支持**：支持OpenAI、Midjourney、Claude等几乎所有国际平台
- **实时到账**：充值立即到账，无等待时间

## 二、注册与申请步骤

### 第一步：注册Depay账户

1. 访问Depay官网：depay.com
2. 点击"注册/Sign Up"
3. 输入邮箱地址和密码
4. 完成邮箱验证
5. 登录后进入个人Dashboard

### 第二步：选择卡片类型

Depay提供多种虚拟卡类型：

| 卡片类型 | 年费 | 特点 |
|---------|------|------|
| Standard | 免费 | 无KYC，额度有限 |
| Pro | $9.9/年 | 更高额度，支持更多功能 |
| Unlimited | $49/年 | 无限额度，专业用户首选 |

**推荐**：如果是首次使用，建议选择Pro版本，额度更充足。

### 第三步：充值USDT

1. 在Dashboard点击"充值/Deposit"
2. 获取USDT充值地址（TRC20网络）
3. 从交易所（如币安、OKX）购买USDT
4. 将USDT转账到Depay提供的地址
5. 等待确认（通常1-5分钟）

**注意**：只能使用TRC20网络的USDT，否则不会到账！

### 第四步：申请虚拟卡

1. 充值完成后，点击"申请卡片/Apply Card"
2. 选择卡片类型（Mastercard或Visa）
3. 设置卡片消费限额
4. 确认申请

### 第五步：获取卡号信息

申请成功后，可以在Dashboard查看：
- 卡号（16位数字）
- 有效期（MM/YY）
- CVV安全码
- 持卡人姓名

## 三、绑定到AI平台

### 绑定ChatGPT/OpenAI

1. 登录ChatGPT账户
2. 进入Settings → Billing → Payment Methods
3. 点击"Add payment method"
4. 输入Depay虚拟卡信息
5. 验证通过后即可使用

### 绑定Midjourney

1. 登录Midjourney官网
2. 进入Account → Manage Plan
3. 选择订阅计划
4. 输入信用卡信息完成订阅

## 四、注意事项和风险提示

### 安全须知

- **妥善保管卡号和CVV**：虚拟卡同样需要保护
- **设置消费限额**：建议根据实际需求设置日/月限额
- **定期检查账单**：关注是否有异常消费

### 风险提示

1. **平台风控**：部分平台可能拒绝虚拟卡，如遇拒绝尝试以下方法：
   - 更换卡片
   - 尝试其他虚拟卡服务
   - 使用礼品卡替代

2. **资金安全**：加密货币价格波动可能导致充值金额变化

3. **合规使用**：确保充值资金来源合法，不要用于任何违法活动

## 五、常见问题解答

**Q: Depay的手续费是多少？**
A: 充值费率约1%，消费费率约0.5%，具体以官方公示为准。

**Q: 卡片有效期多久？**
A: 通常为2-5年，过期后可以申请新卡。

**Q: 充值后多久到账？**
A: TRC20网络通常1-5分钟到账，如遇拥堵可能延迟。

**Q: 支持哪些交易所充值？**
A: 币安、OKX、火币等主流交易所都支持USDT提现到TRC20地址。

**Q: 虚拟卡会被封吗？**
A: 正常使用不会被封，但如触发平台风控可能会被临时冻结。建议遵守各平台使用规则。`
  },
  {
    id: 'noble-card-guide',
    title: 'Noble虚拟卡申请教程 - 专为留学生设计',
    category: 'virtual_card',
    excerpt: 'Noble Card是针对留学生群体推出的虚拟信用卡服务，注册流程简单，支持多币种，适合支付各种海外AI订阅服务',
    toolIds: ['chatgpt', 'claude', 'github-copilot', 'cursor', 'figma', 'notion-ai', 'perplexity', 'jasper', 'copyai', 'grammarly'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Noble', '虚拟卡', '留学生', '多币种', 'AI工具通用'],
    rating: 4.6,
    ratingCount: 8200,
    viewCount: 98000,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    referralUrl: 'https://noblepay.com/?ref=mi-to-ai',
    content: `## 一、Noble Card简介

Noble Card是一款专为海外留学生设计的虚拟信用卡，致力于解决留学生在海外支付难题。支持多币种结算，覆盖全球主要国家和地区。

### 核心特点

- **留学生友好**：注册流程针对留学生优化
- **多币种支持**：美元、欧元、英镑等多币种
- **快速审批**：无需复杂审核，即申即用
- **广泛接受**：支持绝大多数国际平台

## 二、注册申请流程

### 第一步：访问官网并注册

1. 访问Noble Card官网
2. 点击"Get Started"或"Sign Up"
3. 输入邮箱地址
4. 设置密码
5. 验证邮箱

### 第二步：完成基础认证

Noble Card提供不同级别的认证：

| 认证级别 | 要求 | 额度 |
|---------|------|------|
| 基础版 | 邮箱验证 | $500/月 |
| 标准版 | 手机号+身份证 | $2000/月 |
| 高级版 | 护照+视频验证 | $5000/月 |

**建议**：首次使用选择标准版即可满足大部分需求。

### 第三步：选择卡片套餐

根据使用场景选择合适套餐：

- **Starter套餐**：$5.99/年，适合轻量使用
- **Plus套餐**：$12.99/年，推荐大多数用户
- **Premium套餐**：$29.99/年，适合高频使用者

### 第四步：充值

支持多种充值方式：
- 加密货币（USDT、BTC、ETH）
- 银行转账
- 其他用户转账

## 三、使用场景

### 适合支付的AI服务

1. **ChatGPT Plus** - 订阅教程见下文
2. **Claude Pro** - Anthropic官方订阅
3. **GitHub Copilot** - 代码辅助工具
4. **Notion AI** - 笔记和生产力工具
5. **各种API服务** - OpenAI API等

### 充值技巧

- 建议一次性充值3-6个月的使用量，避免频繁充值
- 关注平台活动，部分时期有充值优惠
- 保留一定余额，避免因余额不足导致订阅中断

## 四、支持的大学和使用限制

### 目标用户群体

Noble Card主要面向以下留学生群体：

- 北美（美国、加拿大）
- 英国
- 澳大利亚
- 欧洲其他地区

### 使用限制

- 部分高风险地区可能不支持
- 大额交易可能需要额外验证
- 禁止用于任何违法活动

## 五、常见问题

**Q: 申请需要多久？**
A: 基础版立即可用，标准版通常1-2个工作日。

**Q: 虚拟卡有有效期吗？**
A: 通常为2年，过期前可申请新卡。

**Q: 支持退款吗？**
A: 充值金额不可退款，请根据实际需求充值。

**Q: 如何联系客服？**
A: 通过官网Live Chat或邮件 support@noblecard.com`
  },
  {
    id: 'wildcard-virtual-card',
    title: 'WildCard虚拟卡申请保姆级教程',
    category: 'virtual_card',
    excerpt: 'WildCard虚拟卡是专为国内用户设计的支付解决方案，支持支付宝充值，稳定性和安全性都很高，是订阅ChatGPT Plus的热门选择',
    toolIds: ['chatgpt', 'midjourney', 'claude', 'cursor', 'replit', 'figma', 'jasper', 'copyai', 'grammarly', 'perplexity', 'quillbot', 'notion-ai'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['WildCard', '虚拟卡', '支付宝', 'ChatGPT Plus', 'Cursor', 'Figma', 'Jasper', ' Grammarly'],
    rating: 4.9,
    ratingCount: 15800,
    viewCount: 198000,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z',
    referralUrl: 'https://wildcard.com/?ref=mi-to-ai',
    content: `## 一、WildCard简介

WildCard（ wildcad.com）是一款专门为国内用户设计的虚拟信用卡服务，支持支付宝充值，无需复杂手续，是目前国内用户订阅海外AI服务最受欢迎的选择之一。

### 核心优势

- **支付宝充值**：支持国内支付宝充值，告别USDT
- **操作简单**：全中文界面，流程清晰
- **稳定可靠**：封号率低，稳定性高
- **客服响应快**：中文客服，响应及时
- **多平台支持**：ChatGPT、Claude、Midjourney等

## 二、注册与申请

### 第一步：访问官网

1. 访问 wildcad.com（注意认准官方域名）
2. 点击"立即开通"
3. 使用手机号注册

### 第二步：选择套餐

| 套餐类型 | 费用 | 特点 |
|---------|------|------|
| 年费套餐 | $11.99/年 | 推荐长期用户 |
| 两年套餐 | $23.99/2年 | 更划算 |

**注意**：这是年费，不是充值金额！

### 第三步：完成实名认证

1. 上传身份证照片
2. 完成人脸验证
3. 等待审核（通常几分钟）

### 第四步：获取虚拟卡

审核通过后即可获得：
- 16位卡号
- 有效期
- CVV
- 持卡人信息

## 三、充值教程

### 方式一：支付宝充值（推荐）

1. 登录WildCard后台
2. 点击"充值"
3. 选择"支付宝"
4. 输入充值金额（建议充$20-50）
5. 使用支付宝扫码支付
6. 实时到账

### 方式二：USDT充值

1. 获取USDT充值地址
2. 从交易所提币到该地址
3. 等待确认

**建议**：优先使用支付宝，实时到账且无需额外操作。

## 四、订阅ChatGPT Plus实战

### 第一步：登录ChatGPT

1. 访问 chat.openai.com
2. 登录你的账户（如没有则注册）

### 第二步：进入订阅页面

1. 点击左下角"Upgrade"
2. 选择"ChatGPT Plus"

### 第三步：填写支付信息

1. 选择"Add Credit Card"
2. 填写WildCard虚拟卡信息：
   - 卡号：16位数字
   - 有效期：MM/YY格式
   - CVV：3位安全码
   - 持卡人姓名：输入你的姓名拼音

### 第四步：确认订阅

1. 确认信息无误
2. 点击"Subscribe"
3. 订阅成功！

## 五、常见问题与解决方案

### 问题1：支付被拒绝

**解决方案**：
1. 检查卡片信息是否填写正确
2. 确保卡片有足够余额
3. 尝试关闭VPN后重新支付
4. 联系WildCard客服获取帮助

### 问题2：订阅后被取消

**解决方案**：
1. 检查是否有过异常操作
2. 确保余额充足
3. 联系平台客服说明情况
4. 如持续问题，考虑更换支付方式

### 问题3：如何取消订阅

1. 进入ChatGPT Settings
2. 选择"Manage subscription"
3. 点击"Cancel plan"
4. 确认取消

## 六、安全使用建议

1. **保护卡片信息**：不要泄露卡号和CVV
2. **设置消费提醒**：开启消费通知
3. **定期检查账单**：发现异常立即联系客服
4. **不要代他人支付**：可能触发风控
5. **保持账户活跃**：长期不使用可能被暂停`
  },

  {
    id: 'redotpay-virtual-card',
    title: 'RedotPay虚拟卡申请教程 - 支持USDT充值全球消费',
    category: 'virtual_card',
    excerpt: 'RedotPay是支持USDT充值的加密虚拟卡，可在130+国家4400万商户消费，适合留学生订阅ChatGPT、Claude等AI工具',
    toolIds: ['chatgpt', 'midjourney', 'claude', 'cursor', 'jasper', 'copyai', 'grammarly', 'perplexity', 'notion-ai', 'figma', 'replit'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['RedotPay', '虚拟卡', 'USDT', '加密货币', 'ChatGPT', 'Mastercard', '留学生'],
    rating: 4.6,
    ratingCount: 8500,
    viewCount: 95000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-29T00:00:00Z',
    referralUrl: 'https://wap.redotpay.com/en/invite/affiliates-2?utm_id=thp9sj&utm_source=union&utm_uid=16062&utm_s=83f435b475fa9740d21e75f619566991ebe88480',
    content: `## 一、RedotPay简介

RedotPay是一张支持加密货币（USDT/USDT/BTC/ETH）充值的虚拟Mastercard卡，可在130+国家、4400万+商户消费。特别适合留学生订阅海外AI工具。

### 核心优势

- **加密货币充值**：支持USDT、BTC、ETH充值，无需传统银行账户
- **全球消费**：Mastercard网络，130+国家通用
- **即时开卡**：虚拟卡秒开，实体卡可选
- **无年费**：无年费、无月费
- **KYC简单**：基础认证即可使用

## 二、注册与申请步骤

### 第一步：注册RedotPay账户

1. 访问RedotPay官网或下载App
2. 点击"注册"并填写邮箱/手机号
3. 完成基础KYC认证（身份证/护照）
4. 验证邮箱

### 第二步：充值USDT

1. 在App内获取USDT充值地址（TRC20或ERC20）
2. 从交易所（如OKX、Binance）提币到该地址
3. 等待到账（TRC20通常几分钟）

### 第三步：申请虚拟卡

1. 进入"Card"页面
2. 选择"Virtual Card"
3. 填写个人信息
4. 从余额中扣费开卡

### 第四步：绑定AI工具订阅

1. 复制RedotPay虚拟卡的卡号、有效期、CVV
2. 在ChatGPT/Claude等平台的支付页面填入
3. 完成订阅

## 三、适用AI工具

| 工具 | 月费 | 能否订阅 |
|------|------|---------|
| ChatGPT Plus | $20/月 | ✅ |
| Claude Pro | $20/月 | ✅ |
| Cursor Pro | $20/月 | ✅ |
| Midjourney | $10-30/月 | ✅ |
| Grammarly | $12/月 | ✅ |
| Jasper | $49/月 | ✅ |

## 四、常见问题

**Q: RedotPay和Depay有什么区别？**
A: RedotPay是Mastercard网络，Depay是Visa网络。RedotPay无年费，Depay部分卡有年费。

**Q: 充值多久到账？**
A: TRC20通常1-5分钟，ERC20可能需要10-30分钟。

**Q: 被平台拒绝怎么办？**
A: 部分平台可能风控虚拟卡，建议：1）确保余额充足 2）使用美国IP 3）尝试其他虚拟卡。

**Q: 提现怎么操作？**
A: 卖出USDT → 交易所C2C → 支付宝/银行卡。或直接用RedotPay在全球ATM取现。

## 五、安全建议

1. **不要泄露卡号CVV**：与实体卡同样保护
2. **设置消费通知**：开启每笔消费提醒
3. **充值适量**：不要一次性充太多
4. **保留截图**：订阅确认截图备用`
  },

  {
    id: 'onekey-virtual-card',
    title: 'OneKey虚拟卡申请教程 - USDT充值订阅AI工具',
    category: 'virtual_card',
    excerpt: 'OneKey虚拟卡支持USDT充值，可绑定ChatGPT/OpenAI等AI工具，是留学生订阅海外服务的热门选择',
    toolIds: ['chatgpt', 'midjourney', 'claude', 'cursor', 'jasper', 'copyai', 'grammarly', 'perplexity', 'notion-ai', 'figma', 'replit'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['OneKey', '虚拟卡', 'USDT', 'ChatGPT', 'OpenAI', '加密货币', '留学生'],
    rating: 4.5,
    ratingCount: 7200,
    viewCount: 82000,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-29T00:00:00Z',
    referralUrl: 'https://onekey.so/r/5R2CVW',
    content: `## 一、OneKey虚拟卡简介

OneKey是亚洲最受欢迎的加密钱包品牌之一，提供虚拟卡服务。支持USDT充值，可绑定ChatGPT/OpenAI等国际AI工具订阅。

### 核心优势

- **USDT充值**：支持TRC20/ERC20充值，无需传统银行
- **支持ChatGPT/OpenAI**：专门适配，绑定成功率高
- **KYC简单**：身份证即可完成认证
- **Google账号登录**：支持一键Google登录
- **虚拟卡秒开**：即时获取卡号

## 二、注册与申请步骤

### 第一步：注册OneKey账户

1. 访问 https://onekey.so/r/5R2CVW
2. 使用Google账号登录
3. 完成KYC认证（身份证+视频验证）
4. 进入Card页面

### 第二步：充值USDT

1. 获取OneKey的USDT充值地址
2. 从交易所（OKX/Binance）提币到该地址
3. 最低充值30 USDT激活卡片

### 第三步：申请虚拟卡

1. 选择"US Preferred Card"（适合绑定美国服务）
2. 填写个人信息
3. 虚拟卡即时开通

### 第四步：绑定AI工具

1. 复制卡号、有效期、CVV
2. 在ChatGPT/Claude等平台填入支付信息
3. 完成订阅

## 三、适用AI工具

| 工具 | 月费 | 能否订阅 |
|------|------|---------|
| ChatGPT Plus | $20/月 | ✅ |
| Claude Pro | $20/月 | ✅ |
| Cursor Pro | $20/月 | ✅ |
| Midjourney | $10-30/月 | ✅ |

## 四、常见问题

**Q: OneKey和Depay有什么区别？**
A: OneKey由知名硬件钱包品牌推出，安全性更高。Depay更老牌，OneKey更适配OpenAI。

**Q: 被ChatGPT拒绝怎么办？**
A: 确保选择"US Preferred Card"，使用美国IP注册ChatGPT。

**Q: 提现怎么操作？**
A: USDT提到交易所 → C2C卖出 → 支付宝/银行卡。

## 五、安全建议

1. 开启两步验证（2FA）
2. 不要泄露卡号CVV
3. 设置消费通知
4. 充值适量，不要一次充太多`
  },

  // ==================== GIFT CARDS ====================
  {
    id: 'openai-gift-card',
    title: 'OpenAI API礼品卡购买和充值完整指南',
    category: 'gift_card',
    excerpt: '通过购买OpenAI礼品卡，可以无需信用卡即可充值API额度，适合开发者使用ChatGPT API的各种场景',
    toolIds: ['openai-api', 'chatgpt'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['OpenAI', '礼品卡', 'API', '充值'],
    rating: 4.7,
    ratingCount: 9300,
    viewCount: 112000,
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
    content: `## 一、OpenAI API礼品卡简介

OpenAI API礼品卡是一种预付费充值方式，用户可以购买礼品卡代码来为API账户充值，无需绑定信用卡。适合没有国际信用卡但需要使用ChatGPT API的开发者。

### 适用场景

- **API开发**：基于GPT模型开发应用
- **预算控制**：预先购买，避免超支
- **礼品赠送**：为他人购买API额度
- **企业采购**：公司统一采购API额度

## 二、购买方式

### 方式一：通过App Store（iOS用户）

1. 切换App Store地区到美国
2. 搜索"Apple Gift Card"
3. 选择购买金额
4. 完成支付
5. 获取礼品卡代码

**注意**：需要美区Apple ID

### 方式二：通过Google Play（Android用户）

1. 安装Google Play
2. 切换地区到美国
3. 搜索"Google Play Gift Card"
4. 选择金额并购买
5. 获取兑换码

### 方式三：第三方平台购买

一些第三方平台也销售OpenAI礼品卡：
- Offramp
- DCOne
- 其他授权经销商

**注意**：务必选择正规平台，避免买到无效礼品卡！

## 三、充值步骤

### 第一步：获取OpenAI API密钥

1. 访问 platform.openai.com
2. 登录或注册账户
3. 进入API Keys页面
4. 创建新的API Key
5. 妥善保存密钥

### 第二步：充值API额度

1. 进入Billing页面
2. 点击"Add funds"
3. 选择"Redeem a gift card"
4. 输入礼品卡代码
5. 确认兑换

### 第三步：验证充值

1. 检查账户余额是否增加
2. 确认充值到账

## 四、注意事项和使用技巧

### 注意事项

1. **礼品卡有地区限制**：必须与账户地区一致
2. **礼品卡有有效期**：通常为购买后12个月内
3. **不可退款**：礼品卡一经兑换不可提现或退款
4. **最低充值金额**：各平台要求不同

### 使用技巧

**预算规划**：
- 根据实际需求选择充值金额
- 建议先购买小额测试
- 关注平台优惠活动

**成本优化**：
- 使用GPT-3.5-TURBO比GPT-4更经济
- 合理设置token上限
- 启用用量提醒

## 五、常见问题

**Q: 最低充值金额是多少？**
A: OpenAI API最低充值$5，但实际使用按量计费。

**Q: 礼品卡可以叠加使用吗？**
A: 可以，多张礼品卡可以累加使用。

**Q: API额度会过期吗？**
A: 2024年后充值的额度不会过期，可以一直使用。

**Q: 如何查看API使用量？**
A: 在platform.openai.com的Usage页面查看实时用量。

**Q: 充值后多久到账？**
A: 通常即时到账，如遇延迟可联系客服。`
  },
  {
    id: 'anthropic-claude-gift-card',
    title: 'Anthropic Claude礼品卡充值教程',
    category: 'gift_card',
    excerpt: '详细讲解如何购买Anthropic官方礼品卡为Claude账户充值，支持多种订阅计划，适合没有信用卡的用户',
    toolIds: ['claude', 'claude-api'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Anthropic', 'Claude', '礼品卡', '订阅'],
    rating: 4.7,
    ratingCount: 7200,
    viewCount: 89000,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    content: `## 一、Claude礼品卡简介

Anthropic官方提供礼品卡服务，用户可以通过购买礼品卡来为Claude订阅或API账户充值，无需使用信用卡。

### 支持的产品

- **Claude Pro订阅**：$20/月，享受Pro功能
- **Claude Team**：团队协作版本
- **Claude API**：按量付费的API服务

## 二、购买渠道

### 官方渠道

1. **Anthropic官网**：部分国家支持
2. **App Store**：iOS用户可通过App Store购买
3. **Google Play**：Android用户可通过Google Play购买

### 第三方渠道

- 部分授权零售商
- 教育平台合作伙伴

**注意**：务必通过正规渠道购买，避免买到假卡或无效卡。

## 三、充值步骤

### Claude Pro订阅充值

1. 访问 Anthropic官网
2. 登录或注册Claude账户
3. 进入Account Settings
4. 选择"Subscription"
5. 点击"Redeem Gift Card"
6. 输入礼品卡代码
7. 确认兑换

### Claude API充值

1. 访问 console.anthropic.com
2. 登录账户
3. 进入Billing
4. 选择"Add Credits"
5. 选择"Redeem Gift Card"
6. 输入代码并确认

## 四、支持的订阅计划

### Claude Pro

| 项目 | 详情 |
|------|------|
| 价格 | $20/月 |
| 功能 | 优先访问Claude 3 Sonnet、Opus |
| 访问量 | 标准用量，超出后降级 |

### Claude Team

| 项目 | 详情 |
|------|------|
| 价格 | $25/人/月（最少5人） |
| 功能 | 无限消息、更长上下文、Admin Console |
| 适用 | 团队和企业用户 |

### Claude API

| 模型 | 输入价格 | 输出价格 |
|------|---------|---------|
| Claude 3.5 Sonnet | $3/1M tokens | $15/1M tokens |
| Claude 3 Opus | $15/1M tokens | $75/1M tokens |
| Claude 3 Haiku | $0.25/1M tokens | $1.25/1M tokens |

## 五、注意事项

### 礼品卡使用须知

1. **有效期**：礼品卡通常在购买后12个月内有效
2. **不可退款**：一旦兑换不可提现或退款
3. **地区限制**：部分礼品卡有地区使用限制
4. **余额处理**：兑换后立即到账，不可拆分使用

### 安全提示

- 通过正规渠道购买礼品卡
- 不要购买来路不明的低价卡
- 妥善保管礼品卡代码
- 避免在公共场合透露卡号

## 六、常见问题

**Q: 礼品卡可以用于API充值吗？**
A: 是的，API账户和订阅账户都可以使用礼品卡充值。

**Q: 礼品卡余额可以提现吗？**
A: 不可以，礼品卡余额不可提现。

**Q: 如何查询礼品卡余额？**
A: 在账户的Billing页面查看。

**Q: 订阅取消后礼品卡余额会怎样？**
A: 礼品卡余额会保留，可用于下次订阅或API消费。`
  },
  {
    id: 'midjourney-gift-card',
    title: 'Midjourney礼品卡购买和订阅教程',
    category: 'gift_card',
    excerpt: 'Midjourney是目前最受欢迎的AI绘图工具之一，本教程详细介绍如何通过礼品卡方式订阅Midjourney，避开信用卡支付的限制',
    toolIds: ['midjourney'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['Midjourney', '礼品卡', 'AI绘图', '订阅'],
    rating: 4.6,
    ratingCount: 6800,
    viewCount: 85000,
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
    content: `## 一、Midjourney订阅方式概览

Midjourney目前主要通过信用卡订阅，但同时也支持礼品卡方式。以下是详细的订阅指南。

### 订阅计划对比

| 计划 | 月费 | 小时限额 | 特点 |
|------|------|---------|------|
| Basic | $10 | 3.3小时 | 200张图片，快速模式 |
| Standard | $30 | 15小时 | 无限图片，快速+松弛模式 |
| Pro | $80 | 30小时 | 无限图片+隐私模式 |
| Mega | $120 | 60小时 | 最高画质，超级快速模式 |

## 二、礼品卡订阅方法

### 准备工作

1. 一个Midjourney账户
2. 持有有效的礼品卡（Gift Card）
3. 稳定的网络连接

### 订阅步骤

1. 访问 Midjourney官网
2. 登录你的Discord账户（Midjourney使用Discord）
3. 进入Midjourney Bot频道
4. 发送指令 /subscribe
5. 选择订阅计划
6. 在支付页面选择Gift Card选项
7. 输入礼品卡代码
8. 完成订阅

## 三、礼品卡获取途径

### App Store礼品卡（iOS用户）

1. 切换App Store地区到美国
2. 购买App Store礼品卡
3. 在Midjourney iOS App中兑换

### Google Play礼品卡（Android用户）

1. 切换Google Play地区到美国
2. 购买Google Play礼品卡
3. 在Midjourney App中兑换

### 第三方平台

- 通过朋友代购
- 授权经销商购买

**注意**：务必选择可靠渠道！

## 四、常见问题与解决方案

### 问题1：找不到礼品卡支付选项

**解决方案**：
- 确认App已更新到最新版本
- 清除缓存后重试
- 联系Midjourney Support获取帮助

### 问题2：礼品卡充值失败

**解决方案**：
- 检查礼品卡代码是否正确
- 确认礼品卡未过期
- 验证礼品卡地区与账户一致
- 联系客服处理

### 问题3：如何取消自动续费

1. 进入Midjourney Bot频道
2. 发送 /info 查看订阅信息
3. 选择取消订阅选项

## 五、使用技巧

### 节省用量

1. 使用低版本模型（如V6比V7更快）
2. 选择Standard而非Pro计划（如果够用）
3. 批量生成图片而不是单张生成

### 优化体验

1. 使用Fast Mode获得更快生成速度
2. 利用Relax Mode在空闲时生成
3. 保存常用参数为Preset

## 六、安全注意事项

1. **官方渠道**：优先通过官方渠道购买礼品卡
2. **价格异常**：价格过低的礼品卡可能是骗局
3. **账户安全**：不要在非官方平台输入账户信息
4. **隐私保护**：不要向任何人透露你的验证码`
  },

  // ==================== REGIONAL PRICING ====================
  {
    id: 'china-region-pricing',
    title: '中国区AI工具特殊定价和替代方案',
    category: 'regional_pricing',
    excerpt: '详细分析中国区用户面临的AI工具定价问题，介绍官方渠道和替代方案，帮助留学生找到最适合的订阅方式',
    toolIds: ['chatgpt', 'claude', 'midjourney', 'cursor', 'figma', 'jasper', 'copyai', 'grammarly', 'quillbot', 'notion-ai', 'perplexity', 'replit', 'tabnine', 'kimi', 'gemini', 'webpilot', 'elicit', 'dalle-3'],
    difficulty: 'medium',
    reliability: 'medium',
    tags: ['中国区', '定价', '替代方案', '留学生', '国内可用AI'],
    rating: 4.4,
    ratingCount: 15000,
    viewCount: 180000,
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
    content: `## 一、中国区AI定价现状

### OpenAI/ChatGPT

ChatGPT Plus在中国区的定价受汇率和地区因素影响：

| 地区 | ChatGPT Plus月费 | 备注 |
|------|-----------------|------|
| 美国 | $20 | 原价 |
| 土耳其 | ~$8-10 | 汇率差价 |
| 欧盟 | ~€20 | 含税价格 |
| 中国（官网） | $20 | 美元计价 |

### Claude

Claude Pro订阅在中国区：
- 官方定价：$20/月（美元）
- 部分功能可能受限

### Midjourney

- 官方定价：$10-120/月
- 中国区用户支付受限

## 二、中国用户面临的挑战

### 支付障碍

1. **信用卡限制**：国内信用卡难以支付海外服务
2. **地区限制**：部分服务对中国区用户有限制
3. **实名认证**：部分平台需要海外手机号验证
4. **支付限额**：银行卡境外支付限额

### 解决方案汇总

#### 方案一：虚拟信用卡（推荐）

使用Depay、WildCard等虚拟卡服务：
- 支持支付宝/USDT充值
- 易于申请
- 稳定可靠

#### 方案二：礼品卡

购买各平台礼品卡：
- App Store礼品卡
- Google Play礼品卡
- 官方礼品卡

#### 方案三：第三方平台

通过授权经销商订阅：
- 优点：操作简单
- 缺点：价格可能较高
- 注意：选择可靠平台

## 三、替代AI工具推荐

### 国内可用的高质量AI

| 工具 | 特点 | 适用场景 |
|------|------|---------|
| 通义千问 | 阿里出品，中文友好 | 写作、对话、代码 |
| 文心一言 | 百度出品 | 中文创作 |
| 讯飞星火 | 科大讯飞出品 | 对话、翻译 |
| Kimi | 月之暗面，支持长文本 | 长文本处理 |

### 国际工具中国区访问

如需使用ChatGPT等工具：
1. 使用虚拟信用卡订阅
2. 通过第三方平台代购
3. 利用教育邮箱申请优惠

## 四、价格对比分析

### ChatGPT Plus vs 国内替代品

| 维度 | ChatGPT Plus | 通义千问Plus |
|------|--------------|-------------|
| 月费 | $20（约¥145） | ¥9.9/月 |
| 能力 | GPT-4 | Qwen-Max |
| 中文 | 一般 | 优秀 |
| 稳定性 | 需科学上网 | 国内直连 |

### 选择建议

1. **预算有限**：选择国内工具，性价比高
2. **需要国际资源**：选择ChatGPT Plus
3. **混合使用**：根据场景选择最合适的工具

## 五、安全和合规提示

### 使用虚拟卡的注意事项

1. 选择正规平台，避免资金损失
2. 不要将卡片信息透露给陌生人
3. 设置合理的消费限额
4. 关注账户安全

### 第三方平台选择

- 查看平台资质和用户评价
- 优先选择有售后保障的平台
- 避免价格过低的平台
- 保留交易凭证

## 六、常见问题

**Q: 国内信用卡可以支付吗？**
A: 大多数国际平台不接受国内信用卡，建议使用虚拟卡或礼品卡。

**Q: 使用VPN会影响账户吗？**
A: 正常使用VPN不会影响账户，但应选择稳定的VPN服务。

**Q: 第三方平台可靠吗？**
A: 选择正规授权或有良好口碑的平台，避免上当受骗。

**Q: 国内工具能替代ChatGPT吗？**
A: 对于大多数场景可以，但在某些专业领域仍有差距。`
  },
  {
    id: 'student-discount-programs',
    title: 'AI工具学生折扣计划汇总',
    category: 'regional_pricing',
    excerpt: '整理主流AI工具的学生折扣计划，包括GitHub Copilot免费申请、OpenAI教育优惠等，帮助学生节省订阅费用',
    toolIds: ['github-copilot', 'jetbrains', 'tabnine', 'cursor', 'notion-ai', 'canva', 'figma', 'github'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['学生折扣', 'GitHub Copilot', '教育优惠', '免费', '学生免费'],
    rating: 4.7,
    ratingCount: 22000,
    viewCount: 265000,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z',
    content: `## 一、学生折扣概述

许多AI工具和开发平台为学生提供优惠甚至免费使用，以下是详细汇总。

## 二、主流AI工具学生折扣

### GitHub Copilot - 免费！

**GitHub Copilot** 为学生提供免费使用，是目前最值得申请的学生福利。

#### 申请条件

- 必须是GitHub教育认证的学生
- 有有效的学校邮箱或学生证明
- 年龄13岁及以上

#### 申请步骤

1. 访问 education.github.com
2. 点击"Get Student Benefits"
3. 登录GitHub账户
4. 填写学校信息
5. 上传学生证或使用学校邮箱验证
6. 等待审核（通常1-7天）

#### 审核通过后

- GitHub Copilot：免费使用（价值$10/月）
- GitHub Pro：免费使用
- 其他学习资源

#### 续期

学生身份有效期内自动续期，毕业后需付费。

---

### JetBrains 全家桶 - 免费！

**JetBrains** 为学生提供所有Tools免费使用。

#### 支持的产品

- IntelliJ IDEA Ultimate
- PyCharm Professional
- WebStorm
- DataGrip
- 以及其他所有JetBrains产品

#### 申请方式

1. 访问 jetbrains.com/shop/educase
2. 使用学校邮箱注册
3. 完成验证
4. 获取免费许可证

---

### OpenAI 教育优惠

OpenAI目前没有官方教育折扣，但可以通过以下方式获取优惠：

1. **API用量优惠**：新用户有$5免费额度
2. **教育邮箱**：部分功能优先体验
3. **ChatGPT Team**：适合学生组队使用

---

### Claude 教育用途

Anthropic没有官方教育折扣，但提供：

1. **Claude Pro**：$20/月，标准价格
2. **Claude API**：按量付费，有免费额度

---

### Canva Pro - 免费一年

#### 申请条件

- 学生身份验证
- 学校邮箱

#### 申请步骤

1. 访问 canva.com/education
2. 使用学校邮箱注册
3. 完成学生验证
4. 获取1年免费Canva Pro

---

### Notion - 免费教育版

#### 申请条件

- 教育邮箱验证
- 学生身份

#### 申请步骤

1. 访问 notion.so/product/education
2. 使用学校邮箱注册
3. 完成验证
4. 免费使用Notion

---

## 三、其他开发工具学生福利

### AWS Cloud

- 新用户：$100免费额度（12个月）
- 学生专区：额外的学习资源

### Google Cloud

- 新用户：$300免费额度
- Google AI Platform：部分服务免费

### Microsoft Azure

- 学生订阅：$100免费额度
- Azure for Students Starter：无需信用卡

### IBM Cloud

- Lite版本：永久免费
- 学生项目：额外资源支持

## 四、学生折扣申请技巧

### 加速审核

1. 使用学校官方邮箱（.edu结尾）
2. 上传清晰的学生证照片
3. 填写准确的学校信息

### 续期注意事项

- 提前30天申请续期
- 确保学生身份仍在有效期内
- 保留之前的申请记录

## 五、常见问题

**Q: GitHub Copilot学生版有什么限制？**
A: 功能与付费版相同，但有2000次代码补全/月的限制（大多数学生够用）。

**Q: 毕业后学生折扣会怎样？**
A: 毕业后需要付费订阅，但可以享受老用户优惠。

**Q: 一个学生可以申请多个工具的折扣吗？**
A: 可以，每个工具独立申请。

**Q: 没有学校邮箱怎么办？**
A: 可以上传学生证或其他身份证明进行验证。`
  },
  {
    id: 'education-email-benefits',
    title: '教育邮箱能享受哪些AI工具优惠？',
    category: 'regional_pricing',
    excerpt: '详细介绍教育邮箱（.edu邮箱）能为你带来哪些AI工具的专属优惠和特权，以及如何申请和使用这些教育福利',
    toolIds: ['openai', 'github', 'jetbrains'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['教育邮箱', '.edu', '优惠', '学生特权'],
    rating: 4.5,
    ratingCount: 18500,
    viewCount: 220000,
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    content: `## 一、什么是教育邮箱？

教育邮箱是由学校官方提供的以.edu（或其他教育机构域名）结尾的邮箱账号，通常格式为：username@university.edu

### 常见教育邮箱格式

| 国家 | 常见格式 | 示例 |
|------|---------|------|
| 美国 | .edu | john@harvard.edu |
| 英国 | .ac.uk | john@oxford.ac.uk |
| 加拿大 | .ca | john@utoronto.ca |
| 澳大利亚 | .edu.au | john@anu.edu.au |
| 欧洲 | .edu + 国家码 | john@epfl.ch |

## 二、教育邮箱的AI工具特权

### GitHub Education（必须申请！）

**福利内容**：
- GitHub Copilot免费使用（价值$10/月）
- GitHub Pro免费使用
- 私有仓库无限量

**如何验证**：
1. 访问 education.github.com
2. 提交教育验证申请
3. 等待审核（1-7天）

---

### JetBrains

**福利内容**：
- 所有IDE专业版免费使用
- 包括IntelliJ IDEA、PyCharm等

**验证方式**：
1. 访问 jetbrains.com/shop/educase
2. 使用.edu邮箱注册
3. 自动验证

---

### OpenAI

**福利内容**：
- 新用户$5免费API额度（所有用户）
- 教育邮箱可能获得更高额度
- 优先体验新功能

**注意**：OpenAI没有正式的教育折扣计划，但教育邮箱有助于提高账户信誉。

---

### Canva

**福利内容**：
- Canva Pro免费一年
- 价值$119.88/年

**申请步骤**：
1. 访问 canva.com/education
2. 使用教育邮箱注册
3. 完成学生验证

---

### Notion

**福利内容**：
- 免费升级到Notion AI
- 教育计划专属功能

---

### Atlassian

**福利内容**：
- 所有工具免费使用（最多10用户）
- Jira、Confluence等企业工具

---

### AWS

**福利内容**：
- AWS Educate学生专区
- $100云积分（12个月）
- 学习路径和认证准备

---

### Microsoft

**福利内容**：
- Azure for Students：$100免费额度
- Visual Studio Enterprise：免费访问
- Office 365教育版：免费使用

---

### Google

**福利内容**：
- Google Cloud：$300新用户额度
- Google AI Platform：部分服务免费
- Colab Pro：学生可能获得更高配额

## 三、如何获取教育邮箱

### 在校学生

1. 登录学校学生门户
2. 查找"Email"或"IT Services"
3. 按照指引激活邮箱

### 校友

- 部分学校为校友提供邮箱延续服务
- 可以联系学校IT部门咨询

### 其他方式

如果没有.edu邮箱，可以：
1. 申请GitHub教育验证（上传学生证）
2. 使用学校官方出具的在读证明

## 四、教育邮箱申请技巧

### 加速审核

1. 使用完整的学校域名邮箱
2. 确保学生身份仍在有效期内
3. 上传清晰的学生证照片

### 常见问题

**Q: 学校的邮箱后缀不是.edu能用吗？**
A: 可以，只要是由教育机构官方提供的邮箱通常都能被接受。

**Q: 教育邮箱过期了怎么办？**
A: 大多数服务在验证通过后不会立即检查邮箱有效性，但建议保持邮箱活跃。

## 五、注意事项

### 安全提醒

- 教育邮箱同样需要保护好密码
- 启用双因素认证
- 不要在不信任的网站使用教育邮箱注册

### 使用规范

- 遵守各平台的使用条款
- 教育优惠仅限个人使用
- 不得转让或出售教育福利`
  },

  // ==================== TROUBLESHOOTING ====================
  {
    id: 'payment-failure-solutions',
    title: 'AI工具支付失败问题全面解决方案',
    category: 'troubleshooting',
    excerpt: '汇总了ChatGPT、Claude、Midjourney等AI工具支付失败的各种原因和详细解决方案，帮助留学生快速解决支付问题',
    toolIds: ['chatgpt', 'claude', 'midjourney', 'cursor', 'figma', 'jasper', 'copyai', 'grammarly', 'quillbot', 'notion-ai', 'perplexity', 'replit', 'tabnine', 'kimi', 'gemini', 'webpilot', 'elicit'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['支付失败', '问题解决', '信用卡被拒', '故障排除', '虚拟卡被拒'],
    rating: 4.6,
    ratingCount: 25000,
    viewCount: 320000,
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
    content: `## 一、支付失败常见原因

### 信用卡/借记卡问题

1. **卡片被拒**
   - 发卡行拒绝交易
   - 余额不足
   - 卡片过期
   - 交易限额

2. **信息错误**
   - 卡号填写错误
   - 有效期填写错误
   - CVV填写错误
   - 姓名与卡片不符

3. **风控拦截**
   - 跨境交易被拦截
   - 异常交易被识别
   - 频繁尝试触发风控

### 账户问题

1. **地区限制**
   - 账户地区与支付方式不匹配
   - 账户被限制支付功能

2. **验证未完成**
   - 缺少手机验证
   - 邮箱未验证
   - 账户异常状态

### 平台问题

1. **支付系统维护**
2. **接口异常**
3. **服务器繁忙**

---

## 二、详细解决方案

### 问题1：信用卡被拒绝

**可能原因**：
- 发卡行不支持国际交易
- 银行风控拦截
- 卡片信息过期

**解决方案**：

1. **联系银行**
   - 开通境外网上支付功能
   - 设置单笔/日交易限额
   - 临时解除风控

2. **尝试其他卡片**
   - 使用其他银行的信用卡
   - 尝试借记卡（部分银行借记卡支持境外支付）

3. **使用虚拟卡**
   - Depay、WildCard等虚拟卡
   - 绕过银行风控

---

### 问题2：卡片信息正确但支付失败

**可能原因**：
- 账户地区与卡片地区不匹配
- 浏览器/设备问题
- Cookie或缓存问题

**解决方案**：

1. **清除浏览器数据**
   - 清除Cookie
   - 清除缓存
   - 尝试无痕模式

2. **更换浏览器**
   - Chrome ↔ Firefox ↔ Safari
   - 更新浏览器到最新版本

3. **检查账户地区**
   - 确认账户注册地区
   - 确认支付方式地区设置

---

### 问题3：提示"您的支付被拒绝"

**可能原因**：
- 平台风控系统触发
- 可疑活动检测
- 账户存在异常

**解决方案**：

1. **等待后重试**
   - 等待30分钟-1小时
   - 避免频繁尝试

2. **联系平台客服**
   - 提供必要的身份验证
   - 说明支付情况

3. **更换支付方式**
   - 使用礼品卡替代
   - 使用虚拟卡

---

### 问题4：支付页面无法加载

**可能原因**：
- 网络问题
- VPN/代理问题
- 浏览器插件干扰

**解决方案**：

1. **检查网络**
   - 确保网络连接稳定
   - 尝试切换网络

2. **调整VPN**
   - 尝试更换节点
   - 尝试不使用VPN

3. **禁用浏览器插件**
   - 广告拦截插件可能干扰
   - 隐私插件可能干扰

---

### 问题5：余额充足但扣款失败

**可能原因**：
- 货币类型不匹配
- 汇率换算问题
- 卡片限额

**解决方案**：

1. **检查卡片限额**
   - 日限额可能过低
   - 单笔限额可能不足

2. **分次支付**
   - 将大额支付拆分为多次

3. **使用API充值**
   - 部分平台支持余额充值

---

## 三、预防措施

### 支付前检查清单

- [ ] 确认卡片余额充足
- [ ] 确认卡片未过期
- [ ] 开通境外网上支付
- [ ] 确认账户地区设置正确
- [ ] 准备好备用支付方式

### 建议的支付方式优先级

1. **首选**：虚拟信用卡（Depay/WildCard）
2. **次选**：第三方平台代付
3. **第三**：礼品卡充值
4. **最后**：国际信用卡

---

## 四、常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| CARD_DECLINED | 卡片被拒 | 联系银行或使用虚拟卡 |
| INSUFFICIENT_FUNDS | 余额不足 | 充值后再试 |
| INVALID_CARD | 卡片无效 | 检查卡号信息 |
| EXPIRED_CARD | 卡片过期 | 使用有效卡片 |
| RISK_REJECTED | 风控拒绝 | 更换支付方式 |

---

## 五、联系客服的正确方式

### ChatGPT/OpenAI

- 访问 help.openai.com
- 通过聊天窗口联系

### Claude/Anthropic

- 访问 anthropic.com/contact
- 发送邮件到 support@anthropic.com

### Midjourney

- 通过Discord频道寻求帮助
- 访问 midjourney.com/help`
  },
  {
    id: 'credit-card-rejection',
    title: '信用卡被拒的解决方法和建议',
    category: 'troubleshooting',
    excerpt: '详细分析信用卡被国际平台拒绝的各种原因，提供实用的解决方法和替代支付方案，帮助留学生顺利完成订阅',
    toolIds: ['chatgpt', 'claude', 'midjourney', 'cursor', 'figma', 'jasper', 'copyai', 'grammarly', 'quillbot', 'notion-ai', 'perplexity', 'replit', 'tabnine'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['信用卡被拒', '支付问题', '解决方案', '虚拟卡'],
    rating: 4.5,
    ratingCount: 18000,
    viewCount: 245000,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    content: `## 一、信用卡被拒的原因分析

### 银行层面原因

1. **境外交易限制**
   - 银行默认关闭境外网上交易
   - 需要主动开通

2. **外币交易限制**
   - 部分卡片不支持美元等外币
   - 需要开通多币种功能

3. **风控系统触发**
   - 频繁大额交易
   - 异常时间交易
   - 突然的跨境交易

4. **额度问题**
   - 可用额度不足
   - 单笔超限

### 卡片层面原因

1. **磁条/芯片问题**
2. **卡片过期**
3. **信息变更未更新**
4. **虚拟卡未激活**

### 平台层面原因

1. **地区限制**
   - 平台不支持中国发行卡片
   - 账户与卡片地区不匹配

2. **风控策略**
   - 高风险地区交易被拦截
   - 频繁尝试触发风控

---

## 二、解决方案

### 方案一：联系银行开通权限

**步骤**：

1. 拨打银行客服电话
2. 说明需要开通"境外网上支付"
3. 确认开通的支付通道（如Visa/MasterCard）
4. 设置单笔和日累计交易限额
5. 记录客服工号以备查询

**常用银行客服**：
- 工商银行：95588
- 建设银行：95533
- 招商银行：95555
- 中国银行：95566

---

### 方案二：使用虚拟信用卡

**推荐平台**：

| 平台 | 特点 | 费用 |
|------|------|------|
| WildCard | 中文界面，支付宝充值 | $11.99/年 |
| Depay | 多币种，加密货币充值 | 免费-年费 |

**申请步骤**：
1. 访问平台官网
2. 使用手机号注册
3. 完成基础认证
4. 充值USDT或使用支付宝充值
5. 获取虚拟卡信息

---

### 方案三：使用他人信用卡

**注意事项**：
- 仅限家人或可信朋友
- 确保卡片额度充足
- 了解可能的安全风险

**操作方式**：
1. 获取卡片信息（卡号、有效期、CVV）
2. 在支付页面填写信息
3. 使用持卡人手机号接收验证码（如需要）

---

### 方案四：第三方平台代付

**优点**：
- 操作简单
- 无需自己支付

**缺点**：
- 价格可能较高
- 存在一定风险

**推荐平台**：
- 正规授权经销商
- 留学生社群推荐

---

### 方案五：礼品卡替代

**适用平台**：
- App Store（iOS用户）
- Google Play（Android用户）
- 部分支持礼品卡的平台

**购买方式**：
1. 通过朋友代购
2. 在国外的朋友帮忙购买
3. 授权经销商处购买

---

## 三、不同银行的处理方式

### 国有大行

**工商银行**：
- 开通境外支付：较复杂，需U盾
- 推荐使用手机银行APP

**建设银行**：
- 开通便捷，支持网上自助开通
- 限额设置灵活

**中国银行**：
- 外币卡片较多支持
- 适合有外币需求的用户

### 股份制银行

**招商银行**：
- 网上银行操作便捷
- 客服响应快

**浦发银行**：
- 支持多币种
- 境外支付开通简单

---

## 四、预防措施

### 支付前准备

1. **提前开通权限**
   - 在需要支付前提前开通境外支付
   - 避免临时抱佛脚

2. **检查卡片状态**
   - 确认卡片未过期
   - 确认额度充足

3. **设置合理限额**
   - 根据需求设置单笔限额
   - 设置日累计限额

4. **保留备用方案**
   - 准备虚拟卡作为备用
   - 保存朋友信用卡信息（可信情况下）

### 银行沟通技巧

1. **明确说明用途**
   - 说明用于订阅海外AI服务
   - 提供具体平台名称

2. **要求开通所有通道**
   - Visa
   - MasterCard
   - 可能的话开通American Express

3. **记录沟通内容**
   - 记录客服工号
   - 记录开通时间和内容

---

## 五、常见问题

**Q: 银行说开通了但还是被拒？**
A: 可能需要设置交易密码或手机验证，请银行确认所有安全设置都已完成。

**Q: 借记卡可以吗？**
A: 部分银行的借记卡支持境外支付，但额度通常比信用卡低。

**Q: 虚拟卡安全吗？**
A: 选择正规平台的虚拟卡是安全的，如WildCard、Depay等。

**Q: 被拒后多久可以再试？**
A: 建议等待1-2小时后再试，频繁尝试可能加重风控。`
  },
  {
    id: 'refund-process',
    title: 'AI工具退款流程和注意事项',
    category: 'troubleshooting',
    excerpt: '详细介绍ChatGPT、Claude、Midjourney等主流AI工具的退款政策、申请流程和注意事项，帮助用户在需要时顺利获得退款',
    toolIds: ['chatgpt', 'claude', 'midjourney', 'cursor', 'figma', 'jasper', 'copyai', 'grammarly', 'quillbot', 'notion-ai', 'perplexity', 'replit', 'tabnine', 'dalle-3'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['退款', 'Refund', 'ChatGPT', 'Claude', 'Midjourney', '订阅取消'],
    rating: 4.3,
    ratingCount: 8500,
    viewCount: 98000,
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
    content: `## 一、退款政策概览

### 主流AI工具退款政策

| 平台 | 退款政策 | 说明 |
|------|---------|------|
| ChatGPT | 部分支持 | API余额可退款，Plus订阅较难 |
| Claude | 部分支持 | 按情况审核 |
| Midjourney | 一般不支持 | 订阅后通常不退款 |

## 二、ChatGPT退款

### API余额退款

**适用情况**：
- 账户有未使用的API余额
- 由于技术问题导致无法使用

**申请步骤**：

1. 访问 help.openai.com
2. 找到"Refund"相关选项
3. 填写退款申请表格
4. 提供账户信息和退款原因
5. 等待审核（通常5-10个工作日）

**注意事项**：
- 退款会原路返回
- 退款金额按充值时的汇率计算
- 已使用的额度不可退款

### Plus订阅退款

**政策说明**：
- OpenAI对Plus订阅的退款比较严格
- 如果是重复扣费可以申请
- 如果是误订阅可以尝试申请

**申请方式**：
1. 联系 OpenAI客服
2. 说明订阅情况
3. 提供订阅证明

---

## 三、Claude退款

### API余额退款

**政策说明**：
- Claude API余额不可以提现
- 但可以继续使用直到余额用完

**余额管理**：
- 设置使用限额
- 监控用量
- 避免超额充值

### Pro订阅退款

**政策说明**：
- 订阅退款需要具体审核
- 如果是技术问题导致无法使用可能获得退款

**申请步骤**：
1. 访问 anthropic.com/contact
2. 选择Billing相关问题
3. 说明具体情况
4. 提供账户信息

---

## 四、Midjourney退款

### 订阅退款政策

**官方政策**：
- Midjourney订阅通常不可退款
- 订阅为即时生效，无法"撤销"

**特殊情况**：
- 技术问题导致完全无法使用
- 被错误扣费

### 申请方式

1. 通过Discord联系Support
2. 提供详细的问题描述
3. 提供订阅和支付证明

---

## 五、退款申请技巧

### 提高退款成功率

1. **选择合适的理由**
   - 技术问题 > 误操作 > 改变主意

2. **准备充分的证据**
   - 截图
   - 交易记录
   - 问题描述

3. **使用正确的渠道**
   - 官方渠道 > 第三方平台

4. **保持耐心和礼貌**
   - 礼貌沟通通常更有效

### 退款时间预估

| 平台 | 处理时间 | 到账时间 |
|------|---------|---------|
| ChatGPT API | 5-10工作日 | 3-5工作日 |
| Claude | 5-10工作日 | 3-5工作日 |
| Midjourney | 不确定 | 不确定 |

---

## 六、避免退款的方法

### 订阅前检查

1. **充分了解服务**
   - 免费试用（如有）
   - 了解功能范围

2. **确认支付方式**
   - 确保卡片支持
   - 确保余额充足

3. **了解取消政策**
   - 查看取消流程
   - 了解自动续费时间

### 管理订阅

1. **设置提醒**
   - 订阅续费日期
   - 续费前检查

2. **取消不需要的订阅**
   - 及时取消避免扣费
   - 利用免费试用期

3. **使用预算控制**
   - 设置消费限额
   - 监控使用量

---

## 七、常见问题

**Q: 订阅后可以退款吗？**
A: 大多数平台对订阅类服务退款比较严格，但可以尝试申请。

**Q: 退款会退到哪里？**
A: 通常原路返回，如原来的支付方式。

**Q: 多久可以收到退款？**
A: 各平台不同，通常5-15个工作日。

**Q: 如果退款被拒绝怎么办？**
A: 可以再次申请或联系更高层级客服。`
  },

  // ==================== NEW: AGENT FRAMEWORKS & LOCAL LLMS ====================

  // OpenClaw - 开源免费Agent框架
  {
    id: 'openclaw-complete-guide',
    title: 'OpenClaw AI Agent框架完整指南 - 300K Stars开源项目',
    category: 'regional_pricing',
    excerpt: 'OpenClaw是Apache 2.0开源的AI Agent框架，300K+ Stars，支持20+消息平台。本文介绍OpenClaw的安装配置和支付解决方案',
    toolIds: ['openclaw'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['OpenClaw', 'Agent框架', '开源', 'Docker', '多平台', '安装教程'],
    rating: 4.8,
    ratingCount: 5200,
    viewCount: 68000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、OpenClaw简介

OpenClaw是一个Apache 2.0开源的AI Agent框架，GitHub 300K+ Stars，是目前最流行的开源Agent框架之一。支持Windows、Mac、Linux多平台，以及Docker部署。

### 核心特点

- **多消息平台支持**：微信、企业微信、钉钉、飞书、Telegram、Discord等20+平台
- **插件系统**：丰富的插件扩展
- **记忆管理**：长期记忆和上下文管理
- **工具调用**：内置丰富的工具集
- **跨平台**：支持所有主流操作系统

## 二、安装方式

### 方式一：Docker部署（推荐）

\`\`\`bash
# 克隆仓库
git clone https://github.com/openclaw/agent.git

# 进入目录
cd agent

# 使用Docker启动
docker-compose up -d

# 访问Web界面
open http://localhost:3000
\`\`\`

### 方式二：直接安装

**Windows**：
\`\`\`powershell
# 使用PowerShell安装
iwr https://install.openclaw.com | iex

# 启动OpenClaw
openclaw start
\`\`\`

**Mac/Linux**：
\`\`\`bash
# 使用curl安装
curl -L https://install.openclaw.com | sh

# 启动OpenClaw
openclaw start
\`\`\`

### 方式三：源码部署

\`\`\`bash
# 克隆仓库
git clone https://github.com/openclaw/agent.git

# 安装依赖
npm install

# 复制配置文件
cp config.example.yaml config.yaml

# 编辑配置文件
vim config.yaml

# 启动
npm run dev
\`\`\`

## 三、配置指南

### 配置文件说明

\`\`\`yaml
# config.yaml
server:
  port: 3000
  host: localhost

agent:
  model: gpt-4
  api_key: your-api-key

platforms:
  - type: telegram
    bot_token: your-bot-token
  - type: discord
    bot_token: your-bot-token
\`\`\`

### 支持的消息平台

| 平台 | 配置难度 | 说明 |
|------|---------|------|
| Telegram | 简单 | 需要Bot Token |
| Discord | 简单 | 需要Bot Token |
| 钉钉 | 中等 | 需要钉钉应用 |
| 飞书 | 中等 | 需要飞书应用 |
| 企业微信 | 复杂 | 需要企业资质 |
| 微信 | 复杂 | 需要Hook技术 |

## 四、插件开发

### 创建插件

\`\`\`javascript
// plugins/my-plugin/index.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',

  // 插件初始化
  async onLoad(ctx) {
    console.log('插件加载');
  },

  // 处理消息
  async onMessage(ctx, message) {
    // 处理逻辑
    return {
      content: '回复内容'
    };
  }
};
\`\`\`

### 插件配置

\`\`\`yaml
plugins:
  - name: my-plugin
    enabled: true
    config:
      option1: value1
\`\`\`

## 五、API调用配置

### OpenAI API

\`\`\`yaml
agent:
  model: gpt-4
  api_key: sk-xxx
  api_base: https://api.openai.com/v1
\`\`\`

### Claude API

\`\`\`yaml
agent:
  model: claude-3-opus
  api_key: sk-ant-xxx
  api_base: https://api.anthropic.com
\`\`\`

### 国内API（推荐）

\`\`\`yaml
agent:
  model: deepseek-chat
  api_key: your-deepseek-api-key
  api_base: https://api.deepseek.com
\`\`\`

## 六、常见问题

**Q: Docker版本启动失败？**
A: 确保Docker版本 >= 20.10，并分配足够内存。

**Q: 如何配置HTTPS？**
A: 使用nginx反向代理，或配置let's encrypt证书。

**Q: 支持哪些AI模型？**
A: 支持所有OpenAI兼容的API，包括GPT-4、Claude、DeepSeek等。`
  },

  // Hermes Agent - 自进化AI Agent
  {
    id: 'hermes-agent-complete-guide',
    title: 'Hermes Agent自进化AI框架完整指南',
    category: 'regional_pricing',
    excerpt: 'Hermes Agent是100K+ Stars的自进化AI Agent框架，支持200+模型。本文介绍安装配置和使用教程',
    toolIds: ['hermes-agent'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['Hermes Agent', '自进化', 'Agent框架', '开源', '多模型'],
    rating: 4.7,
    ratingCount: 3800,
    viewCount: 45000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Hermes Agent简介

Hermes Agent是一个具有自进化能力的AI Agent框架，GitHub 100K+ Stars，MIT开源协议。支持200+ AI模型，具有长期记忆、自主学习和工具调用能力。

### 核心特点

- **自进化能力**：可以从交互中持续学习和改进
- **200+模型支持**：GPT、Claude、DeepSeek、Qwen等
- **长期记忆**：基于向量数据库的持久记忆
- **多Agent协作**：支持多个Agent协同工作
- **工具扩展**：丰富的内置工具和自定义工具

## 二、安装部署

### 环境要求

- Python 3.10+
- 16GB+ RAM
- 50GB+ 硬盘空间

### pip安装

\`\`\`bash
# 创建虚拟环境
python -m venv hermes-env
source hermes-env/bin/activate  # Linux/Mac
# or
/* eslint-disable no-useless-escape */
.\hermes-env\Scripts\activate  # Windows
/* eslint-enable no-useless-escape */

# 安装
pip install hermes-agent

# 初始化
hermes init
\`\`\`

### Docker部署

\`\`\`bash
# 拉取镜像
docker pull hermesagent/hermes-agent:latest

# 运行
docker run -d \\
  -p 8000:8000 \\
  -v ~/.hermes:/app/data \\
  hermesagent/hermes-agent:latest
\`\`\`

### 源码安装

\`\`\`bash
git clone https://github.com/mr攻Agent/mr-agent.git
cd mr-agent
pip install -e .
\`\`\`

## 三、配置说明

### 配置文件

\`\`\`yaml
# ~/.hermes/config.yaml
model:
  provider: openai
  name: gpt-4
  api_key: your-api-key

memory:
  type: chroma
  persist_directory: ~/.hermes/memory

tools:
  enabled:
    - web_search
    - calculator
    - file_operations
\`\`\`

### 支持的模型

| 模型 | 提供商 | 配置难度 |
|------|--------|---------|
| GPT-4/3.5 | OpenAI | 简单 |
| Claude 3 | Anthropic | 简单 |
| DeepSeek | DeepSeek | 简单 |
| Qwen | 阿里 | 中等 |
| ChatGLM | 清华 | 中等 |

## 四、使用教程

### 基本使用

\`\`\`python
from hermes import Hermes

# 初始化
agent = Hermes()

# 对话
response = agent.chat("帮我写一个Hello World程序")
print(response)
\`\`\`

### 带工具调用

\`\`\`python
from hermes import Hermes

agent = Hermes(tools=['web_search', 'calculator'])

# Agent会自动选择合适的工具
response = agent.chat("北京现在的天气怎么样？")
print(response)
\`\`\`

### 自定义工具

\`\`\`python
from hermes import Hermes, tool

@tool
def get_weather(city: str) -> str:
    """获取城市天气"""
    # 实现逻辑
    return f"{city}的天气是..."

agent = Hermes(tools=[get_weather])
\`\`\`

## 五、支付相关

### API费用说明

Hermes Agent本身免费，但需要配置AI模型API：

| 模型 | 费用 | 性价比 |
|------|------|--------|
| GPT-4 | $0.03/1K tokens | 中 |
| GPT-3.5 | $0.002/1K tokens | 高 |
| DeepSeek | $0.001/1K tokens | 最高 |
| Claude 3 | $3-15/1M tokens | 中 |

### 推荐配置

**低成本方案**：
\`\`\`yaml
model:
  provider: deepseek
  name: deepseek-chat
  api_key: your-key
\`\`\`

**高智能方案**：
\`\`\`yaml
model:
  provider: openai
  name: gpt-4-turbo
  api_key: your-key
\`\`\`

## 六、常见问题

**Q: 自进化是如何实现的？**
A: 通过记录每次交互到向量数据库，在后续对话中检索相关经验来改进回答。

**Q: 如何避免API费用过高？**
A: 设置每日用量限额，使用低成本模型如DeepSeek。

**Q: 支持中文吗？**
A: 完全支持中文，推荐使用Qwen或DeepSeek模型。`
  },

  // AutoGPT - 自主任务执行Agent
  {
    id: 'autogpt-complete-guide',
    title: 'AutoGPT自主AI Agent完整指南',
    category: 'regional_pricing',
    excerpt: 'AutoGPT是160K+ Stars的自主任务执行框架，通过自然语言指令实现复杂任务自动化。本文介绍安装配置和使用教程',
    toolIds: ['autogpt'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['AutoGPT', '自主执行', 'Agent框架', '开源', '自动化'],
    rating: 4.5,
    ratingCount: 4500,
    viewCount: 58000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、AutoGPT简介

AutoGPT是一个自主任务执行的AI Agent框架，GitHub 160K+ Stars。用户只需提供高层目标，AutoGPT会自动规划、执行、评估和优化任务步骤。

### 核心特点

- **自主规划**：自动分解复杂任务
- **自我反思**：评估执行结果并调整策略
- **视觉支持**：支持图像理解和生成
- **语音交互**：支持语音命令和回复
- **持久记忆**：长期记忆和上下文保持

## 二、安装部署

### 环境要求

- Python 3.10+
- 至少8GB RAM
- 20GB+ 可用磁盘空间

### 快速安装

\`\`\`bash
# 克隆仓库
git clone https://github.com/Significant-Gravitas/AutoGPT.git
cd AutoGPT

# 安装依赖
pip install -r requirements.txt

# 运行
python autogpt/app/main.py
\`\`\`

### Docker安装

\`\`\`bash
# 构建镜像
docker build -t autogpt .

# 运行
docker run -it --env-file .env autogpt
\`\`\`

### 配置API Key

\`\`\`bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
vim .env
\`\`\`

\`\`\`env
# OpenAI配置
OPENAI_API_KEY=sk-xxx

# 可选：使用代理
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
\`\`\`

## 三、使用教程

### 基础命令

\`\`\`bash
# 交互模式
python autogpt/app/main.py

# 指定任务
python autogpt/app/main.py --ai-name "Researcher" --ai-role "research assistant" --goal "研究量子计算的最新进展"

# 连续模式（自动确认）
python autogpt/app/main.py --continuous
\`\`\`

### 首次使用流程

1. 启动程序
2. 给AI分配名称和角色
3. 描述你的目标
4. AI开始自主执行
5. 定期检查进度并确认

## 四、常见配置

### 使用其他模型

**Claude配置**：
\`\`\`env
USE_CLAUDE=1
CLAUDE_API_KEY=sk-ant-xxx
\`\`\`

**DeepSeek配置**：
\`\`\`env
USE_DEEPSEEK=1
DEEPSEEK_API_KEY=xxx
DEEPSEEK_API_BASE=https://api.deepseek.com
\`\`\`

### 记忆配置

\`\`\`yaml
memory:
  backend: redis  # 或 pinecone, chroma, redis
  redis:
    host: localhost
    port: 6379
\`\`\`

## 五、成本控制

### 各模型成本对比

| 模型 | 智能度 | 速度 | 成本 |
|------|--------|------|------|
| GPT-4 | 最高 | 中 | 高 |
| GPT-3.5 | 高 | 快 | 低 |
| DeepSeek | 高 | 快 | 最低 |
| Claude 3 | 高 | 中 | 中 |

### 节省成本技巧

1. 简单任务使用GPT-3.5
2. 设置每次最大token限制
3. 使用连续模式时注意监控
4. 优先使用DeepSeek等低成本模型

## 六、注意事项

**警告**：AutoGPT可能产生意外行为，请：
- 在隔离环境运行
- 设置API消费限额
- 定期检查执行日志
- 谨慎使用连续模式`
  },

  // CrewAI - 多Agent协作框架
  {
    id: 'crewai-complete-guide',
    title: 'CrewAI多Agent协作框架完整指南',
    category: 'regional_pricing',
    excerpt: 'CrewAI是45K+ Stars的多Agent协作框架，让多个AI Agent扮演不同角色协同完成复杂任务。本文介绍安装和使用教程',
    toolIds: ['crewai'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['CrewAI', '多Agent', '协作', 'Agent框架', '开源', '角色扮演'],
    rating: 4.6,
    ratingCount: 2900,
    viewCount: 38000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、CrewAI简介

CrewAI是一个多Agent协作框架，GitHub 45K+ Stars。通过定义多个具有不同角色的Agent，让它们协作完成复杂任务。

### 核心特点

- **多角色Agent**：定义不同的角色和职责
- **任务协作**：Agent之间可以共享信息和结果
- **流程控制**：支持顺序和并行执行
- **工具集成**：内置和自定义工具支持
- **简易API**：Pythonic的简洁接口

## 二、安装部署

### 基本安装

\`\`\`bash
# 使用pip安装
pip install crewai

# 安装额外依赖
pip install crewai[tools]
\`\`\`

### Poetry安装

\`\`\`bash
poetry add crewai crewai-tools
\`\`\`

## 三、使用教程

### 基本示例

\`\`\`python
from crewai import Agent, Crew, Task, Process
from crewai.tools import SerpAPITool

# 创建工具
search_tool = SerpAPITool()

# 创建Agent
researcher = Agent(
    role='Research Analyst',
    goal='Find and summarize the latest AI news',
    backstory='An expert at researching technology trends',
    tools=[search_tool]
)

writer = Agent(
    role='Tech Writer',
    goal='Write clear and engaging tech articles',
    backstory='A professional tech writer with years of experience',
    tools=[]
)

# 创建任务
research_task = Task(
    description='Research the latest developments in AI',
    agent=researcher
)

write_task = Task(
    description='Write an article about the AI news',
    agent=writer,
    context=[research_task]
)

# 创建团队
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential
)

# 执行
result = crew.kickoff()
print(result)
\`\`\`

### 并行执行

\`\`\`python
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, write_task, edit_task],
    process=Process.hierarchical  # 层级协作
)
\`\`\`

## 四、支付相关

CrewAI本身免费，但需要配置AI模型API：

### 推荐API配置

**DeepSeek（推荐）**：
\`\`\`python
import os
os.environ['OPENAI_API_KEY'] = 'your-deepseek-key'
os.environ['OPENAI_API_BASE'] = 'https://api.deepseek.com/v1'
os.environ['OPENAI_MODEL_NAME'] = 'deepseek-chat'
\`\`\`

### 成本控制

- CrewAI免费
- 主要成本来自API调用
- 推荐使用DeepSeek等低成本模型
- 设置任务数量限制避免过度调用

## 五、高级用法

### 自定义工具

\`\`\`python
from crewai.tools import BaseTool
from pydantic import Field

class MyCustomTool(BaseTool):
    name: str = Field(default="my_tool")
    description: str = Field(default="A custom tool")

    def _run(self, argument: str) -> str:
        # 实现逻辑
        return "result"
\`\`\`

### 记忆管理

\`\`\`python
from crewai import Crew
from crewai.memory import Memory

crew = Crew(
    agents=[...],
    tasks=[...],
    memory=Memory()
)
\`\`\`

## 六、常见问题

**Q: 如何选择Agent数量？**
A: 根据任务复杂度，通常2-5个Agent足够。

**Q: Agent之间如何通信？**
A: 通过共享任务上下文，每个Agent可以看到前置任务的输出。

**Q: 如何调试Agent行为？**
A: 使用verbose模式查看详细执行日志。`
  },

  // LangChain - AI应用开发框架
  {
    id: 'langchain-complete-guide',
    title: 'LangChain开发框架完整指南',
    category: 'regional_pricing',
    excerpt: 'LangChain是118K+ Stars的AI应用开发框架，提供模块化组件构建复杂LLM应用。本文介绍安装配置和使用教程',
    toolIds: ['langchain'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['LangChain', '开发框架', 'LLM应用', 'RAG', '向量数据库', 'Chain'],
    rating: 4.4,
    ratingCount: 6200,
    viewCount: 85000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、LangChain简介

LangChain是一个用于构建LLM应用的开发框架，GitHub 118K+ Stars。提供Chain、Agent、Memory、RAG等模块化组件。

### 核心模块

- **Chains**：链接多个组件处理复杂任务
- **Agents**：让LLM自主决策和执行动作
- **Memory**：在对话中保持状态
- **RAG**：检索增强生成
- **Tools**：集成外部工具和服务

## 二、安装部署

### 基本安装

\`\`\`bash
# 基本安装
pip install langchain

# OpenAI集成
pip install langchain-openai

# 所有集成
pip install langchain[all]
\`\`\`

### 可选集成

\`\`\`bash
# 向量数据库
pip install langchain-chroma
pip install langchain-pinecone

# Agent工具
pip install langchain-community

# 其他
pip install langchain-anthropic
pip install langchain-deepseek
\`\`\`

## 三、使用教程

### 基本对话

\`\`\`python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4",
    api_key="sk-xxx"
)

response = llm.invoke("Hello, how are you?")
print(response.content)
\`\`\`

### Chain示例

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

llm = ChatOpenAI(model="gpt-4")

prompt = PromptTemplate(
    input_variables=["topic"],
    template="Write a short story about {topic}"
)

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run("a robot learning to paint")
print(result)
\`\`\`

### RAG示例

\`\`\`python
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA

# 加载文档
from langchain_community.document_loaders import TextLoader
loader = TextLoader("document.txt")
documents = loader.load()

# 分割
splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
docs = splitter.split_documents(documents)

# 向量化
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(docs, embeddings)

# 创建RAG链
llm = ChatOpenAI(model="gpt-4")
qa = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())

# 问答
result = qa.invoke("What is the document about?")
\`\`\`

## 四、支付相关

LangChain免费，但需要配置LLM API：

### API配置

**OpenAI**：
\`\`\`python
import os
os.environ["OPENAI_API_KEY"] = "sk-xxx"
\`\`\`

**DeepSeek（推荐低成本）**：
\`\`\`python
import os
os.environ["OPENAI_API_KEY"] = "your-deepseek-key"
os.environ["OPENAI_API_BASE"] = "https://api.deepseek.com/v1"

from langchain_openai import ChatOpenAI
llm = ChatOpenAI(
    model="deepseek-chat",
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ["OPENAI_API_BASE"]
)
\`\`\`

### 成本优化

1. 优先使用GPT-3.5或DeepSeek
2. 使用批处理减少API调用
3. 缓存常用查询结果
4. 设置最大token限制`
  },

  // Dify - 低代码AI应用平台
  {
    id: 'dify-complete-guide',
    title: 'Dify低代码AI应用平台完整指南',
    category: 'regional_pricing',
    excerpt: 'Dify是120K+ Stars的开源LLM应用平台，低代码方式快速构建AI应用，支持RAG和Agent。本文介绍部署和使用教程',
    toolIds: ['dify'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Dify', '低代码', 'RAG', '开源', '可视化编排', 'LLM应用'],
    rating: 4.7,
    ratingCount: 4100,
    viewCount: 52000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Dify简介

Dify是一个开源的LLM应用开发平台，GitHub 120K+ Stars。提供可视化编排、RAG管道、Agent、API部署等功能。

### 核心特点

- **低代码**：可视化界面，无需编程基础
- **RAG管道**：内置知识库和检索功能
- **Agent**：内置Agent框架
- **多模型支持**：OpenAI、Claude、DeepSeek等
- **API部署**：一键将应用发布为API
- **团队协作**：支持多用户和权限管理

## 二、部署方式

### Docker部署（推荐）

\`\`\`bash
# 下载dify
git clone https://github.com/langgenius/dify.git
cd dify/docker

# 启动服务
cp .env.example .env
docker-compose up -d

# 访问
open http://localhost:80
\`\`\`

### 配置API

首次使用需要配置AI模型：

1. 进入 设置 → 模型供应商
2. 添加你的API密钥
3. 支持：OpenAI、Claude、DeepSeek、Qwen等

### 硬件要求

| 部署方式 | CPU | 内存 | 硬盘 |
|----------|-----|------|------|
| 单机版 | 4核+ | 8GB+ | 50GB+ |
| 生产版 | 8核+ | 16GB+ | 100GB+ |

## 三、使用教程

### 创建应用

1. 点击"创建应用"
2. 选择应用类型：
   - 对话型应用
   - Agent
   - 文本生成应用

3. 选择AI模型
4. 配置提示词
5. 添加知识库（可选）

### RAG知识库

\`\`\`bash
# 上传文档
支持格式：TXT、PDF、DOCX、Markdown、HTML

# 配置检索参数
- 向量模型：text-embedding-3-small
- 检索模式：语义检索、混合检索
- TopK：3-10
\`\`\`

### Agent配置

\`\`\`yaml
# 内置Agent能力
- 意图识别
- 参数提取
- 工具调用
- 知识库检索

# 支持自定义工具
- HTTP API
- Python函数
- Fuction Calling
\`\`\`

## 四、支付相关

Dify开源免费，但需要配置AI模型API：

### 成本分析

| 组件 | 费用 |
|------|------|
| Dify本身 | 免费 |
| AI模型API | 按量计费 |
| 向量数据库 | 免费（内置） |
| 服务器 | 自备 |

### 推荐模型配置

**开发环境**：
- 使用本地开源模型（Ollama）

**生产环境**：
- DeepSeek（推荐）
- GPT-3.5（性价比）
- Claude 3 Haiku（快速）

## 五、API调用

### 获取API Key

1. 进入应用 → 发布 → API
2. 复制API Key

### 调用示例

\`\`\`bash
curl -X POST 'https://your-dify.com/v1/chat-messages' \\
  -H 'Authorization: Bearer app-xxx' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "query": "Hello",
    "response_mode": "blocking"
  }'
\`\`\`

## 六、企业版功能

Dify提供企业版，额外功能：
- SSO单点登录
- 高级权限管理
- 审计日志
- 优先支持
- 自托管授权`
  },

  // Coze - 字节跳动AI Bot平台
  {
    id: 'coze-platform-guide',
    title: 'Coze扣子AI Bot平台完整指南',
    category: 'regional_pricing',
    excerpt: 'Coze是字节跳动推出的AI Bot开发平台，提供60+官方插件，支持快速构建和部署聊天机器人。本文介绍使用教程',
    toolIds: ['coze'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Coze', '扣子', 'Bot', '字节跳动', '插件', '工作流'],
    rating: 4.5,
    ratingCount: 3500,
    viewCount: 42000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Coze简介

Coze是字节跳动推出的AI Bot开发平台（coze.com），提供可视化编排、60+官方插件，工作流、多渠道发布等功能。

### 核心特点

- **60+官方插件**：搜索、代码执行、网页解析等
- **可视化编排**：拖拽式工作流设计
- **多渠道发布**：抖音、微信、Telegram等
- **Bot商店**：分享和发现Bot
- **API支持**：通过API调用Bot

## 二、使用教程

### 创建Bot

1. 访问 coze.com 并登录
2. 点击"创建Bot"
3. 填写Bot信息：
   - 名称
   - 描述
   - 图标

4. 选择AI模型
5. 配置人设提示词

### 工作流编排

\`\`\`
工作流节点：
- LLM节点：AI对话
- 插件节点：调用API
- 代码节点：执行Python/JS
- 条件节点：分支逻辑
- 循环节点：循环执行
\`\`\`

### 插件使用

内置插件：
- 必应搜索
- Google搜索
- 网页解析
- 代码执行
- DALL-E图像生成
- DeepSeek翻译

## 三、发布渠道

### 支持的平台

| 平台 | 配置难度 | 说明 |
|------|---------|------|
| 抖音 | 简单 | 抖音私信 |
| 微信 | 复杂 | 需企业资质 |
| Telegram | 简单 | Bot API |
| 飞书 | 中等 | 机器人 |
| Discord | 简单 | Webhook |

### 发布流程

1. 完成Bot开发
2. 配置发布渠道
3. 提交审核（如需要）
4. 发布上线

## 四、API使用

### 获取API Key

1. 进入设置 → API
2. 创建API Token
3. 复制保存

### 调用示例

\`\`\`bash
curl -X POST 'https://api.coze.com/v1/chat' \\
  -H 'Authorization: Bearer pat-xxx' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "bot_id": "bot-xxx",
    "user_id": "user-xxx",
    "query": "Hello"
  }'
\`\`\`

## 五、费用说明

### 免费额度

- 个人版：免费使用
- 包含基础插件
- 有限API调用

### 付费功能

- 企业版：定制价格
- 高级插件
- 更高API限额
- 优先支持

### API费用

Coze平台本身免费，但AI模型调用可能产生费用。`
  },

  // Ollama - 本地大模型运行工具
  {
    id: 'ollama-complete-guide',
    title: 'Ollama本地大模型运行完整指南',
    category: 'regional_pricing',
    excerpt: 'Ollama是本地大模型运行工具，一键部署Llama 2/Qwen/DeepSeek等开源模型，支持GPU加速。本文介绍安装配置和模型使用',
    toolIds: ['ollama'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Ollama', '本地部署', '开源模型', 'GPU加速', 'Llama', 'DeepSeek'],
    rating: 4.8,
    ratingCount: 7800,
    viewCount: 98000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Ollama简介

Ollama是本地大模型运行工具，一键部署Llama 2、Qwen、DeepSeek、Mistral等开源模型，支持GPU加速，完全免费使用。

### 核心特点

- **一键部署**：简单命令即可运行模型
- **GPU支持**：自动使用NVIDIA/AMD GPU加速
- **模型管理**：轻松下载、切换、删除模型
- **REST API**：提供API接口供应用调用
- **跨平台**：支持macOS、Linux、Windows

## 二、安装部署

### macOS安装

\`\`\`bash
# 使用brew安装
brew install ollama

# 或者下载安装包
# https://ollama.com/download
\`\`\`

### Linux安装

\`\`\`bash
# 一键安装
curl -fsSL https://ollama.com/install.sh | sh
\`\`\`

### Windows安装

1. 访问 ollama.com/download
2. 下载Windows预览版
3. 运行安装程序

### Docker安装

\`\`\`bash
# 拉取镜像
docker pull ollama/ollama:latest

# 运行
docker run -d \\
  -v ollama:/root/.ollama \\
  -p 11434:11434 \\
  ollama/ollama:latest
\`\`\`

## 三、模型使用

### 常用模型

\`\`\`bash
# 下载模型
ollama pull llama2          # Llama 2
ollama pull deepseek-coder  # DeepSeek代码模型
ollama pull qwen            # 通义千问
ollama pull mistral         # Mistral
ollama pull neural-chat     # 神经网络对话

# 查看已下载模型
ollama list

# 删除模型
ollama rm llama2
\`\`\`

### 运行模型

\`\`\`bash
# 对话模式
ollama run llama2

# 指定参数
ollama run deepseek-coder --temperature 0.7 --top-k 50

# 查看模型信息
ollama show deepseek-coder
\`\`\`

### 硬件要求

| 模型 | 参数量 | 最低内存 | 推荐配置 |
|------|--------|---------|---------|
| Llama 2 7B | 7B | 8GB | 12GB+ |
| Llama 2 13B | 13B | 16GB | 24GB+ |
| Qwen 14B | 14B | 16GB | 24GB+ |
| DeepSeek 33B | 33B | 32GB | 48GB+ |

## 四、API调用

### 启动API服务

\`\`\`bash
# macOS/Linux
export OLLAMA_HOST=0.0.0.0
ollama serve

# API调用示例
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Why is the sky blue?"
}'
\`\`\`

### Python调用

\`\`\`python
import ollama

response = ollama.generate(
    model='llama2',
    prompt='Write a hello world program in Python'
)
print(response['response'])
\`\`\`

### OpenAI兼容API

\`\`\`python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # 任意字符串
)

response = client.chat.completions.create(
    model="llama2",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
\`\`\`

## 五、自定义模型

### 导入GGUF模型

\`\`\`bash
# 创建Modelfile
echo 'FROM ./my-model.gguf' > Modelfile

# 创建模型
ollama create my-model -f Modelfile

# 运行
ollama run my-model
\`\`\`

### Modelfile配置

\`\`\`
FROM llama2
PARAMETER temperature 0.8
PARAMETER top_p 0.9
SYSTEM """
You are a helpful assistant.
"""
\`\`\`

## 六、常见问题

**Q: 报错"No such file or directory"？**
A: 确保GPU驱动和CUDA正确安装（Linux）。

**Q: 速度很慢？**
A: 检查是否使用了GPU加速，或尝试更小的模型。

**Q: 如何同时运行多个模型？**
A: 启动多个ollama serve实例，或使用Docker容器隔离。`
  },

  // LM Studio - 本地LLM桌面应用
  {
    id: 'lm-studio-complete-guide',
    title: 'LM Studio本地LLM完整指南',
    category: 'regional_pricing',
    excerpt: 'LM Studio提供类ChatGPT界面，支持GGUF格式模型，GPU加速开箱即用。本文介绍安装配置和使用教程',
    toolIds: ['lm-studio'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['LM Studio', '本地部署', 'LLM', '桌面应用', 'GPU加速', 'GGUF'],
    rating: 4.7,
    ratingCount: 5600,
    viewCount: 72000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、LM Studio简介

LM Studio是一款本地LLM运行平台，提供类ChatGPT的图形界面，支持GGUF格式模型，GPU加速开箱即用，完全免费。

### 核心特点

- **图形界面**：类ChatGPT的友好界面
- **GGUF支持**：支持大多数开源模型格式
- **GPU加速**：NVIDIA/AMD/Apple Silicon
- **本地API**：提供OpenAI兼容的本地API
- **模型下载**：内置模型搜索和下载
- **跨平台**：macOS、Linux、Windows

## 二、安装部署

### 下载安装

1. 访问 lmstudio.ai
2. 下载对应平台版本
3. 安装并启动

### 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 内存 | 8GB | 16GB+ |
| 显卡 | 4GB显存 | 8GB+ |
| 硬盘 | 10GB | 20GB+ |

### GPU驱动

**NVIDIA**：安装CUDA驱动
**AMD**：安装ROCm（Linux/macOS）
**Apple Silicon**：原生支持

## 三、使用教程

### 下载模型

1. 点击左侧"Search"
2. 搜索模型名称（如：llama2、qwen）
3. 选择版本
4. 点击Download

### 对话界面

1. 顶部选择模型
2. 底部输入消息
3. 按Enter发送
4. 等待生成完成

### 参数调整

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| Temperature | 创造性 | 0.7 |
| Max Length | 最大长度 | 2048 |
| Top P | 采样 | 0.9 |
| GPU Layers | GPU卸载 | 越多越好 |

## 四、本地API

### 启动API服务器

1. 点击左侧"Server"
2. 选择模型
3. 点击"Start Server"
4. 默认地址：http://localhost:1234/v1

### API调用示例

\`\`\`python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:1234/v1",
    api_key="lm-studio"
)

response = client.chat.completions.create(
    model="llama2",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
\`\`\`

### curl调用

\`\`\`bash
curl http://localhost:1234/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
\`\`\`

## 五、模型获取

### 支持的模型格式

- GGUF（推荐）
- GPTQ
- AWQ
- GGML

### 推荐模型

| 模型 | 适用场景 | 硬件需求 |
|------|---------|---------|
| Llama 2 7B | 日常对话 | 8GB |
| Mistral 7B | 通用任务 | 8GB |
| Qwen 14B | 中文场景 | 16GB |
| DeepSeek 33B | 复杂任务 | 32GB |

### 模型下载来源

- Hugging Face
- The Bloke
- LM Studio内置搜索

## 六、与Ollama对比

| 特性 | LM Studio | Ollama |
|------|-----------|--------|
| 界面 | 图形界面 | 命令行 |
| API兼容 | OpenAI | OpenAI |
| 模型格式 | GGUF | 原生格式 |
| 操作难度 | 简单 | 中等 |
| 适用用户 | 普通用户 | 开发者 |`
  },

  // AnythingLLM - 本地RAG知识库
  {
    id: 'anything-llm-complete-guide',
    title: 'AnythingLLM本地RAG知识库完整指南',
    category: 'regional_pricing',
    excerpt: 'AnythingLLM是本地RAG知识库应用，构建私有AI知识助手，支持文档对话和知识库管理。本文介绍安装配置和使用',
    toolIds: ['anything-llm'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['AnythingLLM', '知识库', 'RAG', '本地部署', '文档问答', '私有化'],
    rating: 4.6,
    ratingCount: 3200,
    viewCount: 41000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、AnythingLLM简介

AnythingLLM是一款本地RAG知识库应用，可以构建私有AI知识助手，支持多文档对话、知识库管理、本地部署。

### 核心特点

- **多文档支持**：PDF、TXT、DOCX、Markdown等
- **向量数据库**：内置LanceDB
- **工作区隔离**：多项目分离
- **私有部署**：完全本地运行
- **多模型支持**：OpenAI、Claude、本地模型
- **API集成**：支持与现有系统集成

## 二、安装部署

### 下载安装

1. 访问 useanything.com
2. 下载对应平台版本
3. 安装并启动

### Docker安装

\`\`\`bash
docker pull mintplexlabs/anythingllm

docker run -d \\
  -p 3001:3001 \\
  -v ~/anything-llm:/app/storage \\
  mintplexlabs/anythingllm
\`\`\`

### 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 内存 | 8GB | 16GB+ |
| 显卡 | 4GB | 8GB+ |
| 硬盘 | 5GB | 20GB+ |

## 三、使用教程

### 创建工作区

1. 点击"New Workspace"
2. 输入工作区名称
3. 选择AI模型
4. 开始使用

### 上传文档

1. 进入工作区
2. 点击"Upload"
3. 选择文件或粘贴文本
4. 等待向量化完成

### 对话查询

1. 在输入框提问
2. 系统检索相关文档
3. AI基于文档生成回答
4. 查看引用的文档来源

## 四、配置说明

### AI模型配置

**使用本地Ollama**：
\`\`\`
Model Provider: Ollama
Base URL: http://localhost:11434
Model: llama2
Embedding: nomic-embed-text
\`\`\`

**使用DeepSeek**：
\`\`\`
Model Provider: OpenAI Compatible
Base URL: https://api.deepseek.com/v1
API Key: your-key
Model: deepseek-chat
\`\`\`

### 向量数据库

内置LanceDB，无需额外配置

### 嵌入模型

推荐使用：
- nomic-embed-text（本地）
- text-embedding-3-small（OpenAI）

## 五、应用场景

### 企业内部知识库

- 员工手册
- 产品文档
- 技术规范

### 研究资料管理

- 论文整理
- 学术文献
- 研究笔记

### 个人知识管理

- 阅读笔记
- 课程资料
- 项目文档

## 六、费用说明

AnythingLLM完全免费，但需要：
- 自备AI模型API或本地模型
- 自备服务器/电脑`
  },

  // DeepSeek - 便宜API的国产大模型
  {
    id: 'deepseek-api-payment',
    title: 'DeepSeek API充值和低成本使用完整指南',
    category: 'regional_pricing',
    excerpt: 'DeepSeek是70K+ Stars的国产开源大模型，API价格极低，数学和代码能力领先。本文介绍DeepSeek API充值和免费使用方式',
    toolIds: ['deepseek'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['DeepSeek', 'API', '充值', '便宜', '国产大模型', '代码能力'],
    rating: 4.7,
    ratingCount: 6800,
    viewCount: 88000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、DeepSeek简介

DeepSeek是国产开源大模型平台，GitHub 70K+ Stars。DeepSeek-Coder/DeepSeek-Math等模型在代码和数学领域表现优异，API价格仅为GPT-4的1%。

### 模型列表

| 模型 | 特点 | 适用场景 |
|------|------|---------|
| DeepSeek Chat | 对话生成 | 通用对话 |
| DeepSeek Coder | 代码专用 | 编程辅助 |
| DeepSeek Math | 数学专用 | 数学推理 |
| DeepSeek VL | 多模态 | 图文理解 |

### API定价

| 模型 | 输入 | 输出 | 备注 |
|------|------|------|------|
| DeepSeek Chat | ¥0.001/千tokens | ¥0.002/千tokens | 极低价格 |
| DeepSeek Coder | ¥0.001/千tokens | ¥0.002/千tokens | 代码能力强 |
| GPT-4 | ¥0.07/千tokens | ¥0.21/千tokens | 对比 |

## 二、API充值

### 充值方式

1. 访问 platform.deepseek.com
2. 注册账号
3. 进入控制台 → 充值
4. 支持支付宝/微信

### 充值金额

建议首次充值¥10-50，根据使用量选择

### API使用

\`\`\`python
from openai import OpenAI

client = OpenAI(
    api_key="your-deepseek-api-key",
    base_url="https://api.deepseek.com/v1"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
\`\`\`

## 三、免费使用

### 新用户赠送

DeepSeek赠送一定免费额度，新用户可使用

### 本地部署

DeepSeek开源模型可本地部署：

\`\`\`bash
# 使用Ollama
ollama run deepseek-coder
ollama run deepseek-math
\`\`\`

## 四、应用集成

### OpenClaw

\`\`\`yaml
agent:
  model: deepseek-chat
  api_key: your-key
  api_base: https://api.deepseek.com/v1
\`\`\`

### LangChain

\`\`\`python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="deepseek-chat",
    api_key="your-key",
    base_url="https://api.deepseek.com/v1"
)
\`\`\`

### CrewAI

\`\`\`python
import os
os.environ["OPENAI_API_KEY"] = "your-deepseek-key"
os.environ["OPENAI_API_BASE"] = "https://api.deepseek.com/v1"
\`\`\`

## 五、成本对比

| 模型 | 1M tokens成本 | 相对价格 |
|------|--------------|---------|
| GPT-4 | ¥280 | 基准 |
| GPT-3.5 | ¥14 | 5% |
| DeepSeek | ¥3 | 1% |

DeepSeek性价比极高，推荐作为主力模型。`
  },

  // Qwen - 通义千问
  {
    id: 'qwen-open-source-guide',
    title: 'Qwen通义千问开源模型完整指南',
    category: 'regional_pricing',
    excerpt: 'Qwen是阿里开源的大模型，Qwen2系列性能对标GPT-4，支持开源部署和API调用。本文介绍Qwen的使用和部署方式',
    toolIds: ['qwen'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Qwen', '通义千问', '阿里', '开源', '大模型', '中文优化'],
    rating: 4.6,
    ratingCount: 5200,
    viewCount: 65000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、Qwen简介

Qwen（通义千问）是阿里开发的大语言模型，Qwen2系列开源，性能对标GPT-4，在中文理解和代码生成方面表现优秀。

### 模型系列

| 模型 | 参数量 | 特点 |
|------|--------|------|
| Qwen 2 0.5B | 0.5B | 轻量级 |
| Qwen 2 1.5B | 1.5B | 轻量 |
| Qwen 2 7B | 7B | 主流 |
| Qwen 2 72B | 72B | 旗舰 |

## 二、使用方式

### 方式一：在线体验

访问：
- 通义千问：qwen.ai
- 阿里云百炼：bailian.console.aliyun.com

### 方式二：API调用

\`\`\`python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

response = client.chat.completions.create(
    model="qwen-plus",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
\`\`\`

### 方式三：本地部署

**使用Ollama**：
\`\`\`bash
ollama run qwen
\`\`\`

**使用Hugging Face**：
\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2-7B")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B")
\`\`\`

## 三、支付相关

### 在线API费用

| 模型 | 价格 | 说明 |
|------|------|------|
| qwen-turbo | ¥0.004/千tokens | 快速 |
| qwen-plus | ¥0.02/千tokens | 增强 |
| qwen-max | ¥0.12/千tokens | 旗舰 |

### 免费额度

阿里云百炼有新用户免费额度

### 本地部署

完全免费，只需准备硬件

## 四、硬件要求

| 模型 | 最低内存 | 推荐配置 |
|------|---------|---------|
| Qwen 2 7B | 16GB | 24GB+ |
| Qwen 2 72B | 128GB | 256GB+ |

## 五、应用场景

- 智能对话
- 文本生成
- 代码编写
- 知识问答
- 创意写作`
  },

  // ChatGLM - 清华智谱AI大模型
  {
    id: 'chatglm-open-source-guide',
    title: 'ChatGLM清华智谱AI完整指南',
    category: 'regional_pricing',
    excerpt: 'ChatGLM是清华智谱开发的千亿参数大模型，开源ChatGLM2-6B/GLM-4系列。本文介绍ChatGLM的使用和部署方式',
    toolIds: ['chatglm'],
    difficulty: 'medium',
    reliability: 'high',
    tags: ['ChatGLM', '清华', '开源', '大模型', '千亿参数', '中文'],
    rating: 4.5,
    ratingCount: 4800,
    viewCount: 58000,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z',
    content: `## 一、ChatGLM简介

ChatGLM是清华智谱AI开发的大语言模型，ChatGLM2-6B和GLM-4系列开源，中文理解能力强，高校背景深厚。

### 模型系列

| 模型 | 参数量 | 特点 |
|------|--------|------|
| ChatGLM2-6B | 6B | 开源轻量 |
| ChatGLM3-6B | 6B | 性能提升 |
| GLM-4 | 100B+ | 旗舰闭源 |
| GLM-4V | 多模态 | 图像理解 |

## 二、使用方式

### 方式一：在线体验

- 智谱AI：chatglm.cn
- 智谱AI开放平台：open.bigmodel.cn

### 方式二：API调用

\`\`\`python
from zhipuai import ZhipuAI

client = ZhipuAI(api_key="your-api-key")

response = client.chat.completions.create(
    model="glm-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
\`\`\`

### 方式三：开源模型

**使用Hugging Face**：
\`\`\`python
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("THUDM/chatglm2-6b", trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained("THUDM/chatglm2-6b", trust_remote_code=True)
\`\`\`

**使用Ollama**：
\`\`\`bash
ollama run chatglm
\`\`\`

## 三、支付相关

### GLM API定价

| 模型 | 输入 | 输出 |
|------|------|------|
| GLM-4 | ¥0.1/千tokens | ¥0.1/千tokens |
| GLM-3-Turbo | ¥0.001/千tokens | ¥0.001/千tokens |

### 免费额度

智谱AI开放平台有免费额度

### 本地部署

开源版本完全免费

## 四、硬件要求

| 模型 | 最低内存 | 推荐配置 |
|------|---------|---------|
| ChatGLM2-6B | 12GB | 16GB+ |
| ChatGLM3-6B | 12GB | 16GB+ |`
  },
  {
    id: 'perplexity-pro-student-discount-2026',
    title: 'Perplexity Pro 学生 50% 折扣指南（SheerID 验证）',
    category: 'regional_pricing',
    excerpt: 'Perplexity 官方为学生提供 50% Pro 折扣：月付 $10/月（正常 $20），年付可叠加折扣达 $50/年。需用 .edu/.ac 等学校邮箱或 SheerID 验证学生身份。覆盖美加澳等 181+ 国家。',
    toolIds: ['perplexity'],
    difficulty: 'easy',
    reliability: 'high',
    tags: ['Perplexity', '学生折扣', 'SheerID', '50%折扣', '.edu邮箱'],
    rating: 4.7,
    ratingCount: 8500,
    viewCount: 125000,
    createdAt: '2026-06-22T00:00:00Z',
    updatedAt: '2026-06-22T00:00:00Z',
    content: `## 一、Perplexity Pro 学生折扣概览

Perplexity 官方为学生提供 **50% Pro 折扣**，月付从 $20/月降到 **$10/月**。叠加年付优惠后，年付仅需 $50/年（正常 $200）。

来源：[Perplexity 官方学生页](https://www.perplexity.ai/students)、[SheerID 50% off 详情](https://shop.sheerid.com/offers/50-off-perplexity-pro-for-students-and-educators/)。

**支持国家**：美国、加拿大、澳大利亚 + 181 个国家（基本覆盖所有主要留学目的地）。

**不是免费**：注意这是折扣不是免费。Reddit 2026-02 用户反馈："用 .edu 邮箱验证后可 1 年 $50"——这是年付 $50 的叠加优惠。

## 二、申请流程

### 步骤 1：注册账号

访问 [perplexity.ai/students](https://www.perplexity.ai/students)，使用任意邮箱注册。

### 步骤 2：SheerID 验证学生身份

Perplexity 用 SheerID 验证学生身份，提供两种方式：

**方式 A：学校邮箱验证**
- 使用 .edu、.ac、.edu.cn、ac.uk 等公认教育域名邮箱
- 自动识别，无需上传材料
- 大多数国际学生用此方式

**方式 B：学生证/录取通知**
- 上传学生证照片（含姓名、学校、有效期）
- 或上传在读证明/录取通知
- 审核 1-3 个工作日

### 步骤 3：选择套餐

- **月付**：$10/月（原价 $20/月）
- **年付**：$50/年（原价 $200/年，等同于月付的 25%）

### 步骤 4：续费

折扣自动续费，但需每年重新验证学生身份。毕业后会切换到原价。

## 三、能拿到什么

### Pro 功能

- **GPT-4o、Claude 3.5 Sonnet、Sonar** 等高级模型选择
- **无限 Pro Search**（Copilot 引导式搜索）
- **每日 300+ 次专业搜索**
- **无限文件上传分析**（PDF、Word、Excel）
- **图像生成**（每月 50+ 张）

### 新增：Comet 浏览器

2026 年 6 月 Perplexity 与 Comet AI 浏览器合作，学生可获得 **Comet 折扣**（不是完全免费）。

## 四、不适合的人群

- 博士生在做敏感研究（涉及未发表论文、专利、医疗等）：Perplexity 会用你的查询改进模型，考虑用本地模型
- 学校在禁止 AI 工具名单上（少见，但有）：先查 [mi-to-ai 政策库](/policies)
- 已经在用免费 ChatGPT/Claude 够用：不一定需要 Pro

## 五、常见问题

**Q：折扣会一直续吗？**
A：会自动续费，但需每年重新验证学生身份。毕业后切换到原价。

**Q：没有 .edu 邮箱怎么办？**
A：用方式 B 上传学生证或录取通知。1-3 工作日审核。

**Q：能叠加 GitHub Student Pack 吗？**
A：可以。GitHub Student Pack 已经包含 Perplexity Pro 学生折扣（不同入口），不要再叠加 Perplexity 官方的。

**Q：学校邮箱不是 .edu 怎么办？**
A：可以用学校正式邮箱（如 student@your-university.edu.cn），只要 SheerID 能识别。或者用方式 B 上传材料。

**Q：能取消吗？**
A：随时取消，没有合同限制。

**Q：退款政策？**
A：Perplexity 30 天内不满意可全额退款。

## 六、替代方案

如果不符合 Perplexity 学生折扣条件：
- **ChatGPT Plus**：$20/月，无官方学生折扣
- **Claude Pro**：$20/月，无官方学生折扣（但有 GitHub Student Pack）
- **Gemini Advanced**：$20/月，**有 Google AI Student 免费试用 1 个月**
- **NotebookLM**：完全免费，Google 出品
- **DeepSeek V4-Pro**：API 输出 $0.87/百万 token，超级便宜

参考：[GitHub Student Developer Pack](https://education.github.com/pack)、[Google AI Student Plan](https://one.google.com/about/google-ai-premium/)。
`
  },
];

// Helper functions
export function getPaymentSolutionsByCategory(category: string): PaymentSolutionData[] {
  return paymentSolutionsData.filter(s => s.category === category);
}

export function getPaymentSolutionById(id: string): PaymentSolutionData | undefined {
  // First try exact match
  const exactMatch = paymentSolutionsData.find(s => s.id === id);
  if (exactMatch) return exactMatch;

  // Try slug-based match (e.g., 'depay-guide' -> 'depay-complete-guide')
  const slugLower = id.toLowerCase();
  return paymentSolutionsData.find(s =>
    s.id.toLowerCase().includes(slugLower) ||
    s.title.toLowerCase().replace(/\s+/g, '-').includes(slugLower)
  );
}

export function getRelatedSolutions(solution: PaymentSolutionData, limit: number = 3): PaymentSolutionData[] {
  // Get related solutions by same category, then by shared toolIds
  return paymentSolutionsData
    .filter(s => s.id !== solution.id)
    .map(s => ({
      ...s,
      relevanceScore: (
        (s.category === solution.category ? 3 : 0) +
        s.toolIds.filter(t => solution.toolIds.includes(t)).length * 2
      )
    }))
    .filter(s => s.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore || b.rating - a.rating)
    .slice(0, limit)
    .map(({ relevanceScore, ...s }) => s);
}

// Get solutions by tag
export function getSolutionsByTag(tag: string): PaymentSolutionData[] {
  return paymentSolutionsData.filter(s =>
    s.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

// Get all unique tags
export function getAllPaymentTags(): string[] {
  const tags = new Set<string>();
  paymentSolutionsData.forEach(s => s.tags.forEach(t => tags.add(t)));
  return [...tags].sort();
}

// Search solutions by keyword
export function searchPaymentSolutions(query: string): PaymentSolutionData[] {
  const lowerQuery = query.toLowerCase();
  return paymentSolutionsData.filter(s =>
    s.title.toLowerCase().includes(lowerQuery) ||
    s.excerpt.toLowerCase().includes(lowerQuery) ||
    s.content.toLowerCase().includes(lowerQuery) ||
    s.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

// Get popular solutions (by view count)
export function getPopularSolutions(limit: number = 5): PaymentSolutionData[] {
  return [...paymentSolutionsData]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

// Get latest solutions
export function getLatestSolutions(limit: number = 5): PaymentSolutionData[] {
  return [...paymentSolutionsData]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export const paymentCategories = [
  { value: 'virtual_card', label: '虚拟卡', icon: '💳', description: '虚拟信用卡服务，可绑定各种支付方式' },
  { value: 'gift_card', label: '礼品卡', icon: '🎁', description: '各大平台的礼品卡购买和使用教程' },
  { value: 'regional_pricing', label: '地区定价', icon: '🌍', description: '利用不同地区价格差异节省费用' },
  { value: 'troubleshooting', label: '问题解答', icon: '❓', description: '常见支付问题解决方案' },
];
