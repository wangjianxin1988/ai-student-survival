import type { APIRoute } from 'astro';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// This endpoint must be rendered at runtime (not prerendered)
export const prerender = false;

const siteUrl = 'https://mi-to-ai.com';

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

  // Static routes (always included)
  const enRoutes = staticRoutes.map(r => ({
    url: `/en${r.url === '/' ? '' : r.url}`,
    priority: r.priority,
    changefreq: r.changefreq,
  }));

  // ============ Dynamic routes from Supabase ============
  let toolSlugs: string[] = [];
  let policySlugs: string[] = [];
  let paymentSlugs: string[] = [];
  let offerIds: string[] = [];
  let promptSlugs: string[] = [];

  if (isSupabaseConfigured) {
    // Fetch all dynamic slugs in parallel
    const [
      toolsResult,
      policiesResult,
      paymentsResult,
      offersResult,
      promptsResult,
    ] = await Promise.allSettled([
      supabase.from('tools').select('slug').eq('is_active', true),
      supabase.from('university_policies').select('university_slug'),
      supabase.from('payment_solutions').select('id'),
      supabase.from('offers').select('id'),
      supabase.from('prompt_templates').select('slug'),
    ]);

    if (toolsResult.status === 'fulfilled' && toolsResult.value.data) {
      toolSlugs = toolsResult.value.data.map(t => t.slug);
    }
    if (policiesResult.status === 'fulfilled' && policiesResult.value.data) {
      policySlugs = policiesResult.value.data.map(p => p.university_slug);
    }
    if (paymentsResult.status === 'fulfilled' && paymentsResult.value.data) {
      paymentSlugs = paymentsResult.value.data.map(p => String(p.id));
    }
    if (offersResult.status === 'fulfilled' && offersResult.value.data) {
      offerIds = offersResult.value.data.map(o => String(o.id));
    }
    if (promptsResult.status === 'fulfilled' && promptsResult.value.data) {
      promptSlugs = promptsResult.value.data.map(p => p.slug);
    }
  }

  // Build dynamic routes from fetched data
  const toolRoutes = toolSlugs.map(slug => ({ url: `/tools/${slug}`, priority: '0.8', changefreq: 'weekly' }));
  const enToolRoutes = toolSlugs.map(slug => ({ url: `/en/tools/${slug}`, priority: '0.8', changefreq: 'weekly' }));
  const paymentRoutes = paymentSlugs.map(id => ({ url: `/payment/${id}`, priority: '0.7', changefreq: 'monthly' }));
  const enPaymentRoutes = paymentSlugs.map(id => ({ url: `/en/payment/${id}`, priority: '0.7', changefreq: 'monthly' }));
  const policyRoutes = policySlugs.map(slug => ({ url: `/policies/${slug}`, priority: '0.7', changefreq: 'monthly' }));
  const enPolicyRoutes = policySlugs.map(slug => ({ url: `/en/policies/${slug}`, priority: '0.7', changefreq: 'monthly' }));
  const offerRoutes = offerIds.map(id => ({ url: `/offers/${id}`, priority: '0.7', changefreq: 'monthly' }));
  const enOfferRoutes = offerIds.map(id => ({ url: `/en/offers/${id}`, priority: '0.7', changefreq: 'monthly' }));
  const promptRoutes = promptSlugs.map(slug => ({ url: `/prompts/${slug}`, priority: '0.6', changefreq: 'weekly' }));
  const enPromptRoutes = promptSlugs.map(slug => ({ url: `/en/prompts/${slug}`, priority: '0.6', changefreq: 'weekly' }));

  const allRoutes = [
    ...staticRoutes,
    ...enRoutes,
    ...toolRoutes,
    ...enToolRoutes,
    ...paymentRoutes,
    ...enPaymentRoutes,
    ...policyRoutes,
    ...enPolicyRoutes,
    ...offerRoutes,
    ...enOfferRoutes,
    ...promptRoutes,
    ...enPromptRoutes,
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
