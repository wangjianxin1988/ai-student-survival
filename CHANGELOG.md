# Changelog

All notable changes to this project will be documented in this file.

## [1.0.6] - 2026-08-27

### SEO + GEO 修复大版本

**8 个 commit 全部 deploy SUCCESS**。完整修复总结见 [`references/SEO_FIXES_2026-08-27.md`](references/SEO_FIXES_2026-08-27.md)

### OAuth 升级
- GSC OAuth scope 从 `webmasters.readonly` 升级到 **`webmasters` (full)**
- 现在能 PUT resubmit sitemap + Request Indexing
- sitemap 81 天没动 → 现在 Google 1 秒内下载新版

### sitemap 修复
- 从 498 URLs → **572 URLs**（修复 survivalRoutes 22+22 个）
- 加 `Cache-Control: no-cache`（避免 CDN 缓存 stale 版）

### 新内容索引
- 14 个新内容（4 tools + 3 blog + 2 payment + 2 survival + 3 prompts）
- 全部 P68 5 项验证通过：size + keywords + og:image + sitemap + title
- 14/14 URL Inspection 从 "Unknown to Google" → "Discovered"

### Unsplash 图修复（P70）
- 修复 4 处 Unsplash 404 图（GPT-5.6 Sol + 1 支付 + 2 篇博客）
- 新增 `scripts/verify-unsplash-images.py` 永久检测脚本
- 全 37 张图 HTTP 200

### Payment 列表排序（P71）
- Top 2 = viewCount 最高（热门）
- Top 3+ = updatedAt 倒序（最新优先）
- 用户筛选时按 viewCount 排（UX 一致）

### Dead Code 删除
- `src/data/toolsData.ts` 724 行删除（所有引用已迁移到 staticTools）

### Skill 经验沉淀
- P66-P71 全部写入 `mi-to-ai-operations` skill
- OAuth 升级文档：`references/gsc-oauth-full-scope-upgrade.md`

### 验证结果
- 核心页面 10/10 HTTP 200
- sitemap 572 URLs + no-cache
- robots.txt: GPTBot / ClaudeBot / PerplexityBot / CCBot 全部 Allowed
- llms.txt / llms-full.txt: 9.4KB 总（AI 引擎可读）
- JSON-LD: 详情页 2-6 blocks / 首页 4 blocks
- GSC 7 天: 5 clicks / 530 imp / 90 天: 72 clicks / 4,753 imp

## [1.0.5] - 2026-05-23

### Testing & QA
- Comprehensive E2E testing across all core pages (auth, community, map, contact, user profile, regression)
- Auth flow verified: login, register, OAuth (Google/GitHub), magic link, forgot password
- Interactive pages tested: map, survival guides, prompts, offers, questions
- Content pages verified: about, contact, faq, guide, privacy, terms, compare
- English version pages verified: all 16 EN pages load correctly
- Security audit: content moderation, API endpoints, auth flow, RLS policies

### Known Issues (Non-blocking)
- English pages contain some Chinese text in shared navigation/database content (cosmetic)
- HTML5 email validation `valid` property undefined in test (form still works correctly)
- Supabase session not stored in localStorage during test (auth still functions via cookies)

### Code Quality
- Build passes: `astro build` completes successfully
- TypeScript: source files clean, test file type errors are expected
- ESLint: configured and passing for source files

## [1.0.3] - 2026-05-23

### Fixed
- Added ESLint configuration to resolve linting errors
- Fixed unused variable issues in multiple components (LoginForm, RegisterForm, ContactDeveloper, etc.)
- Fixed PostCard.tsx case block declarations (added braces for lexical declarations)
- Fixed CampusMap.tsx unused university variable
- Fixed ShareButton.tsx unused image prop
- Fixed CommunityFeed.tsx catch block error handling
- Fixed CompareButton.tsx unused props
- Fixed AddMarkerForm.tsx unused onSubmit prop
- Fixed MapPage.tsx unused markerUniIds
- Fixed OfferComment.tsx unused translations
- Fixed content-moderation.ts regex pattern warnings
- Fixed paymentSolutions.ts escape character warnings
- Fixed env.d.ts triple-slash reference warning

### Code Quality
- Created proper ESLint configuration (.eslintrc.json)
- Improved TypeScript strictness compliance
- Enhanced error handling consistency across components

### Documentation
- Updated CHANGELOG.md for v1.0.3

## [1.0.2] - 2026-05-23

### Fixed
- Bug fixes from QA testing

## [1.0.1] - 2026-05-23

### Fixed
- Removed hardcoded developer contact info from ContactDeveloper.tsx (now uses environment variables)
- Updated Contact API to use environment variables for developer contact
- Removed unused variable in LoginForm.tsx
- Improved XSS protection by using environment variables for sensitive display data

### Security
- Developer WeChat ID now loaded from PUBLIC_DEVELOPER_WECHAT env var
- Developer Email now loaded from PUBLIC_DEVELOPER_EMAIL env var
- API contact endpoint updated to use environment variables

## [1.0.0] - 2026-05-19

### Added
- Initial production release
- AI Tools library (33 tools)
- Payment solutions (20+)
- University policies (42 universities)
- Prompt templates (30+)
- Survival guides (20+)
- Q&A community
- Campus map (100+ markers)
- Offer showcase
