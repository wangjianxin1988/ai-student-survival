import type { APIRoute } from 'astro';

export const prerender = false;

// In-memory cache for pricing data (1 hour TTL)
const pricingCache = new Map<string, { data: PricingData; expiresAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface PricingPlan {
  price: string;
  currency: string;
  period: string;
  planName: string;
  features: string[];
  lastUpdated: string;
  source: string;
}

interface PricingData {
  slug: string;
  plans: PricingPlan[];
  cached: boolean;
}

// Comprehensive 2026 pricing data for all tools
const pricingDatabase: Record<string, PricingPlan[]> = {
  'chatgpt': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['GPT-4o mini', 'Basic features', 'Standard response speed', 'Limited usage'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
    { price: '$8', currency: 'USD', period: '/month', planName: 'Go', features: ['GPT-4o mini', 'Higher limits', 'Extended context', 'Faster responses'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
    { price: '$20', currency: 'USD', period: '/month', planName: 'Plus', features: ['GPT-4o access', 'DALL-E image generation', 'Advanced features', 'Priority access', 'GPT-4 Turbo'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
    { price: '$100', currency: 'USD', period: '/month', planName: 'Pro $100', features: ['Unlimited GPT-4o', 'Advanced voice', 'Codex access', 'Deep research', 'Priority support'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
    { price: '$200', currency: 'USD', period: '/month', planName: 'Pro $200', features: ['Everything in Pro $100', 'Maximum compute', 'Unlimited all models', 'Priority access', 'Early access to new features'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
  ],
  'claude': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Claude 3.5 Sonnet', 'Standard features', 'Limited usage', 'Basic support'], lastUpdated: '2026-06-01', source: 'Anthropic Official' },
    { price: '$20', currency: 'USD', period: '/month', planName: 'Pro', features: ['Claude 3.5 Sonnet & Opus', 'Priority access', 'Higher limits', 'Extended thinking'], lastUpdated: '2026-06-01', source: 'Anthropic Official' },
    { price: '$100', currency: 'USD', period: '/month', planName: 'Max 5x', features: ['5x Pro usage', 'Priority access', 'Extended thinking', 'All models'], lastUpdated: '2026-06-01', source: 'Anthropic Official' },
    { price: '$200', currency: 'USD', period: '/month', planName: 'Max 20x', features: ['20x Pro usage', 'Highest priority', 'All features unlocked', 'Early access'], lastUpdated: '2026-06-01', source: 'Anthropic Official' },
  ],
  'midjourney': [
    { price: '$10', currency: 'USD', period: '/month', planName: 'Basic', features: ['200 images/month', 'Fast generation', 'Standard quality'], lastUpdated: '2026-06-01', source: 'Midjourney Official' },
    { price: '$30', currency: 'USD', period: '/month', planName: 'Standard', features: ['Unlimited images', 'Fast + Relax mode', 'Higher resolution'], lastUpdated: '2026-06-01', source: 'Midjourney Official' },
    { price: '$60', currency: 'USD', period: '/month', planName: 'Pro', features: ['Unlimited images', 'Privacy mode', 'All features', 'Priority queue'], lastUpdated: '2026-06-01', source: 'Midjourney Official' },
    { price: '$120', currency: 'USD', period: '/month', planName: 'Mega', features: ['Everything in Pro', 'Maximum speed', 'Highest priority', '12 concurrent jobs'], lastUpdated: '2026-06-01', source: 'Midjourney Official' },
  ],
  'github-copilot': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic completions', 'Limited usage for students', 'Community support'], lastUpdated: '2026-06-01', source: 'GitHub Official' },
    { price: '$10', currency: 'USD', period: '/month', planName: 'Pro', features: ['Unlimited completions', 'All languages', 'IDE support', 'CLI assistance'], lastUpdated: '2026-06-01', source: 'GitHub Official' },
    { price: '$39', currency: 'USD', period: '/month', planName: 'Pro+', features: ['Everything in Pro', 'Copilot Chat', 'Pull request summaries', 'Advanced code review'], lastUpdated: '2026-06-01', source: 'GitHub Official' },
    { price: '$19', currency: 'USD', period: '/seat/month', planName: 'Business', features: ['Organization-wide', 'Enterprise security', 'Audit logs', 'IP indemnity'], lastUpdated: '2026-06-01', source: 'GitHub Official' },
  ],
  'cursor': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['2000 completions', '50 premium requests', 'Basic features'], lastUpdated: '2026-06-01', source: 'Cursor Official' },
    { price: '$20', currency: 'USD', period: '/month', planName: 'Pro', features: ['Unlimited completions', '500 premium requests/month', 'All models', 'Priority support'], lastUpdated: '2026-06-01', source: 'Cursor Official' },
    { price: '$40', currency: 'USD', period: '/month', planName: 'Business', features: ['Everything in Pro', 'Centralized billing', 'Admin dashboard', 'SAML SSO'], lastUpdated: '2026-06-01', source: 'Cursor Official' },
  ],
  'perplexity': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Limited searches', 'Basic models', 'Standard responses'], lastUpdated: '2026-06-01', source: 'Perplexity Official' },
    { price: '$20', currency: 'USD', period: '/month', planName: 'Pro', features: ['Unlimited searches', 'All models', 'Focus mode', 'API credits'], lastUpdated: '2026-06-01', source: 'Perplexity Official' },
  ],
  'gemini': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Limited queries', 'Gemini Pro', 'Basic features'], lastUpdated: '2026-06-01', source: 'Google AI Official' },
    { price: '$19.99', currency: 'USD', period: '/month', planName: 'Advanced', features: ['Unlimited queries', 'Gemini Advanced', 'Best models', '2TB storage'], lastUpdated: '2026-06-01', source: 'Google AI Official' },
  ],
  'notion-ai': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic features', 'Limited AI usage', 'Personal use'], lastUpdated: '2026-06-01', source: 'Notion Official' },
    { price: '$10', currency: 'USD', period: '/month', planName: 'Plus', features: ['Unlimited AI', 'Advanced features', 'Team features', 'Version history'], lastUpdated: '2026-06-01', source: 'Notion Official' },
  ],
  'jasper': [
    { price: '$49', currency: 'USD', period: '/month', planName: 'Pro', features: ['Unlimited words', '50+ templates', 'Team features', 'Brand voice'], lastUpdated: '2026-06-01', source: 'Jasper Official' },
    { price: '$99', currency: 'USD', period: '/month', planName: 'Business', features: ['Everything in Pro', 'Custom templates', 'API access', 'Advanced analytics'], lastUpdated: '2026-06-01', source: 'Jasper Official' },
  ],
  'copyai': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['2000 words/month', '90+ templates', 'Basic features'], lastUpdated: '2026-06-01', source: 'Copy.ai Official' },
    { price: '$49', currency: 'USD', period: '/month', planName: 'Pro', features: ['Unlimited words', 'All templates', 'Workflows', 'Priority support'], lastUpdated: '2026-06-01', source: 'Copy.ai Official' },
  ],
  'grammarly': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic grammar', 'Spelling checks', 'Punctuation'], lastUpdated: '2026-06-01', source: 'Grammarly Official' },
    { price: '$12', currency: 'USD', period: '/month', planName: 'Premium', features: ['Advanced grammar', 'Tone detection', 'Plagiarism checker', 'Style suggestions'], lastUpdated: '2026-06-01', source: 'Grammarly Official' },
  ],
  'quillbot': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Standard mode', '125 words paraphrase', 'Basic features'], lastUpdated: '2026-06-01', source: 'QuillBot Official' },
    { price: '$9.95', currency: 'USD', period: '/month', planName: 'Premium', features: ['All modes', 'Unlimited words', 'Plagiarism checker', 'Grammar check'], lastUpdated: '2026-06-01', source: 'QuillBot Official' },
  ],
  'tabnine': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic completions', 'Community support', 'Limited models'], lastUpdated: '2026-06-01', source: 'Tabnine Official' },
    { price: '$10', currency: 'USD', period: '/month', planName: 'Pro', features: ['Full completions', 'AI explanations', 'Priority support', 'All languages'], lastUpdated: '2026-06-01', source: 'Tabnine Official' },
  ],
  'replit': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic features', 'Community templates', 'Limited resources'], lastUpdated: '2026-06-01', source: 'Replit Official' },
    { price: '$15', currency: 'USD', period: '/month', planName: 'Pro', features: ['Always on', 'Higher resources', 'Custom domains', 'Private projects'], lastUpdated: '2026-06-01', source: 'Replit Official' },
  ],
  'figma': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['3 projects', 'Basic features', 'Personal use'], lastUpdated: '2026-06-01', source: 'Figma Official' },
    { price: '$15', currency: 'USD', period: '/month', planName: 'Professional', features: ['Unlimited projects', 'Team features', 'Version history', 'Branching'], lastUpdated: '2026-06-01', source: 'Figma Official' },
  ],
  'dalle-3': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Limited generations via ChatGPT', 'Basic quality'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
    { price: '$20', currency: 'USD', period: '/month', planName: 'Plus', features: ['Unlimited generations', 'DALL-E 3 access', 'Higher resolution'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
  ],
  'stable-diffusion': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', 'Local deployment', 'Unlimited use', 'Community models'], lastUpdated: '2026-06-01', source: 'Stability AI Official' },
    { price: '$9', currency: 'USD', period: '/month', planName: 'Pro', features: ['API access', 'Premium features', 'Priority support', 'Early access'], lastUpdated: '2026-06-01', source: 'Stability AI Official' },
  ],
  'kimi': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['200K context', 'File analysis', 'Web search', 'Basic features'], lastUpdated: '2026-06-01', source: 'Moonshot AI Official' },
  ],
  'webpilot': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Free for individual use', 'Basic features', 'Web browsing'], lastUpdated: '2026-06-01', source: 'WebPilot Official' },
  ],
  'elicit': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Limited searches', 'Basic features', 'Paper analysis'], lastUpdated: '2026-06-01', source: 'Elicit Official' },
    { price: '$15', currency: 'USD', period: '/month', planName: 'Plus', features: ['Unlimited searches', 'Advanced features', 'Export options'], lastUpdated: '2026-06-01', source: 'Elicit Official' },
  ],
  // Chinese AI Tools
  'wenxin-yiyan': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础对话功能', '文心一言3.5'], lastUpdated: '2026-06-01', source: '百度官方' },
    { price: '¥59', currency: 'CNY', period: '/月', planName: '文心一言4.0', features: ['文心一言4.0', '更多功能', '优先体验'], lastUpdated: '2026-06-01', source: '百度官方' },
  ],
  'tongyi-qianwen': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['通义千问2.5', '基础对话功能'], lastUpdated: '2026-06-01', source: '阿里云官方' },
    { price: '¥29.9', currency: 'CNY', period: '/月', planName: 'Plus', features: ['通义千问Plus', '更多额度', '高级功能'], lastUpdated: '2026-06-01', source: '阿里云官方' },
  ],
  'xunfei-xinghuo': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础对话', '语音交互'], lastUpdated: '2026-06-01', source: '讯飞星火官方' },
    { price: '¥49', currency: 'CNY', period: '/月', planName: 'Plus', features: ['更多额度', '高级功能', 'API接入'], lastUpdated: '2026-06-01', source: '讯飞星火官方' },
  ],
  'zhixing-qingyan': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础对话功能', 'GLM-4'], lastUpdated: '2026-06-01', source: '智谱AI官方' },
    { price: '¥49', currency: 'CNY', period: '/月', planName: 'Plus', features: ['GLM-4 Plus', '更多额度', '高级功能'], lastUpdated: '2026-06-01', source: '智谱AI官方' },
  ],
  'doubao': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础对话', '语音交互', '日常使用'], lastUpdated: '2026-06-01', source: '字节跳动官方' },
  ],
  'hunyuan': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础对话功能', '腾讯生态集成'], lastUpdated: '2026-06-01', source: '腾讯官方' },
  ],
  'shangliang': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础对话功能'], lastUpdated: '2026-06-01', source: '商汤科技官方' },
    { price: '¥39', currency: 'CNY', period: '/月', planName: 'Plus', features: ['更多额度', '高级推理能力'], lastUpdated: '2026-06-01', source: '商汤科技官方' },
  ],
  'tiangong': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础搜索和对话'], lastUpdated: '2026-06-01', source: '昆仑万维官方' },
    { price: '¥29', currency: 'CNY', period: '/月', planName: 'Plus', features: ['更多额度', '高级功能'], lastUpdated: '2026-06-01', source: '昆仑万维官方' },
  ],
  'pangu': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '体验版', features: ['基础API调用'], lastUpdated: '2026-06-01', source: '华为云官方' },
    { price: '¥0.03', currency: 'CNY', period: '/千token', planName: '按量付费', features: ['按实际使用量计费', 'API接入'], lastUpdated: '2026-06-01', source: '华为云官方' },
  ],
  'tongyi-wanxiang': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '每日免费', features: ['每日免费生成', '基础风格'], lastUpdated: '2026-06-01', source: '阿里云官方' },
    { price: '¥29.9', currency: 'CNY', period: '/月', planName: '会员', features: ['无限生成', '更多风格', '高清图片'], lastUpdated: '2026-06-01', source: '阿里云官方' },
  ],
  'miaohua': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['每日免费额度', '基础风格'], lastUpdated: '2026-06-01', source: '商汤科技官方' },
    { price: '¥39', currency: 'CNY', period: '/月', planName: 'Pro', features: ['无限生成', 'ControlNet', '高清图片'], lastUpdated: '2026-06-01', source: '商汤科技官方' },
  ],
  'liblib': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['每日免费额度', '基础模型'], lastUpdated: '2026-06-01', source: 'Liblib AI Official' },
    { price: '¥29', currency: 'CNY', period: '/月', planName: '会员', features: ['更多额度', '会员专属模型'], lastUpdated: '2026-06-01', source: 'Liblib AI Official' },
  ],
  'xunfei-xiezuo': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['基础写作辅助', '语音输入'], lastUpdated: '2026-06-01', source: '讯飞写作官方' },
    { price: '¥29', currency: 'CNY', period: '/月', planName: 'Pro', features: ['更多模板', '高级润色', '翻译功能'], lastUpdated: '2026-06-01', source: '讯飞写作官方' },
  ],
  'mita-writecat': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['语法检查', '错别字纠正'], lastUpdated: '2026-06-01', source: '秘塔写作猫官方' },
    { price: '¥29', currency: 'CNY', period: '/月', planName: 'Pro', features: ['全文改写', '翻译', '更多功能'], lastUpdated: '2026-06-01', source: '秘塔写作猫官方' },
  ],
  'caiyun-xiaomeng': [
    { price: '¥0', currency: 'CNY', period: '/月', planName: '免费版', features: ['每日免费创作', '基础风格'], lastUpdated: '2026-06-01', source: '彩云科技官方' },
    { price: '¥49', currency: 'CNY', period: '/月', planName: '高级创作版', features: ['无限创作', '自定义世界观', '角色设定'], lastUpdated: '2026-06-01', source: '彩云科技官方' },
  ],
  // Agent/LLM Frameworks
  'openclaw': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', '20+ platform support', 'Plugin system'], lastUpdated: '2026-06-01', source: 'OpenClaw Official' },
  ],
  'hermes-agent': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', '200+ model support', 'Self-evolution'], lastUpdated: '2026-06-01', source: 'Hermes Agent Official' },
  ],
  'autogpt': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', 'Autonomous task execution', 'Memory management'], lastUpdated: '2026-06-01', source: 'AutoGPT Official' },
  ],
  'crewai': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', 'Multi-agent collaboration', 'Role-based agents'], lastUpdated: '2026-06-01', source: 'CrewAI Official' },
    { price: '$15', currency: 'USD', period: '/month', planName: 'Pro', features: ['Team seats', 'Priority support', 'Advanced features'], lastUpdated: '2026-06-01', source: 'CrewAI Official' },
  ],
  'langchain': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', 'Python & JavaScript', 'Chain building'], lastUpdated: '2026-06-01', source: 'LangChain Official' },
  ],
  'dify': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', 'Self-hosted', 'Basic features'], lastUpdated: '2026-06-01', source: 'Dify Official' },
    { price: '$30', currency: 'USD', period: '/month', planName: 'Pro', features: ['Cloud hosting', 'More seats', 'Advanced features'], lastUpdated: '2026-06-01', source: 'Dify Official' },
  ],
  'coze': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['60+ plugins', 'Bot building', 'Discord/Teams integration'], lastUpdated: '2026-06-01', source: 'Coze Official' },
    { price: '$15', currency: 'USD', period: '/month', planName: 'Pro', features: ['More bots', 'API access', 'Priority support'], lastUpdated: '2026-06-01', source: 'Coze Official' },
  ],
  'ollama': [
    { price: '$0', currency: 'USD', period: '/month', planName: '免费', features: ['开源免费', '本地部署', 'GPU加速', '200+模型'], lastUpdated: '2026-06-01', source: 'Ollama Official' },
  ],
  'lm-studio': [
    { price: '$0', currency: 'USD', period: '/month', planName: '免费', features: ['开源免费', '本地LLM', '类ChatGPT界面'], lastUpdated: '2026-06-01', source: 'LM Studio Official' },
  ],
  'anything-llm': [
    { price: '$0', currency: 'USD', period: '/month', planName: '免费', features: ['开源免费', '本地RAG', '多文档支持'], lastUpdated: '2026-06-01', source: 'AnythingLLM Official' },
  ],
  'deepseek': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['API access', 'Chat', 'Code generation'], lastUpdated: '2026-06-01', source: 'DeepSeek Official' },
    { price: '$0.1', currency: 'USD', period: '/M tokens', planName: 'API Pricing', features: ['DeepSeek Chat', 'Extremely low cost', 'Code generation'], lastUpdated: '2026-06-01', source: 'DeepSeek Official' },
  ],
  'qwen': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source models', 'Qwen 2.5', 'API access'], lastUpdated: '2026-06-01', source: 'Qwen Official' },
  ],
  'chatglm': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', 'GLM-4', 'API access'], lastUpdated: '2026-06-01', source: 'ChatGLM Official' },
  ],

  // ========== New Tools (2026) ==========
  'hermes-desktop': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Open source', 'Cross-platform', 'Full Agent capabilities', 'Skills system'], lastUpdated: '2026-06-01', source: 'Nous Research Official' },
  ],
  'github-copilot-app': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic completions', 'Limited usage', 'Community support'], lastUpdated: '2026-06-01', source: 'GitHub Official' },
    { price: '$10', currency: 'USD', period: '/month', planName: 'Pro', features: ['Unlimited completions', 'Agent sessions', 'PR lifecycle', 'Canvas'], lastUpdated: '2026-06-01', source: 'GitHub Official' },
    { price: '$39', currency: 'USD', period: '/month', planName: 'Pro+', features: ['Everything in Pro', 'Advanced code review', 'Priority support'], lastUpdated: '2026-06-01', source: 'GitHub Official' },
  ],
  'microsoft-scout': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic AI assistant', 'Microsoft 365 integration', 'Limited automation'], lastUpdated: '2026-06-01', source: 'Microsoft Official' },
    { price: '$10', currency: 'USD', period: '/month', planName: 'Premium', features: ['Full Autopilot', 'Advanced automation', 'Priority support'], lastUpdated: '2026-06-01', source: 'Microsoft Official' },
  ],
  'openai-codex': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Limited Codex access', 'Basic code generation'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
    { price: '$20', currency: 'USD', period: '/month', planName: 'Plus', features: ['Standard Codex', 'Role plugins', 'Sites', 'GPT-5.5'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
    { price: '$100', currency: 'USD', period: '/month', planName: 'Pro', features: ['5x usage', 'All features', 'Priority support'], lastUpdated: '2026-06-01', source: 'OpenAI Official' },
  ],
  'windsurf': [
    { price: '$0', currency: 'USD', period: '/month', planName: 'Free', features: ['Basic Cascade', 'Limited AI usage', 'Standard features'], lastUpdated: '2026-06-01', source: 'Codeium Official' },
    { price: '$15', currency: 'USD', period: '/month', planName: 'Pro', features: ['Full Cascade Agent', 'Unlimited AI', 'Advanced models', 'Priority support'], lastUpdated: '2026-06-01', source: 'Codeium Official' },
  ],
};

function getCachedPricing(slug: string): PricingPlan[] | null {
  const cached = pricingCache.get(slug);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data.plans;
  }
  return null;
}

function setCachedPricing(slug: string, plans: PricingPlan[]): void {
  pricingCache.set(slug, {
    data: { slug, plans, cached: true },
    expiresAt: Date.now() + CACHE_TTL,
  });
}

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cache first
  let plans = getCachedPricing(slug);

  if (!plans) {
    // Try to get from database
    plans = pricingDatabase[slug] || null;

    if (plans) {
      // Cache the result
      setCachedPricing(slug, plans);
    }
  }

  if (!plans) {
    return new Response(JSON.stringify({ error: 'Tool not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    data: plans,
    meta: {
      slug,
      cached: !!getCachedPricing(slug),
      timestamp: new Date().toISOString(),
    },
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
