import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.PUBLIC_SUPABASE_URL as string | undefined)
  || (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined)
  || 'https://giynvpfnzzelzwpmsgtf.supabase.co';
const ANON_KEY = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined)
  || (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined)
  || '';

// Simple admin token for this endpoint (one-time use)
const ADMIN_TOKEN = 'ai-student-survival-seed-2024';

export const prerender = false;

// ─── TOOLS DATA (33 tools) ────────────────────────────────────────────────────
const toolsData = [
  { name: 'ChatGPT', slug: 'chatgpt', description: 'OpenAI开发的AI对话助手，支持写作、编程、分析等多种任务', category: 'communication', subcategory: 'chatbot', pricing: 'freemium', price_detail: { monthly: 20, yearly: 200, currency: 'USD' }, url: 'https://chat.openai.com', image_url: 'https://placehold.co/400x200/10b981/ffffff?text=ChatGPT', rating: 4.8, rating_count: 12500, dimensions: { easeOfUse: 4.5, features: 4.9, value: 4.7 }, tags: ['写作', '编程', '分析', '对话'], features: ['多轮对话', '代码生成', '文本创作', '数据分析'], alternatives: ['claude', 'gemini'], is_new: false },
  { name: 'Claude', slug: 'claude', description: 'Anthropic开发的AI助手，擅长长文本处理和复杂分析', category: 'communication', subcategory: 'chatbot', pricing: 'freemium', price_detail: { monthly: 20, yearly: 192, currency: 'USD' }, url: 'https://claude.ai', image_url: 'https://placehold.co/400x200/8b5cf6/ffffff?text=Claude', rating: 4.7, rating_count: 8900, dimensions: { easeOfUse: 4.6, features: 4.8, value: 4.5 }, tags: ['写作', '长文本', '分析', '研究'], features: ['100K上下文', '长文本分析', '创意写作', '代码审查'], alternatives: ['chatgpt', 'gemini'], is_new: false },
  { name: 'Midjourney', slug: 'midjourney', description: 'AI图像生成工具，通过文本描述创建高质量图像', category: 'design', subcategory: 'image-generation', pricing: 'paid', price_detail: { monthly: 10, yearly: 96, currency: 'USD' }, url: 'https://midjourney.com', image_url: 'https://placehold.co/400x200/ec4899/ffffff?text=Midjourney', rating: 4.6, rating_count: 6200, dimensions: { easeOfUse: 3.8, features: 4.9, value: 4.4 }, tags: ['图像生成', '设计', '创意', '艺术'], features: ['文生图', '风格多样', '高分辨率', '社区分享'], alternatives: ['dalle', 'stable-diffusion'], is_new: false },
  { name: 'GitHub Copilot', slug: 'github-copilot', description: 'AI编程助手，为开发者提供代码补全和生成功能', category: 'coding', subcategory: 'code-assistant', pricing: 'paid', price_detail: { monthly: 10, yearly: 100, currency: 'USD' }, url: 'https://github.com/features/copilot', image_url: 'https://placehold.co/400x200/238636/ffffff?text=GitHub+Copilot', rating: 4.5, rating_count: 9800, dimensions: { easeOfUse: 4.3, features: 4.7, value: 4.2 }, tags: ['编程', '代码补全', 'IDE', '开发者'], features: ['代码补全', '函数生成', 'Bug修复', '代码解释'], alternatives: ['cursor', 'tabnine'], is_new: false },
  { name: 'Notion AI', slug: 'notion-ai', description: '集成在Notion中的AI助手，帮你写文档、整理笔记', category: 'writing', subcategory: 'writing-assistant', pricing: 'freemium', price_detail: { monthly: 10, yearly: 96, currency: 'USD' }, url: 'https://notion.so', image_url: 'https://placehold.co/400x200/1a1a1a/ffffff?text=Notion+AI', rating: 4.4, rating_count: 5600, dimensions: { easeOfUse: 4.7, features: 4.3, value: 4.2 }, tags: ['笔记', '文档', '写作', '整理'], features: ['智能摘要', '自动续写', '翻译', '整理笔记'], alternatives: ['obsidian-ai', 'craft-ai'], is_new: true },
  { name: 'Perplexity', slug: 'perplexity', description: 'AI搜索引擎，基于真实网络内容回答问题', category: 'research', subcategory: 'search', pricing: 'freemium', price_detail: { monthly: 20, yearly: 200, currency: 'USD' }, url: 'https://perplexity.ai', image_url: 'https://placehold.co/400x200/20c997/ffffff?text=Perplexity', rating: 4.6, rating_count: 7800, dimensions: { easeOfUse: 4.5, features: 4.6, value: 4.5 }, tags: ['搜索', '研究', '问答', '实时信息'], features: ['实时搜索', '引用来源', '多语言', '连续对话'], alternatives: ['chatgpt-search', 'phind'], is_new: false },
  { name: 'Gemini', slug: 'gemini', description: 'Google开发的AI助手，集成在Google生态中，支持搜索、文档和代码生成', category: 'communication', subcategory: 'chatbot', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://gemini.google.com', image_url: 'https://placehold.co/400x200/3b82f6/ffffff?text=Gemini', rating: 4.5, rating_count: 9800, dimensions: { easeOfUse: 4.6, features: 4.6, value: 4.4 }, tags: ['对话', '搜索', '代码', 'Google生态'], features: ['Google集成', '多模态', '代码生成', '实时信息'], alternatives: ['chatgpt', 'claude'], is_new: true },
  { name: 'Canva AI', slug: 'canva-ai', description: 'Canva内置的AI设计工具，支持AI生成图片、PPT和社交媒体内容', category: 'design', subcategory: 'design-assistant', pricing: 'freemium', price_detail: { monthly: 12.99, yearly: 119.88, currency: 'USD' }, url: 'https://canva.com', image_url: 'https://placehold.co/400x200/00c4cc/ffffff?text=Canva+AI', rating: 4.4, rating_count: 8200, dimensions: { easeOfUse: 4.8, features: 4.4, value: 4.3 }, tags: ['设计', 'PPT', '海报', '社交媒体'], features: ['AI图片生成', 'PPT制作', '社交媒体模板', '品牌套件'], alternatives: ['figma', 'adobe-express'], is_new: true },
  { name: 'Cursor', slug: 'cursor', description: 'AI代码编辑器，基于GPT-4构建，支持智能补全、代码解释和多文件编辑', category: 'coding', subcategory: 'code-editor', pricing: 'freemium', price_detail: { monthly: 20, yearly: 192, currency: 'USD' }, url: 'https://cursor.sh', image_url: 'https://placehold.co/400x200/15803d/ffffff?text=Cursor', rating: 4.6, rating_count: 7100, dimensions: { easeOfUse: 4.7, features: 4.7, value: 4.6 }, tags: ['编程', 'IDE', '代码生成', '编辑器'], features: ['AI对话', '代码补全', '多文件编辑', '团队协作'], alternatives: ['github-copilot', 'replit'], is_new: true },
  { name: 'Gamma', slug: 'gamma', description: 'AI驱动的PPT和文档生成工具，输入主题即可生成专业演示文稿', category: 'writing', subcategory: 'presentation', pricing: 'freemium', price_detail: { monthly: 8, yearly: 72, currency: 'USD' }, url: 'https://gamma.app', image_url: 'https://placehold.co/400x200/f97316/ffffff?text=Gamma', rating: 4.2, rating_count: 4800, dimensions: { easeOfUse: 4.7, features: 4.3, value: 4.1 }, tags: ['PPT', '演示', '文档', 'AI生成'], features: ['一键生成PPT', '多模板', '在线协作', '导出PDF'], alternatives: ['canva', 'beautiful-ai'], is_new: true },
  { name: 'Poe', slug: 'poe', description: 'Quora开发的AI聚合平台，一个界面访问多个AI模型包括GPT-4、Claude、Llama等', category: 'communication', subcategory: 'chatbot', pricing: 'freemium', price_detail: { monthly: 19.6, yearly: 199.8, currency: 'USD' }, url: 'https://poe.com', image_url: 'https://placehold.co/400x200/7c3aed/ffffff?text=Poe', rating: 4.3, rating_count: 4500, dimensions: { easeOfUse: 4.6, features: 4.4, value: 4.2 }, tags: ['聚合', '多模型', '对话', '快速访问'], features: ['多模型聚合', '快速切换', '自定义Bot', 'API访问'], alternatives: ['chatgpt', 'claude'], is_new: false },
  { name: 'Leonardo.ai', slug: 'leonardo-ai', description: 'AI图像生成平台，专注游戏资产和风格化图片，支持多种风格模型', category: 'design', subcategory: 'image-generation', pricing: 'freemium', price_detail: { monthly: 10, yearly: 96, currency: 'USD' }, url: 'https://leonardo.ai', image_url: 'https://placehold.co/400x200/6366f1/ffffff?text=Leonardo.ai', rating: 4.4, rating_count: 3900, dimensions: { easeOfUse: 4.1, features: 4.7, value: 4.4 }, tags: ['图像生成', '游戏', '艺术', '风格化'], features: ['游戏资产', '风格模型', '图像增强', '社区画廊'], alternatives: ['midjourney', 'stable-diffusion'], is_new: true },
  { name: 'Phind', slug: 'phind', description: '专为开发者设计的AI搜索引擎，回答编程问题并提供代码示例', category: 'coding', subcategory: 'search', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://phind.com', image_url: 'https://placehold.co/400x200/22c55e/ffffff?text=Phind', rating: 4.2, rating_count: 3200, dimensions: { easeOfUse: 4.4, features: 4.5, value: 4.7 }, tags: ['编程', '搜索', '开发者', '代码'], features: ['代码搜索', '多语言支持', '上下文理解', '无广告'], alternatives: ['perplexity', 'stackoverflow'], is_new: false },
  { name: 'QuillBot', slug: 'quillbot', description: 'AI改写和润色工具，帮助学生和写作者优化句子结构和表达方式', category: 'writing', subcategory: 'paraphrasing', pricing: 'freemium', price_detail: { monthly: 9.95, yearly: 79.95, currency: 'USD' }, url: 'https://quillbot.com', image_url: 'https://placehold.co/400x200/8b5cf6/ffffff?text=QuillBot', rating: 4.5, rating_count: 9200, dimensions: { easeOfUse: 4.7, features: 4.4, value: 4.5 }, tags: ['写作', '改写', '润色', '学术'], features: ['改写模式', '同义词替换', '摘要生成', '引用生成'], alternatives: ['grammarly', 'paraphrase'], is_new: false },
  { name: 'Otter.ai', slug: 'otter-ai', description: 'AI会议助手，自动转录会议内容、生成摘要和识别发言人', category: 'communication', subcategory: 'transcription', pricing: 'freemium', price_detail: { monthly: 8, yearly: 80, currency: 'USD' }, url: 'https://otter.ai', image_url: 'https://placehold.co/400x200/3b82f6/ffffff?text=Otter.ai', rating: 4.1, rating_count: 3800, dimensions: { easeOfUse: 4.5, features: 4.2, value: 4.0 }, tags: ['会议', '转录', '笔记', '效率'], features: ['实时转录', '自动摘要', '发言人识别', '日历集成'], alternatives: ['fireflies', 'rev'], is_new: false },
  { name: 'Kimi', slug: 'kimi', description: '月之暗面开发的AI助手，支持超长上下文和文档分析，专为中文用户优化', category: 'communication', subcategory: 'chatbot', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://kimi.moonshot.cn', image_url: 'https://placehold.co/400x200/2563eb/ffffff?text=Kimi', rating: 4.6, rating_count: 6500, dimensions: { easeOfUse: 4.7, features: 4.5, value: 4.8 }, tags: ['对话', '长文本', '文档分析', '中文'], features: ['20万字上下文', '文档分析', '联网搜索', '多文件处理'], alternatives: ['chatgpt', 'claude'], is_new: true },
  { name: 'DALL-E 3', slug: 'dalle-3', description: 'OpenAI开发的AI图像生成模型，通过自然语言描述创建高质量图像', category: 'design', subcategory: 'image-generation', pricing: 'paid', price_detail: { monthly: 20, yearly: 200, currency: 'USD' }, url: 'https://openai.com/dall-e-3', image_url: 'https://placehold.co/400x200/db2777/ffffff?text=DALL-E+3', rating: 4.7, rating_count: 11000, dimensions: { easeOfUse: 4.4, features: 4.8, value: 4.5 }, tags: ['图像生成', '设计', '创意', 'AI绘画'], features: ['高精度图像', '文字渲染', '风格多样', 'ChatGPT集成'], alternatives: ['midjourney', 'stable-diffusion'], is_new: true },
  { name: 'Tabnine', slug: 'tabnine', description: 'AI代码补全插件，支持所有主流编程语言，通过深度学习提升编码效率', category: 'coding', subcategory: 'code-assistant', pricing: 'freemium', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://tabnine.com', image_url: 'https://placehold.co/400x200/16a34a/ffffff?text=Tabnine', rating: 4.3, rating_count: 5600, dimensions: { easeOfUse: 4.4, features: 4.5, value: 4.6 }, tags: ['编程', '代码补全', 'IDE', '多语言'], features: ['全语言支持', '本地运行', '隐私保护', '私有模型训练'], alternatives: ['github-copilot', 'cursor'], is_new: false },
  { name: 'Grammarly', slug: 'grammarly', description: 'AI写作辅助工具，提供语法检查、拼写纠错和风格优化建议', category: 'writing', subcategory: 'grammar-check', pricing: 'freemium', price_detail: { monthly: 12, yearly: 144, currency: 'USD' }, url: 'https://grammarly.com', image_url: 'https://placehold.co/400x200/7c3aed/ffffff?text=Grammarly', rating: 4.7, rating_count: 15000, dimensions: { easeOfUse: 4.8, features: 4.6, value: 4.5 }, tags: ['写作', '语法', '校对', '学术'], features: ['语法纠错', '风格建议', '剽窃检测', '多平台集成'], alternatives: ['quillbot', 'languageTool'], is_new: false },
  { name: 'Stable Diffusion', slug: 'stable-diffusion', description: '开源AI图像生成模型，支持本地部署和自定义模型，适合高级用户和研究者', category: 'design', subcategory: 'image-generation', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://stability.ai', image_url: 'https://placehold.co/400x200/be185d/ffffff?text=Stable+Diffusion', rating: 4.4, rating_count: 8900, dimensions: { easeOfUse: 3.6, features: 4.8, value: 4.9 }, tags: ['图像生成', '开源', '本地部署', '自定义模型'], features: ['开源免费', '本地运行', 'LoRA模型', 'ControlNet'], alternatives: ['midjourney', 'dalle'], is_new: false },
  { name: 'OpenClaw', slug: 'openclaw', description: 'Apache 2.0开源的AI Agent框架，300K+ Stars，支持20+消息平台，Windows/Mac/Linux/Docker多平台部署', category: 'coding', subcategory: 'agent-framework', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://github.com/openclaw/agent', image_url: 'https://placehold.co/400x200/f97316/ffffff?text=OpenClaw', rating: 4.8, rating_count: 5200, dimensions: { easeOfUse: 4.2, features: 4.9, value: 4.9 }, tags: ['Agent', '开源', '多平台', '消息平台', 'Docker'], features: ['多消息平台集成', '插件系统', '记忆管理', '工具调用', '20+平台支持'], alternatives: ['hermes-agent', 'autogpt'], is_new: true },
  { name: 'Hermes Agent', slug: 'hermes-agent', description: '100K+ Stars的自进化AI Agent框架，MIT开源，支持200+模型，可自我进化和持续学习', category: 'coding', subcategory: 'agent-framework', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://github.com/mr攻Agent/mr-agent', image_url: 'https://placehold.co/400x200/8b5cf6/ffffff?text=Hermes+Agent', rating: 4.7, rating_count: 3800, dimensions: { easeOfUse: 4.0, features: 4.8, value: 4.9 }, tags: ['Agent', '自进化', '多模型', '开源', 'MIT'], features: ['200+模型支持', '自进化能力', '多Agent协作', '长期记忆', '工具扩展'], alternatives: ['openclaw', 'autogpt'], is_new: true },
  { name: 'AutoGPT', slug: 'autogpt', description: '160K+ Stars的自主任务执行Agent框架，通过自然语言指令实现复杂任务的自动化完成', category: 'coding', subcategory: 'agent-framework', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://github.com/Significant-Gravitas/AutoGPT', image_url: 'https://placehold.co/400x200/10b981/ffffff?text=AutoGPT', rating: 4.5, rating_count: 4500, dimensions: { easeOfUse: 3.8, features: 4.7, value: 4.8 }, tags: ['Agent', '自主执行', '自动化', '开源'], features: ['自主任务规划', '步骤执行', '自我反思', '视觉支持', '语音交互'], alternatives: ['openclaw', 'langchain'], is_new: true },
  { name: 'CrewAI', slug: 'crewai', description: '45K+ Stars的多Agent协作框架，让多个AI Agent扮演不同角色协同完成复杂任务', category: 'coding', subcategory: 'agent-framework', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://github.com/crewAIInc/crewAI', image_url: 'https://placehold.co/400x200/3b82f6/ffffff?text=CrewAI', rating: 4.6, rating_count: 2900, dimensions: { easeOfUse: 4.3, features: 4.6, value: 4.7 }, tags: ['Agent', '多Agent', '协作', '角色扮演', '工作流'], features: ['多角色Agent', '任务协作', '流程控制', '输出整合', '简易定义'], alternatives: ['langchain', 'autogpt'], is_new: true },
  { name: 'LangChain', slug: 'langchain', description: '118K+ Stars的AI应用开发框架，提供模块化组件构建复杂LLM应用，支持Python和JavaScript', category: 'coding', subcategory: 'agent-framework', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://github.com/langchain-ai/langchain', image_url: 'https://placehold.co/400x200/22c55e/ffffff?text=LangChain', rating: 4.4, rating_count: 6200, dimensions: { easeOfUse: 3.8, features: 4.8, value: 4.6 }, tags: ['Agent', '开发框架', 'LLM应用', 'RAG', '向量数据库'], features: ['Chain构建', 'Agent抽象', 'RAG支持', '工具调用', '向量存储'], alternatives: ['dify', 'crewai'], is_new: true },
  { name: 'Dify', slug: 'dify', description: '120K+ Stars的开源LLM应用开发平台，低代码方式快速构建AI应用，支持RAG和Agent', category: 'coding', subcategory: 'no-code-ai', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://github.com/langgenius/dify', image_url: 'https://placehold.co/400x200/ec4899/ffffff?text=Dify', rating: 4.7, rating_count: 4100, dimensions: { easeOfUse: 4.6, features: 4.7, value: 4.8 }, tags: ['LLM应用', '低代码', 'RAG', '开源', '可视化编排'], features: ['可视化编排', 'RAG管道', 'Agent', 'API部署', '多模型支持'], alternatives: ['langchain', 'coze'], is_new: true },
  { name: 'Coze', slug: 'coze', description: '字节跳动推出的AI Bot开发平台，提供60+官方插件，支持快速构建和部署聊天机器人', category: 'communication', subcategory: 'bot-platform', pricing: 'freemium', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://coze.com', image_url: 'https://placehold.co/400x200/ef4444/ffffff?text=Coze', rating: 4.5, rating_count: 3500, dimensions: { easeOfUse: 4.7, features: 4.5, value: 4.4 }, tags: ['Bot', '聊天机器人', '插件', '工作流', '字节跳动'], features: ['60+插件', '工作流编排', '多渠道发布', 'Bot商店', 'API支持'], alternatives: ['dify', 'langchain'], is_new: true },
  { name: 'Ollama', slug: 'ollama', description: '本地大模型运行工具，一键部署Llama 2/Qwen/DeepSeek等开源模型，支持GPU加速', category: 'coding', subcategory: 'local-llm', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://ollama.com', image_url: 'https://placehold.co/400x200/06b6d4/ffffff?text=Ollama', rating: 4.8, rating_count: 7800, dimensions: { easeOfUse: 4.8, features: 4.6, value: 4.9 }, tags: ['本地部署', '开源模型', 'GPU加速', '命令行', '隐私保护'], features: ['一键部署', 'GPU支持', '模型管理', 'REST API', '跨平台'], alternatives: ['lm-studio', 'anything-llm'], is_new: true },
  { name: 'LM Studio', slug: 'lm-studio', description: '本地LLM运行平台，提供类ChatGPT界面，支持GGUF格式模型，GPU加速开箱即用', category: 'coding', subcategory: 'local-llm', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://lmstudio.ai', image_url: 'https://placehold.co/400x200/8b5cf6/ffffff?text=LM+Studio', rating: 4.7, rating_count: 5600, dimensions: { easeOfUse: 4.9, features: 4.5, value: 4.8 }, tags: ['本地部署', 'LLM', '桌面应用', 'GPU加速', '隐私'], features: ['类ChatGPT界面', '模型下载', 'GPU加速', '本地API', '多模型'], alternatives: ['ollama', 'anything-llm'], is_new: true },
  { name: 'AnythingLLM', slug: 'anything-llm', description: '本地RAG知识库应用，构建私有AI知识助手，支持文档对话和知识库管理', category: 'coding', subcategory: 'knowledge-base', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://github.com/Mintplex-Labs/anything-llm', image_url: 'https://placehold.co/400x200/14b8a6/ffffff?text=AnythingLLM', rating: 4.6, rating_count: 3200, dimensions: { easeOfUse: 4.5, features: 4.7, value: 4.8 }, tags: ['知识库', 'RAG', '本地部署', '文档问答', '私有化'], features: ['多文档支持', '向量数据库', '工作区隔离', '私有部署', 'API集成'], alternatives: ['ollama', 'dify'], is_new: true },
  { name: 'DeepSeek', slug: 'deepseek', description: '70K+ Stars的国产开源大模型，API价格极低，数学和代码能力领先，支持开源模型本地部署', category: 'communication', subcategory: 'llm', pricing: 'paid', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://deepseek.com', image_url: 'https://placehold.co/400x200/1a1a2e/ffffff?text=DeepSeek', rating: 4.7, rating_count: 6800, dimensions: { easeOfUse: 4.5, features: 4.8, value: 4.9 }, tags: ['大模型', '国产', '便宜API', '代码', '数学'], features: ['低成本API', '开源模型', '代码生成', '数学推理', '长上下文'], alternatives: ['qwen', 'kimi'], is_new: true },
  { name: 'Qwen', slug: 'qwen', description: '阿里通义千问大模型，开源版本Qwen2/1.8B-72B，支持中英文，性能对标GPT-4', category: 'communication', subcategory: 'llm', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://qwenlm.github.io', image_url: 'https://placehold.co/400x200/f59e0b/ffffff?text=Qwen', rating: 4.6, rating_count: 5200, dimensions: { easeOfUse: 4.4, features: 4.7, value: 4.8 }, tags: ['大模型', '阿里', '开源', '通义千问', '中英双语'], features: ['开源模型', '多尺寸版本', '长上下文', '代码生成', '中文优化'], alternatives: ['deepseek', 'chatglm'], is_new: true },
  { name: 'ChatGLM', slug: 'chatglm', description: '清华智谱AI开发的千亿参数大模型，开源ChatGLM2-6B/GLM-4系列，中文理解能力强', category: 'communication', subcategory: 'llm', pricing: 'free', price_detail: { monthly: 0, yearly: 0, currency: 'USD' }, url: 'https://chatglm.cn', image_url: 'https://placehold.co/400x200/10b981/ffffff?text=ChatGLM', rating: 4.5, rating_count: 4800, dimensions: { easeOfUse: 4.3, features: 4.6, value: 4.7 }, tags: ['大模型', '清华', '开源', '中文', '千亿参数'], features: ['千亿参数', '中文优化', '开源版本', '微调支持', '本地部署'], alternatives: ['qwen', 'deepseek'], is_new: true },
];

// ─── UNIVERSITY POLICIES DATA ─────────────────────────────────────────────────
const policiesData = [
  { university_name: 'MIT', university_slug: 'mit', university_name_en: 'Massachusetts Institute of Technology', country: '美国', country_en: 'United States', region: 'Massachusetts', city: 'Cambridge', flag_emoji: '🇺🇸', qs_rank: 1, times_rank: 2, usnews_rank: 2, overall_policy: 'allowed', overall_summary: 'MIT对AI工具的使用持开放态度，鼓励学生合理使用AI辅助学习。', teaching_policy: 'MIT对AI工具的使用持开放态度，鼓励学生合理使用AI辅助学习。教师可以在课程中指定使用特定AI工具。', assignment_policy: '允许使用AI工具进行头脑风暴、语法检查和代码调试。必须披露AI工具的使用并确保最终代码/文本体现个人思考。', group_project_policy: '允许在小组项目中使用AI工具，但需在项目报告中披露每位成员对AI工具的使用情况。', exam_policy: '考试中使用AI工具的政策由各课程教授自行决定。闭卷考试通常禁止使用AI工具。', thesis_policy: '允许在论文写作中使用AI辅助工具进行语言润色和语法检查。研究内容必须基于原创工作。', research_policy: '允许使用AI工具进行文献检索和数据分析。实验数据和论文写作必须基于原创研究。', coding_policy: '允许使用GitHub Copilot等AI编程工具进行代码辅助，但需理解并能解释所提交的代码。', allowed_tools: ['ChatGPT', 'GitHub Copilot', 'Claude', 'Perplexity'], prohibited_tools: [], restricted_tools: [], citation_requirement: '需在作业中明确披露AI工具的使用，包括提示词和AI输出的关键内容。', disclosure_requirement: '所有AI辅助工作必须在作业中标注。', penalty: '如未披露AI使用情况，可能被视为学术不诚实。', source_url: 'https://ai.mit.edu/', last_updated: '2024-03-15', verified: true },
  { university_name: 'Stanford University', university_slug: 'stanford', university_name_en: 'Stanford University', country: '美国', country_en: 'United States', region: 'California', city: 'Stanford', flag_emoji: '🇺🇸', qs_rank: 5, times_rank: 2, usnews_rank: 3, overall_policy: 'allowed', overall_summary: 'Stanford允许在课程中有限制地使用AI工具，各院系可自主制定具体政策。', teaching_policy: 'Stanford允许在课程中有限制地使用AI工具。各院系可自主制定具体政策。', assignment_policy: '学生必须在作业中披露所有AI工具的使用，包括提示词和输出内容。', group_project_policy: '小组项目中所有成员需分别披露各自的AI工具使用情况。', exam_policy: '大部分考试禁止使用AI工具。具体政策由教授决定。', thesis_policy: '研究生论文写作中可以使用AI辅助但必须明确说明用途。', research_policy: '允许使用AI辅助学术研究，必须在方法论部分说明AI的使用方式。', coding_policy: '允许使用AI编程工具但需披露，且需理解所提交的代码。', allowed_tools: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'], prohibited_tools: [], restricted_tools: [], citation_requirement: '必须明确标注AI工具的使用，包括使用的具体提示词。', disclosure_requirement: '在作业末尾添加"AI Disclosure"部分说明AI使用情况。', penalty: '未披露AI使用可能被视为学术不诚实。', source_url: 'https://ed.stanford.edu/', last_updated: '2024-02-20', verified: true },
  { university_name: 'University of Cambridge', university_slug: 'cambridge', university_name_en: 'University of Cambridge', country: '英国', country_en: 'United Kingdom', region: 'England', city: 'Cambridge', flag_emoji: '🇬🇧', qs_rank: 3, times_rank: 5, usnews_rank: 8, overall_policy: 'restricted', overall_summary: 'Cambridge采取谨慎态度，鼓励学生发展独立思考能力。部分院系限制AI使用。', teaching_policy: 'Cambridge采取谨慎态度，鼓励学生发展独立思考能力。部分院系限制AI使用。', assignment_policy: '禁止在考试和计入成绩的作业中使用AI生成内容。本科生禁止使用ChatGPT撰写作业。', group_project_policy: '禁止在计入成绩的作业中提交AI生成的内容作为个人贡献。', exam_policy: '所有考试绝对禁止使用AI工具，违反者将面临严重学术处分。', thesis_policy: '允许在研究中使用AI辅助数据分析，但论文主体必须基于原创思考。', research_policy: '允许在研究中使用AI辅助数据分析，但论文必须基于原创思考。', coding_policy: '部分院系允许使用AI辅助编程，但需能够解释和辩护所提交的代码。', allowed_tools: ['Claude', 'Perplexity', 'Grammarly'], prohibited_tools: ['ChatGPT (undergraduates)'], restricted_tools: [], citation_requirement: '如使用AI工具，必须在参考文献中说明。', disclosure_requirement: '需在作业中明确说明AI的使用范围和方式。', penalty: '严重违反者可能面临学术处分。', source_url: 'https://www.cam.ac.uk/', last_updated: '2024-01-10', verified: true },
  { university_name: 'Harvard University', university_slug: 'harvard', university_name_en: 'Harvard University', country: '美国', country_en: 'United States', region: 'Massachusetts', city: 'Cambridge', flag_emoji: '🇺🇸', qs_rank: 4, times_rank: 3, usnews_rank: 1, overall_policy: 'allowed', overall_summary: 'Harvard对AI工具的使用采取谨慎开放态度，教师可自行决定课程政策。', teaching_policy: 'Harvard对AI工具的使用采取谨慎开放态度，教师可自行决定课程政策。', assignment_policy: '要求学生明确披露AI工具的使用，禁止将AI生成内容作为原创作品提交。', group_project_policy: '小组成员需分别说明各自的AI工具使用情况。', exam_policy: '大部分考试禁止使用AI工具，闭卷考试严格执行。', thesis_policy: '允许使用AI进行语言润色和初步草稿，但论文主体须为原创。', research_policy: '允许使用AI辅助学术研究，但必须遵守学术诚信准则。', coding_policy: '允许使用AI编程辅助工具，需能解释和修改所提交的代码。', allowed_tools: ['Claude', 'Perplexity', 'Grammarly'], prohibited_tools: ['ChatGPT (without disclosure)'], restricted_tools: [], citation_requirement: '必须披露AI工具的使用，包括工具名称和使用方式。', disclosure_requirement: '在作业中标注"Use of AI: [工具名称和用途]"。', penalty: '未披露的AI使用视为学术不诚实。', source_url: 'https://cai.harvard.edu/', last_updated: '2024-02-15', verified: true },
  { university_name: 'UCLA', university_slug: 'ucla', university_name_en: 'University of California, Los Angeles', country: '美国', country_en: 'United States', region: 'California', city: 'Los Angeles', flag_emoji: '🇺🇸', qs_rank: 29, times_rank: 18, usnews_rank: 15, overall_policy: 'allowed', overall_summary: 'UCLA允许学生在课程中有限使用AI工具，鼓励批判性思维。', teaching_policy: 'UCLA允许学生在课程中有限使用AI工具，鼓励批判性思维。', assignment_policy: '学生须遵守课程教师的AI使用政策，禁止在未经允许的情况下使用AI完成作业。', group_project_policy: '小组项目中的AI使用需在报告中披露。', exam_policy: '考试中的AI使用政策由教授决定。', thesis_policy: '允许使用AI辅助研究，但须在方法论中说明。', research_policy: '允许在研究中使用AI进行文献综述和数据分析。', coding_policy: '允许使用GitHub Copilot等编程辅助工具。', allowed_tools: ['ChatGPT', 'Claude', 'Perplexity', 'GitHub Copilot'], prohibited_tools: [], restricted_tools: [], citation_requirement: '需在作业中说明AI工具的使用。', disclosure_requirement: '在作业末尾说明AI的使用情况。', penalty: '违反学术诚信政策将接受学术审查。', source_url: 'https://www.ucla.edu/', last_updated: '2024-03-01', verified: true },
  { university_name: 'Imperial College London', university_slug: 'imperial-college', university_name_en: 'Imperial College London', country: '英国', country_en: 'United Kingdom', region: 'England', city: 'London', flag_emoji: '🇬🇧', qs_rank: 6, times_rank: 12, usnews_rank: 18, overall_policy: 'restricted', overall_summary: 'Imperial College对AI工具使用采取限制性态度，强调学生独立学习能力培养。', teaching_policy: 'Imperial College对AI工具使用采取限制性态度，强调学生独立学习能力培养。', assignment_policy: '禁止在考试和计入成绩的作业中使用AI生成内容。须遵守各课程具体规定。', group_project_policy: '禁止提交AI生成的内容作为个人贡献。', exam_policy: '考试禁止使用所有AI工具。', thesis_policy: '允许在论文中使用AI辅助工具但须明确说明。', research_policy: '允许在研究中使用AI辅助工具，须明确说明使用方式和范围。', coding_policy: '允许有限使用AI编程工具，需能解释代码逻辑。', allowed_tools: ['Grammarly', 'Perplexity'], prohibited_tools: ['ChatGPT', 'Claude', 'Gemini'], restricted_tools: [], citation_requirement: '必须披露所有AI工具的使用。', disclosure_requirement: '在报告末尾说明AI工具的使用情况。', penalty: '违反者可能面临严重学术处分。', source_url: 'https://www.imperial.ac.uk/', last_updated: '2024-01-20', verified: true },
  { university_name: 'ETH Zurich', university_slug: 'eth-zurich', university_name_en: 'ETH Zurich', country: '瑞士', country_en: 'Switzerland', region: 'Zurich', city: 'Zurich', flag_emoji: '🇨🇭', qs_rank: 7, times_rank: 11, usnews_rank: 27, overall_policy: 'allowed', overall_summary: 'ETH Zurich对AI工具持开放但负责任的态度，鼓励学生合理使用。', teaching_policy: 'ETH Zurich对AI工具持开放但负责任的态度，鼓励学生合理使用。', assignment_policy: '允许使用AI进行头脑风暴和语法检查，但必须披露。禁止将AI内容作为原创提交。', group_project_policy: '小组项目中的AI使用需全体成员知情并披露。', exam_policy: '闭卷考试禁止使用AI工具。开卷考试由教授决定。', thesis_policy: '允许使用AI辅助论文写作，必须在方法论部分说明。', research_policy: '允许研究中使用AI辅助数据分析，须在方法论部分说明。', coding_policy: '允许使用AI编程工具，需能解释所提交的代码。', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot', 'Perplexity'], prohibited_tools: [], restricted_tools: [], citation_requirement: '必须说明AI工具的使用，包括提示词和输出内容摘要。', disclosure_requirement: '在作业中添加AI使用声明。', penalty: '未披露的AI使用视为学术不诚实。', source_url: 'https://ethz.ch/', last_updated: '2024-02-28', verified: true },
  { university_name: 'UNSW Sydney', university_slug: 'unsw', university_name_en: 'University of New South Wales', country: '澳大利亚', country_en: 'Australia', region: 'New South Wales', city: 'Sydney', flag_emoji: '🇦🇺', qs_rank: 19, times_rank: 71, usnews_rank: 41, overall_policy: 'allowed', overall_summary: 'UNSW拥抱AI作为学习工具，提供AI guidelines帮助学生和教师合理使用。', teaching_policy: 'UNSW拥抱AI作为学习工具，提供AI guidelines帮助学生和教师合理使用。', assignment_policy: '允许使用AI辅助学习，但必须：1.批判性评估AI输出 2.在作业中披露使用情况 3.保留AI交互记录。', group_project_policy: '小组项目中每人均需披露各自的AI使用情况。', exam_policy: '考试中使用AI工具的政策由各课程决定。', thesis_policy: '研究论文中可以适当使用AI进行语言润色，必须明确标注。', research_policy: '允许研究中使用AI辅助数据分析。', coding_policy: '允许使用AI编程工具，需能解释所提交的代码。', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot', 'Kimi', 'Perplexity'], prohibited_tools: [], restricted_tools: [], citation_requirement: '需说明AI工具的使用，包括提示词和输出关键内容。', disclosure_requirement: '在作业中添加AI工具使用声明。', penalty: '未披露AI使用且影响原创性评估可能扣分。', source_url: 'https://www.unsw.edu.au/', last_updated: '2024-02-28', verified: true },
  { university_name: 'University of Oxford', university_slug: 'oxford', university_name_en: 'University of Oxford', country: '英国', country_en: 'United Kingdom', region: 'England', city: 'Oxford', flag_emoji: '🇬🇧', qs_rank: 2, times_rank: 1, usnews_rank: 5, overall_policy: 'restricted', overall_summary: 'Oxford对AI工具持谨慎态度，要求学生在学术工作中展示独立思考。', teaching_policy: 'Oxford对AI工具持谨慎态度，要求学生在学术工作中展示独立思考。', assignment_policy: '禁止在计入成绩的作业中使用AI生成内容。个别课程可能有例外规定。', group_project_policy: '禁止在计入成绩的作业中提交AI生成的内容作为个人贡献。', exam_policy: '所有考试绝对禁止使用AI工具，违反者将面临学术处分甚至开除。', thesis_policy: '允许在研究中使用AI进行初步探索，但论文主体须为原创。', research_policy: '允许在研究中使用AI辅助数据分析，但论文主体须为原创。', coding_policy: '允许有限使用AI编程工具，需能完全解释所提交的代码。', allowed_tools: ['Perplexity', 'Grammarly'], prohibited_tools: ['ChatGPT', 'Claude (coursework)'], restricted_tools: [], citation_requirement: '必须披露所有AI工具的使用。', disclosure_requirement: '需在作业中明确标注AI的使用。', penalty: '违反者可能面临学术处分甚至开除。', source_url: 'https://www.ox.ac.uk/', last_updated: '2024-01-15', verified: true },
];

// ─── PAYMENT SOLUTIONS DATA ───────────────────────────────────────────────────
const paymentData = [
  { title: '虚拟信用卡 Depay', category: 'virtual_card', content: 'Depay 提供虚拟信用卡服务，支持使用 USDT 等加密货币充值，适合没有海外银行卡的用户。\n\n**使用步骤：**\n1. 注册 Depay 账号\n2. 充值 USDT\n3. 开通虚拟卡\n4. 绑定到 AI 工具\n\n**优点：**\n- 无需海外银行账户\n- 支持加密货币充值\n- 开通快速\n\n**缺点：**\n- 充值有手续费\n- 部分平台可能拒绝\n\n**费用：**\n- 开卡费：$5-10\n- 月费：$0-2\n- 充值手续费：1-2%', excerpt: '提供虚拟信用卡服务，支持加密货币充值，适合没有海外银行卡的用户', tool_ids: [], difficulty: 'easy', reliability: 'high', tags: ['虚拟卡', 'USDT', 'Depay', '留学生', '信用卡'], rating: 4.5, rating_count: 1200 },
  { title: 'Apple Gift Card', category: 'gift_card', content: '通过 Apple Gift Card 购买 iAMSmart 地区的订阅服务。\n\n**步骤：**\n1. 注册美区 Apple ID\n2. 购买 Apple Gift Card\n3. 兑换到账户\n4. 订阅 ChatGPT Plus\n\n**适用地区：**\n- 香港、新加坡等 iAMSmart 支持地区\n\n**注意事项：**\n- 需要当地支付方式购买 Gift Card\n- 或通过淘宝/闲鱼购买', excerpt: '通过 Apple Gift Card 购买美区订阅服务，适合有美区 Apple ID 的用户', tool_ids: [], difficulty: 'medium', reliability: 'high', tags: ['Apple', 'Gift Card', 'iAMSmart', 'ChatGPT'], rating: 4.2, rating_count: 890 },
  { title: '低价区定价策略', category: 'regional_pricing', content: '利用不同地区的定价差异获取更优惠的价格。部分 AI 工具在发展中国家有折扣价。\n\n**方法：**\n1. 使用 VPN 切换到低价地区\n2. 注册当地账号\n3. 使用当地支付方式\n\n**注意事项：**\n- 部分服务检测 IP 和支付方式\n- 可能违反服务条款\n- 稳定性较差', excerpt: '利用不同地区的定价差异获取优惠，需要 VPN 和当地支付方式', tool_ids: [], difficulty: 'hard', reliability: 'medium', tags: ['低价区', 'VPN', '折扣', '区域定价'], rating: 3.8, rating_count: 650 },
  { title: 'FOMEPay 虚拟卡', category: 'virtual_card', content: 'FOMEPay 提供另一款虚拟信用卡，支持 USDT 充值，开卡流程简单，适合留学生。\n\n**优点：**\n- 支持多币种\n- 开卡门槛低\n- 支持多种 AI 平台\n\n**缺点：**\n- 汇率转换费用\n- 部分高级功能需付费\n\n**费用：**\n- 开卡费：$5\n- 充值手续费：1%', excerpt: 'FOMEPay 虚拟信用卡，支持 USDT 充值，适合多种 AI 平台订阅', tool_ids: [], difficulty: 'easy', reliability: 'high', tags: ['虚拟卡', 'FOMEPay', 'USDT', '留学生'], rating: 4.3, rating_count: 780 },
  { title: '好友代付', category: 'friend_assistance', content: '通过在海外有信用卡的朋友或亲戚代为支付订阅费用。\n\n**步骤：**\n1. 联系有海外信用卡的朋友\n2. 说明需要订阅的服务\n3. 将费用偿还给朋友（可用人民币转账）\n\n**优点：**\n- 无手续费\n- 稳定可靠\n\n**缺点：**\n- 需要信任关系\n- 可能造成人情负担\n- 不适合大额或频繁支付', excerpt: '通过海外朋友代付订阅费用，适合有海外人脉的用户', tool_ids: [], difficulty: 'easy', reliability: 'high', tags: ['代付', '朋友', '信用卡', '人情'], rating: 4.6, rating_count: 2100 },
  { title: 'WildCard 虚拟卡', category: 'virtual_card', content: 'WildCard 是专为国内用户设计的虚拟信用卡，支持快速开卡和多种 AI 平台订阅。\n\n**优点：**\n- 专为国内用户优化\n- 开卡流程简单\n- 支持 GPT、Claude 等主流平台\n\n**缺点：**\n- 有开卡费和年费\n- 充值手续费约1%\n\n**费用：**\n- 开卡费：$9.9（一年）\n- 充值手续费：1%', excerpt: 'WildCard 虚拟信用卡，专为国内用户设计，支持多种 AI 平台订阅', tool_ids: [], difficulty: 'easy', reliability: 'high', tags: ['WildCard', '虚拟卡', 'GPT', 'Claude'], rating: 4.4, rating_count: 950 },
];

// ─── PROMPT TEMPLATES DATA ───────────────────────────────────────────────────
const promptsData = [
  { title: '学术论文润色', content: 'Please help me polish my academic writing. Here is my draft paragraph:\n\n[DRAFT TEXT]\n\nPlease help me:\n1. Improve academic tone and formality\n2. Fix grammar and spelling errors\n3. Enhance clarity and conciseness\n4. Maintain my original voice and ideas\n\nPlease only provide suggestions for improvement, do not rewrite the entire text. After each suggestion, explain briefly why this change improves the writing.', description: '用于润色学术论文段落，保持学术语气同时改善语法和表达', category: 'thesis', tool_id: null, rating: 4.8, rating_count: 450, usage_count: 1200, tags: ['学术', '润色', '论文', '英文'] },
  { title: '留学申请 Personal Statement', content: 'Please help me write a compelling Personal Statement for my graduate school application.\n\nMy background:\n- Academic background: [DEGREE, MAJOR, UNIVERSITY]\n- Research experience: [DESCRIBE YOUR RESEARCH]\n- Career goals: [YOUR CAREER OBJECTIVES]\n- Why this program: [WHY THIS PROGRAM]\n\nRequirements:\n- Word count: 500-800 words\n- Tone: Professional yet personal\n- Highlight unique experiences and motivations\n\nPlease draft a Personal Statement that tells a coherent story about my academic journey and future goals.', description: '帮助撰写留学申请的 Personal Statement', category: 'application', tool_id: null, rating: 4.7, rating_count: 380, usage_count: 980, tags: ['留学', '申请', 'Personal Statement', '文书'] },
  { title: '代码注释生成', content: 'Please generate comprehensive documentation for the following function/code:\n\n[LANGUAGE]:\n[CODE]\n\nPlease generate:\n1. File-level docstring\n2. Function/method docstring including:\n   - Brief description\n   - Parameters (name, type, description)\n   - Return value (type, description)\n   - Examples\n3. Inline comments for complex logic\n4. Any necessary warnings or notes\n\nFollow [LANGUAGE] best practices and docstring conventions.', description: '为代码生成规范的文档注释', category: 'job', tool_id: null, rating: 4.6, rating_count: 290, usage_count: 850, tags: ['代码', '文档', '注释', '开发'] },
  { title: '会议纪要整理', content: 'Please help me organize my meeting notes into a structured format.\n\nRaw notes:\n[PASTE MEETING NOTES HERE]\n\nPlease create:\n1. **Meeting Overview**: Date, attendees, main topic\n2. **Key Discussion Points**: Main topics discussed\n3. **Decisions Made**: Actions and decisions agreed upon\n4. **Action Items**: Tasks assigned with owners and deadlines\n5. **Follow-up Questions**: Outstanding questions to address\n\nFormat in markdown for easy sharing.', description: '将会议笔记整理成结构化格式', category: 'daily', tool_id: null, rating: 4.5, rating_count: 220, usage_count: 720, tags: ['会议', '笔记', '整理', '效率'] },
  { title: '求职Cover Letter', content: 'Please help me write a professional cover letter for a job application.\n\n**Position:** [JOB TITLE]\n**Company:** [COMPANY NAME]\n**My Background:**\n- Education: [DEGREE, UNIVERSITY]\n- Relevant Experience: [WORK EXPERIENCE]\n- Key Skills: [SKILLS]\n\n**Why this company:**\n[EXPLAIN WHY YOU WANT TO WORK HERE]\n\nRequirements:\n- Professional tone\n- Concise (one page)\n- Highlight most relevant experiences for this role\n- Show genuine interest in the company', description: '帮助撰写求职 Cover Letter', category: 'job', tool_id: null, rating: 4.6, rating_count: 310, usage_count: 890, tags: ['求职', 'Cover Letter', '简历', '找工作'] },
  { title: '研究文献综述', content: 'Please help me write a literature review section for my research paper.\n\n**Research Topic:** [YOUR TOPIC]\n**Key Themes to Cover:** [THEME 1], [THEME 2], [THEME 3]\n\nFor each theme, please:\n1. Summarize the main findings from key papers\n2. Identify consensus and debates in the field\n3. Point out gaps that your research addresses\n4. Provide citations in APA format where possible\n\nPlease maintain academic writing standards and ensure logical flow between themes.', description: '帮助撰写研究文献综述部分', category: 'research', tool_id: null, rating: 4.4, rating_count: 180, usage_count: 560, tags: ['研究', '文献综述', '学术', '论文'] },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function verifyJWT(token: string) {
  if (!token || !token.startsWith('eyJ') || token.split('.').length !== 3) return false;
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    return payload.role === 'service_role';
  } catch { return false; }
}

async function clearAndSeed(adminClient: ReturnType<typeof createClient>) {
  // Clear existing data
  const tables = ['prompt_templates', 'payment_solutions', 'university_policies', 'tools'];
  for (const table of tables) {
    await adminClient.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  // Insert tools first (needed for tool_id references)
  const { data: insertedTools, error: toolsErr } = await adminClient.from('tools').insert(toolsData).select('id, slug');
  if (toolsErr) throw new Error(`Tools: ${toolsErr.message}`);
  console.log(`Seeded ${insertedTools?.length ?? 0} tools`);

  // Build tool slug → id map for prompt templates
  const toolMap: Record<string, string> = {};
  if (insertedTools) {
    for (const t of insertedTools) toolMap[t.slug] = t.id;
  }

  // Update prompt tool_ids
  const promptsWithToolIds = promptsData.map(p => ({
    ...p,
    tool_id: p.tool_id ? (toolMap[p.tool_id] || null) : null,
  }));

  // Insert remaining tables
  const results = await Promise.allSettled([
    adminClient.from('university_policies').insert(policiesData).select(),
    adminClient.from('payment_solutions').insert(paymentData).select(),
    adminClient.from('prompt_templates').insert(promptsWithToolIds).select(),
  ]);

  const errors = results.filter(r => r.status === 'rejected' || r.value.error);
  if (errors.length) {
    const msgs = errors.map(e => e.status === 'rejected' ? (e as PromiseRejectedResult).reason?.message : (e as PromiseFulfilledResult<any>).value.error?.message);
    throw new Error(`Insert errors: ${msgs.join('; ')}`);
  }

  return { tools: insertedTools?.length ?? 0 };
}

async function verifyCounts(adminClient: ReturnType<typeof createClient>) {
  const counts = await Promise.all([
    adminClient.from('tools').select('id', { count: 'exact', head: true }),
    adminClient.from('university_policies').select('id', { count: 'exact', head: true }),
    adminClient.from('payment_solutions').select('id', { count: 'exact', head: true }),
    adminClient.from('prompt_templates').select('id', { count: 'exact', head: true }),
  ]);
  return {
    tools: counts[0].count ?? 0,
    policies: counts[1].count ?? 0,
    payments: counts[2].count ?? 0,
    prompts: counts[3].count ?? 0,
  };
}

// ─── API ROUTE ────────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { service_role_key, admin_token } = body;

    // Verify admin token
    if (admin_token !== ADMIN_TOKEN) {
      return json({ success: false, error: 'Unauthorized - invalid admin token' }, 401);
    }

    // Verify service_role_key
    if (!service_role_key || !verifyJWT(service_role_key)) {
      return json({ success: false, error: 'Invalid or missing service_role_key. Must be a valid JWT with role=service_role.' }, 400);
    }

    // Create admin client
    const adminClient = createClient(SUPABASE_URL, service_role_key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Test connection
    const { error: connErr } = await adminClient.from('tools').select('id').limit(1);
    if (connErr) {
      return json({ success: false, error: `Connection failed: ${connErr.message}` }, 502);
    }

    // Check if already seeded
    const counts = await verifyCounts(adminClient);
    if (counts.tools >= 15 && counts.policies >= 5) {
      return json({ success: true, message: 'Database already seeded', counts });
    }

    // Seed data
    const result = await clearAndSeed(adminClient);
    const finalCounts = await verifyCounts(adminClient);

    return json({
      success: true,
      message: 'Database seeded successfully',
      inserted: result,
      counts: finalCounts,
    });

  } catch (err: any) {
    console.error('Seed error:', err);
    return json({ success: false, error: err.message || 'Internal error' }, 500);
  }
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
