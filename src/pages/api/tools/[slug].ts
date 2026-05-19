import type { APIRoute } from 'astro';

// This endpoint needs to handle dynamic slugs at runtime
export const prerender = false;

// Static tool data (mirrors the data in src/pages/tools/[slug].astro)
const toolsData: Record<string, any> = {
  'chatgpt': {
    id: '1',
    name: 'ChatGPT',
    slug: 'chatgpt',
    description: 'OpenAI开发的AI对话助手，支持写作、编程、分析等多种任务。ChatGPT是目前最流行的AI工具之一，拥有强大的语言理解和生成能力。',
    category: 'communication',
    subcategory: 'chatbot',
    pricing: 'freemium',
    priceDetail: { monthly: 20, yearly: 200, currency: 'USD' },
    url: 'https://chat.openai.com',
    imageUrl: 'https://placehold.co/800x400/10b981/ffffff?text=ChatGPT',
    rating: 4.8,
    ratingCount: 12500,
    dimensions: { easeOfUse: 4.5, features: 4.9, value: 4.7 },
    tags: ['写作', '编程', '分析', '对话', 'OpenAI'],
    features: ['多轮对话', '代码生成', '文本创作', '数据分析', '文件上传', '语音交互'],
    alternatives: ['claude', 'gemini'],
    isNew: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-05-01',
  },
  'claude': {
    id: '2',
    name: 'Claude',
    slug: 'claude',
    description: 'Anthropic开发的AI助手，擅长长文本处理和复杂分析。Claude拥有100K上下文窗口，适合处理长文档和复杂任务。',
    category: 'communication',
    subcategory: 'chatbot',
    pricing: 'freemium',
    priceDetail: { monthly: 20, yearly: 192, currency: 'USD' },
    url: 'https://claude.ai',
    imageUrl: 'https://placehold.co/800x400/8b5cf6/ffffff?text=Claude',
    rating: 4.7,
    ratingCount: 8900,
    dimensions: { easeOfUse: 4.6, features: 4.8, value: 4.5 },
    tags: ['写作', '长文本', '分析', '研究', 'Anthropic'],
    features: ['100K上下文', '长文本分析', '创意写作', '代码审查', '文档处理', '隐私保护'],
    alternatives: ['chatgpt', 'gemini'],
    isNew: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-05-01',
  },
  'midjourney': {
    id: '3',
    name: 'Midjourney',
    slug: 'midjourney',
    description: 'AI图像生成工具，通过文本描述创建高质量图像。Midjourney是当前最流行的AI绘图工具之一。',
    category: 'design',
    subcategory: 'image-generation',
    pricing: 'paid',
    priceDetail: { monthly: 10, yearly: 96, currency: 'USD' },
    url: 'https://midjourney.com',
    imageUrl: 'https://placehold.co/800x400/ec4899/ffffff?text=Midjourney',
    rating: 4.6,
    ratingCount: 6200,
    dimensions: { easeOfUse: 3.8, features: 4.9, value: 4.4 },
    tags: ['图像生成', '设计', '创意', '艺术'],
    features: ['文生图', '风格多样', '高分辨率', '社区分享', '版本迭代', '局部重绘'],
    alternatives: ['dalle', 'stable-diffusion'],
    isNew: false,
    createdAt: '2024-02-01',
    updatedAt: '2024-05-01',
  },
  'github-copilot': {
    id: '4',
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    description: 'AI编程助手，为开发者提供代码补全和生成功能。GitHub Copilot与VS Code深度集成。',
    category: 'coding',
    subcategory: 'code-assistant',
    pricing: 'paid',
    priceDetail: { monthly: 10, yearly: 100, currency: 'USD' },
    url: 'https://github.com/features/copilot',
    imageUrl: 'https://placehold.co/800x400/238636/ffffff?text=GitHub+Copilot',
    rating: 4.5,
    ratingCount: 9800,
    dimensions: { easeOfUse: 4.3, features: 4.7, value: 4.2 },
    tags: ['编程', '代码补全', 'IDE', '开发者'],
    features: ['代码补全', '函数生成', 'Bug修复', '代码解释', '多语言支持', '注释生成'],
    alternatives: ['cursor', 'tabnine'],
    isNew: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-05-01',
  },
  'notion-ai': {
    id: '5',
    name: 'Notion AI',
    slug: 'notion-ai',
    description: '集成在Notion中的AI助手，帮你写文档、整理笔记。Notion AI是知识工作者的效率工具。',
    category: 'writing',
    subcategory: 'writing-assistant',
    pricing: 'freemium',
    priceDetail: { monthly: 10, yearly: 96, currency: 'USD' },
    url: 'https://notion.so',
    imageUrl: 'https://placehold.co/800x400/1a1a1a/ffffff?text=Notion+AI',
    rating: 4.4,
    ratingCount: 5600,
    dimensions: { easeOfUse: 4.7, features: 4.3, value: 4.2 },
    tags: ['笔记', '文档', '写作', '整理'],
    features: ['智能摘要', '自动续写', '翻译', '整理笔记', '内容生成', '模板创建'],
    alternatives: ['obsidian-ai', 'craft-ai'],
    isNew: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-05-01',
  },
  'perplexity': {
    id: '6',
    name: 'Perplexity',
    slug: 'perplexity',
    description: 'AI搜索引擎，基于真实网络内容回答问题。Perplexity提供带来源引用的答案。',
    category: 'research',
    subcategory: 'search',
    pricing: 'freemium',
    priceDetail: { monthly: 20, yearly: 200, currency: 'USD' },
    url: 'https://perplexity.ai',
    imageUrl: 'https://placehold.co/800x400/20c997/ffffff?text=Perplexity',
    rating: 4.6,
    ratingCount: 7800,
    dimensions: { easeOfUse: 4.5, features: 4.6, value: 4.5 },
    tags: ['搜索', '研究', '问答', '实时信息'],
    features: ['实时搜索', '引用来源', '多语言', '连续对话', '图片搜索', '学术搜索'],
    alternatives: ['chatgpt-search', 'phind'],
    isNew: false,
    createdAt: '2024-02-15',
    updatedAt: '2024-05-01',
  },
};

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'MISSING_SLUG',
        message: 'Tool slug is required',
      },
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Allow cross-origin for error responses
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const tool = toolsData[slug];

  if (!tool) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'TOOL_NOT_FOUND',
        message: `Tool with slug "${slug}" not found`,
      },
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Allow cross-origin for error responses
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const response = {
    success: true,
    data: tool,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // CORS: Public read-only tool detail data
      // Single tool details are public informational content.
      // No authentication or user-specific data involved.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'index, follow',
    },
  });
};
