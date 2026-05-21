import type { APIRoute } from 'astro';
import { getTools } from '@/lib/supabase';

export const prerender = false;

// Static fallback data for tools
const staticTools = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    slug: 'chatgpt',
    description: 'OpenAI\'s conversational AI assistant, capable of understanding and generating human-like text based on context.',
    category: 'writing' as const,
    subcategory: 'chatbot',
    pricing: 'freemium' as const,
    priceDetail: { monthly: 20, currency: 'USD' },
    url: 'https://chat.openai.com',
    imageUrl: 'https://placehold.co/400x200/10a37f/ffffff?text=ChatGPT',
    rating: 4.8,
    ratingCount: 125000,
    dimensions: { easeOfUse: 4.9, features: 4.7, value: 4.5 },
    tags: ['AI', 'Chatbot', 'Writing', 'Research'],
    features: ['Natural language understanding', 'Code generation', 'Multi-turn conversations', 'Plugin support'],
    alternatives: ['Claude', 'Gemini', 'Llama'],
    isNew: false,
    createdAt: '2023-01-01',
    updatedAt: '2024-03-15',
  },
  {
    id: 'claude',
    name: 'Claude',
    slug: 'claude',
    description: 'Anthropic\'s AI assistant focused on being helpful, harmless, and honest.',
    category: 'writing' as const,
    subcategory: 'chatbot',
    pricing: 'freemium' as const,
    priceDetail: { monthly: 20, currency: 'USD' },
    url: 'https://claude.ai',
    imageUrl: 'https://placehold.co/400x200/11bsf11/ffffff?text=Claude',
    rating: 4.7,
    ratingCount: 89000,
    dimensions: { easeOfUse: 4.8, features: 4.6, value: 4.4 },
    tags: ['AI', 'Chatbot', 'Writing', 'Analysis'],
    features: ['Long context window', 'Document analysis', 'Safe and helpful', 'Constitutional AI'],
    alternatives: ['ChatGPT', 'Gemini', 'Llama'],
    isNew: false,
    createdAt: '2023-03-01',
    updatedAt: '2024-03-15',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    slug: 'midjourney',
    description: 'AI-powered image generation tool that creates stunning visual artwork from text descriptions.',
    category: 'design' as const,
    subcategory: 'image-generation',
    pricing: 'paid' as const,
    priceDetail: { monthly: 10, currency: 'USD' },
    url: 'https://midjourney.com',
    imageUrl: 'https://placehold.co/400x200/5858d6/ffffff?text=Midjourney',
    rating: 4.6,
    ratingCount: 67000,
    dimensions: { easeOfUse: 4.2, features: 4.9, value: 4.3 },
    tags: ['AI', 'Image', 'Design', 'Art'],
    features: ['High-quality image generation', 'Style control', 'Upscaling', 'Variations'],
    alternatives: ['DALL-E', 'Stable Diffusion', 'Ideogram'],
    isNew: false,
    createdAt: '2023-02-01',
    updatedAt: '2024-03-15',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    description: 'AI pair programmer that suggests code completions and entire functions in real-time.',
    category: 'coding' as const,
    subcategory: 'code-completion',
    pricing: 'paid' as const,
    priceDetail: { monthly: 10, currency: 'USD' },
    url: 'https://github.com/features/copilot',
    imageUrl: 'https://placehold.co/400x200/238636/ffffff?text=GitHub+Copilot',
    rating: 4.5,
    ratingCount: 45000,
    dimensions: { easeOfUse: 4.4, features: 4.7, value: 4.2 },
    tags: ['Coding', 'AI', 'IDE', 'Developer'],
    features: ['Code completion', 'Function generation', 'Debugging assistance', 'Multi-language support'],
    alternatives: ['Tabnine', 'Amazon CodeWhisperer', 'Cursor'],
    isNew: false,
    createdAt: '2023-06-01',
    updatedAt: '2024-03-15',
  },
  {
    id: 'notion-ai',
    name: 'Notion AI',
    slug: 'notion-ai',
    description: 'AI-powered writing assistant integrated into Notion for notes, docs, and knowledge management.',
    category: 'writing' as const,
    subcategory: 'productivity',
    pricing: 'paid' as const,
    priceDetail: { monthly: 10, currency: 'USD' },
    url: 'https://notion.so',
    imageUrl: 'https://placehold.co/400x200/ffffff/000000?text=Notion+AI',
    rating: 4.4,
    ratingCount: 34000,
    dimensions: { easeOfUse: 4.6, features: 4.3, value: 4.1 },
    tags: ['Writing', 'Productivity', 'Notes', 'Documentation'],
    features: ['Summarization', 'Brainstorming', 'Draft writing', 'Translation'],
    alternatives: ['Obsidian', 'Evernote', 'Roam'],
    isNew: false,
    createdAt: '2023-11-01',
    updatedAt: '2024-03-15',
  },
];

export const GET: APIRoute = async ({ url }) => {
  const category = url.searchParams.get('category') || '';
  const pricing = url.searchParams.get('pricing') || '';
  const search = url.searchParams.get('q') || '';

  // Build query params object
  const params: { category?: string; pricing?: string; search?: string } = {};
  if (category) params.category = category;
  if (pricing) params.pricing = pricing;
  if (search) params.search = search;

  // Try to fetch from Supabase, fall back to static data
  let tools: any[] = [];
  let source: 'supabase' | 'static' = 'static';

  try {
    // getTools uses hardcoded credentials in supabase.ts for Cloudflare Pages SSR reliability
    tools = await getTools(params);
    source = 'supabase';
  } catch (error) {
    console.warn('Supabase API fetch failed, using static fallback');
    // Use static fallback data
    tools = [...staticTools];
  }

  // Apply filters to static data if using fallback
  if (source === 'static') {
    if (category) {
      tools = tools.filter(t => t.category === category);
    }
    if (pricing) {
      tools = tools.filter(t => t.pricing === pricing);
    }
    if (search) {
      const q = search.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag: string) => tag.toLowerCase().includes(q))
      );
    }
  }

  const response = {
    success: true,
    data: tools,
    meta: {
      total: tools.length,
      timestamp: new Date().toISOString(),
      source,
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // CORS: Public read-only tool catalog data
      // This endpoint serves static AI tool information (names, descriptions, pricing).
      // No authentication required - this is public marketing/informational content.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'index, follow',
    },
  });
};