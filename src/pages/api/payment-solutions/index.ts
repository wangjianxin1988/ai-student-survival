import type { APIRoute } from 'astro';

export const prerender = false;

// Static payment solutions data (mirrors the data in src/pages/payment/index.astro)
const paymentSolutions = [
  {
    id: '1',
    title: 'Depay虚拟卡申请和使用完整教程',
    category: 'virtual_card',
    difficulty: 'easy',
    reliability: 'high',
    excerpt: 'Depay是目前最流行的留学生虚拟卡服务，支持USDT充值，无需KYC...',
    rating: 4.8,
    views: 12500,
    content: '详细讲解Depay虚拟卡的申请流程、充值方式和使用技巧...',
    toolIds: ['chatgpt', 'claude'],
    tags: ['虚拟卡', 'Depay', 'USDT'],
    ratingCount: 2500,
    createdAt: '2024-01-15',
    updatedAt: '2024-05-01',
  },
  {
    id: '2',
    title: 'OpenAI API礼品卡购买图文教程',
    category: 'gift_card',
    difficulty: 'medium',
    reliability: 'high',
    excerpt: '图文详解如何在Apple Store购买OpenAI礼品卡，并充值到账户...',
    rating: 4.6,
    views: 8900,
    content: '详细介绍通过礼品卡方式充值OpenAI API的完整流程...',
    toolIds: ['chatgpt'],
    tags: ['礼品卡', 'OpenAI', 'API'],
    ratingCount: 1800,
    createdAt: '2024-02-01',
    updatedAt: '2024-05-01',
  },
  {
    id: '3',
    title: 'ChatGPT Plus土耳其区订阅教程（最低价）',
    category: 'regional_pricing',
    difficulty: 'hard',
    reliability: 'medium',
    excerpt: '通过土耳其区的特殊定价，享受ChatGPT Plus最低价格订阅...',
    rating: 4.5,
    views: 15600,
    content: '利用土耳其里拉汇率优势，以最低价格订阅ChatGPT Plus...',
    toolIds: ['chatgpt'],
    tags: ['土耳其', '区域定价', 'ChatGPT Plus'],
    ratingCount: 3200,
    createdAt: '2024-01-20',
    updatedAt: '2024-05-01',
  },
  {
    id: '4',
    title: 'Anthropic Claude礼品卡充值教程',
    category: 'gift_card',
    difficulty: 'easy',
    reliability: 'high',
    excerpt: '详细讲解如何购买Anthropic官方礼品卡进行充值...',
    rating: 4.7,
    views: 7200,
    content: '一步步教你如何购买和使用Anthropic礼品卡为Claude充值...',
    toolIds: ['claude'],
    tags: ['礼品卡', 'Claude', 'Anthropic'],
    ratingCount: 1450,
    createdAt: '2024-02-10',
    updatedAt: '2024-05-01',
  },
  {
    id: '5',
    title: 'WildCard虚拟卡申请保姆级教程',
    category: 'virtual_card',
    difficulty: 'easy',
    reliability: 'high',
    excerpt: 'WildCard提供更安全的虚拟信用卡服务，适合长期使用...',
    rating: 4.9,
    views: 9800,
    content: 'WildCard虚拟卡申请全流程，包括充值验证和使用注意事项...',
    toolIds: ['chatgpt', 'claude', 'midjourney'],
    tags: ['虚拟卡', 'WildCard', '长期使用'],
    ratingCount: 2100,
    createdAt: '2024-03-01',
    updatedAt: '2024-05-01',
  },
  {
    id: '6',
    title: 'Midjourney订阅常见问题汇总',
    category: 'troubleshooting',
    difficulty: 'easy',
    reliability: 'high',
    excerpt: '汇总了Midjourney订阅过程中的常见问题和解决方案...',
    rating: 4.4,
    views: 5400,
    content: '解决Midjourney订阅中的支付被拒、订阅管理等问题...',
    toolIds: ['midjourney'],
    tags: ['Midjourney', '问题解决', '订阅'],
    ratingCount: 980,
    createdAt: '2024-02-20',
    updatedAt: '2024-05-01',
  },
];

export const GET: APIRoute = async ({ url }) => {
  const category = url.searchParams.get('category') || '';
  const difficulty = url.searchParams.get('difficulty') || '';
  const toolId = url.searchParams.get('toolId') || '';

  // Filter solutions based on query params
  let filteredSolutions = paymentSolutions;

  if (category) {
    filteredSolutions = filteredSolutions.filter(s => s.category === category);
  }
  if (difficulty) {
    filteredSolutions = filteredSolutions.filter(s => s.difficulty === difficulty);
  }
  if (toolId) {
    filteredSolutions = filteredSolutions.filter(s => s.toolIds.includes(toolId));
  }

  const response = {
    success: true,
    data: filteredSolutions,
    meta: {
      total: filteredSolutions.length,
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // CORS: Public read-only data - no authentication required
      // This endpoint serves static payment solution information
      // that is intended to be freely accessible by any origin.
      // If you need to restrict access, implement authentication.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'index, follow',
    },
  });
};
