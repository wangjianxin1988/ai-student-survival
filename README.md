# AI留学生存指南

> 中国留学生AI工具大全 - 工具推荐 · 支付指南 · 大学政策 · Prompt模板

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.14.1-green.svg)
![Astro](https://img.shields.io/badge/astro-4.15-blue.svg)

## 项目简介

AI留学生存指南是一个AI Native网站，服务中国留学生在海外使用AI工具的四大痛点：

1. **不知道用什么AI工具** - 500+精选AI工具，多维度分类和评分
2. **支付困难** - 虚拟卡、礼品卡、地区定价全攻略
3. **不了解大学AI政策** - 200+海外大学AI政策数据库
4. **不会写Prompt** - 1000+精选Prompt模板库

## 核心特性

- **AI Native架构** - 同时服务人类用户和AI Agent
- **双语言支持** - 中文 + 英文，无缝切换
- **结构化数据** - Schema.org JSON-LD，SEO/GEO优化
- **API优先** - 所有数据可通过API访问
- **响应式设计** - 适配所有设备

## 快速开始

### 前置要求

- Node.js >= 18.14.1
- pnpm (推荐) 或 npm

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-student-survival.git
cd ai-student-survival

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 填入你的Supabase配置

# 启动开发服务器
pnpm dev
```

打开 http://localhost:4321 查看网站。

### 环境变量

```env
# Supabase
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# TinaCMS (可选)
TINA_CLIENT_ID=your-tina-client-id
TINA_TOKEN=your-tina-token
```

## 项目结构

```
ai-student-survival/
├── src/
│   ├── components/       # React组件
│   │   ├── tools/       # AI工具相关
│   │   ├── payment/    # 支付相关
│   │   ├── policies/   # 政策相关
│   │   └── common/     # 通用组件
│   ├── layouts/        # 布局组件
│   ├── pages/          # 页面
│   │   ├── index.astro
│   │   ├── tools/
│   │   ├── payment/
│   │   ├── policies/
│   │   └── api/
│   ├── lib/            # 工具函数
│   │   └── supabase.ts
│   └── styles/         # 全局样式
├── public/
│   ├── robots.txt     # AI爬虫规则
│   └── sitemap.xml    # 网站地图
├── content/            # TinaCMS内容
├── supabase/           # 数据库Schema
├── tests/              # 测试文件
├── SPEC.md             # 开发规范
└── package.json
```

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Astro 4.x + React 18 | Islands架构 |
| 样式 | TailwindCSS | 原子化CSS |
| 内容管理 | TinaCMS | Git-based |
| 数据库 | Supabase | PostgreSQL + 实时 |
| 搜索 | Typesense | 全文搜索 |
| 部署 | Cloudflare Pages | 边缘加速 |

## 开发

```bash
# 开发
pnpm dev

# 类型检查
pnpm check

# 代码格式
pnpm format

# 代码检查
pnpm lint

# 测试
pnpm test

# 构建
pnpm build

# 预览构建
pnpm preview
```

## 页面路由

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 主页，展示四大模块 |
| AI工具库 | `/tools` | 工具列表页 |
| 工具详情 | `/tools/[slug]` | 单个工具详情页 |
| 支付解决方案 | `/payment` | 支付教程列表 |
| 大学政策 | `/policies` | 大学政策列表 |
| API文档 | `/api` | API端点说明 |

## API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/tools` | GET | 获取AI工具列表 |
| `/api/tools/[slug]` | GET | 获取工具详情 |
| `/api/payment-solutions` | GET | 获取支付解决方案 |
| `/api/policies` | GET | 获取大学政策列表 |
| `/api/prompts` | GET | 获取Prompt模板 |

## 部署

### Cloudflare Pages

1. 在Cloudflare Pages创建新项目
2. 连接Git仓库
3. 配置构建命令：
   ```bash
   pnpm build
   ```
4. 设置环境变量
5. 部署！

### 本地构建

```bash
pnpm build
# 输出在 dist/ 目录
```

## 数据模型

### AI工具 (Tool)

```typescript
interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'writing' | 'coding' | 'design' | 'research' | 'communication';
  pricing: 'free' | 'freemium' | 'paid';
  priceDetail: { monthly?: number; yearly?: number; currency: string };
  url: string;
  rating: number;
  ratingCount: number;
  dimensions: { easeOfUse: number; features: number; value: number };
  tags: string[];
  features: string[];
  alternatives: string[];
  isNew: boolean;
}
```

### 支付解决方案 (PaymentSolution)

```typescript
interface PaymentSolution {
  id: string;
  title: string;
  category: 'virtual_card' | 'gift_card' | 'regional_pricing' | 'troubleshooting';
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reliability: 'high' | 'medium' | 'low';
  rating: number;
  ratingCount: number;
}
```

### 大学政策 (UniversityPolicy)

```typescript
interface UniversityPolicy {
  id: string;
  universityName: string;
  country: string;
  region: string;
  teachingPolicy: string;
  assignmentPolicy: string;
  researchPolicy: string;
  prohibitedTools: string[];
  allowedTools: string[];
  penalty: string;
  lastUpdated: string;
}
```

## SEO/GEO优化

- [x] Schema.org JSON-LD结构化数据
- [x] robots.txt AI爬虫权限
- [x] Open Graph标签
- [x] Twitter Cards
- [x] Sitemap.xml
- [x] 语义化URL
- [x] 响应式设计

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

Made with ❤️ for Chinese international students
