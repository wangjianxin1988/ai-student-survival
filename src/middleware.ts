import { defineMiddleware } from 'astro:middleware';
import { getLocaleFromUrl, type Locale } from '@/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const locale = getLocaleFromUrl(context.url);
  context.locals.locale = locale as Locale;

  // Set Cloudflare runtime for SSR pages
  // Required for Cloudflare Pages hybrid output mode
  (context.locals as any).runtime = 'cloudflare';

  return next();
});
