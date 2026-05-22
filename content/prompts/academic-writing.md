---
title: Academic Writing Assistant
slug: academic-writing
description: 写学术论文时的提示词模板
category: writing
prompt: "我在写一篇关于 {{topic}} 的学术论文，需要帮忙润色。

字数要求：{{word_count}} 字
格式要求：{{format}}

我希望你：
1. 帮我把语言改得更学术一点，但不要改变我原来的意思
2. 指出语法和拼写错误
3. 让表达更清晰简洁
4. 保留我原来的观点和思路

只给我修改建议就好，不要帮我重写整篇文章。每条建议简单说明一下为什么这样改更好。"
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
