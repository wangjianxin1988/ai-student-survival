// scripts/check-tool-images.js
// P73 铁律：所有 AI tool 必须有 Unsplash imageUrl（1200×630 比例）
//
// CI 强制门禁：未来任何缺 imageUrl 的 AI tool 都会被本脚本拦截，commit 直接失败。
// 调用方式：node scripts/check-tool-images.js   (或 pnpm check:tool-images)
//
// 期望 src/data/static-tools.ts 顶部数组形如：
//   {
//     id: 'some-id',
//     ...
//     imageUrl: 'https://images.unsplash.com/photo-...?w=1200&h=630&fit=crop',
//     ...
//   },
//   ...
// ];
//
// 字段名支持（任一即可）：imageUrl | coverImage | thumbnail | ogImage
// 与 check-payment-images.js 风格一致，但独立实现，避免耦合。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_FILE = path.join(PROJECT_ROOT, 'src/data/static-tools.ts');

if (!fs.existsSync(TARGET_FILE)) {
  console.error(`❌ 找不到文件：${TARGET_FILE}`);
  console.error('请确认你在 ai-student-survival 仓库根目录下运行此脚本。');
  process.exit(2);
}

// 文件可能是 CRLF，统一替换为 LF（保持源行号不变在结尾用）
const content = fs.readFileSync(TARGET_FILE, 'utf-8').replace(/\r\n/g, '\n');

// 1. 找 export const xxx: Type[] = [  （自动识别数组名，不硬编码 staticTools）
const arrayStartMatch = content.match(/export\s+const\s+(\w+)\s*:\s*\w+\[\]\s*=\s*\[/);
if (!arrayStartMatch) {
  console.error(`❌ ${TARGET_FILE} 没找到 export const xxx: Type[] = [`);
  process.exit(1);
}
const arrayName = arrayStartMatch[1];
const arrayStartIdx = arrayStartMatch.index + arrayStartMatch[0].length;

// 2. 找数组结束 ];  （第一个独立行的 ]; 即可，匹配 payment 脚本风格但更宽松）
const afterStart = content.substring(arrayStartIdx);
const endMatch = afterStart.match(/\n[ \t]*\];\s*(?:\n|$)/);
if (!endMatch) {
  console.error(`❌ ${TARGET_FILE} 找不到数组结束 ];`);
  process.exit(1);
}
const arrayEndIdx = arrayStartIdx + endMatch.index;
const inArray = content.substring(0, arrayEndIdx);

// 3. 抓所有顶层 block：以 `{` 开头（可能在独立行），到下一个 `\n  },` 或 `\n  };` 结束。
//    比 payment 脚本更鲁棒：兼容 `{` 后跟 comment 行的情况 + 不同缩进。
const blockPattern = /\{[\s\S]*?(?=\n[ \t]*\},|\n[ \t]*\};|\n\};)/g;
const blocks = inArray.match(blockPattern) || [];

const IMAGE_FIELD_RE = /(?:imageUrl|coverImage|thumbnail|ogImage)\s*:/i;
const ID_RE = /\bid:\s*'([^']+)'/;

let missingCount = 0;
const missingIds = [];

for (const block of blocks) {
  const idMatch = block.match(ID_RE);
  if (!idMatch) continue; // 跳过非条目 block
  const hasImage = IMAGE_FIELD_RE.test(block);
  if (!hasImage) {
    missingCount++;
    missingIds.push(idMatch[1]);
  }
}

if (missingCount > 0) {
  console.error(`❌ P73 检查失败：${missingCount}/${blocks.length} 个 AI tool 缺 imageUrl/coverImage`);
  console.error('缺图 id 列表：');
  missingIds.forEach(id => console.error(`  - ${id}`));
  console.error('');
  console.error(`数据源：${TARGET_FILE} 数组 ${arrayName}`);
  console.error('修复方法：给每条加 Unsplash imageUrl（1200×630 比例，URL 加 ?w=1200&h=630&fit=crop）');
  console.error('参考现有条目：从 src/data/static-tools.ts 任意一条复制 imageUrl 行。');
  process.exit(1);
}

console.log(`✓ P73 检查通过：${blocks.length} 个 AI tool 全部有 imageUrl/coverImage`);
process.exit(0);
