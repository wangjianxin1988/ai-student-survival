// scripts/check-blog-images.js
// P73 铁律：所有 blog post 必须有 Unsplash imageUrl（1200×630 比例）
//
// CI 强制门禁：未来任何缺 imageUrl 的 blog post 都会被本脚本拦截，commit 直接失败。
// 调用方式：node scripts/check-blog-images.js   (或 pnpm check:blog-images)
//
// 期望 src/data/blogPosts.ts 顶部数组形如：
//   {
//     id: 'some-slug',
//     ...
//     imageUrl: 'https://images.unsplash.com/photo-...?w=1200&h=630&fit=crop',
//     ...
//   },
//   ...
// ];
//
// 注意：BlogPost interface 当前没有 imageUrl 字段，但 P73 强制要求每条必须有。
// 字段名支持（任一即可）：imageUrl | coverImage | thumbnail | ogImage
// 与 check-payment-images.js / check-tool-images.js 风格一致，但独立实现。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_FILE = path.join(PROJECT_ROOT, 'src/data/blogPosts.ts');

if (!fs.existsSync(TARGET_FILE)) {
  console.error(`❌ 找不到文件：${TARGET_FILE}`);
  console.error('请确认你在 ai-student-survival 仓库根目录下运行此脚本。');
  process.exit(2);
}

// 文件可能是 CRLF，统一替换为 LF
const content = fs.readFileSync(TARGET_FILE, 'utf-8').replace(/\r\n/g, '\n');

// 1. 找 export const xxx: Type[] = [  （自动识别数组名，不硬编码 blogPosts）
const arrayStartMatch = content.match(/export\s+const\s+(\w+)\s*:\s*\w+\[\]\s*=\s*\[/);
if (!arrayStartMatch) {
  console.error(`❌ ${TARGET_FILE} 没找到 export const xxx: Type[] = [`);
  process.exit(1);
}
const arrayName = arrayStartMatch[1];
const arrayStartIdx = arrayStartMatch.index + arrayStartMatch[0].length;

// 2. 找数组结束 ];。blogPosts.ts 最后一条 entry 用了 6 空格 }, + 4 空格 ];
//    且文件可能以 ]; EOF 结束。用更宽松的匹配：找到 export 之后第一个独立行的 ];
const afterStart = content.substring(arrayStartIdx);
const endMatch = afterStart.match(/\n[ \t]*\];\s*(?:\n|$)/);
if (!endMatch) {
  console.error(`❌ ${TARGET_FILE} 找不到数组结束 ];`);
  process.exit(1);
}
const arrayEndIdx = arrayStartIdx + endMatch.index;
const inArray = content.substring(0, arrayEndIdx);

// 3. 抓所有顶层 block。blogPosts.ts 里有些 entry 是 `{` 后跟 comment 行 + `id:`，
//    兼容 `{` 后跟任意字符（含换行）直到 `\n  },` / `\n  };` / `\n};` 或缩进变体。
const blockPattern = /\{[\s\S]*?(?=\n[ \t]*\},|\n[ \t]*\};|\n\};)/g;
const blocks = inArray.match(blockPattern) || [];

const IMAGE_FIELD_RE = /(?:imageUrl|coverImage|thumbnail|ogImage)\s*:/i;
const ID_RE = /\bid:\s*'([^']+)'/;

let missingCount = 0;
const missingIds = [];

for (const block of blocks) {
  const idMatch = block.match(ID_RE);
  if (!idMatch) continue;
  const hasImage = IMAGE_FIELD_RE.test(block);
  if (!hasImage) {
    missingCount++;
    missingIds.push(idMatch[1]);
  }
}

if (missingCount > 0) {
  console.error(`❌ P73 检查失败：${missingCount}/${blocks.length} 个 blog post 缺 imageUrl/coverImage`);
  console.error('缺图 id 列表：');
  missingIds.forEach(id => console.error(`  - ${id}`));
  console.error('');
  console.error(`数据源：${TARGET_FILE} 数组 ${arrayName}`);
  console.error('修复方法：给每条 blog 在顶层加 Unsplash imageUrl（1200×630 比例，URL 加 ?w=1200&h=630&fit=crop）');
  console.error('参考现有 7 条：waic-2026-international-student-trends / us-colleges-drop-supplemental-essays-2027 / gemini-pro-student-offer-2026-status / ai-reshapes-university-classroom-2026 / ai-models-august-2026-ultimate-showdown / fall-2026-ai-course-advisor-strategy / chinaguide-ai-china-travel-2026');
  console.error('同时建议扩展 BlogPost interface 加 imageUrl?: string 字段。');
  process.exit(1);
}

console.log(`✓ P73 检查通过：${blocks.length} 个 blog post 全部有 imageUrl/coverImage`);
process.exit(0);
