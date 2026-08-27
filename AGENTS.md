# AGENTS.md - AI留学生存指南 (mi-to-ai.com) Agent 入口文档

> 版本: v1.0 | 创建: 2026-08-27 | 用途: **新会话 / 新 agent 开工前必读**

---

## 🚨 **第一步（开工前必读）**

**任何 agent（Claude Code / Hermes / Codex / 其他）**接手这个项目**，第一步必须按顺序读完以下文档**：

1. **`README.md`** — 项目简介 + 快速开始
2. **`CHANGELOG.md`** — **最新版本变更**（必读！避免重复已修复的问题）
3. **`PROJECT_STATUS_REPORT.md`** — **项目完整状态**（必读！包含最新 commit + 数据统计 + 已知问题）
4. **如果是 SEO/GEO/OAuth/GSC 相关任务**，额外读：
   - `references/SEO_FIXES_2026-08-27.md` — 2026-08-27 SEO 修复总结
   - `references/gsc-oauth-full-scope-upgrade.md` — OAuth 升级流程
   - `references/gsc-credentials.md` — GSC 凭据管理
5. **根目录文档目录**（不要假设文件不存在）：
   ```bash
   ls *.md references/*.md
   ```

**🚨 铁律**：
- ❌ **新 agent 第一件事不是写代码，是读文档**——根目录有完整文档体系
- ❌ **不要假设"文档不存在"或"过时"**——除非 `ls` 确认
- ❌ **不要基于记忆声称数据**——必查文档/git log/GSC API
- ✅ **报告"已完成"前必须 `ls *.md` + 看最新 CHANGELOG + 看 PROJECT_STATUS_REPORT**
- ✅ **如果 PROJECT_STATUS_REPORT 超过 7 天未更新，必须先更新它再继续**

**事件**：2026-08-27 我犯的错——没主动读 PROJECT_STATUS_REPORT.md，**整天不知道根目录有完整文档体系**。信哥指出来后才写 `SEO_FIXES_2026-08-27.md` 总结。

---

## 项目基本信息

| 项目 | 值 |
|------|-----|
| 项目名 | AI留学生存指南 (mi-to-ai.com) |
| 版本 | v1.0.6 (2026-08-27) |
| 描述 | AI Native website for Chinese international students |
| 生产URL | https://mi-to-ai.com |
| GitHub | git@github.com:wangjianxin1988/ai-student-survival.git |
| 最新Commit | `86c2e0f` (或更新) |

---

## 技术栈速览

- **框架**: Astro 4.x + React 18 + TailwindCSS 3.4
- **数据库**: Supabase (PostgreSQL 17 + PostGIS)
- **部署**: Cloudflare Pages (边缘加速)
- **CI/CD**: GitHub Actions → 推送 main 自动部署
- **包管理**: pnpm
- **i18n**: 自定义方案 (zh/en)

---

## 当前 SEO + GSC 状态

| 项目 | 状态 |
|------|------|
| sitemap.xml | **572 URLs** + Cache-Control no-cache |
| 14 个新内容 | 全部 "Discovered"（待索引）|
| GSC 7 天 | 5 clicks / 530 imp / CTR 0.94% / pos 31.6 |
| GSC 90 天 | 72 clicks / 4,753 imp / CTR 1.51% / pos 17.2 |
| OAuth scope | `webmasters` (full) + `webmasters.readonly` |
| Indexed | 0/572 (3-7 天内会大幅增长) |

---

## 必看文档列表

| 文件 | 何时读 |
|------|--------|
| `README.md` | 永远 |
| `CHANGELOG.md` | 永远 |
| `PROJECT_STATUS_REPORT.md` | 永远 |
| `CLAUDE.md` | Claude Code 工作时 |
| `SPEC.md` | 改核心规范时 |
| `P3_DESIGN.md` | 改架构时 |
| `references/SEO_FIXES_2026-08-27.md` | SEO / GEO / GSC 任务 |
| `references/gsc-oauth-full-scope-upgrade.md` | OAuth 任务 |
| `references/gsc-credentials.md` | GSC 凭据任务 |

---

## 关键 Pitfalls（P60-P71）

详见 `mi-to-ai-operations` skill（Hermes 用户）：
- **P66**: 详情页空 → 必须把 inline 数据搬到源文件
- **P67**: placehold.co 是 SEO 债 → 必须用 Unsplash
- **P68**: 新内容更新后必跑 5 项验证命令
- **P69**: OAuth callback server 唯一启动方式 = delegate_task
- **P70**: Unsplash imageUrl 必须 HTTP 200 验证（用 `scripts/verify-unsplash-images.py`）
- **P71**: payment 列表排序 = Top 2 热门 + 时间倒序

---

## 核心数据 / 配置位置

| 类型 | 文件 |
|------|------|
| AI 工具 (65 个) | `src/data/static-tools.ts` |
| 支付方案 (47 个) | `src/data/paymentSolutions.ts` |
| 博客 (18 篇) | `src/data/blogPosts.ts` |
| Survival (22 个) | `src/data/survivalGuides.ts` |
| Prompts (43 个) | `src/data/promptTemplates.ts` |
| Offers (20 个) | `src/data/offers.ts` |
| GSC Token | `references/gsc-refresh-token.json` (gitignored) |
| OAuth Client | `references/gcp-oauth-client.json` (gitignored) |

---

## 部署流程

1. 本地修改 → `git add -A`
2. `git commit -m "..."` (用 Co-Authored-By: MiniMax-M3 / Claude)
3. `git push origin main`
4. GitHub Actions 自动 build + deploy (CF Pages)
5. 45-90 秒后生产端生效
6. `gh run list --limit 1` 验证 SUCCESS

---

**这个文件是任何 agent 开工前的第一站**——别假设其他 agent 知道项目状态，**让他们读这里**。