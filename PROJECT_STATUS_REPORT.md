# AI留学生存指南 - 项目完整状态报告

> 生成时间: 2026-05-28 16:48
> 项目路径: D:\suoyouxiangmu\ai-student-survival

---

## 一、项目基本信息

| 项目 | 值 |
|------|-----|
| 项目名 | AI留学生存指南 (ai-student-survival) |
| 版本 | v1.0.5 |
| 描述 | AI Native website for Chinese international students |
| 许可证 | MIT |
| Node.js要求 | >= 18.14.1 |
| 包管理器 | pnpm |
| 生产URL | https://mi-to-ai.com |
| Pages URL | https://mi-to-ai-new.pages.dev |
| GitHub | git@github.com:wangjianxin1988/ai-student-survival.git |
| 最新Git Tag | v1.0.5 |
| 最新Commit | f5d409e "ci: deploy with new API token" |

---

## 二、技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Astro 4.x + React 18 | Islands架构 |
| 样式 | TailwindCSS 3.4 | 原子化CSS |
| 数据库 | Supabase | PostgreSQL + PostGIS + 实时订阅 |
| 部署 | Cloudflare Pages | 边缘加速 |
| CI/CD | GitHub Actions | push to main自动部署 |
| 构建适配器 | @astrojs/cloudflare 11.2 | SSR + 静态混合 |
| 包管理 | pnpm | workspace支持 |
| i18n | 自定义方案 (zh/en) | src/i18n/zh.json + en.json |

---

## 三、核心功能模块

### 已实现功能
1. **AI工具库** - 33个工具, 多维度分类/评分/搜索
2. **支付解决方案** - 虚拟卡/礼品卡/地区定价攻略
3. **大学AI政策库** - 42所大学, 38字段详细政策
4. **Prompt模板** - 30+精选模板
5. **防坑防骗指南** - 20+指南
6. **问答社区** - 发帖/评论/点赞/收藏/积分
7. **校园地图** - Leaflet集成, 100+标记点 (PostGIS)
8. **Offer展示** - 分享/筛选/详情
9. **用户系统** - 登录/注册/OAuth(Google/GitHub/Apple)/Magic Link
10. **个人中心** - 头像/收藏/评分/Offer/设置
11. **积分系统** - 积分交易/排行榜 (Demo模式)
12. **赞助商** - 赞助商墙/申请
13. **联系/反馈** - 表单提交
14. **中英文双语** - 16个英文页面

### 路由结构
```
/                       - 首页
/tools                  - AI工具列表
/tools/[slug]           - 工具详情
/payment                - 支付方案
/policies               - 大学政策
/prompts                - Prompt模板
/survival               - 防坑指南
/map                    - 校园地图
/community              - 社区
/questions              - 问答
/offers                 - Offer展示
/about                  - 关于
/contact                - 联系
/faq                    - FAQ
/guide                  - 指南
/privacy                - 隐私
/terms                  - 条款
/compare                - 工具对比
/user                   - 个人中心
/user/favorites         - 收藏
/user/offers            - 我的Offer
/user/ratings           - 评分
/user/settings          - 设置
/auth/login             - 登录
/auth/register          - 注册
/auth/callback          - OAuth回调
/admin                  - 管理后台
/api/*                  - API端点 (30+)
/en/*                   - 英文版 (所有页面)
```

---

## 四、数据库架构

### Supabase配置
| 项目 | 值 |
|------|-----|
| Project Ref | giynvpfnzzelzwpmsgtf |
| URL | https://giynvpfnzzelzwpmsgtf.supabase.co |
| 数据库版本 | PostgreSQL 17 |
| PostGIS | 已启用 (地理空间支持) |
| 表数量 | 33 |
| 函数数量 | 260 (大部分是PostGIS函数) |
| RLS策略 | 已配置 |

### 核心数据表 (33张)

| 表名 | 列数 | 外键 | 说明 |
|------|------|------|------|
| tools | 19 | 0 | AI工具库 |
| university_policies | 38 | 0 | 大学AI政策 |
| payment_solutions | 14 | 0 | 支付方案 |
| prompt_templates | 13 | 0 | Prompt模板 |
| community_posts | 28 | 0 | 社区帖子 |
| post_comments | 9 | 2 | 评论 |
| post_likes | 4 | 1 | 点赞 |
| post_favorites | 4 | 1 | 收藏 |
| profiles | 12 | 0 | 用户资料 |
| cities | 22 | 0 | 城市 (~10行) |
| attractions | 29 | 1 | 景点 |
| restaurants | 29 | 1 | 餐厅 |
| blogger_restaurants | 17 | 2 | 博主餐厅推荐 |
| check_ins | 12 | 3 | 打卡记录 |
| scam_reports | 17 | 1 | 骗局举报 |
| emergency_info | 18 | 1 | 紧急信息 |
| itineraries | 20 | 0 | 行程规划 |
| itinerary_days | 13 | 2 | 行程天数 |
| price_references | 15 | 1 | 价格参考 |
| city_metrics | 8 | 1 | 城市指标 |
| ai_conversations | 8 | 1 | AI对话 |
| ai_messages | 7 | 1 | AI消息 |
| bookmarks | 7 | 0 | 书签 |
| contact_messages | 11 | 0 | 联系消息 |
| notifications | 8 | 0 | 通知 |
| points_transactions | 7 | 0 | 积分交易 |
| user_points_balance | 5 | 0 | 积分余额 |
| user_follows | 4 | 0 | 关注关系 |
| sponsors | 13 | 0 | 赞助商 |
| public_leaderboard | 6 | 0 | 排行榜(视图) |
| spatial_ref_sys | 5 | 0 | PostGIS空间参考 |
| geography_columns | 7 | 0 | PostGIS视图 |
| geometry_columns | 7 | 0 | PostGIS视图 |

### 外键关系
```
post_comments.post_id      -> community_posts.id
post_comments.parent_id    -> post_comments.id (自引用)
emergency_info.city_id     -> cities.id
ai_messages.conversation_id -> ai_conversations.id
restaurants.city_id        -> cities.id
check_ins.city_id          -> cities.id
check_ins.attraction_id    -> attractions.id
check_ins.restaurant_id    -> restaurants.id
city_metrics.city_id       -> cities.id
ai_conversations.city_id   -> cities.id
post_favorites.post_id     -> community_posts.id
scam_reports.city_id       -> cities.id
post_likes.post_id         -> community_posts.id
attractions.city_id        -> cities.id
blogger_restaurants.restaurant_id -> restaurants.id
blogger_restaurants.city_id -> cities.id
price_references.city_id   -> cities.id
itinerary_days.itinerary_id -> itineraries.id
itinerary_days.city_id     -> cities.id
```

### 数据库迁移文件
```
supabase/migrations/
├── 001_create_community_posts.sql
├── 001b_indexes_rls.sql
├── 001c_insert_tools.sql
├── 2026_05_19_0001_add_promotion_fields.sql
├── 20260523_add_rls_policies.sql
├── 20260524_add_contact_messages.sql
├── 20260525_add_oauth_provider_function.sql
├── 20260526000000_sync_remote.sql
├── 20260528_03_create_campus_markers.sql
└── skipped/
```

---

## 五、部署配置

### Cloudflare Pages
| 项目 | 值 |
|------|-----|
| 项目名 | mi-to-ai-new |
| 输出目录 | dist |
| 兼容日期 | 2025-01-01 |
| 自定义域名 | mi-to-ai.com |
| Zone ID | 94944d650e42e4b39eca661851016eae |
| Account ID | d6d81a527b2e9b2620245bfa56711398 |

### astro.config.mjs 关键配置
- site: 'https://mi-to-ai.com'
- output: 'hybrid' (SSR + 静态混合)
- adapter: cloudflare
- i18n: zh (默认) + en
- SSR排除: /_astro/*, /images/*, /api/*, /auth/debug, /auth/test-register

### GitHub Actions CI/CD
**文件:** `.github/workflows/deploy-cf-pages.yml`

**触发条件:**
- push to main → 部署
- pull_request to main → 仅测试

**部署流程:**
1. checkout代码
2. 安装pnpm + Node.js 22
3. pnpm install
4. pnpm lint (容错)
5. pnpm build
6. 安装wrangler v4
7. `wrangler pages deploy dist --project-name=mi-to-ai-new --branch=main`

**其他Workflows:**
- add-sponsor-columns.yml
- apply-migration.yml
- apply-sponsors-migration.yml
- get-pat.yml
- setup-and-config.yml
- supabase-setup.yml

---

## 六、环境变量

### .env.example
```
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=your-secure-password-here
PUBLIC_TURNSTILE_SITE_KEY=your-site-key-here
```

### .env (开发环境)
```
PUBLIC_SUPABASE_URL=https://giynvpfnzzelzwpmsgtf.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbG...ul9I
FORCE_DEMO_AUTH=true
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

### 生产环境需配置 (Cloudflare Dashboard)
- PUBLIC_SUPABASE_URL
- PUBLIC_SUPABASE_ANON_KEY
- ADMIN_PASSWORD (密码保护)
- PUBLIC_TURNSTILE_SITE_KEY

---

## 七、Claude Code 开发配置

### .claude/settings.json
- 权限: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch, ReadAll
- 工具: toptiary, webSearch(max 10), mcp, gitBranchProtection
- Task文档: 自动创建到 .claude/tasks/

### .claude/commands/supabase.md
- 交互式数据库Schema浏览
- supabase-skill CLI集成
- 支持环境切换、SQL执行、迁移管理

### CLAUDE.md 核心配置
- Multi-Agent工作流: orchestrator(1) + builder(3) + tester(2) + reviewer(1)
- 架构设计流程: 需求分析 → ARCHITECTURE.md → IMPLEMENTATION.md → 代码实现 → 自测 → 审查 → 部署
- 质量门槛: pnpm format(0 error) + pnpm check(0 error) + pnpm build(exit 0)
- 禁止事项: 禁止跳过架构设计、禁止未测试交付、禁止硬编码敏感信息、禁止破坏性操作

---

## 八、版本历史

| 版本 | 日期 | 主要变更 |
|------|------|---------|
| v1.0.5 | 2026-05-23 | 全面E2E测试, 修复ESLint/代码质量 |
| v1.0.3 | 2026-05-23 | ESLint配置, 修复未使用变量 |
| v1.0.2 | 2026-05-23 | QA测试修复 |
| v1.0.1 | 2026-05-23 | 移除硬编码联系方式, 环境变量化 |
| v1.0.0 | 2026-05-19 | 初始生产版本 |

### Git最新Commits
```
f5d409e ci: deploy with new API token
d19123e ci: trigger deployment with Global API Key
11ef260 fix(search): direct modal manipulation instead of window.openSearch
91dbcfe ci: trigger deployment with updated Cloudflare token
9be782f fix(deploy): correct Cloudflare Pages project name to mi-to-ai-new
```

---

## 九、操作手册

### 9.1 本地开发

```bash
# 克隆项目
git clone git@github.com:wangjianxin1988/ai-student-survival.git
cd ai-student-survival

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入Supabase配置

# 启动开发服务器
pnpm dev
# 访问 http://localhost:4321

# 类型检查
pnpm check

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 运行测试
pnpm test

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

### 9.2 部署上线

**自动部署 (推荐):**
```bash
# 推送到main分支自动触发CI/CD
git push origin main
```

**手动部署:**
```bash
# 构建
pnpm build

# 使用wrangler部署
wrangler pages deploy dist --project-name=mi-to-ai-new --branch=main
```

**触发重新部署 (环境变量变更后):**
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

### 9.3 数据库操作

**查看Schema:**
```bash
# 查看所有表
cat .supabase-schema/index.md

# 查看特定表
cat .supabase-schema/tables/tools.md

# 查看外键关系
cat .supabase-schema/relationships.json

# 查看函数
cat .supabase-schema/functions.md
```

**运行迁移:**
```bash
# 查看迁移状态
supabase migration list

# 创建新迁移
supabase migration new <name>

# 应用迁移
supabase migration up

# 回滚
supabase migration down -n 1
```

**直接SQL操作:**
```bash
# 通过supabase-skill
supabase-skill sql -c "SELECT count(*) FROM tools"

# 通过REST API
curl -s "$SUPABASE_URL/rest/v1/tools?select=name,category" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

**种子数据:**
```bash
# 在Supabase Dashboard SQL Editor中执行
cat supabase/seed.sql
```

### 9.4 回滚操作

**代码回滚:**
```bash
# 查看Git历史
git log --oneline -20

# 回滚到指定commit
git revert <commit-hash>

# 或重置到指定tag
git reset --hard v1.0.4
git push origin main --force
```

**数据库回滚:**
```bash
# 回滚最近的迁移
supabase migration down -n 1

# 标记迁移状态
supabase migration repair --status reverted <version>
```

### 9.5 环境变量管理

**Cloudflare Pages环境变量:**
1. 登录 https://dash.cloudflare.com
2. Workers & Pages → mi-to-ai-new → Settings → Environment Variables
3. 添加/修改变量
4. 触发重新部署

**Supabase环境变量:**
```bash
# 列出secrets
supabase secrets list --project-ref giynvpfnzzelzwpmsgtf

# 设置secret
supabase secrets set KEY=VALUE --project-ref giynvpfnzzelzwpmsgtf
```

---

## 十、项目文档清单

| 文件 | 说明 |
|------|------|
| README.md | 项目简介和快速开始 |
| CLAUDE.md | Claude Code开发指引 (471行) |
| SPEC.md | MVP开发规范 |
| CHANGELOG.md | 版本变更记录 |
| P3_DESIGN.md | P3架构与长期设计 (1035行) |
| ISSUE_ANALYSIS.md | 问题分析与修复清单 (51项全通过) |
| FINAL_TEST_REPORT_v105.md | v1.0.5最终测试报告 |
| CUSTOM-DOMAIN-SETUP.md | 自定义域名配置指南 |
| PASSWORD_SETUP.md | 密码保护配置指南 |
| SETUP_INSTRUCTIONS.md | Cloudflare环境变量配置指南 |
| docs/FEATURE_EXPANSION_PLAN.md | 功能拓展规划 |
| docs/POLICY_UPDATE_GUIDE.md | 大学政策数据更新指南 |
| .supabase-schema/index.md | 数据库Schema索引 |
| .supabase-schema/relationships.json | 外键关系 |
| .supabase-schema/functions.md | 数据库函数 |
| .supabase-schema/tables/*.md | 33张表的详细Schema |

---

## 十一、已知问题 (Non-blocking)

| 问题 | 严重性 | 状态 |
|------|--------|------|
| 英文页面共享导航显示中文 | LOW | 已知 - 纯UI问题 |
| HTML5 email validation属性undefined | LOW | 表单功能正常 |
| Supabase session不在localStorage | LOW | Cookie认证正常 |

---

## 十二、测试文件

项目包含大量测试脚本:
- test_api_security.mjs - API安全测试
- test_community_qa.mjs - 社区QA测试
- test_complete_e2e.mjs - 完整E2E测试
- test_auth-v105.mjs - 认证测试
- v105-community-test.mjs - v1.0.5社区测试
- test_reports/ - 测试报告JSON文件

---

## 十三、数据统计

| 数据类型 | 数量 |
|---------|------|
| AI工具 | 33 |
| 大学政策 | 42所大学 |
| 支付方案 | 6+ |
| Prompt模板 | 30+ |
| 防坑指南 | 20+ |
| 社区帖子 | 50+ |
| 评论 | 454+ |
| 城市 | ~10 |
| 赞助商 | ~5 |
| 英文页面 | 16 |

---

_报告生成完毕_
