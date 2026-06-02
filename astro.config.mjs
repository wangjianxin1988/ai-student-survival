import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://mi-to-ai.com',
  output: 'hybrid',
  trailingSlash: 'ignore',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    routeConfig: {
      exclude: [
        "/_astro/*",
        "/images/*",
      ],
      include: [
        "/api/*",
      ],
    },
  }),
  image: {
    // Use Astro's default image optimization for Cloudflare
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['@supabase/supabase-js'],
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

});
