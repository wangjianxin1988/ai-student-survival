// scripts/fix-blog-images.js
// P73 修复：给缺 imageUrl 的 blog post 在【数组块内部】插入 Unsplash imageUrl。
//
// ⚠️ 铁律（14c2227 踩过的坑）：绝对不能把 imageUrl 追加到文件末尾。
// 本脚本的做法：
//   1. 定位 export const blogPosts: BlogPost[] = [ ... ]; 的数组区间
//   2. 只在该区间内查找目标 blog 块（以 `id: 'slug',` 为锚）
//   3. 在该块内最后一个 `viewCount: N,` 行之后插入 imageUrl（保持同缩进）
//   4. 插入点必须 < 数组结束下标，否则拒绝写入
//
// 用法：node scripts/fix-blog-images.js  (幂等，已有 imageUrl 的块会跳过)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FILE = path.join(PROJECT_ROOT, 'src/data/blogPosts.ts');

// slug -> Unsplash photo id（全部已 urllib verify HTTP 200 + image/jpeg，且与站内已用图不重复）
const BLOG_IMAGES = {
  'chatgpt-go-how-to-subscribe': 'photo-1563986768494-4dee2763ff3f',
  'claude-opus-48-review': 'photo-1712002641088-9d76f9080889',
  'eu-ai-act-student-guide': 'photo-1467269204594-9661b134dd2b',
  'best-ai-coding-tools-2026': 'photo-1555949963-ff9fe0c870eb',
  'top-25-ai-tools-2026': 'photo-1451187580459-43490279c0fa',
  'china-ai-usage-guide-2026': 'photo-1508804185872-d7badad00f7d',
  'us-f1-4-year-cap-2026': 'photo-1541339907198-e08756dedf3f',
  'china-aigc-detection-2026': 'photo-1581093450021-4a7360e9a6b5',
  'claude-fable-5-review-2026': 'photo-1544947950-fa07a98d237f',
  'deepseek-v4-pro-price-cut-2026': 'photo-1611974789855-9c2a0a7236a3',
  'ai-models-july-2026-roundup': 'photo-1531746790731-6c087fecd65a',
};

const toUrl = (pid) => `https://images.unsplash.com/${pid}?w=1200&h=630&fit=crop`;

let content = fs.readFileSync(FILE, 'utf-8');

// --- 1. 定位数组区间 ---
function arrayBounds(text) {
  const m = text.match(/export\s+const\s+(\w+)\s*:\s*\w+\[\]\s*=\s*\[/);
  if (!m) throw new Error('找不到 export const xxx: Type[] = [');
  const start = m.index + m[0].length;
  const after = text.substring(start);
  const end = after.match(/\n[ \t]*\];\s*(?:\n|$)/);
  if (!end) throw new Error('找不到数组结束 ];');
  return { name: m[1], start, end: start + end.index };
}

let bounds = arrayBounds(content);
console.log(`数组 ${bounds.name}: [${bounds.start}, ${bounds.end})`);

let inserted = 0;
let skipped = 0;

for (const [slug, pid] of Object.entries(BLOG_IMAGES)) {
  bounds = arrayBounds(content); // 每次插入后偏移会变，重新计算

  const idAnchor = `id: '${slug}',`;
  const idIdx = content.indexOf(idAnchor, bounds.start);
  if (idIdx === -1 || idIdx >= bounds.end) {
    console.error(`❌ ${slug}: 数组内找不到 ${idAnchor}`);
    process.exitCode = 1;
    continue;
  }

  // 块结束：从 id 往后第一个 `\n  },` / `\n    },` / `\n      },` 行
  const blockEndMatch = content.substring(idIdx).match(/\n[ \t]*\},/);
  if (!blockEndMatch) {
    console.error(`❌ ${slug}: 找不到块结束 },`);
    process.exitCode = 1;
    continue;
  }
  const blockEnd = idIdx + blockEndMatch.index;
  const block = content.substring(idIdx, blockEnd);

  if (/(?:imageUrl|coverImage|thumbnail|ogImage)\s*:/.test(block.replace(/`[\s\S]*`/g, ''))) {
    console.log(`- ${slug}: 已有 imageUrl，跳过`);
    skipped++;
    continue;
  }

  // 锚到块内的 viewCount 行（顶层字段，且在 content 模板字符串之后）
  const vcMatch = block.match(/\n([ \t]*)viewCount:\s*[0-9]+,/);
  if (!vcMatch) {
    console.error(`❌ ${slug}: 块内找不到 viewCount 字段`);
    process.exitCode = 1;
    continue;
  }
  const indent = vcMatch[1];
  const insertPos = idIdx + vcMatch.index + vcMatch[0].length;

  // 安全断言：插入点必须在数组区间内
  if (insertPos <= bounds.start || insertPos >= bounds.end) {
    throw new Error(`拒绝写入：${slug} 插入点 ${insertPos} 不在数组区间 [${bounds.start}, ${bounds.end})`);
  }

  content =
    content.substring(0, insertPos) +
    `\n${indent}imageUrl: '${toUrl(pid)}',` +
    content.substring(insertPos);
  inserted++;
  console.log(`✓ ${slug}: imageUrl 已插入（数组内，offset ${insertPos}）`);
}

// --- 2. 写入前最终校验：所有 imageUrl 都必须在数组区间内 ---
const finalBounds = arrayBounds(content);
const orphans = [];
const re = /^[ \t]*imageUrl:\s*'/gm;
let mm;
while ((mm = re.exec(content)) !== null) {
  if (mm.index > finalBounds.end) orphans.push(mm.index);
}
if (orphans.length > 0) {
  throw new Error(`❌ 检测到 ${orphans.length} 个数组外孤儿 imageUrl（offsets ${orphans.join(',')}），拒绝写入`);
}

fs.writeFileSync(FILE, content);
console.log(`\n✅ 完成：插入 ${inserted}，跳过 ${skipped}，孤儿 imageUrl 0 个`);
