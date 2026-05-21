# SEO/GEO Schema 增强设计文档

> **版本:** v1.0 | **日期:** 2026-05-20 | **状态:** 待审批

---

## 1. 概述

### 1.1 目标
增强网站的 AI 搜索引擎优化（SEO）和生成式 AI 优化（GEO），添加以下功能：
1. **BreadcrumbList Schema** - 面包屑导航结构化数据
2. **Article Schema** - 文章/帖子结构化数据
3. **BLUF 结构** - TL;DR 摘要区块
4. **深度内容** - 扩展阅读和背景介绍

### 1.2 预期效果
- AI 爬虫引用率提升 60%
- FAQPage 在 AI Overviews 出现率提高 3.2 倍
- 详情页在 AI 搜索结果中排名提升

---

## 2. 技术方案

### 2.1 Layout.astro 增强

#### 2.1.1 Props 扩展
```typescript
interface Props {
  // 现有 props...
  breadcrumbs?: BreadcrumbItem[];  // 新增
  articleSchema?: ArticleSchema;   // 新增
}

interface BreadcrumbItem {
  position: number;  // 1-based
  name: string;
  url: string;
}

interface ArticleSchema {
  headline: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}
```

#### 2.1.2 Schema 注入逻辑
```astro
<!-- BreadcrumbList Schema -->
{breadcrumbs && breadcrumbs.length > 0 && (
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map(item => ({
      "@type": "ListItem",
      "position": item.position,
      "name": item.name,
      "item": item.url
    }))
  })} />
)}

<!-- Article Schema -->
{articleSchema && (
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": articleSchema.headline,
    "author": { "@type": "Person", "name": articleSchema.author || "MI TO AI" },
    "datePublished": articleSchema.datePublished,
    "dateModified": articleSchema.dateModified,
    "image": articleSchema.image,
    "publisher": {
      "@type": "Organization",
      "name": "MI TO AI",
      "url": Astro.site?.toString()
    }
  })} />
)}
```

---

### 2.2 BLUF 结构组件

#### 2.2.1 BlufSummary.astro 组件
```astro
---
interface Props {
  title?: string;  // 默认: "TL;DR"
  points: string[];
  locale: 'zh' | 'en';
}

const { title, points, locale } = Astro.props;
const defaultTitle = locale === 'zh' ? 'TL;DR 摘要' : 'TL;DR Summary';
---

<div class="bluf-container">
  <div class="bluf-header">
    <span class="bluf-icon">📌</span>
    <h3>{title || defaultTitle}</h3>
  </div>
  <ul class="bluf-points">
    {points.map(point => <li>{point}</li>)}
  </ul>
</div>
```

#### 2.2.2 样式设计
```css
.bluf-container {
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.bluf-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #1e40af;
}

.bluf-points {
  padding-left: 1.5rem;
}

.bluf-points li {
  margin-bottom: 0.5rem;
  color: #374151;
}
```

---

### 2.3 深度内容区块

#### 2.3.1 DeepContent.astro 组件
```astro
---
interface Props {
  title: string;
  content: string;
  locale: 'zh' | 'en';
}
---

<section class="deep-content">
  <h3>{title}</h3>
  <div class="prose">
    <slot />
  </div>
</section>
```

---

## 3. 页面改造清单

### 3.1 policies/[id].astro

| 改动项 | 说明 |
|--------|------|
| 添加 breadcrumbs prop | 首页 > 政策列表 > 大学名称 |
| 添加 TL;DR 区块 | 提取政策要点：允许/禁止/限制工具列表 |
| 添加扩展阅读区块 | 500字背景介绍 |

### 3.2 survival/[id].astro

| 改动项 | 说明 |
|--------|------|
| 添加 breadcrumbs prop | 首页 > 防坑指南 > 分类 > 标题 |
| 添加 Article Schema | headline, author, datePublished |
| 添加 TL;DR 区块 | 3-5 个防坑要点 |
| 添加扩展阅读区块 | 相关资源链接 |

### 3.3 prompts/[id].astro

| 改动项 | 说明 |
|--------|------|
| 添加 breadcrumbs prop | 首页 > 模板 > 分类 > 标题 |
| 增强 CreativeWork Schema | 添加 author, datePublished |

### 3.4 questions/[id].astro

| 改动项 | 说明 |
|--------|------|
| 添加 breadcrumbs prop | 首页 > 问答 > 问题标题 |
| 添加 Article Schema | Q&A 作为 Article |

### 3.5 offers/[id].astro

| 改动项 | 说明 |
|--------|------|
| 添加 breadcrumbs prop | 首页 > Offers > 标题 |
| 添加 TL;DR 区块 | Offer 核心信息 |

### 3.6 community/[id].astro

| 改动项 | 说明 |
|--------|------|
| 添加 breadcrumbs prop | 首页 > 社区 > 帖子标题 |
| 添加 Article Schema | headline, author, datePublished |

---

## 4. 内容策略

### 4.1 TL;DR 摘要生成规则

**政策页面:**
1. 总体政策（允许/限制/禁止）
2. 允许使用的 AI 工具（最多 3 个）
3. 关键要求（引用/披露）
4. 违规后果

**生存指南页面:**
1. 核心问题
2. 主要解决方案
3. 注意事项
4. 相关资源

**Prompt 模板页面:**
1. 模板用途
2. 适用场景
3. 使用技巧

### 4.2 深度内容字数要求

| 页面类型 | 最少字数 | 推荐字数 |
|----------|----------|----------|
| 政策详情 | 800 | 1500 |
| 生存指南 | 1000 | 2000 |
| Prompt 模板 | 500 | 800 |

---

## 5. 实现顺序

1. **Phase 1: Schema 基础设施**
   - Layout.astro 增强
   - BreadcrumbList Schema 组件

2. **Phase 2: Article Schema**
   - community/[id].astro
   - survival/[id].astro

3. **Phase 3: BLUF + 深度内容**
   - TL;DR 组件开发
   - 各页面 TL;DR 添加
   - 扩展阅读区块添加

---

## 6. 测试验证

### 6.1 Schema 验证
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

### 6.2 SEO 效果追踪
- Google Search Console 结构化数据报告
- AI 搜索引用率监控

---

## 7. 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Schema 语法错误 | 低 | 高 | 严格类型检查 + 测试验证 |
| 内容重复 | 中 | 低 | canonical URL 正确设置 |
| 性能影响 | 低 | 低 | Schema 内联，不额外请求 |

---

_Last updated: 2026-05-20_
