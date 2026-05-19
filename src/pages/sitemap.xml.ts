import type { APIRoute } from 'astro';

// This endpoint must be rendered at runtime (not prerendered)
export const prerender = false;

const siteUrl = 'https://ai-student-survival.pages.dev';

// All static page routes
const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/tools', priority: '0.9', changefreq: 'daily' },
  { url: '/payment', priority: '0.8', changefreq: 'weekly' },
  { url: '/policies', priority: '0.8', changefreq: 'weekly' },
  { url: '/prompts', priority: '0.7', changefreq: 'weekly' },
  { url: '/compare', priority: '0.7', changefreq: 'weekly' },
  { url: '/community', priority: '0.7', changefreq: 'daily' },
  { url: '/map', priority: '0.6', changefreq: 'monthly' },
  { url: '/offers', priority: '0.7', changefreq: 'weekly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/about', priority: '0.5', changefreq: 'monthly' },
  { url: '/contact', priority: '0.4', changefreq: 'monthly' },
  { url: '/guide', priority: '0.6', changefreq: 'weekly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  { url: '/api', priority: '0.3', changefreq: 'monthly' },
];

// Dynamic tool slugs
const toolSlugs = [
  'chatgpt', 'claude', 'midjourney', 'github-copilot', 'notion-ai',
  'perplexity', 'jasper', 'copyai', 'grammarly', 'quillbot',
  'tabnine', 'cursor', 'replit', 'figma', 'dalle-3',
  'stable-diffusion', 'kimi', 'gemini', 'webpilot', 'wenxin-yiyan',
  'tongyi-qianwen', 'xunfei-xinghuo', 'zhixing-qingyan', 'doubao',
  'hunyuan', 'shangliang', 'tiangong', 'pangu', 'tongyi-wanxiang',
  'miaohua', 'liblib', 'xunfei-xiezuo', 'mita-writecat', 'caiyun-xiaomeng',
];

// Dynamic payment solution slugs
const paymentSlugs = Array.from({ length: 10 }, (_, i) => String(i + 1));

// Dynamic policy slugs
const policySlugs = [
  'mit', 'stanford', 'cambridge', 'oxford', 'unsw',
  'toronto', 'eth', 'ntu', 'harvard', 'nus',
];

// English versions
const enRoutes = staticRoutes.map(r => ({
  url: `/en${r.url === '/' ? '' : r.url}`,
  priority: r.priority,
  changefreq: r.changefreq,
}));

const enToolSlugs = toolSlugs.map(slug => `/en/tools/${slug}`);
const enPaymentSlugs = paymentSlugs.map(id => `/en/payment/${id}`);
const enPolicySlugs = policySlugs.map(slug => `/en/policies/${slug}`);

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const today = formatDate(new Date());

  const allRoutes = [
    ...staticRoutes,
    ...enRoutes,
    ...toolSlugs.map(slug => ({ url: `/tools/${slug}`, priority: '0.8', changefreq: 'weekly' })),
    ...enToolSlugs.map(url => ({ url, priority: '0.8', changefreq: 'weekly' })),
    ...paymentSlugs.map(id => ({ url: `/payment/${id}`, priority: '0.7', changefreq: 'monthly' })),
    ...enPaymentSlugs.map(url => ({ url, priority: '0.7', changefreq: 'monthly' })),
    ...policySlugs.map(slug => ({ url: `/policies/${slug}`, priority: '0.7', changefreq: 'monthly' })),
    ...enPolicySlugs.map(url => ({ url, priority: '0.7', changefreq: 'monthly' })),
    { url: '/community/create', priority: '0.6', changefreq: 'weekly' },
    { url: '/en/community/create', priority: '0.6', changefreq: 'weekly' },
    { url: '/offers/submit', priority: '0.5', changefreq: 'monthly' },
    { url: '/en/offers/submit', priority: '0.5', changefreq: 'monthly' },
    { url: '/map/add', priority: '0.5', changefreq: 'monthly' },
    { url: '/en/map/add', priority: '0.5', changefreq: 'monthly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allRoutes
  .map(
    route => `  <url>
    <loc>${escapeXml(`${siteUrl}${route.url}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'index, follow',
    },
  });
};
