# SEO/GEO Schema Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add BreadcrumbList Schema, Article Schema, BLUF TL;DR components, and deep content to improve AI search visibility.

**Architecture:** Layout.astro unified Schema injection with new breadcrumbs/articleSchema props, new BlufSummary component, and deep content sections.

**Tech Stack:** Astro, TypeScript, TailwindCSS

---

## File Structure

```
src/
├── layouts/
│   └── Layout.astro                    [MODIFY] Add breadcrumbs/articleSchema props
├── components/
│   └── seo/
│       ├── BlufSummary.astro           [CREATE] TL;DR summary component
│       └── DeepContent.astro           [CREATE] Deep content section
├── pages/
│   ├── policies/
│   │   └── [id].astro                 [MODIFY] Add Schema + BLUF
│   ├── survival/
│   │   └── [id].astro                 [MODIFY] Add Schema + BLUF
│   ├── prompts/
│   │   └── [id].astro                 [MODIFY] Add breadcrumbs prop
│   ├── questions/
│   │   └── [id].astro                 [MODIFY] Add breadcrumbs prop
│   ├── offers/
│   │   └── [id].astro                 [MODIFY] Add Schema + BLUF
│   └── community/
│       └── [id].astro                 [MODIFY] Add Schema + BLUF
```

---

## Tasks

### Task 1: Layout.astro Schema Infrastructure

**Files:**
- Modify: `src/layouts/Layout.astro:1-50`
- Test: `src/pages/policies/[id].astro`

- [ ] **Step 1: Read current Layout.astro**

Read `src/layouts/Layout.astro` lines 1-50 to understand current Props interface.

- [ ] **Step 2: Extend Props interface**

Add these types and props to the frontmatter:

```astro
---
// ... existing imports

interface BreadcrumbItem {
  position: number;
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

interface Props {
  // ... existing props
  breadcrumbs?: BreadcrumbItem[];   // ADD
  articleSchema?: ArticleSchema;     // ADD
}

const {
  // ... existing destructuring
  breadcrumbs,
  articleSchema,
} = Astro.props;
```

- [ ] **Step 3: Add Schema injection before closing </head>**

Add this after line 92 (after existing jsonLd script):

```astro
<!-- BreadcrumbList Schema -->
{breadcrumbs && breadcrumbs.length > 0 && (
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item: BreadcrumbItem) => ({
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

- [ ] **Step 4: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/layouts/Layout.astro
git commit -m "feat(seo): add breadcrumbs and articleSchema props to Layout"
```

---

### Task 2: Create BlufSummary Component

**Files:**
- Create: `src/components/seo/BlufSummary.astro`
- Test: `src/pages/policies/[id].astro`

- [ ] **Step 1: Create BlufSummary.astro**

Create file `src/components/seo/BlufSummary.astro`:

```astro
---
interface Props {
  title?: string;
  points: string[];
  locale: 'zh' | 'en';
}

const { title, points, locale } = Astro.props;
const defaultTitle = locale === 'zh' ? 'TL;DR 摘要' : 'TL;DR Summary';
---

<div class="bluf-container my-6">
  <div class="bluf-header">
    <span class="text-xl">📌</span>
    <h3 class="text-lg font-semibold text-blue-800">{title || defaultTitle}</h3>
  </div>
  <ul class="bluf-points space-y-2 mt-3">
    {points.map(point => (
      <li class="flex items-start gap-2 text-gray-700">
        <span class="text-green-500 mt-0.5">✓</span>
        <span>{point}</span>
      </li>
    ))}
  </ul>
</div>

<style>
  .bluf-container {
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border: 1px solid #dbeafe;
    border-radius: 12px;
    padding: 1.25rem;
  }

  .bluf-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .bluf-points {
    padding-left: 1.25rem;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/components/seo/BlufSummary.astro
git commit -m "feat(seo): create BlufSummary TL;DR component"
```

---

### Task 3: Create DeepContent Component

**Files:**
- Create: `src/components/seo/DeepContent.astro`
- Test: `src/pages/survival/[id].astro`

- [ ] **Step 1: Create DeepContent.astro**

Create file `src/components/seo/DeepContent.astro`:

```astro
---
interface Props {
  title: string;
  locale: 'zh' | 'en';
}

const { title, locale } = Astro.props;
---

<section class="deep-content-section my-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <span class="text-purple-500">📖</span>
    {title}
  </h3>
  <div class="prose prose-gray max-w-none">
    <slot />
  </div>
</section>

<style>
  .deep-content-section h4 {
    @apply text-lg font-semibold text-gray-800 mt-6 mb-3;
  }

  .deep-content-section p {
    @apply text-gray-600 leading-relaxed mb-4;
  }

  .deep-content-section ul {
    @apply list-disc pl-6 mb-4 space-y-2;
  }

  .deep-content-section li {
    @apply text-gray-600;
  }

  .deep-content-section strong {
    @apply text-gray-900;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/components/seo/DeepContent.astro
git commit -m "feat(seo): create DeepContent section component"
```

---

### Task 4: Update policies/[id].astro with Schema + BLUF

**Files:**
- Modify: `src/pages/policies/[id].astro:1-70`
- Test: Build check

- [ ] **Step 1: Read current file**

Read `src/pages/policies/[id].astro` lines 1-70.

- [ ] **Step 2: Import BlufSummary component**

Add import after line 14:

```astro
import BlufSummary from '@/components/seo/BlufSummary.astro';
```

- [ ] **Step 3: Add breadcrumbs data**

Add after line 33 (after jsonLd definition):

```astro
// Breadcrumbs for Schema
const breadcrumbs = [
  { position: 1, name: locale === 'en' ? 'Home' : '首页', url: locale === 'en' ? 'https://mi-to-ai.com/en/' : 'https://mi-to-ai.com/' },
  { position: 2, name: locale === 'en' ? 'Policies' : '大学政策', url: locale === 'en' ? 'https://mi-to-ai.com/en/policies' : 'https://mi-to-ai.com/policies' },
  { position: 3, name: policy.universityName, url: Astro.url.href }
];

// Article Schema for policies
const articleSchema = {
  headline: `${policy.universityName} AI ${locale === 'en' ? 'Policy' : '政策'}`,
  dateModified: policy.lastUpdated
};

// BLUF Points - extract key policy points
const blufPoints = [
  policy.overallPolicy === 'allowed'
    ? (locale === 'en' ? '✅ AI tools are allowed' : '✅ 该校允许使用 AI 工具')
    : policy.overallPolicy === 'restricted'
    ? (locale === 'en' ? '⚠️ AI tools have restrictions' : '⚠️ 该校对 AI 工具有限制')
    : (locale === 'en' ? '❌ Most AI tools are prohibited' : '❌ 大多数 AI 工具被禁止使用'),
  policy.allowedTools.length > 0
    ? (locale === 'en'
      ? `✅ Allowed: ${policy.allowedTools.slice(0, 3).join(', ')}`
      : `✅ 允许使用: ${policy.allowedTools.slice(0, 3).join(', ')}`)
    : (locale === 'en' ? 'No tools explicitly allowed' : '无明确允许的工具'),
  locale === 'en'
    ? `📋 Citation required: ${policy.citationRequirement.substring(0, 50)}...`
    : `📋 引用要求: ${policy.citationRequirement.substring(0, 30)}...`,
  policy.penalty !== 'None specified'
    ? (locale === 'en'
      ? `⚠️ Violation penalty: ${policy.penalty}`
      : `⚠️ 违规处罚: ${policy.penalty}`)
    : null
].filter(Boolean) as string[];
```

- [ ] **Step 4: Update Layout props**

Modify the Layout component call (around line 129):

```astro
<Layout
  title={`${policy.universityName} AI ${locale === 'en' ? 'Policy' : '政策'}`}
  description={`${locale === 'en' ? 'View' : '查看'}${policy.universityName}${locale === 'en' ? "'s AI usage policy" : '的AI使用政策'}`}
  jsonLd={jsonLd}
  locale={locale}
  breadcrumbs={breadcrumbs}
  articleSchema={articleSchema}
>
```

- [ ] **Step 5: Add BLUF component after breadcrumb nav**

Find the breadcrumb section and add BlufSummary after it:

```astro
<!-- After the breadcrumb nav (after line 149) -->
<BlufSummary points={blufPoints} locale={locale} />
```

- [ ] **Step 6: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/pages/policies/[id].astro
git commit -m "feat(seo): add breadcrumbs, article schema, and BLUF to policy detail"
```

---

### Task 5: Update survival/[id].astro with Schema + BLUF

**Files:**
- Modify: `src/pages/survival/[id].astro`
- Test: Build check

- [ ] **Step 1: Read survival/[id].astro**

Read full file to understand its structure.

- [ ] **Step 2: Update Layout with breadcrumbs**

Since survival/[id].astro uses SurvivalDetailClient React component, we need to:
1. Add breadcrumbs prop to Layout
2. The BLUF will be handled inside SurvivalDetailClient

Add to Layout call:

```astro
<Layout
  title={locale === 'zh' ? '指南详情' : 'Guide Details'}
  description={locale === 'zh' ? '查看防坑防骗指南详情' : 'View survival guide details'}
  breadcrumbs={[
    { position: 1, name: locale === 'zh' ? '首页' : 'Home', url: locale === 'zh' ? 'https://mi-to-ai.com/' : 'https://mi-to-ai.com/en/' },
    { position: 2, name: locale === 'zh' ? '防坑指南' : 'Survival Guides', url: locale === 'zh' ? 'https://mi-to-ai.com/survival' : 'https://mi-to-ai.com/en/survival' },
    { position: 3, name: 'Guide Details', url: Astro.url.href }
  ]}
  articleSchema={{
    headline: locale === 'zh' ? '生存指南详情' : 'Survival Guide',
    dateModified: new Date().toISOString().split('T')[0]
  }}
>
```

- [ ] **Step 3: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/pages/survival/[id].astro
git commit -m "feat(seo): add breadcrumbs and article schema to survival detail"
```

---

### Task 6: Update prompts/[id].astro with breadcrumbs

**Files:**
- Modify: `src/pages/prompts/[id].astro:1-60`
- Test: Build check

- [ ] **Step 1: Add breadcrumbs prop**

After line 46 (after jsonLd), add:

```astro
// Breadcrumbs
const breadcrumbs = [
  { position: 1, name: locale === 'zh' ? '首页' : 'Home', url: locale === 'zh' ? 'https://mi-to-ai.com/' : 'https://mi-to-ai.com/en/' },
  { position: 2, name: locale === 'zh' ? 'Prompt模板' : 'Prompts', url: locale === 'zh' ? 'https://mi-to-ai.com/prompts' : 'https://mi-to-ai.com/en/prompts' },
  { position: 3, name: template.title, url: Astro.url.href }
];
```

- [ ] **Step 2: Update Layout call**

Update Layout call (around line 49):

```astro
<Layout
  title={`${template.title} - Prompt模板`}
  description={template.description}
  jsonLd={jsonLd}
  locale={locale}
  breadcrumbs={breadcrumbs}
>
```

- [ ] **Step 3: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/pages/prompts/[id].astro
git commit -m "feat(seo): add breadcrumbs to prompt detail page"
```

---

### Task 7: Update questions/[id].astro with breadcrumbs

**Files:**
- Modify: `src/pages/questions/[id].astro`
- Test: Build check

- [ ] **Step 1: Read questions/[id].astro**

- [ ] **Step 2: Add breadcrumbs and article schema**

Find the Layout call and add:

```astro
// Breadcrumbs
const breadcrumbs = [
  { position: 1, name: locale === 'zh' ? '首页' : 'Home', url: locale === 'zh' ? 'https://mi-to-ai.com/' : 'https://mi-to-ai.com/en/' },
  { position: 2, name: locale === 'zh' ? '问答' : 'Questions', url: locale === 'zh' ? 'https://mi-to-ai.com/questions' : 'https://mi-to-ai.com/en/questions' },
  { position: 3, name: 'Q&A', url: Astro.url.href }
];

const articleSchema = {
  headline: 'Question Detail',
  dateModified: new Date().toISOString().split('T')[0]
};
```

- [ ] **Step 3: Update Layout call**

Add `breadcrumbs={breadcrumbs}` and `articleSchema={articleSchema}` props.

- [ ] **Step 4: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/pages/questions/[id].astro
git commit -m "feat(seo): add breadcrumbs and article schema to question detail"
```

---

### Task 8: Update offers/[id].astro with Schema + BLUF

**Files:**
- Modify: `src/pages/offers/[id].astro`
- Test: Build check

- [ ] **Step 1: Read offers/[id].astro**

- [ ] **Step 2: Add breadcrumbs and article schema**

Add similar pattern as other detail pages:

```astro
// Breadcrumbs
const breadcrumbs = [
  { position: 1, name: locale === 'zh' ? '首页' : 'Home', url: locale === 'zh' ? 'https://mi-to-ai.com/' : 'https://mi-to-ai.com/en/' },
  { position: 2, name: locale === 'zh' ? 'Offers' : 'Offers', url: locale === 'zh' ? 'https://mi-to-ai.com/offers' : 'https://mi-to-ai.com/en/offers' },
  { position: 3, name: offer.title, url: Astro.url.href }
];
```

- [ ] **Step 3: Add BLUF points**

```astro
const blufPoints = [
  locale === 'zh' ? `🎁 Offer: ${offer.discount || offer.benefit}` : `🎁 Offer: ${offer.discount || offer.benefit}`,
  offer.expiryDate ? (locale === 'zh' ? `⏰ 有效期至: ${offer.expiryDate}` : `⏰ Valid until: ${offer.expiryDate}`) : null,
  offer.code ? (locale === 'zh' ? `🔑 优惠码: ${offer.code}` : `🔑 Code: ${offer.code}`) : null
].filter(Boolean) as string[];
```

- [ ] **Step 4: Update Layout and add BlufSummary**

Add breadcrumbs to Layout, import and add BlufSummary.

- [ ] **Step 5: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/pages/offers/[id].astro
git commit -m "feat(seo): add breadcrumbs, article schema, and BLUF to offer detail"
```

---

### Task 9: Update community/[id].astro with Schema + BLUF

**Files:**
- Modify: `src/pages/community/[id].astro`
- Test: Build check

- [ ] **Step 1: Read community/[id].astro**

- [ ] **Step 2: Add breadcrumbs and article schema**

```astro
// Breadcrumbs
const breadcrumbs = [
  { position: 1, name: '首页', url: 'https://mi-to-ai.com/' },
  { position: 2, name: '社区', url: 'https://mi-to-ai.com/community' },
  { position: 3, name: '帖子', url: Astro.url.href }
];

const articleSchema = {
  headline: 'Community Post',
  dateModified: new Date().toISOString().split('T')[0]
};
```

- [ ] **Step 3: Update Layout and add BlufSummary**

- [ ] **Step 4: Commit**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/pages/community/[id].astro
git commit -m "feat(seo): add breadcrumbs, article schema, and BLUF to community post"
```

---

### Task 10: Build Verification

**Files:**
- Test: `src/layouts/Layout.astro`

- [ ] **Step 1: Run build**

```bash
cd D:/suoyouxiangmu/ai-student-survival
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Test locally**

```bash
pnpm dev
```

Verify pages load correctly with new Schema.

---

### Task 11: Schema Validation

**Files:**
- Test: Online validation tools

- [ ] **Step 1: Validate with Google Rich Results Test**

Visit: https://search.google.com/test/rich-results

Test these URLs:
- /policies/mit (or any policy detail)
- /survival/[id]
- /prompts/[id]
- /faq

Expected: All Schema types detected correctly.

- [ ] **Step 2: Commit final changes**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git push origin main
```

---

## Summary

| Task | File | Schema Added |
|------|------|--------------|
| 1 | Layout.astro | ✅ Infrastructure |
| 2 | BlufSummary.astro | ✅ Component |
| 3 | DeepContent.astro | ✅ Component |
| 4 | policies/[id].astro | ✅ BreadcrumbList + Article + BLUF |
| 5 | survival/[id].astro | ✅ BreadcrumbList + Article |
| 6 | prompts/[id].astro | ✅ BreadcrumbList |
| 7 | questions/[id].astro | ✅ BreadcrumbList + Article |
| 8 | offers/[id].astro | ✅ BreadcrumbList + Article + BLUF |
| 9 | community/[id].astro | ✅ BreadcrumbList + Article + BLUF |
| 10-11 | Build + Validation | ✅ |
