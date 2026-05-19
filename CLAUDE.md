# CLAUDE.md - AI留学生存指南 开发配置

> 版本: v1.1 | 更新: 2026-05-16 | 用途: Claude Code开发指引

---

## Claude Code 高级配置 (Power User)

### settings.json 核心配置

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "WebFetch", "WebSearch", "ReadAll"]
  },
  "tools": {
    "webSearch": { "disabled": false, "maxResults": 10 },
    "mcp": { "disabled": false }
  },
  "advancement": {
    "createTaskDocuments": true,
    "createTaskDocumentsPath": ".claude/tasks"
  }
}
```

### Multi-Agent 工作流配置

| Agent角色 | 数量 | 职责 |
|-----------|------|------|
| orchestrator | 1 | 任务分解、结果汇总 |
| builder | 3 | 并行实现功能模块 |
| tester | 2 | 独立测试验证 |
| reviewer | 1 | 代码审查 |

**委托关键词规则:**
```
r"(搜索|调研)" → researcher
r"(实现|写代码)" → builder
r"(测试|验证)" → tester
r"(审查|检查)" → reviewer
```

### Task自动化

每次任务自动创建:
- `.claude/tasks/{task-id}/task_plan.md` - 任务计划
- `.claude/tasks/{task-id}/findings.md` - 研究发现
- `.claude/tasks/{task-id}/progress.md` - 执行日志

---

## 项目概述

- **项目名**: AI留学生存指南
- **类型**: AI Native网站 (Astro + React + TailwindCSS)
- **目标用户**: 中国留学生
- **核心功能**: AI工具库、支付解决方案、大学AI政策、Prompt模板
- **部署**: Cloudflare Pages

---

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Astro 4.x + React 18 | Islands架构 |
| 样式 | TailwindCSS | 原子化CSS |
| 数据库 | Supabase | PostgreSQL + 实时 |
| 搜索 | Typesense | 全文搜索 |
| 部署 | Cloudflare Pages | 边缘加速+AI爬虫友好 |

---

## Claude Code 工作流

### 架构设计流程 (必须遵循)

```
收到任务
    ↓
分析需求（不明确时立即追问）
    ↓
架构设计 → 输出 ARCHITECTURE.md
    ↓
编写实现计划 → 输出 IMPLEMENTATION.md
    ↓
代码实现
    ↓
自测验证 (pnpm build + pnpm check)
    ↓
代码审查
    ↓
部署
```

### 质量门槛

| 检查项 | 命令 | 通过标准 |
|--------|------|---------|
| 代码格式 | `pnpm format` | 0 error |
| 类型检查 | `pnpm check` | 0 error |
| 构建 | `pnpm build` | exit 0 |

---

## 开发命令

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 类型检查
npm run check

# 代码格式
npm run format

# 代码检查
npm run lint

# 构建
npm run build

# 预览
npm run preview

# 部署到CF Pages
wrangler pages deploy dist --project-name=ai-student-survival
```

---

## AI Native要求

### Schema.org结构化数据

每个页面必须包含JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "工具名称",
  "offers": { "price": "20", "priceCurrency": "USD" },
  "aggregateRating": { "ratingValue": "4.5" }
}
```

### API端点设计

| 端点 | 方法 | 说明 |
|------|------|------|
| /api/tools | GET | AI工具列表 |
| /api/tools/[slug] | GET | 工具详情 |
| /api/payment-solutions | GET | 支付方案 |
| /api/policies | GET | 大学政策 |

### robots.txt AI爬虫权限

```
User-agent: GPTBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Claude
Allow: /
```

---

## 分支管理

```
main                    # 主分支，生产环境
├── develop             # 开发分支
│   ├── feature/*      # 功能分支
│   ├── bugfix/*       # Bug修复
│   └── hotfix/*       # 紧急修复
```

### 合并流程

1. 功能开发完成
2. 从main拉取最新代码
3. 运行 `pnpm build && pnpm check`
4. 发起PR/MR
5. 合并到main自动部署

---

## 目录结构

```
src/
├── components/       # React组件
│   ├── tools/      # AI工具相关
│   ├── payment/   # 支付相关
│   ├── policies/  # 政策相关
│   └── common/   # 通用组件
├── layouts/        # 布局组件
├── pages/          # 页面
│   ├── index.astro
│   ├── tools/
│   ├── payment/
│   ├── policies/
│   └── api/
├── lib/            # 工具函数
│   └── supabase.ts
└── styles/        # 全局样式
```

---

## 禁止事项

1. **禁止跳过架构设计** - 复杂功能必须先设计
2. **禁止未测试就交付** - 核心功能必须有测试
3. **禁止硬编码敏感信息** - API密钥通过环境变量
4. **禁止破坏性操作** - 删除/修改前先备份

---

## 沟通规范

```
结论: [一句话结论]
证据: [文件路径/命令输出]
详情: |
  - 完成项1
  - 完成项2
```

---

_Last updated: 2026-05-16_
