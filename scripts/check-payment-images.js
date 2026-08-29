// scripts/check-payment-images.js
// P73 + 信哥 2026-08-29 铁律：所有 payment solution 必须有 Unsplash imageUrl
//
// CI 强制门禁：未来任何缺 imageUrl 的 payment solution 都会被本脚本拦截，commit 直接失败。
// 调用方式：node scripts/check-payment-images.js   (或 pnpm check:payment-images)
//
// 期望 src/data/paymentSolutions.ts 顶部数组形如：
//   {
//     id: 'some-id',
//     ...,
//     imageUrl: 'https://images.unsplash.com/photo-...',  // 必须存在
//     ...,
//   },
//   ...
// ];

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_FILE = path.join(PROJECT_ROOT, 'src/data/paymentSolutions.ts');

if (!fs.existsSync(TARGET_FILE)) {
  console.error(`❌ 找不到文件：${TARGET_FILE}`);
  console.error('请确认你在 ai-student-survival 仓库根目录下运行此脚本。');
  process.exit(2);
}

const content = fs.readFileSync(TARGET_FILE, 'utf-8');

// 抓所有顶层 payment-solution 块：以 `{` + `id: '...',` 开头，到下一个 `  },` 或 `];` 结束。
// 顶层块缩进是 4 空格；content 字段里有反引号字符串可能含 }, 但 `\n  },` 前的两空格+}, 必须
// 是数组元素结束符（content 是反引号多行字符串，不会出现 `\n  },` 这种顶格 closing 形式）。
const blocks = content.match(/\{\s*id:\s*'[^']+',[\s\S]*?(?=\n  \},|\n\};)/g) || [];

let missingCount = 0;
const missingIds = [];

for (const block of blocks) {
  const idMatch = block.match(/id:\s*'([^']+)'/);
  const imgMatch = block.match(/imageUrl:\s*'([^']+)'/);

  if (idMatch && !imgMatch) {
    missingCount++;
    missingIds.push(idMatch[1]);
  }
}

if (missingCount > 0) {
  console.error(`❌ P73 检查失败：${missingCount} 个 payment solution 缺 imageUrl`);
  console.error('缺图 id 列表：');
  missingIds.forEach(id => console.error(`  - ${id}`));
  console.error('');
  console.error('修复方法：给每条加 Unsplash imageUrl（1200×630 比例，URL 加 ?w=1200&h=630&fit=crop）');
  console.error('参考现有 4 条：chatgpt-go-gpt-5-6-subscription-2026 / china-domestic-payment-guide-2026 / google-ai-pro-student-payment-guide-2026 / mastercard-ai-cashback-card-2026');
  process.exit(1);
}

console.log(`✓ P73 检查通过：${blocks.length} 个 payment solution 全部有 imageUrl`);
process.exit(0);