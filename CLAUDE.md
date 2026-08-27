# CLAUDE.md - AI留学生存指南 开发配置

> 版本: v1.2 | 更新: 2026-08-27 | 用途: Claude Code / Hermes / Codex / 任何 AI Agent 开发指引

---

## 🚨 **新会话 / 新任务开工前必读**（2026-08-27 增加，P72 铁律）

**任何 agent（Claude Code / Hermes / Codex / 其他）接手这个项目的**第一步**，必须按顺序读完以下文档**——**不接受任何借口**：

1. **`AGENTS.md`** — Agent 入口文档（**最新**，2026-08-27 创建）
2. **`README.md`** — 项目简介 + 快速开始
3. **`CHANGELOG.md`** — **最新版本变更**（必读！避免重复已修复的问题）
4. **`PROJECT_STATUS_REPORT.md`** — **项目完整状态**（必读！包含最新 commit + 数据统计 + 已知问题）
5. **如果是 SEO/GEO/OAuth/GSC 相关任务**，额外读：
   - `references/SEO_FIXES_2026-08-27.md` — 2026-08-27 SEO 修复总结
   - `references/gsc-oauth-full-scope-upgrade.md` — OAuth 升级流程
   - `references/gsc-credentials.md` — GSC 凭据管理
6. **根目录文档目录**（不要假设文件不存在）：
   ```bash
   ls *.md references/*.md
   ```

**P72 铁律**（2026-08-27 实踩）：
- ❌ **新 agent 第一件事不是写代码，是读文档**——根目录有 README/CHANGELOG/PROJECT_STATUS 完整文档
- ❌ **不要假设"文档不存在"或"过时"**——除非 `ls` 确认
- ❌ **不要基于记忆声称数据**——必查文档/git log/GSC API
- ✅ **报告"已完成"前必须 `ls *.md` + 看最新 CHANGELOG + 看 PROJECT_STATUS_REPORT**
- ✅ **如果 PROJECT_STATUS_REPORT 超过 7 天未更新，必须先更新它再继续**

**事件**：2026-08-27 我犯的错——没主动读 PROJECT_STATUS_REPORT.md，**整天不知道根目录有完整文档体系**。信哥指出来后才写 `SEO_FIXES_2026-08-27.md` 总结。

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

<!-- supabase-skill:start -->
## supabase-cli (Supabase Database & Infrastructure)

Requires: `supabase` CLI installed, logged in via `supabase login`.
All commands support `-o json` for structured output.

### Environments
- **TEST**: `undefined` (test)

**Environment routing** (use these refs when user says...):
- "dev", "development", "local" → `--project-ref undefined`

**Direct API access** (for curl/psql when supabase CLI isn't enough):
- Read keys from `.env` file — NEVER hardcode keys in commands
- TEST: `$SUPABASE_TEST_URL`, `$SUPABASE_TEST_SERVICE_KEY`, `$SUPABASE_TEST_ANON_KEY`
- Load with: `source .env` or `export $(grep -v '^#' .env | xargs)`

### IMPORTANT: CLI Flag Reference
- Database commands (db, migration, inspect, storage) use `--linked` (requires `supabase link` first)
- Management commands (functions, projects, secrets, snippets) use `--project-ref <ref>`
- `supabase db execute` does NOT exist — use `supabase-skill sql` instead
- To switch linked project: `supabase link --project-ref <ref>`

### Project Linking (required before db/migration/inspect/storage commands)
- `supabase link --project-ref <ref>` — link current directory to a Supabase project
- Must run from a directory with `supabase/config.toml` (or run `supabase init` first)
- Only one project can be linked at a time per directory

### SQL Execution (via psql)
Run arbitrary SQL against any configured environment. Connection is pre-configured — no linking or env vars needed.

**When to use what:**
- **Schema exploration** (table structure, columns, FKs, functions): use `supabase-skill context/table/search/columns` — instant, reads local cache
- **Data queries** (SELECT, INSERT, UPDATE, DELETE, ad-hoc SQL): use `supabase-skill sql` — runs live against the database
- **DDL / migrations**: use `supabase migration` workflow (not `sql`)

**Commands:**
- `supabase-skill sql -c "SELECT count(*) FROM table_name"` — run SQL on stage (default)
- `supabase-skill sql --prod -c "SELECT ..."` — run SQL on production
- `supabase-skill sql -f path/to/file.sql` — execute SQL file
- `echo "SELECT 1" | supabase-skill sql` — pipe SQL via stdin
- `supabase-skill sql -c "..." --raw` — raw unformatted psql output
- `supabase-skill sql --setup` — configure postgres connection URL
- `supabase-skill sql --prod --setup` — configure prod connection URL

**Environment targeting:**
- Default is always **stage** — safe for exploration and testing
- Use `--prod` only when user explicitly asks for production data
- Use `--project-ref <ref>` to target a specific project ref directly

**Notes:**
- Connection strings are stored in config (set during `supabase-skill install` or first `sql` run)
- If you get a connection error, tell the user to run `supabase-skill sql --setup` to configure pgUrl
- Schema is auto-set to the configured schema (e.g., `public`) via search_path

### Data Operations (REST API)
Load env vars first: `source .env` or `export $(grep -v '^#' .env | xargs)`
Header shorthand: `-H "apikey: $KEY" -H "Authorization: Bearer $KEY"`
GET uses `Accept-Profile: public`, POST/PATCH/DELETE use `Content-Profile: public`

**SELECT (GET)**:
- `curl -s "$URL/rest/v1/<table>?select=col1,col2&limit=10" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Accept-Profile: public"`

**Filters** (append to URL query string):
- `?col=eq.value` — equals | `?col=neq.value` — not equals
- `?col=gt.5` — greater than | `?col=gte.5` — greater or equal | `?col=lt.5` | `?col=lte.5`
- `?col=like.*pattern*` — LIKE | `?col=ilike.*pattern*` — case-insensitive LIKE
- `?col=in.(val1,val2)` — IN list | `?col=is.null` — IS NULL | `?col=is.true`
- `?or=(col1.eq.a,col2.eq.b)` — OR conditions
- `?order=col.desc` — ORDER BY | `?limit=10&offset=20` — pagination

**COUNT**: Add `-H "Prefer: count=exact"` header, read `Content-Range` response header

**INSERT (POST)**:
- `curl -s "$URL/rest/v1/<table>" -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Profile: public" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"col": "value"}'`

**UPDATE (PATCH)** — ALWAYS include a filter or you update ALL rows:
- `curl -s "$URL/rest/v1/<table>?id=eq.<uuid>" -X PATCH -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Profile: public" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"col": "new_value"}'`

**UPSERT (POST with merge)**:
- Add header: `-H "Prefer: resolution=merge-duplicates,return=representation"`

**DELETE** — ALWAYS include a filter or you delete ALL rows:
- `curl -s "$URL/rest/v1/<table>?id=eq.<uuid>" -X DELETE -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Profile: public" -H "Prefer: return=representation"`

**Call RPC function (POST)**:
- `curl -s "$URL/rest/v1/rpc/<function>" -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Profile: public" -H "Content-Type: application/json" -d '{"param": "value"}'`

### Migrations (uses --linked, NOT --project-ref)
- `supabase migration new <name>` — create empty migration file (local only)
- `supabase migration list` — compare local vs remote (linked project)
- `supabase migration up` — apply pending migrations to linked project
- `supabase migration down -n 1` — rollback last N migrations
- `supabase migration repair --status applied <version>` — mark version as applied
- `supabase migration repair --status reverted <version>` — mark version as reverted
- `supabase migration squash` — combine into single file
- `supabase migration fetch` — pull migration history from remote

### DDL (Schema Changes via Migrations)
All schema changes go through migration files. Create with `supabase migration new <name>`, write SQL, apply with `supabase migration up`:
- **CREATE TABLE**: `CREATE TABLE public.<name> (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), ...);`
- **ALTER TABLE**: `ALTER TABLE public.<table> ADD COLUMN <col> <type>;`
- **DROP TABLE**: `DROP TABLE IF EXISTS public.<table>;`
- **CREATE VIEW**: `CREATE OR REPLACE VIEW public.<name> AS SELECT ...;`
- **CREATE INDEX**: `CREATE INDEX idx_<table>_<col> ON public.<table>(<col>);`
- **CREATE FUNCTION/RPC**: `CREATE OR REPLACE FUNCTION public.<name>(...) RETURNS ... AS $$ ... $$ LANGUAGE plpgsql;`
- **RLS Policies**: `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY; CREATE POLICY ...`
- **Triggers**: `CREATE TRIGGER ... BEFORE/AFTER INSERT/UPDATE ON public.<table> ...`
- **Enums**: `CREATE TYPE public.<name> AS ENUM ('val1', 'val2');`
- Always use `public.` schema prefix for all objects
- Run `supabase migration list` BEFORE and AFTER to verify

### Schema Management (uses --linked, NOT --project-ref)
- `supabase db diff` — diff local vs remote schema
- `supabase db dump` — dump full schema from linked project
- `supabase db dump --data-only` — dump data only
- `supabase db dump -s public` — dump specific schema
- `supabase db pull` — pull remote schema to local migrations
- `supabase db push` — push migrations to remote
- `supabase db lint` — check for typing errors (local only)

### Database Inspection (uses --linked or --db-url, NOT --project-ref)
- `supabase inspect db table-stats` — table sizes + row counts
- `supabase inspect db index-stats` — index usage + scan counts
- `supabase inspect db long-running-queries` — queries > 5min
- `supabase inspect db outliers` — slowest queries by total time
- `supabase inspect db bloat` — dead tuple estimation
- `supabase inspect db locks` — active locks
- `supabase inspect db blocking` — blocking lock chains
- `supabase inspect db db-stats` — cache hit rates, WAL, sizes
- `supabase inspect db vacuum-stats` — vacuum status per table
- `supabase inspect db role-stats` — role information
- `supabase inspect db replication-slots` — replication status
- `supabase inspect report` — CSV of ALL inspect commands
- Alternative: `supabase inspect db table-stats --db-url "postgresql://..."` — inspect without linking

### Storage (uses --linked + --experimental)
- `supabase storage ls ss:///bucket/path --experimental` — list objects (note: triple slash ss:///)
- `supabase storage cp local.file ss:///bucket/path --experimental` — upload
- `supabase storage cp ss:///bucket/path local.file --experimental` — download
- `supabase storage rm ss:///bucket/path --experimental` — delete
- `supabase storage mv ss:///old ss:///new --experimental` — move/rename

### Edge Functions (uses --project-ref)
- `supabase functions list --project-ref <ref>` — list deployed functions
- `supabase functions deploy <name> --project-ref <ref>` — deploy function
- `supabase functions delete <name> --project-ref <ref>` — delete function
- `supabase functions new <name>` — create new function locally
- `supabase functions download [name]` — download function source from linked project
- `supabase functions serve` — serve all functions locally for testing

### Branches (uses --project-ref)
- `supabase branches list --project-ref <ref> -o json` — list all preview branches
- `supabase branches create <name> --project-ref <ref>` — create preview branch
- `supabase branches get <branch-id> --project-ref <ref>` — get branch details
- `supabase branches delete <branch-id> --project-ref <ref>` — delete branch
- `supabase branches pause <branch-id> --project-ref <ref>` — pause branch (save costs)
- `supabase branches unpause <branch-id> --project-ref <ref>` — resume branch

### Backups (uses --project-ref)
- `supabase backups list --project-ref <ref>` — list available physical backups
- `supabase backups restore --project-ref <ref>` — restore to specific timestamp (PITR)

### Project Management (uses --project-ref)
- `supabase projects list -o json` — list all projects
- `supabase projects api-keys --project-ref <ref> -o json` — get API keys
- `supabase secrets list --project-ref <ref>` — list env secrets
- `supabase secrets set KEY=VALUE --project-ref <ref>` — set secret
- `supabase postgres-config get --project-ref <ref>` — get Postgres config overrides
- `supabase postgres-config update --project-ref <ref>` — update Postgres config

### Code Generation
- `supabase gen types --linked` — generate TypeScript types from linked project schema
- `supabase gen types --project-id <ref>` — generate types from specific project

### SQL Snippets (uses --project-ref)
- `supabase snippets list --project-ref <ref> -o json` — list saved snippets
- `supabase snippets download <id> --project-ref <ref>` — download snippet SQL

### Setup
- `supabase-skill install` — global setup (interactive wizard, adds to ~/.claude/CLAUDE.md)
- `supabase-skill init` — per-project setup (CLAUDE.md + .env + .gitignore)
- `supabase-skill docs` — output LLM instruction snippet
- `supabase-skill docs --format claude` — CLAUDE.md format
- `supabase-skill envs` — list configured environments

### Schema Snapshot (local DB map — use INSTEAD of querying information_schema)
If `.supabase-schema/` exists, ALWAYS use these commands instead of running SQL to explore the schema:
- `supabase-skill snapshot` — snapshot schema to .supabase-schema/ (tables, columns, FKs, functions)
- `supabase-skill snapshot --project-ref <ref>` — snapshot a specific environment
- `supabase-skill context <table-or-topic>` — get full context: columns, FKs, related tables (3 levels deep), name-related tables, functions
- `supabase-skill context <topic> --depth 5` — deeper FK traversal
- `supabase-skill table <name>` — full single-table detail with relationships, functions, related table summaries
- `supabase-skill columns --type <type>` — find all columns of a type (uuid, jsonb, text, timestamp, etc.)
- `supabase-skill columns --fk` — find all foreign key columns
- `supabase-skill columns --table <name>` — filter columns to specific table
- `supabase-skill columns <name> --type jsonb` — combine name + type filters
- `supabase-skill search <query>` — search tables, columns, functions, and relationships
- `supabase-skill search <query> --json` — structured JSON output
- `supabase-skill functions [query]` — list/search RPC functions with parameters
- `supabase-skill functions --args uuid` — find functions by argument type
- `supabase-skill indexes [table]` — list indexes, filter by table, `--unique`, `--primary`
- `supabase-skill enums [name]` — list custom enum types and their values
- `supabase-skill policies [table]` — list RLS policies, filter by `--command SELECT/INSERT/UPDATE/DELETE`
- `supabase-skill triggers [table]` — list triggers, filter by `--event INSERT/UPDATE/DELETE`
- `supabase-skill views [name]` — list views, `--full` for definitions
- Read `.supabase-schema/tables/<name>.md` — full table schema (columns, types, PKs, FKs, defaults)
- Read `.supabase-schema/index.md` — overview of all tables, views, functions
- Read `.supabase-schema/relationships.json` — all foreign key mappings
- Read `.supabase-schema/functions.md` — all RPC functions with parameters

### Schema Snapshot Auto-Refresh
- Snapshot refreshes nightly via cron (if configured with `supabase-skill cron`)
- **After applying migrations**: Run `supabase-skill snapshot` to update the local schema cache
- **After creating/altering tables**: Run `supabase-skill snapshot` before continuing work
- **Rule of thumb**: If you ran any DDL (CREATE, ALTER, DROP) or migration commands, refresh the snapshot immediately
- **Freshness check**: If snapshot is >24h old, suggest refreshing before relying on schema data
- `supabase-skill doctor` shows snapshot age and overall setup health

### Safety Rules
- NEVER run mutations on PROD without explicit user approval
- ALWAYS specify `--project-ref` — never rely on linked project for remote ops
- Use `-o json` for structured output the agent can parse
- Run `supabase migration list` BEFORE and AFTER migration operations
- Test migrations on STAGE before applying to PROD

### Exit codes
- 0 = success, 1 = error
<!-- supabase-skill:end -->
