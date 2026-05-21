# Password Protection Setup

## Overview

The site uses password protection for demo access. Users must enter the correct password before they can view content or use OAuth login.

## Password Configuration

### Environment Variable

The password is controlled by the `ADMIN_PASSWORD` environment variable.

**Default password (development only):** `demo-access-2024`

### Production Setup (Cloudflare Pages)

To set a secure password for production:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** > **ai-student-survival** > **Settings** > **Environment Variables**
3. Add a new variable:
   - **Variable Name:** `ADMIN_PASSWORD`
   - **Value:** Your chosen password
4. Save and redeploy

### Local Development

For local development, create a `.env` file (copy from `.env.example`) and set:

```
ADMIN_PASSWORD=your-local-password
```

## How It Works

1. User visits the site
2. A password input is displayed
3. After entering the correct password, the user can:
   - Browse the site content
   - Login/register using OAuth (Google, GitHub, Apple)

## OAuth Login

OAuth login (Google, GitHub, Apple) still requires Supabase configuration. If Supabase is properly configured:
- OAuth buttons will redirect to the respective OAuth providers
- Users can create real accounts linked to their OAuth provider

## Security Notes

- Password verification status is stored in `sessionStorage` (cleared when browser closes)
- The password itself is never stored, only the verification status
- For production, use a strong, unique password
