# Cloudflare Pages 环境变量配置指南

## 问题描述

网站 https://ai-student-survival.pages.dev 返回 522 错误（Cloudflare 无法连接到源服务器）。

GitHub Actions 部署成功，但网站无法访问。根本原因是 **Supabase 环境变量未在 Cloudflare Pages Dashboard 中设置**。

## 修复步骤

### 1. 登录 Cloudflare Dashboard

访问 https://dash.cloudflare.com 并登录您的账户。

### 2. 进入项目设置

1. 在左侧菜单选择 **Workers & Pages**
2. 点击 **ai-student-survival** 项目
3. 进入 **Settings**（设置）选项卡
4. 选择 **Environment Variables**（环境变量）

### 3. 添加 Supabase 环境变量

为 **Production** 环境添加以下两个变量：

| 变量名 | 值 |
|--------|-----|
| `PUBLIC_SUPABASE_URL` | `https://giynvpfnzzelzwpmsgtf.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeW52cGZuenplbHp3cG1zZ3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDYxMjUsImV4cCI6MjA5NDc4MjEyNX0.TfBGkymlc-lMKkgmZHTUT-rMfOYo52VZRmbCU4bul9I` |

### 4. 触发重新部署

设置完环境变量后，需要触发重新部署以使变量生效。

#### 方法：推送空提交

在项目根目录执行：

```bash
cd D:\suoyouxiangmu\ai-student-survival
git commit --allow-empty -m "chore: trigger redeploy after env vars"
git push origin main
```

或者直接通过 GitHub Actions 控制台重新运行 workflow。

### 5. 验证部署

部署完成后，访问 https://ai-student-survival.pages.dev 检查是否正常访问。

## 技术说明

### 为什么环境变量需要单独设置？

1. 本地 `.env` 文件用于本地开发构建
2. GitHub Actions 使用自己的环境构建
3. Cloudflare Pages Workers/ Pages Functions 在运行时需要访问环境变量
4. 这些运行时环境变量必须在 Cloudflare Dashboard 中单独配置

### Astro 配置说明

项目使用 `output: 'hybrid'` 模式，部分页面需要服务端渲染 (SSR)。SSR 代码在 Cloudflare Workers 中运行，因此需要访问 Supabase 环境变量。

```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://ai-student-survival.pages.dev',
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  // ...
});
```

## 获取 Supabase 凭据（备用）

如果需要更新 Supabase 凭据：

1. 登录 https://supabase.com/dashboard
2. 选择项目 **gizplan-student-survival** 或类似名称
3. 进入 **Settings** > **API**
4. 复制 **Project URL** 和 **anon public** key

## 故障排除

### 仍然出现 522 错误？

1. 确认环境变量已正确添加（检查是否有拼写错误）
2. 确认环境变量在 **Production** 环境而非其他环境
3. 等待几分钟后重试（环境变量可能需要时间生效）
4. 检查 Cloudflare Pages 的部署日志

### 构建失败？

检查 GitHub Actions 日志中是否有错误信息。
