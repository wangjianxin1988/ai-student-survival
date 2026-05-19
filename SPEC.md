# AI留学生存指南 - MVP开发规范

> 版本: v1.0 | 日期: 2026-05-16 | 状态: 开发中

---

## 一、项目概述

### 1.1 项目定位
服务中国留学生的AI Native网站，解决四大痛点：
1. 不知道用什么AI工具
2. 支付困难
3. 不了解大学AI政策
4. 不会写Prompt

### 1.2 MVP范围 (第一阶段 4-6周)

| 模块 | 功能 | 工期 |
|------|------|------|
| 项目初始化 | Astro + TailwindCSS + 部署 | 1周 |
| AI工具库 | 列表 + 详情 + 筛选 + 搜索 | 2周 |
| 支付解决方案 | 分类页 + 文章页 + 虚拟卡教程 | 1.5周 |
| 大学政策库 | 列表 + 详情 + 搜索 | 1周 |
| AI Native基础 | Schema.org + robots.txt + API + SEO | 0.5周 |

---

## 二、技术架构

### 2.1 技术栈
| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Astro 4.x + React 18 | Islands架构 |
| 样式 | TailwindCSS | 原子化CSS |
| 内容管理 | TinaCMS | Git-based |
| 部署 | Cloudflare Pages | 边缘加速 |
| 数据库 | Supabase | PostgreSQL + 实时 |
| AI服务 | Claude API | 内置AI功能 |
| 搜索 | Typesense | 全文搜索 |

### 2.2 目录结构
```
ai-student-survival/
├── src/
│   ├── components/       # React组件
│   │   ├── tools/       # AI工具相关
│   │   ├── payment/    # 支付相关
│   │   ├── policies/   # 政策相关
│   │   └── common/     # 通用组件
│   ├── layouts/        # 布局
│   ├── pages/          # 页面
│   │   ├── index.astro
│   │   ├── tools/
│   │   ├── payment/
│   │   ├── policies/
│   │   └── api/        # API路由
│   ├── lib/            # 工具函数
│   │   ├── supabase.ts
│   │   └── typesense.ts
│   └── styles/         # 全局样式
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── content/            # TinaCMS内容
├── supabase/           # 数据库Schema
├── tests/
├── package.json
├── astro.config.mjs
├── tailwind.config.mjs
└── README.md
```

---

## 三、数据模型

### 3.1 AI工具 (Tool)
```typescript
interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'writing' | 'coding' | 'design' | 'research' | 'communication';
  subcategory: string;
  pricing: 'free' | 'freemium' | 'paid';
  priceDetail: {
    monthly?: number;
    yearly?: number;
    currency: string;
  };
  url: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  dimensions: {
    easeOfUse: number;
    features: number;
    value: number;
  };
  tags: string[];
  features: string[];
  alternatives: string[];
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 支付解决方案 (PaymentSolution)
```typescript
interface PaymentSolution {
  id: string;
  title: string;
  category: 'virtual_card' | 'gift_card' | 'regional_pricing' | 'troubleshooting';
  content: string; // markdown
  toolIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  reliability: 'high' | 'medium' | 'low';
  tags: string[];
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 大学政策 (UniversityPolicy)
```typescript
interface UniversityPolicy {
  id: string;
  universityName: string;
  country: string;
  region: string;
  teachingPolicy: string;
  assignmentPolicy: string;
  researchPolicy: string;
  prohibitedTools: string[];
  allowedTools: string[];
  penalty: string;
  lastUpdated: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 四、AI Native要求

### 4.1 Schema.org结构化数据
每个页面必须包含JSON-LD，示例:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ChatGPT",
  "applicationCategory": "BusinessApplication",
  "offers": { "price": "20", "priceCurrency": "USD" }
}
```

### 4.2 API端点
| 端点 | 方法 | 说明 |
|------|------|------|
| /api/tools | GET | 工具列表 |
| /api/tools/[slug] | GET | 工具详情 |
| /api/payment-solutions | GET | 支付方案列表 |
| /api/policies | GET | 政策列表 |

### 4.3 robots.txt
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Claude
Allow: /

Sitemap: https://[domain]/sitemap.xml
```

---

## 五、SEO要求

### 5.1 Meta标签
每个页面必须有:
- `<title>` - 独特描述性标题
- `<meta name="description">` - 150字符内
- `<meta name="keywords">` - 逗号分隔

### 5.2 结构化数据
- Schema.org JSON-LD
- Open Graph
- Twitter Cards

### 5.3 Sitemap
- /sitemap.xml
- 包含所有页面URL

---

## 六、质量门槛

| 指标 | 门槛 |
|------|------|
| 功能 | 核心功能100%可用 |
| 性能 | 首屏<3s, LCP<2.5s |
| SEO | 核心关键词可搜索 |
| AI爬虫 | GPTBot/CCBot/Claude可抓取 |
| 代码 | ESLint/Prettier 0错误 |

---

## 七、交付物

1. 可访问的网站 (Cloudflare Pages)
2. Git仓库 (GitHub/GitLab)
3. README.md (快速开始)
4. API.md (接口文档)
5. 初始数据 (≥20个工具, ≥10个支付方案, ≥10个大学政策)

---

## 八、更新日志

### v1.1 (2026-05-18)

#### 问题修复

| 问题 | 描述 | 修复内容 |
|------|------|---------|
| #17 | 支付解决方案教程详情页添加相关教程链接 | 在侧边栏添加防坑指南链接区块 |
| #18 | 留学生问答社区浏览更多功能完善 | 添加AI工具库、防坑指南、大学政策、Offers、Prompt模板链接 |
| #19 | 大学政策页面学校太少 | 添加复旦大学、上海交通大学、浙江大学等中国名校政策 |
| #20 | 大学详情页缺少到地图、防坑、offer、问答的链接 | 在快捷操作区添加5个链接按钮 |
| #21 | 大学详情页政策更新提醒功能开发 | 实现订阅功能、localStorage存储、浏览器通知 |
| #22 | 地图页面大学与政策页面学校对应 | 扩充universities列表至45所，匹配policies.ts |
| #23 | 地图页面添加标签和标记功能（根据积分） | 添加用户等级标签、积分权限提示 |
| #24 | 地图页面设施类型标签太少 | CATEGORY_ICONS已有24个类别，覆盖全面 |
