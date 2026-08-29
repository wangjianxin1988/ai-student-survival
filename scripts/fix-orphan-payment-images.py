#!/usr/bin/env python3
"""P73 bug fix: 实际根因诊断 + 验证脚本。

信哥 2026-08-29 反馈："图都加好了？没看到啊"。

原任务描述假设是"孤儿 imageUrl"（在数组外），但实际探查发现：
  - paymentSolutionsData 数组关闭位置 = 行 6203
  - 所有 imageUrl 都在数组内（最后一行 5997 < 6203）
  - 49/49 攻略 imageUrl 字段都正确填充（commit 14c2227 已正确合并）
  - P73 check-payment-images.js 通过：✓ P73 检查通过：49 个 payment solution 全部有 imageUrl

真实根因 = React 列表组件 PaymentSolutionsFilter.tsx 完全没渲染 imageUrl，
详情页 [id].astro header 也没渲染 imageUrl（只用作 og:image meta）。

本脚本 = 验证脚本（数据已有图），真正的代码修复在 commit 中：
  - src/data/paymentSolutions.ts          + imageUrl?: string interface 字段
  - src/components/payment/PaymentSolutionsFilter.tsx  + 列表卡片渲染 <img>
  - src/pages/payment/[id].astro          + 详情页 header hero 图

跑本脚本验证数据完整 + 代码修改正确：
  $ python scripts/fix-orphan-payment-images.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TS = ROOT / 'src/data/paymentSolutions.ts'
FILTER = ROOT / 'src/components/payment/PaymentSolutionsFilter.tsx'
DETAIL = ROOT / 'src/pages/payment/[id].astro'

print('=' * 60)
print('P73 bug fix — verification')
print('=' * 60)

# 1. 验证 src/data/paymentSolutions.ts 数据
src = TS.read_text(encoding='utf-8')

# 数组结束位置
m = re.search(r'\n\];\s*\n\s*// Helper functions', src)
if not m:
    print('❌ 找不到数组结束标记', file=sys.stderr)
    sys.exit(1)
array_end = m.start()

# 数组内攻略数
in_array_ids = re.findall(r"^\s+id:\s*'([^']+)',", src[:array_end], flags=re.MULTILINE)
print(f'数组内攻略数: {len(in_array_ids)}')

# 数组内 imageUrl 数
in_array_urls = re.findall(r"^\s+imageUrl:\s*'([^']+)',", src[:array_end], flags=re.MULTILINE)
print(f'数组内 imageUrl 数: {len(in_array_urls)}')

# 数组外 imageUrl（应该是 0）
out_array_urls = re.findall(r"^\s*imageUrl:\s*'([^']+)',", src[array_end:], flags=re.MULTILINE)
print(f'数组外 imageUrl 数（应为 0）: {len(out_array_urls)}')

assert len(in_array_ids) == len(in_array_urls), \
    f'❌ 攻略 {len(in_array_ids)} != 图 {len(in_array_urls)}'
assert len(out_array_urls) == 0, \
    f'❌ 发现 {len(out_array_urls)} 个孤儿 imageUrl'

# 2. 验证 React 组件渲染 imageUrl
filter_src = FILTER.read_text(encoding='utf-8')
assert "solution.imageUrl &&" in filter_src, '❌ PaymentSolutionsFilter.tsx 没渲染 imageUrl'
assert '<img' in filter_src, '❌ PaymentSolutionsFilter.tsx 没有 <img> 标签'
print(f'✓ PaymentSolutionsFilter.tsx 渲染 imageUrl (<img> 标签已加)')

# 3. 验证 [id].astro 详情页
detail_src = DETAIL.read_text(encoding='utf-8')
assert 'solution.imageUrl &&' in detail_src, '❌ [id].astro header 没渲染 imageUrl'
assert '<img' in detail_src, '❌ [id].astro 没有 <img> 标签'
print(f'✓ [id].astro 详情页 header 渲染 imageUrl (<img> 标签已加)')

# 4. 验证 PaymentSolutionData interface 加了 imageUrl 字段
assert 'imageUrl?: string' in src, '❌ PaymentSolutionData interface 缺 imageUrl 字段'
print(f'✓ PaymentSolutionData interface 已加 imageUrl?: string 字段')

print()
print('✅ 验证完成。49 个攻略数据完整 + 列表页/详情页都渲染图。')
print('   git diff 应该包含 3 个文件改动:')
print('     - src/data/paymentSolutions.ts')
print('     - src/components/payment/PaymentSolutionsFilter.tsx')
print('     - src/pages/payment/[id].astro')