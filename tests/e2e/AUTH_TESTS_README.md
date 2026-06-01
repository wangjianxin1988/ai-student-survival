# Auth E2E Tests — Playwright + 1secmail

自动化登录/注册 E2E 测试套件，使用真实 Supabase 认证和 1secmail 临时邮箱。

## 测试场景

| # | 场景 | 描述 |
|---|------|------|
| 1 | 注册新用户 | 注册 → 收到验证邮件 → 点击链接验证 → 自动登录 |
| 2 | OTP验证码登录 | 输入邮箱 → 发送6位验证码 → 输入验证码 → 登录成功 |
| 3 | 忘记密码 | 输入邮箱 → 收到重置链接 → 设置新密码 → 用新密码登录 |
| 4 | 密码登录 | 注册验证后 → 用邮箱+密码登录 → 登录成功 |
| 5 | 登录页面元素 | 验证登录页所有表单元素存在 |
| 6 | 注册页面元素 | 验证注册页所有表单元素存在 |

## 前置条件

1. **Node.js 22+** 已安装
2. **pnpm** 已安装
3. **Playwright 浏览器** 已安装：
   ```bash
   pnpm exec playwright install chromium
   ```
4. **开发服务器**正在运行：
   ```bash
   pnpm dev
   ```
   默认端口 4321，可通过 `BASE_URL` 环境变量修改。

5. **Supabase 配置正确**（.env 文件中）：
   ```
   PUBLIC_SUPABASE_URL=https://giynvpfnzzelzwpmsgtf.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA  # 测试密钥，自动通过
   ```

6. **关闭 Demo 模式**（确保 `FORCE_DEMO_AUTH` 不为 `true`，`isDemoMode()` 返回 `false`）

## 运行测试

```bash
# 运行所有认证测试
pnpm exec playwright test tests/e2e/auth.spec.ts

# 运行单个场景
pnpm exec playwright test tests/e2e/auth.spec.ts -g "Scenario 1"

# 带浏览器UI运行（可视化调试）
pnpm exec playwright test tests/e2e/auth.spec.ts --headed

# 调试模式（逐步执行）
pnpm exec playwright test tests/e2e/auth.spec.ts --debug

# 指定自定义URL
BASE_URL=http://localhost:4329 pnpm exec playwright test tests/e2e/auth.spec.ts
```

## 文件结构

```
tests/e2e/
├── auth.setup.ts    # 辅助函数（邮箱生成、邮件轮询、OTP提取）
├── auth.spec.ts     # 主测试文件（6个测试用例）
└── ...
playwright.config.ts # Playwright 配置
```

## 技术细节

### 1secmail API
- 免费临时邮箱，无需注册
- 每个测试生成独立邮箱，避免冲突
- 轮询间隔 3 秒，最长等待 90 秒

### Turnstile 验证
- 使用测试密钥 `1x00000000000000000000AA`
- 测试模式下自动通过，无需手动操作
- 代码中通过 `useLayoutEffect` 同步发射 token

### OTP 提取
- 从邮件 HTML/textBody 中用正则提取 6 位数字
- 支持多种邮件格式

### 恢复链接提取
- 解析 `<a href="...">` 标签
- 处理 HTML 实体（`&amp;`, `&#x2F;` 等）
- 支持 hash fragment（`#access_token=...&type=recovery`）

## 故障排除

### 邮件收不到
- 1secmail 有速率限制，等待几分钟后重试
- 检查 Supabase 邮件发送配置
- 确认 Supabase 项目未禁用邮件确认

### Turnstile 失败
- 确保 `.env` 中 `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`
- 测试密钥在生产环境不可用

### 端口冲突
- 检查 `pnpm dev` 运行在哪个端口
- 用 `BASE_URL` 环境变量指定正确端口

### Supabase rate limit
- 连续注册可能触发 90 秒速率限制
- 等待后重试，或使用不同 IP
