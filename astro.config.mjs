import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://mi-to-ai.com',
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    routeConfig: {
      exclude: [
        "/_astro/*",
        "/images/*",
        "/api/*",
        "/auth/debug",
        "/auth/test-register",
      ],
    },
  }),
  image: {
    service: {},
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
  schema: {
    type: 'json',
    required: ['title', 'description'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
    },
  },
});
