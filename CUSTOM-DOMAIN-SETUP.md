# Cloudflare Custom Domain Setup - Manual Steps

## What's Already Done ✅
- Site deployed: https://bd97200c.ai-student-survival.pages.dev
- Database seeded: 41 rows (20 tools, 9 policies, 6 payments, 6 prompts)
- SEO schemas: FAQPage, BreadcrumbList, WebSite, Organization
- Sitemap & robots.txt configured
- GitHub Actions CI/CD working

## What Needs Manual Setup (requires your Cloudflare login)

### Step 1: Add DNS Records
1. Go to https://dash.cloudflare.com → Login
2. Select domain: mi-to-ai.com
3. Go to DNS → Records → Add Record:
   - Type: CNAME | Name: www | Target: ai-student-survival.pages.dev | Proxy: DNS only (grey cloud)
4. For root domain (mi-to-ai.com), add:
   - Type: A | Name: @ | Target: 76.76.21.21 | Proxy: DNS only

### Step 2: Bind Custom Domain on Cloudflare Pages
1. Go to https://dash.cloudflare.com → Pages → ai-student-survival
2. Go to Settings → Custom Domains → Add custom domain
3. Enter: www.mi-to-ai.com (will auto-detect DNS)
4. Also add: mi-to-ai.com

### Step 3: Create API Token (optional, for future automation)
1. https://dash.cloudflare.com/profile/api-tokens
2. Create Token → Custom token → Start with template
3. Permissions needed:
   - Zone: DNS: Edit
   - Account: Cloudflare Pages: Edit
   - Account: Account Settings: Read
4. Account resources: Include specific account "wangjianjian1988's Account"

## Credentials on File
- Supabase service_role_key: saved at .service_role_key.txt
- Zone ID: 94944d650e42e4b39eca661851016eae
- Account ID: d6d81a527b2e9b2620245bfa56711398
- Project ref: giynvpfnzzelzwpmsgtf
