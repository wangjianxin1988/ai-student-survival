---
title: Academic Writing Assistant
slug: academic-writing
description: 帮助撰写学术论文、研究报告的提示词模板
category: writing
prompt: "请帮我撰写一篇关于 {{topic}} 的学术论文。要求：
1. 结构完整，包括摘要、引言、文献综述、方法论、结果分析、结论
2. 使用学术语言，避免口语化表达
3. 引用相关的理论和研究
4. 论点清晰，论据充分

字数要求：{{word_count}} 字
格式要求：{{format}}"
variables:
  - topic
  - word_count
  - format
examples:
  - 人工智能对高等教育的影响，3000字，APA格式
  - 可持续发展在企业管理中的应用，5000字，MLA格式
createdAt: 2024-01-01
updatedAt: 2024-05-01
---
