# 社区帖子分类发布与自动推送系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户发帖时选择分类并填写对应表单，热度达标后自动推送到目标板块详情页；支持积分直接发布。

**Architecture:** 基于现有CommunityPost结构扩展，添加推送相关字段；新增热度计算服务和积分直接发布API；PostEditor已有分类表单组件，需确保字段完整。

**Tech Stack:** Astro + React + TypeScript + Supabase

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/lib/community/types.ts` | 扩展CommunityPost类型 |
| `src/lib/auto-promote/service.ts` | 热度计算和推送逻辑 |
| `src/lib/points/config.ts` | 积分配置（添加直接发布费用） |
| `src/components/community/PostEditor.tsx` | 表单组件（已存在，需扩展） |
| `src/components/community/PostDetail.tsx` | 帖子详情（显示推送状态） |
| `src/pages/api/community/promote.ts` | 直接发布API |
| `src/pages/api/community/boost.ts` | 热门加速API |
| `src/pages/api/community/points-balance.ts` | 查询积分余额API |
| `src/i18n/zh.json` | 中文翻译 |
| `src/i18n/en.json` | 英文翻译 |

---

## Task 1: 扩展 CommunityPost 类型

**Files:**
- Modify: `src/lib/community/types.ts`

**Steps:**

- [ ] **Step 1: 添加推送相关字段到 CommunityPost**

```typescript
// 在 CommunityPost 接口中添加以下字段（位于 autoPromoteReason 之后）
// 直接发布相关
directPublishRequested?: boolean;      // 是否申请过直接发布
directPublishCost?: number;            // 直接发布消耗积分
isHotBoost?: boolean;                 // 是否热门加速
hotBoostExpiresAt?: string;           // 热门加速过期时间
promoteSource?: 'auto' | 'points';   // 推送来源
promoteScore?: number;                // 推送时的热度评分
```

- [ ] **Step 2: 添加 CATEGORY_CONFIG 配置**

```typescript
// 在 CATEGORY_LABELS 之后添加
export const CATEGORY_CONFIG: Record<CommunityCategory, {
  path: string;
  requireMeta: boolean;
  promotionThreshold: { likes: number; comments: number; favorites: number };
}> = {
  tools: { path: '/tools', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  payment: { path: '/payment', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  policy: { path: '/policies', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  prompt: { path: '/prompts', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  survival: { path: '/survival', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  discussion: { path: '/community', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  qa: { path: '/community', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
};
```

- [ ] **Step 3: 添加热度计算函数类型**

```typescript
// 在文件末尾添加
export interface PromotionCheckResult {
  canPromote: boolean;
  score: number;
  threshold: number;
  details: {
    likes: number;
    comments: number;
    favorites: number;
    postAgeHours: number;
  };
}

export function calculatePromotionScore(post: CommunityPost): number {
  return post.likesCount * 1 + post.commentsCount * 2 + post.favoritesCount * 3;
}

export function checkPromotionEligibility(post: CommunityPost): PromotionCheckResult {
  const score = calculatePromotionScore(post);
  const threshold = 10; // likes*1 + comments*2 + favorites*3 >= 10
  const postAgeHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);

  return {
    canPromote: score >= threshold && postAgeHours <= 72,
    score,
    threshold,
    details: {
      likes: post.likesCount,
      comments: post.commentsCount,
      favorites: post.favoritesCount,
      postAgeHours,
    },
  };
}
```

- [ ] **Step 4: 提交代码**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/lib/community/types.ts
git commit -m "feat(community): extend CommunityPost with promotion fields and scoring functions"
```

---

## Task 2: 更新积分配置

**Files:**
- Modify: `src/lib/points/config.ts`

**Steps:**

- [ ] **Step 1: 添加直接发布相关积分动作**

```typescript
// 在 ACTIONS 对象中添加以下字段（位于 POST_PINNED 之后）
DIRECT_PUBLISH: -50,          // 直接发布到目标板块
HOT_BOOST: -20,             // 24小时热门加速
```

- [ ] **Step 2: 在 POINTS_CONFIG 中添加注释说明**

```typescript
// 在 ACTIONS 配置注释中添加
// 直接发布相关
DIRECT_PUBLISH: -50,          // 直接发布到目标板块（跳过热度等待）
HOT_BOOST: -20,             // 24小时热门加速（额外首页曝光）
```

- [ ] **Step 3: 提交代码**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/lib/points/config.ts
git commit -m "feat(points): add direct publish and hot boost point costs"
```

---

## Task 3: 更新自动推送服务

**Files:**
- Modify: `src/lib/auto-promote/service.ts`

**Steps:**

- [ ] **Step 1: 添加新的推送检查函数**

```typescript
// 在文件末尾添加

import { calculatePromotionScore, checkPromotionEligibility, type PromotionCheckResult } from '@/lib/community/types';

// 检查所有待推送帖子
export async function checkAllPendingPromotions(): Promise<void> {
  // 获取所有未推送的帖子（发布72小时内的）
  const cutoffTime = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('auto_promoted', false)
    .eq('status', 'published')
    .gte('created_at', cutoffTime);

  if (error || !posts) {
    console.error('Error fetching posts for auto-promote:', error);
    return;
  }

  for (const post of posts) {
    const communityPost = mapToCommunityPost(post);
    const result = checkPromotionEligibility(communityPost);

    if (result.canPromote) {
      await executePromotion(post.id, 'auto', result.score);
    }
  }
}

// 执行推送
export async function executePromotion(
  postId: string,
  source: 'auto' | 'points',
  score: number
): Promise<boolean> {
  // 获取帖子
  const { data: post, error } = await supabase
    .from('community_posts')
    .select('category')
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error('Error fetching post for promotion:', error);
    return false;
  }

  const updateData = {
    auto_promoted: true,
    promote_source: source,
    promote_score: score,
    promoted_to_category: post.category,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from('community_posts')
    .update(updateData)
    .eq('id', postId);

  if (updateError) {
    console.error('Error promoting post:', updateError);
    return false;
  }

  return true;
}

// 辅助函数：数据库记录映射到 CommunityPost
function mapToCommunityPost(post: Record<string, unknown>): CommunityPost {
  return {
    id: post.id as string,
    userId: post.user_id as string,
    userName: post.user_name as string || '',
    userAvatar: post.user_avatar as string || '',
    title: post.title as string,
    content: post.content as string,
    excerpt: post.excerpt as string | undefined,
    category: post.category as CommunityCategory,
    tags: post.tags as string[] || [],
    images: post.images as string[] || [],
    likesCount: post.likes_count as number || 0,
    commentsCount: post.comments_count as number || 0,
    viewsCount: post.views_count as number || 0,
    favoritesCount: post.favorites_count as number || 0,
    isPinned: post.is_pinned as boolean || false,
    isLocked: post.is_locked as boolean || false,
    autoPromoted: post.auto_promoted as boolean || false,
    autoPromoteReason: post.auto_promote_reason as string | undefined,
    promotedToCategory: post.promoted_to_category as string | undefined,
    status: post.status as 'draft' | 'published' | 'deleted',
    createdAt: post.created_at as string,
    updatedAt: post.updated_at as string,
  };
}
```

- [ ] **Step 2: 提交代码**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/lib/auto-promote/service.ts
git commit -m "feat(auto-promote): add checkAllPendingPromotions and executePromotion functions"
```

---

## Task 4: 创建积分直接发布 API

**Files:**
- Create: `src/pages/api/community/promote.ts`
- Create: `src/pages/api/community/boost.ts`
- Create: `src/pages/api/community/points-balance.ts`

**Steps:**

- [ ] **Step 1: 创建积分直接发布 API - promote.ts**

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { POINTS_CONFIG } from '@/lib/points/config';
import { checkPromotionEligibility } from '@/lib/community/types';
import { executePromotion } from '@/lib/auto-promote/service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { postId, userId } = body;

    if (!postId || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '缺少必要参数' }
      }), { status: 400 });
    }

    // 检查用户积分
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('points')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '用户不存在' }
      }), { status: 404 });
    }

    const pointsCost = Math.abs(POINTS_CONFIG.ACTIONS.DIRECT_PUBLISH);
    if (profile.points < pointsCost) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '积分不足，需要 ' + pointsCost + ' 积分' },
        pointsCost,
        remainingPoints: profile.points
      }), { status: 400 });
    }

    // 检查帖子是否存在且未推送
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '帖子不存在' }
      }), { status: 404 });
    }

    if (post.auto_promoted) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '帖子已被推送' }
      }), { status: 400 });
    }

    // 扣除积分
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ points: profile.points - pointsCost })
      .eq('user_id', userId);

    if (updateError) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '积分扣除失败' }
      }), { status: 500 });
    }

    // 执行推送
    const promotionScore = (post.likes_count || 0) * 1 + (post.comments_count || 0) * 2 + (post.favorites_count || 0) * 3;
    const success = await executePromotion(postId, 'points', promotionScore);

    if (!success) {
      // 退还积分
      await supabase
        .from('user_profiles')
        .update({ points: profile.points })
        .eq('user_id', userId);

      return new Response(JSON.stringify({
        success: false,
        error: { message: '推送失败，积分已退还' }
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      pointsCost,
      remainingPoints: profile.points - pointsCost,
      message: '发布成功'
    }), { status: 200 });

  } catch (err) {
    console.error('Direct promote error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: { message: '服务器错误' }
    }), { status: 500 });
  }
};
```

- [ ] **Step 2: 创建热门加速 API - boost.ts**

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { POINTS_CONFIG } from '@/lib/points/config';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { postId, userId } = body;

    if (!postId || !userId) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '缺少必要参数' }
      }), { status: 400 });
    }

    // 检查用户积分
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('points')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '用户不存在' }
      }), { status: 404 });
    }

    const pointsCost = Math.abs(POINTS_CONFIG.ACTIONS.HOT_BOOST);
    if (profile.points < pointsCost) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '积分不足，需要 ' + pointsCost + ' 积分' },
        pointsCost,
        remainingPoints: profile.points
      }), { status: 400 });
    }

    // 计算过期时间（24小时后）
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 扣除积分并设置热门加速
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ points: profile.points - pointsCost })
      .eq('user_id', userId);

    if (updateError) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '积分扣除失败' }
      }), { status: 500 });
    }

    // 更新帖子的热门加速状态
    const { error: postError } = await supabase
      .from('community_posts')
      .update({
        is_hot_boost: true,
        hot_boost_expires_at: expiresAt
      })
      .eq('id', postId);

    if (postError) {
      // 退还积分
      await supabase
        .from('user_profiles')
        .update({ points: profile.points })
        .eq('user_id', userId);

      return new Response(JSON.stringify({
        success: false,
        error: { message: '热门加速设置失败，积分已退还' }
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      pointsCost,
      remainingPoints: profile.points - pointsCost,
      expiresAt,
      message: '热门加速成功，有效期24小时'
    }), { status: 200 });

  } catch (err) {
    console.error('Hot boost error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: { message: '服务器错误' }
    }), { status: 500 });
  }
};
```

- [ ] **Step 3: 创建积分余额查询 API - points-balance.ts**

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '缺少 userId 参数' }
      }), { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('points')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: '用户不存在' }
      }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      points: profile.points
    }), { status: 200 });

  } catch (err) {
    console.error('Points balance error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: { message: '服务器错误' }
    }), { status: 500 });
  }
};
```

- [ ] **Step 4: 提交代码**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/pages/api/community/promote.ts src/pages/api/community/boost.ts src/pages/api/community/points-balance.ts
git commit -m "feat(api): add direct publish, hot boost, and points balance APIs"
```

---

## Task 5: 更新 PostEditor 组件

**Files:**
- Modify: `src/components/community/PostEditor.tsx`

**Steps:**

- [ ] **Step 1: 添加推送提示信息到表单底部**

找到 PostEditor 组件中表单提交的按钮区域（约第659-676行），在"发布帖子"按钮上方添加推送说明：

```tsx
{/* 在 <div className="flex items-center justify-end gap-3"> 之前添加 */}
<div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
  <div className="flex items-start gap-3">
    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="text-sm">
      <p className="text-blue-800 font-medium mb-1">
        {CATEGORY_LABELS[category]?.zh || '该分类'}帖子推送说明
      </p>
      <ul className="text-blue-600 space-y-1">
        <li>• 热度达标后自动推送到 {category !== 'discussion' && category !== 'qa' ? CATEGORY_LABELS[category]?.zh : '社区'} 板块</li>
        <li>• 或消耗 50 积分直接发布到目标板块</li>
        <li>• 消耗 20 积分可获得 24 小时热门加速</li>
      </ul>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 确保所有分类表单完整**

检查现有的 ToolsForm、PaymentForm、PolicyForm、PromptForm、SurvivalForm 组件，确保它们包含设计文档中要求的所有字段。

主要检查项：
- ToolsForm: 是否有 howToUse 和 useCases 字段（第124-153行附近的 textarea）
- PolicyForm: 是否有 codingPolicy 字段

如果缺失，在对应位置添加缺失的字段。

- [ ] **Step 3: 提交代码**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/components/community/PostEditor.tsx
git commit -m "feat(post-editor): add promotion hints and ensure form completeness"
```

---

## Task 6: 更新 PostDetail 组件显示推送状态

**Files:**
- Modify: `src/components/community/PostDetail.tsx`

**Steps:**

- [ ] **Step 1: 在帖子内容区域添加推送状态显示**

找到帖子内容显示区域，添加推送状态和原帖链接：

```tsx
{/* 在帖子内容之后，评论区之前添加 */}

{/* 推送状态显示 */}
{(post.autoPromoted || post.directPublishRequested) && (
  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="text-sm">
        <p className="text-green-800 font-medium">
          {post.promoteSource === 'points' ? '直达' : '已推送'} {CATEGORY_LABELS[post.category]?.zh} 热门
        </p>
        {post.promoteScore !== undefined && (
          <p className="text-green-600 mt-1">
            热度评分: {post.promoteScore} | 推送时间: {new Date(post.promotedAt || post.updatedAt).toLocaleDateString('zh-CN')}
          </p>
        )}
      </div>
    </div>
  </div>
)}

{/* 非推送帖子显示热度进度 */}
{!post.autoPromoted && category !== 'discussion' && category !== 'qa' && (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600">热度进度</span>
      <span className="text-sm font-medium text-gray-900">
        {calculateScore(post)} / 10
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all"
        style={{ width: `${Math.min(100, (calculateScore(post) / 10) * 100)}%` }}
      />
    </div>
    <p className="text-xs text-gray-500 mt-2">
      点赞×1 + 评论×2 + 收藏×3 = 热度评分，≥10分自动推送
    </p>
  </div>
)}
```

其中 calculateScore 函数：
```tsx
function calculateScore(post: CommunityPost): number {
  return post.likesCount * 1 + post.commentsCount * 2 + post.favoritesCount * 3;
}
```

- [ ] **Step 2: 提交代码**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/components/community/PostDetail.tsx
git commit -m "feat(post-detail): add promotion status and heat progress display"
```

---

## Task 7: 更新国际化文件

**Files:**
- Modify: `src/i18n/zh.json`
- Modify: `src/i18n/en.json`

**Steps:**

- [ ] **Step 1: 添加推送相关中文翻译到 zh.json**

找到 community 或 common 部分，添加：

```json
"community": {
  "promotion": {
    "autoPromoted": "已自动推送到 {category}",
    "directPromoted": "直达 {category} 热门",
    "heatProgress": "热度进度",
    "heatScore": "热度评分",
    "heatFormula": "点赞×1 + 评论×2 + 收藏×3 = 热度评分，≥10分自动推送",
    "directPublish": "直接发布",
    "directPublishCost": "消耗 {points} 积分直接发布到目标板块",
    "hotBoost": "热门加速",
    "hotBoostCost": "消耗 {points} 积分获得24小时热门曝光",
    "pointsRequired": "需要 {points} 积分",
    "points不足": "积分不足",
    "promotionSuccess": "发布成功",
    "viewOriginal": "查看原文"
  }
}
```

- [ ] **Step 2: 添加推送相关英文翻译到 en.json**

```json
"community": {
  "promotion": {
    "autoPromoted": "Auto-promoted to {category}",
    "directPromoted": "Direct to {category} Hot",
    "heatProgress": "Heat Progress",
    "heatScore": "Heat Score",
    "heatFormula": "Likes×1 + Comments×2 + Favorites×3 = Score, ≥10 triggers auto-promotion",
    "directPublish": "Direct Publish",
    "directPublishCost": "Spend {points} points to publish directly to target board",
    "hotBoost": "Hot Boost",
    "hotBoostCost": "Spend {points} points for 24-hour hot exposure",
    "pointsRequired": "Requires {points} points",
    "points不足": "Insufficient points",
    "promotionSuccess": "Published successfully",
    "viewOriginal": "View original"
  }
}
```

- [ ] **Step 3: 提交代码**

```bash
cd D:/suoyouxiangmu/ai-student-survival
git add src/i18n/zh.json src/i18n/en.json
git commit -m "feat(i18n): add promotion related translations"
```

---

## Task 8: 添加数据库字段

**Files:**
- Create: `supabase/migrations/xxxx_add_promotion_fields.sql`

**Steps:**

- [ ] **Step 1: 创建数据库迁移 SQL**

```sql
-- 添加推送相关字段到 community_posts 表
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS promote_source TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS promote_score INTEGER;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS direct_publish_requested BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS direct_publish_cost INTEGER;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_hot_boost BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS hot_boost_expires_at TIMESTAMP;

-- 创建索引以优化推送查询
CREATE INDEX IF NOT EXISTS idx_community_posts_auto_promoted ON community_posts(auto_promoted) WHERE auto_promoted = false;
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
```

- [ ] **Step 2: 提交迁移文件**

```bash
cd D:/suoyouxiangmu/ai-student-survival
mkdir -p supabase/migrations
git add supabase/migrations/xxxx_add_promotion_fields.sql
git commit -m "feat(db): add promotion related columns to community_posts"
```

---

## Task 9: 端到端测试

**Files:**
- Create: `tests/community-promotion.test.ts`

**Steps:**

- [ ] **Step 1: 编写推送功能测试**

```typescript
import { describe, it, expect } from 'vitest';
import { calculatePromotionScore, checkPromotionEligibility } from '@/lib/community/types';

describe('Promotion Scoring', () => {
  it('calculates score correctly', () => {
    const post = {
      likesCount: 5,
      commentsCount: 3,
      favoritesCount: 2,
      createdAt: new Date().toISOString(),
    } as any;

    expect(calculatePromotionScore(post)).toBe(5 * 1 + 3 * 2 + 2 * 3); // 17
  });

  it('eligible when score >= 10 and within 72 hours', () => {
    const post = {
      likesCount: 5,
      commentsCount: 3,
      favoritesCount: 0,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24h ago
    } as any;

    const result = checkPromotionEligibility(post);
    expect(result.canPromote).toBe(true);
    expect(result.score).toBe(11); // 5*1 + 3*2 + 0*3
  });

  it('not eligible when score < 10', () => {
    const post = {
      likesCount: 2,
      commentsCount: 1,
      favoritesCount: 1,
      createdAt: new Date().toISOString(),
    } as any;

    const result = checkPromotionEligibility(post);
    expect(result.canPromote).toBe(false);
    expect(result.score).toBe(7); // 2*1 + 1*2 + 1*3
  });

  it('not eligible when older than 72 hours', () => {
    const post = {
      likesCount: 10,
      commentsCount: 10,
      favoritesCount: 10,
      createdAt: new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString(), // 80h ago
    } as any;

    const result = checkPromotionEligibility(post);
    expect(result.canPromote).toBe(false);
    expect(result.details.postAgeHours).toBeGreaterThan(72);
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
cd D:/suoyouxiangmu/ai-student-survival
pnpm test -- tests/community-promotion.test.ts
```

- [ ] **Step 3: 提交测试**

```bash
git add tests/community-promotion.test.ts
git commit -m "test: add promotion scoring tests"
```

---

## 实施检查清单

完成所有任务后，验证以下功能：

- [ ] 用户发帖可选择分类并填写对应表单
- [ ] 表单涵盖目标板块详情页的所有必要字段
- [ ] 帖子热度评分正确计算
- [ ] 评分≥10且在72小时内自动推送
- [ ] 积分直接发布功能正常（扣费正确）
- [ ] 积分热门加速功能正常
- [ ] 推送后帖子详情页显示推送状态
- [ ] 原帖链接正确显示
- [ ] 中文/英文翻译完整
- [ ] 所有测试通过
- [ ] 构建成功

---

## 自检清单

完成计划后，检查以下内容：

1. **Spec覆盖**：设计文档中的每个需求是否都有对应的任务？
2. **占位符扫描**：计划中是否有 TODO、TBD、implement later 等占位符？
3. **类型一致性**：类型、函数签名、属性名是否在各任务间一致？

---

_计划完成，等待实施_
