/**
 * AI工具更新说明实时抓取服务
 * 支持从GitHub Releases和官方Changelog页面抓取最新更新
 */

// 更新来源配置
export interface UpdateSource {
  url: string;
  type: 'github' | 'changelog' | 'blog' | 'none';
  // GitHub仓库信息（用于API调用）
  githubOwner?: string;
  githubRepo?: string;
}

// 所有工具的更新来源配置
export const UPDATE_SOURCES: Record<string, UpdateSource> = {
  // ========== Writing 工具 ==========
  'notion-ai': {
    url: 'https://www.notion.so/updates',
    type: 'changelog',
  },
  'jasper': {
    url: 'https://www.jasper.ai/changelog',
    type: 'changelog',
  },
  'copyai': {
    url: 'https://www.copy.ai/changelog',
    type: 'changelog',
  },
  'grammarly': {
    url: 'https://www.grammarly.com/updates',
    type: 'changelog',
  },
  'quillbot': {
    url: 'https://quillbot.com/changelog',
    type: 'changelog',
  },

  // ========== Coding 工具 ==========
  'github-copilot': {
    url: 'https://github.com/github/copilot-release-notes/releases',
    type: 'github',
    githubOwner: 'github',
    githubRepo: 'copilot-release-notes',
  },
  'tabnine': {
    url: 'https://github.com/codota/TabNine/releases',
    type: 'github',
    githubOwner: 'codota',
    githubRepo: 'TabNine',
  },
  'cursor': {
    url: 'https://cursor.com/changelog',
    type: 'changelog',
  },
  'replit': {
    url: 'https://docs.replit.com/updates',
    type: 'changelog',
  },

  // ========== Design 工具 ==========
  'midjourney': {
    url: 'https://docs.midjourney.com/',
    type: 'changelog',
  },
  'figma': {
    url: 'https://www.figma.com/changelog/',
    type: 'changelog',
  },
  'dalle-3': {
    url: 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes',
    type: 'changelog',
  },
  'stable-diffusion': {
    url: 'https://stability.ai/news',
    type: 'changelog',
  },
  'tongyi-wanxiang': {
    url: 'https://help.aliyun.com/zh/tongyi/document-2506281',
    type: 'changelog',
  },
  'miaohua': {
    url: '',
    type: 'none',
  },
  'liblib': {
    url: 'https://www.liblib.ai/',
    type: 'changelog',
  },

  // ========== Research 工具 ==========
  'perplexity': {
    url: 'https://www.perplexity.ai/changelog/',
    type: 'changelog',
  },
  'webpilot': {
    url: 'https://github.com/webpilot-ai/Webpilot/releases',
    type: 'github',
    githubOwner: 'webpilot-ai',
    githubRepo: 'Webpilot',
  },
  'elicit': {
    url: 'https://elicit.com/blog',
    type: 'blog',
  },

  // ========== Communication 工具 ==========
  'chatgpt': {
    url: 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes',
    type: 'changelog',
  },
  'claude': {
    url: 'https://docs.anthropic.com/en/release-notes/overview',
    type: 'changelog',
  },
  'kimi': {
    url: 'https://kimi.moonshot.cn/docs/changelog',
    type: 'changelog',
  },
  'gemini': {
    url: 'https://ai.google.dev/gemini-api/docs/changelog',
    type: 'changelog',
  },
  'wenxin-yiyan': {
    url: 'https://yiyan.baidu.com/notice',
    type: 'changelog',
  },
  'tongyi-qianwen': {
    url: 'https://help.aliyun.com/zh/qwen',
    type: 'changelog',
  },
  'xunfei-xinghuo': {
    url: 'https://www.xfyun.cn/doc/spark/Web.html',
    type: 'changelog',
  },
  'zhixing-qingyan': {
    url: 'https://www.zhipuai.cn/news',
    type: 'changelog',
  },
  'doubao': {
    url: 'https://www.volcengine.com/docs/82379/1195622',
    type: 'changelog',
  },
  'hunyuan': {
    url: 'https://cloud.tencent.com/document/product/1729',
    type: 'changelog',
  },
  'shangliang': {
    url: 'https://www.sensetime.com/news',
    type: 'changelog',
  },
  'tiangong': {
    url: 'https://www.tiangong.cn/',
    type: 'changelog',
  },
  'pangu': {
    url: 'https://www.huaweicloud.com/product/pangu.html',
    type: 'changelog',
  },

  // ========== Agent 框架 ==========
  'openclaw': {
    url: 'https://github.com/openclaw/openclaw/releases',
    type: 'github',
    githubOwner: 'openclaw',
    githubRepo: 'openclaw',
  },
  'hermes-agent': {
    url: 'https://github.com/NousResearch/hermes-agent/releases',
    type: 'github',
    githubOwner: 'NousResearch',
    githubRepo: 'hermes-agent',
  },
  'autogpt': {
    url: 'https://github.com/Significant-Gravitas/AutoGPT/releases',
    type: 'github',
    githubOwner: 'Significant-Gravitas',
    githubRepo: 'AutoGPT',
  },
  'crewai': {
    url: 'https://github.com/crewAIInc/crewAI/releases',
    type: 'github',
    githubOwner: 'crewAIInc',
    githubRepo: 'crewAI',
  },
  'langchain': {
    url: 'https://github.com/langchain-ai/langchain/releases',
    type: 'github',
    githubOwner: 'langchain-ai',
    githubRepo: 'langchain',
  },
  'dify': {
    url: 'https://github.com/langgenius/dify/releases',
    type: 'github',
    githubOwner: 'langgenius',
    githubRepo: 'dify',
  },
  'coze': {
    url: 'https://www.coze.com/open/docs/guides/release_note',
    type: 'changelog',
  },
  'ollama': {
    url: 'https://github.com/ollama/ollama/releases',
    type: 'github',
    githubOwner: 'ollama',
    githubRepo: 'ollama',
  },
  'lm-studio': {
    url: 'https://lmstudio.ai/changelog',
    type: 'changelog',
  },
  'anything-llm': {
    url: 'https://github.com/Mintplex-Labs/anything-llm/releases',
    type: 'github',
    githubOwner: 'Mintplex-Labs',
    githubRepo: 'anything-llm',
  },
  'deepseek': {
    url: 'https://api-docs.deepseek.com/updates',
    type: 'changelog',
  },
  'qwen': {
    url: 'https://github.com/QwenLM/Qwen3/releases',
    type: 'github',
    githubOwner: 'QwenLM',
    githubRepo: 'Qwen3',
  },
  'chatglm': {
    url: 'https://github.com/THUDM/ChatGLM3/releases',
    type: 'github',
    githubOwner: 'THUDM',
    githubRepo: 'ChatGLM3',
  },
};

// GitHub API 调用获取最新 release
export async function fetchGitHubLatestRelease(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Tools-Tracker/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} for ${owner}/${repo}`);
      return null;
    }

    const releases = await response.json();

    if (!releases || releases.length === 0) {
      return null;
    }

    const latest = releases[0];

    // 格式化发布信息
    const version = latest.tag_name ? `v${latest.tag_name.replace(/^v/, '')}` : 'Latest';
    const date = new Date(latest.published_at).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let content = `**${version}** (${date})`;

    if (latest.name) {
      content += `\n\n${latest.name}`;
    }

    if (latest.body) {
      // 限制内容长度
      const body = latest.body.substring(0, 500);
      content += `\n\n${body}${latest.body.length > 500 ? '...' : ''}`;
    }

    return content;
  } catch (error) {
    console.error(`Failed to fetch GitHub release for ${owner}/${repo}:`, error);
    return null;
  }
}

// 抓取网页内容
export async function fetchChangelogPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch changelog: ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();

    // 简单提取标题和内容（实际项目中应该用更健壮的HTML解析）
    // 这里只是演示，实际需要根据每个网站定制
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Latest Update';

    // 返回页面标题作为更新信息
    return `最新更新: ${title}\n\n来源: ${url}`;
  } catch (error) {
    console.error(`Failed to fetch changelog page ${url}:`, error);
    return null;
  }
}

// 根据工具slug获取更新信息
export async function fetchToolUpdate(toolSlug: string): Promise<{
  latestUpdate: string;
  sourceUrl: string;
  fetchedAt: string;
  sourceType: string;
} | null> {
  const source = UPDATE_SOURCES[toolSlug];

  if (!source || source.type === 'none' || !source.url) {
    return null;
  }

  let latestUpdate: string | null = null;

  if (source.type === 'github' && source.githubOwner && source.githubRepo) {
    latestUpdate = await fetchGitHubLatestRelease(source.githubOwner, source.githubRepo);
  } else if (source.type === 'changelog' || source.type === 'blog') {
    latestUpdate = await fetchChangelogPage(source.url);
  }

  if (!latestUpdate) {
    return null;
  }

  return {
    latestUpdate,
    sourceUrl: source.url,
    fetchedAt: new Date().toISOString(),
    sourceType: source.type,
  };
}
