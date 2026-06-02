import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { checkSensitiveEndpoint, SENSITIVE_ENDPOINTS } from '@/lib/rate-limit';

export const prerender = false;

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limit: 10 requests per minute per IP
    const { getClientIP } = await import('@/lib/rate-limit');
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');
    const rateLimitResult = checkSensitiveEndpoint('chatbot', clientIP);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: 'Too many requests. Please try again later.' }
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': (rateLimitResult.retryAfter || 60).toString(),
        }
      });
    }

    const { message, context, locale = 'zh', conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: { message: 'Message is required' }
      }), { status: 400 });
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback response when no API key is configured
      const fallbackResponse = generateFallbackResponse(message, locale);
      return new Response(JSON.stringify({
        success: true,
        message: fallbackResponse.message,
        recommendedTools: fallbackResponse.recommendedTools || [],
        source: 'fallback'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build the prompt with context
    const systemPrompt = locale === 'zh'
      ? `你是一个AI工具导航助手，帮助留学生找到合适的AI工具和解决方案。

网站包含：
${context}

你的职责：
1. 基于用户需求，推荐合适的AI工具或方案
2. 提供直达链接（如 /tools/chatgpt、/payment、/policies/harvard）
3. 回答关于大学AI政策的问题
4. 帮助解决支付问题

回答要求：
- 使用与用户相同的语言（简体中文）回复
- 简洁明了，直接给出推荐
- 如有具体链接，提供完整路径
- 如果不确定某个具体信息，建议用户访问相关页面查看详情
- 支持多轮对话上下文，可以回顾之前的对话内容

示例回复格式：
"根据你的需求，我推荐使用 Claude，它擅长长文本处理和复杂分析。你可以在 /tools/claude 查看详情。如果需要订阅，可以查看 /payment 了解虚拟卡申请教程。"`
      : `You are an AI tool navigation assistant helping international students find the right AI tools and solutions.

The website contains:
${context}

Your responsibilities:
1. Recommend suitable AI tools or solutions based on user needs
2. Provide direct links (e.g., /tools/chatgpt, /payment, /policies/harvard)
3. Answer questions about university AI policies
4. Help with payment issues

Response requirements:
- Reply in the same language as the user (English)
- Be concise and direct
- Provide full paths if sharing links
- If unsure about specific information, suggest visiting relevant pages
- Support multi-turn conversation context, review previous conversation content

Example response format:
"Based on your needs, I recommend using Claude. It's great for long text processing and complex analysis. You can view details at /tools/claude. For subscription help, check /payment to learn about virtual card options."`;

    // Build messages array with conversation history
    const messages = [
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      // Fall back to keyword matching when API fails
      const fallbackResponse = generateFallbackResponse(message, locale);
      return new Response(JSON.stringify({
        success: true,
        message: fallbackResponse.message,
        recommendedTools: fallbackResponse.recommendedTools || [],
        source: 'fallback'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      message: data.content?.[0]?.text || 'No response',
      source: 'claude'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chatbot API error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

interface RecommendedTool {
  name: string;
  slug: string;
  description: string;
  url: string;
}

interface FallbackResponse {
  message: string;
  recommendedTools?: RecommendedTool[];
}

function generateFallbackResponse(message: string, locale: string): FallbackResponse {
  const lowerMsg = message.toLowerCase();

  // Chinese responses
  if (locale === 'zh') {
    if (lowerMsg.includes('写作') || lowerMsg.includes('write') || lowerMsg.includes('写文章')) {
      return {
        message: '根据你的需求，推荐以下写作AI工具：\n\n1. **ChatGPT** - 综合能力强，适合各类写作任务\n2. **Claude** - 长文本处理优秀，适合论文和报告\n3. **Grammarly** - 专注语法检查和润色\n4. **秘塔写作猫** - 适合中文写作纠错\n\n你可以访问 /tools 查看完整列表，按"写作"分类筛选。',
        recommendedTools: [
          { name: 'ChatGPT', slug: 'chatgpt', description: '综合能力强，适合各类写作任务', url: '/tools/chatgpt' },
          { name: 'Claude', slug: 'claude', description: '长文本处理优秀，适合论文和报告', url: '/tools/claude' },
          { name: 'Grammarly', slug: 'grammarly', description: '专注语法检查和润色', url: '/tools/grammarly' }
        ]
      };
    }

    if (lowerMsg.includes('编程') || lowerMsg.includes('代码') || lowerMsg.includes('code') || lowerMsg.includes('编程')) {
      return {
        message: '推荐以下编程AI工具：\n\n1. **GitHub Copilot** - 代码补全最强，与VS Code集成好\n2. **Cursor** - AI代码编辑器，基于GPT-4\n3. **Tabnine** - 支持本地运行，保护隐私\n\n访问 /tools?category=coding 查看更多。',
        recommendedTools: [
          { name: 'GitHub Copilot', slug: 'github-copilot', description: '代码补全最强，与VS Code集成好', url: '/tools/github-copilot' },
          { name: 'Cursor', slug: 'cursor', description: 'AI代码编辑器，基于GPT-4', url: '/tools/cursor' },
          { name: 'Tabnine', slug: 'tabnine', description: '支持本地运行，保护隐私', url: '/tools/tabnine' }
        ]
      };
    }

    if (lowerMsg.includes('支付') || lowerMsg.includes('信用卡') || lowerMsg.includes('订阅') || lowerMsg.includes('pay')) {
      return {
        message: '没有信用卡？以下是支付解决方案：\n\n1. **Depay虚拟卡** - 申请简单，支持USDT充值\n2. **WildCard虚拟卡** - 安全可靠，适合长期使用\n3. **礼品卡购买** - 通过Apple Store购买OpenAI礼品卡\n\n详细教程请访问 /payment',
        recommendedTools: []
      };
    }

    if (lowerMsg.includes('chatgpt')) {
      if (lowerMsg.includes('允许') || lowerMsg.includes('哪些学校') || lowerMsg.includes('政策')) {
        return {
          message: '以下大学允许使用ChatGPT：\n\n🇺🇸 **美国**：Harvard、Stanford、MIT、Yale、Columbia、Cornell、Princeton\n🇬🇧 **英国**：Cambridge、Imperial、Edinburgh、Manchester\n🇸🇬 **新加坡**：NUS、NTU\n\n其他学校政策请查看 /policies',
          recommendedTools: []
        };
      }
      return {
        message: 'ChatGPT是OpenAI开发的AI对话助手，支持写作、编程、分析等多种任务。\n\n免费版有使用限制，Plus版 $20/月。\n\n订阅遇到支付问题？查看 /payment 了解虚拟卡方案。\n\n详细对比请访问 /tools/chatgpt',
        recommendedTools: [
          { name: 'ChatGPT', slug: 'chatgpt', description: 'OpenAI开发的AI对话助手', url: '/tools/chatgpt' }
        ]
      };
    }

    if (lowerMsg.includes('claude')) {
      return {
        message: 'Claude是Anthropic开发的AI助手，特别擅长：\n\n- 长文本处理（支持20万字上下文）\n- 复杂分析和推理\n- 代码审查\n\n免费使用，Pro版 $20/月。\n\n查看详情：/tools/claude',
        recommendedTools: [
          { name: 'Claude', slug: 'claude', description: 'Anthropic开发的AI助手，擅长长文本处理', url: '/tools/claude' }
        ]
      };
    }

    if (lowerMsg.includes('大学') || lowerMsg.includes('学校') || lowerMsg.includes('policy')) {
      return {
        message: '我们的大学政策数据库包含44所大学的AI使用政策：\n\n热门学校：\n- 🇺🇸 Harvard、Stanford、MIT\n- 🇬🇧 Oxford（禁止）、Cambridge\n- 🇸🇬 NUS、NTU\n\n直接访问：/policies/harvard',
        recommendedTools: []
      };
    }

    return {
      message: '你好！我是AI助手，可以帮你：\n\n1. 推荐AI工具 - 说"推荐一个写作工具"\n2. 解答支付问题 - 说"怎么订阅ChatGPT"\n3. 查询大学政策 - 说"哪些学校允许用ChatGPT"\n\n请告诉我你的需求！',
      recommendedTools: []
    };
  }

  // English responses
  if (lowerMsg.includes('writing') || lowerMsg.includes('write') || lowerMsg.includes('article')) {
    return {
      message: 'Based on your needs, I recommend these writing AI tools:\n\n1. **ChatGPT** - Great all-rounder for various writing tasks\n2. **Claude** - Excellent for long-form content and reports\n3. **Grammarly** - Focuses on grammar and proofreading\n\nView all at /tools?category=writing',
      recommendedTools: [
        { name: 'ChatGPT', slug: 'chatgpt', description: 'Great all-rounder for various writing tasks', url: '/tools/chatgpt' },
        { name: 'Claude', slug: 'claude', description: 'Excellent for long-form content and reports', url: '/tools/claude' },
        { name: 'Grammarly', slug: 'grammarly', description: 'Focuses on grammar and proofreading', url: '/tools/grammarly' }
      ]
    };
  }

  if (lowerMsg.includes('coding') || lowerMsg.includes('code') || lowerMsg.includes('programming')) {
    return {
      message: 'Recommended coding AI tools:\n\n1. **GitHub Copilot** - Best code completion, great VS Code integration\n2. **Cursor** - AI code editor based on GPT-4\n3. **Tabnine** - Supports local running, privacy protection\n\nMore at /tools?category=coding',
      recommendedTools: [
        { name: 'GitHub Copilot', slug: 'github-copilot', description: 'Best code completion, great VS Code integration', url: '/tools/github-copilot' },
        { name: 'Cursor', slug: 'cursor', description: 'AI code editor based on GPT-4', url: '/tools/cursor' },
        { name: 'Tabnine', slug: 'tabnine', description: 'Supports local running, privacy protection', url: '/tools/tabnine' }
      ]
    };
  }

  if (lowerMsg.includes('pay') || lowerMsg.includes('credit card') || lowerMsg.includes('subscribe')) {
    return {
      message: 'No credit card? Here are payment solutions:\n\n1. **Depay Virtual Card** - Easy application, USDT top-up\n2. **WildCard Virtual Card** - Secure, great for long-term use\n3. **Gift Card Purchase** - Buy OpenAI gift cards via Apple Store\n\nFull guide at /payment',
      recommendedTools: []
    };
  }

  if (lowerMsg.includes('university') || lowerMsg.includes('school') || lowerMsg.includes('policy')) {
    return {
      message: 'Our database contains AI policies for 44 universities:\n\nPopular:\n- 🇺🇸 Harvard, Stanford, MIT\n- 🇬🇧 Oxford (prohibited), Cambridge\n- 🇸🇬 NUS, NTU\n\nBrowse all at /policies',
      recommendedTools: []
    };
  }

  return {
    message: 'Hello! I can help you with:\n\n1. AI tool recommendations - Try "recommend a writing tool"\n2. Payment solutions - Try "how to subscribe to ChatGPT"\n3. University policies - Try "which universities allow ChatGPT"\n\nJust let me know what you need!',
    recommendedTools: []
  };
}
