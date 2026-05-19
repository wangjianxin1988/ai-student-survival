# 社区帖子分类发布与自动推送系统设计

> 版本: v1.0 | 日期: 2026-05-19 | 状态: 设计中

---

## 一、概述

### 1.1 背景

用户只能在社区问答（/questions）发布帖子，但希望优质帖子能够根据用户选择的分类自动推送到对应板块详情页，形成与目标板块格式完全一致的内容。

### 1.2 目标

1. 用户发帖时选择分类（AI工具/支付指南/大学政策/Prompt/妙妙地图）并填写对应表单
2. 表单涵盖目标板块详情页的所有必要字段
3. 帖子留在社区，带完整结构化数据
4. 热度达标时自动推送到对应板块
5. 支持积分直接发布到目标板块

---

## 二、表单字段设计

### 2.1 分类与板块映射

| 分类 | 值 | 目标板块路径 |
|------|-----|-------------|
| AI工具 | `tools` | `/tools/{slug}` |
| 支付指南 | `payment` | `/payment/{id}` |
| 大学政策 | `policy` | `/policies/{slug}` |
| Prompt | `prompt` | `/prompts/{id}` |
| 妙妙贴 | `survival` | `/survival/{id}` |

### 2.2 AI工具表单 (ToolsPostMeta)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 工具名称 |
| slug | string | 是 | URL slug（自动生成） |
| description | string | 是 | 工具描述 |
| subcategory | string | 否 | 子分类 |
| pricing | free/freemium/paid | 是 | 定价模式 |
| priceMonthly | number | 否 | 月付价格 |
| priceYearly | number | 否 | 年付价格 |
| url | string | 是 | 官网URL |
| features | string[] | 否 | 功能列表 |
| alternatives | string[] | 否 | 替代工具 |
| tips | string[] | 否 | 使用技巧 |
| howToUse | Array<{step, title, description}> | 否 | 教程步骤 |
| useCases | Array<{title, description}> | 否 | 使用场景 |

### 2.3 支付指南表单 (PaymentPostMeta)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 标题 |
| excerpt | string | 否 | 摘要 |
| paymentCategory | virtual_card/gift_card/regional_pricing/troubleshooting | 是 | 支付类型 |
| difficulty | easy/medium/hard | 是 | 难度 |
| reliability | high/medium/low | 是 | 可靠性 |
| content | string | 是 | 详细教程（Markdown） |
| toolIds | string[] | 否 | 关联的工具ID |

### 2.4 大学政策表单 (PolicyPostMeta)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| universityName | string | 是 | 大学名称 |
| universitySlug | string | 是 | URL slug |
| country | string | 是 | 国家 |
| overallPolicy | allowed/restricted/prohibited/case_by_case | 是 | 总体政策 |
| teachingPolicy | string | 否 | 教学场景政策 |
| assignmentPolicy | string | 否 | 作业政策 |
| examPolicy | string | 否 | 考试政策 |
| thesisPolicy | string | 否 | 论文政策 |
| researchPolicy | string | 否 | 研究政策 |
| allowedTools | string[] | 否 | 允许使用的AI工具 |
| restrictedTools | string[] | 否 | 限制使用的AI工具 |

### 2.5 Prompt表单 (PromptPostMeta)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 标题 |
| content | string | 是 | Prompt内容 |
| promptCategory | application/thesis/job/daily/research | 是 | 分类 |
| toolId | string | 否 | 适用工具 |
| description | string | 否 | 描述 |
| howToUse | string | 否 | 使用说明 |
| tags | string[] | 否 | 标签 |

### 2.6 妙妙贴表单 (SurvivalPostMeta)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 标题 |
| survivalCategory | scam/culture/safety/legal/other | 是 | 分类 |
| country | string | 否 | 国家 |
| universityId | string | 否 | 大学ID |
| content | string | 是 | 内容（英文） |
| contentZh | string | 否 | 内容（中文） |
| tags | string[] | 否 | 标签 |

---

## 三、自动推送规则

### 3.1 热度阈值

| 指标 | 阈值 | 权重 |
|------|------|------|
| 点赞 (likes) | ≥ 5 | ×1 |
| 评论 (comments) | ≥ 3 | ×2 |
| 收藏 (favorites) | ≥ 2 | ×3 |

### 3.2 推送条件

```
评分 = likes×1 + comments×2 + favorites×3
推送条件 = 评分 ≥ 10 AND 发布时间 ≤ 72小时
```

### 3.3 推送流程

1. 系统每小时检查一次待推送帖子
2. 计算帖子在过去72小时的热度评分
3. 评分≥10时，标记为`autoPromoted: true`
4. 记录推送目标板块和推送时间
5. 帖子在目标板块详情页展示，带"来自社区"标识

### 3.4 原帖链接

推送后的帖子详情页底部显示：
```
原文发布于社区 → [查看原帖]
```

---

## 四、积分直接发布机制

### 4.1 费用配置

| 动作 | 积分消耗 | 说明 |
|------|---------|------|
| 直接发布到目标板块 | 50积分 | 跳过热度等待，直接推送 |
| 24小时热门加速 | 20积分 | 额外首页曝光 |

### 4.2 现有积分规则（保留）

| 动作 | 获得/消耗 |
|------|-----------|
| 发布帖子 | +15积分 |
| 被点赞 | +2积分 |
| 被收藏 | +3积分 |
| 被评论 | +3积分 |
| 被分享 | +2积分 |
| 帖子置顶 | -50积分 |

### 4.3 扣费时机

- 用户点击"直接发布"按钮时预扣积分
- 如果帖子被审核拒绝，积分退回
- 热门加速在发布时即时生效

---

## 五、数据模型扩展

### 5.1 CommunityPost 扩展字段

```typescript
interface CommunityPost {
  // ... 现有字段
  
  // 自动推送相关
  isPromoted?: boolean;           // 是否已被推送
  promotedAt?: string;            // 推送时间
  promotedToCategory?: string;    // 推送到的目标分类
  promoteSource?: 'auto' | 'points';  // 推送来源
  promoteScore?: number;         // 推送时的热度评分
  
  // 直接发布相关
  directPublishRequested?: boolean;  // 是否申请过直接发布
  directPublishCost?: number;       // 直接发布消耗积分
  isHot加速?: boolean;              // 是否热门加速
  hot加速ExpiresAt?: string;        // 热门加速过期时间
}
```

### 5.2 推送历史表

```typescript
interface PromotionHistory {
  id: string;
  postId: string;
  action: 'auto' | 'direct';
  targetCategory: string;
  score: number;           // 推送时的评分
  threshold: number;       // 当时的阈值
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}
```

---

## 六、API 设计

### 6.1 新增端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/community/promote` | POST | 申请直接发布（消耗积分） |
| `/api/community/promote-status` | GET | 查询推送状态 |
| `/api/community/boost` | POST | 申请热门加速（消耗积分） |

### 6.2 直接发布请求

```typescript
// POST /api/community/promote
interface PromoteRequest {
  postId: string;
  targetCategory: string;
  action: 'direct' | 'boost';
}

// 响应
interface PromoteResponse {
  success: boolean;
  pointsCost: number;
  remainingPoints: number;
  message: string;
}
```

---

## 七、UI/UX 设计

### 7.1 发帖页面

- 分类选择区域：6个卡片（AI工具/支付指南/大学政策/Prompt/妙妙贴/讨论）
- 选择分类后，下方显示对应表单
- 表单底部显示推送说明：
  ```
  热度达标后将自动推送到 {目标板块}，或消耗50积分直接发布
  ```

### 7.2 推送状态标识

帖子详情页显示推送状态：
- 未推送：显示当前热度评分和阈值
- 已推送：显示"已推送至{板块}" + 原文链接
- 直接发布：显示"直达{板块}热门"标识

### 7.3 用户积分显示

- 发帖按钮附近显示用户积分余额
- 积分不足时，直接发布按钮置灰并提示"积分不足"

---

## 八、技术实现

### 8.1 文件修改清单

| 文件 | 修改内容 |
|------|---------|
| `src/components/community/PostEditor.tsx` | 添加分类表单 |
| `src/lib/community/types.ts` | 扩展PostMeta类型 |
| `src/lib/community/service.ts` | 添加推送逻辑 |
| `src/lib/points/config.ts` | 添加直接发布费用 |
| `src/pages/api/community/promote.ts` | 新增直接发布API |
| `src/pages/api/community/boost.ts` | 新增热门加速API |
| `src/components/community/PostDetail.tsx` | 显示推送状态 |
| `src/i18n/zh.json` | 中文翻译 |
| `src/i18n/en.json` | 英文翻译 |

### 8.2 推送检查定时任务

```typescript
// cron job: 每小时执行
async function checkPendingPromotions() {
  const posts = await getPostsPendingPromotion();
  for (const post of posts) {
    const score = calculateScore(post);
    const age = getPostAgeHours(post.createdAt);
    
    if (score >= 10 && age <= 72) {
      await promotePost(post, 'auto', score);
    }
  }
}
```

---

## 九、质量门槛

| 指标 | 门槛 |
|------|------|
| 表单验证 | 必填字段100%验证 |
| 推送延迟 | ≤1小时 |
| 积分扣费 | 精确无误 |
| 推送成功率 | ≥99% |

---

## 十、测试计划

| 测试场景 | 验证内容 |
|---------|---------|
| 正常推送流程 | 热度达标后自动推送 |
| 时间窗口测试 | 超过72小时不推送 |
| 积分直接发布 | 扣费正确，跳过等待 |
| 热门加速 | 24小时曝光生效 |
| 积分不足 | 按钮置灰，提示不足 |
| 原帖链接 | 推送后链接正确 |

---

## 十一、待决策项

无。所有设计已确定。

---

## 附录：现有 PostMeta 类型（参考）

```typescript
interface ToolsPostMeta {
  name: string;
  slug: string;
  description: string;
  subcategory: string;
  pricing: 'free' | 'freemium' | 'paid';
  priceMonthly?: number;
  priceYearly?: number;
  url: string;
  features: string[];
  alternatives: string[];
  howToUse: Array<{ step: number; title: string; description: string }>;
  useCases: Array<{ title: string; description: string }>;
  tips: string[];
}
```

---

_设计完成，等待实施_
