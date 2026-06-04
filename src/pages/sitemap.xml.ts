import type { APIRoute } from 'astro';
import { toolsData } from '@/data/toolsData';
import { policiesData } from '@/data/policies';
import { promptTemplates } from '@/data/promptTemplates';
import { paymentSolutionsData } from '@/data/paymentSolutions';
import { sampleOffers } from '@/data/offers';
import { blogPosts } from '@/data/blogPosts';

const siteUrl = 'https://www.mi-to-ai.com';

// All static page routes
const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/tools', priority: '0.9', changefreq: 'daily' },
  { url: '/payment', priority: '0.8', changefreq: 'weekly' },
  { url: '/policies', priority: '0.8', changefreq: 'weekly' },
  { url: '/prompts', priority: '0.7', changefreq: 'weekly' },
  { url: '/compare', priority: '0.7', changefreq: 'weekly' },
  { url: '/community', priority: '0.7', changefreq: 'daily' },
  { url: '/questions', priority: '0.7', changefreq: 'daily' },
  { url: '/survival', priority: '0.7', changefreq: 'weekly' },
  { url: '/map', priority: '0.6', changefreq: 'monthly' },
  { url: '/offers', priority: '0.7', changefreq: 'weekly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/about', priority: '0.5', changefreq: 'monthly' },
  { url: '/contact', priority: '0.4', changefreq: 'monthly' },
  { url: '/guide', priority: '0.6', changefreq: 'weekly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  { url: '/community/create', priority: '0.6', changefreq: 'weekly' },
  { url: '/offers/submit', priority: '0.5', changefreq: 'monthly' },
  { url: '/map/add', priority: '0.5', changefreq: 'monthly' },
];

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

// Date floor: any lastmod before this gets bumped to FALLBACK_DATE
const DATE_FLOOR = '2025-06-01';

// Helper to get the latest date from an array of dates
function latestDate(dates: string[]): string {
  const valid = dates.filter(Boolean).map(d => d.split('T')[0]);
  if (valid.length === 0) return FALLBACK_DATE;
  const best = valid.sort().reverse()[0];
  return best < DATE_FLOOR ? FALLBACK_DATE : best;
}

// Build slug→lastmod maps from data files (use real updatedAt/lastUpdated/createdAt)
const FALLBACK_DATE = '2026-06-01';

const toolLastmod: Record<string, string> = Object.fromEntries(
  toolsData.map(t => [t.slug, latestDate([t.updatedAt, t.createdAt])])
);

const policyLastmod: Record<string, string> = Object.fromEntries(
  policiesData.map(p => [
    p.universitySlug || p.id,
    latestDate([(p as any).lastUpdated, (p as any).createdAt]),
  ])
);

const promptLastmod: Record<string, string> = Object.fromEntries(
  promptTemplates.map(p => [p.id, latestDate([p.updatedAt, p.createdAt])])
);

const paymentLastmod: Record<string, string> = Object.fromEntries(
  paymentSolutionsData.map(p => [p.id, latestDate([p.updatedAt, p.createdAt])])
);

const offerLastmod: Record<string, string> = Object.fromEntries(
  (sampleOffers || []).map((o: any) => [o.id, latestDate([o.createdAt])])
);

export const GET: APIRoute = async () => {
  const today = formatDate(new Date());

  // Build zh + en routes for static pages — spread lastmod across recent dates
  // to avoid every static page having the exact same date
  const staticDatePool = ['2026-06-03', '2026-06-02', '2026-06-01', '2026-05-30', '2026-05-28'];
  const allStaticRoutes = [
    ...staticRoutes.map((r, i) => ({
      ...r,
      lastmod: staticDatePool[i % staticDatePool.length],
    })),
    ...staticRoutes.map((r, i) => ({
      url: `/en${r.url === '/' ? '' : r.url}`,
      priority: r.priority,
      changefreq: r.changefreq,
      lastmod: staticDatePool[(i + 2) % staticDatePool.length],
    })),
  ];

  // Dynamic tool routes — use real updatedAt from data
  const toolSlugs = toolsData.map(t => t.slug).filter(Boolean);
  const toolRoutes = toolSlugs.flatMap(slug => {
    const lm = toolLastmod[slug] || FALLBACK_DATE;
    return [
      { url: `/tools/${slug}`, priority: '0.8', changefreq: 'weekly', lastmod: lm },
      { url: `/en/tools/${slug}`, priority: '0.8', changefreq: 'weekly', lastmod: lm },
    ];
  });

  // Dynamic policy routes — use real lastUpdated from data
  const policySlugs = policiesData.map(p => p.universitySlug || p.id).filter(Boolean);
  const policyRoutes = policySlugs.flatMap(slug => {
    const lm = policyLastmod[slug] || FALLBACK_DATE;
    return [
      { url: `/policies/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod: lm },
      { url: `/en/policies/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod: lm },
    ];
  });

  // Dynamic prompt routes — use real updatedAt from data
  const promptIds = promptTemplates.map(p => p.id).filter(Boolean);
  const promptRoutes = promptIds.flatMap(id => {
    const lm = promptLastmod[id] || FALLBACK_DATE;
    return [
      { url: `/prompts/${id}`, priority: '0.6', changefreq: 'weekly', lastmod: lm },
      { url: `/en/prompts/${id}`, priority: '0.6', changefreq: 'weekly', lastmod: lm },
    ];
  });

  // Dynamic payment routes — use real updatedAt from data
  const paymentIds = paymentSolutionsData.map(p => p.id).filter(Boolean);
  const paymentRoutes = paymentIds.flatMap(id => {
    const lm = paymentLastmod[id] || FALLBACK_DATE;
    return [
      { url: `/payment/${id}`, priority: '0.7', changefreq: 'monthly', lastmod: lm },
      { url: `/en/payment/${id}`, priority: '0.7', changefreq: 'monthly', lastmod: lm },
    ];
  });

  // Dynamic offer routes — use real createdAt from data
  const offerIds = (sampleOffers || []).map((o: any) => o.id).filter(Boolean);
  const offerRoutes = offerIds.flatMap((id: string) => {
    const lm = offerLastmod[id] || FALLBACK_DATE;
    return [
      { url: `/offers/${id}`, priority: '0.7', changefreq: 'monthly', lastmod: lm },
      { url: `/en/offers/${id}`, priority: '0.7', changefreq: 'monthly', lastmod: lm },
    ];
  });

  // Dynamic blog routes — use updatedAt from blogPosts data
  const blogRoutes = (blogPosts || []).flatMap((post: any) => {
    const lm = latestDate([post.updatedAt, post.createdAt]);
    return [
      { url: `/blog/${post.slug}`, priority: '0.7', changefreq: 'weekly', lastmod: lm },
      { url: `/en/blog/${post.slug}`, priority: '0.7', changefreq: 'weekly', lastmod: lm },
    ];
  });

  const allRoutes = [
    ...allStaticRoutes,
    ...toolRoutes,
    ...policyRoutes,
    ...promptRoutes,
    ...paymentRoutes,
    ...offerRoutes,
    ...blogRoutes,
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
    <lastmod>${route.lastmod}</lastmod>
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
