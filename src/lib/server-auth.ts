/**
 * Server-side auth helper for Astro API routes
 * Reads Authorization: Bearer <token> from the incoming request
 * and validates it using supabase.auth.getUser(token).
 *
 * This works in Cloudflare Pages SSR environment where localStorage
 * is not available.
 */
import { supabase, isSupabaseConfigured } from './supabase';

export interface ServerUser {
  id: string;
  email: string;
  name?: string;
}

export async function getServerUser(request: Request): Promise<ServerUser | null> {
  // Check for demo mode: client sends demo user ID in special header
  const demoUserId = request.headers.get('X-Demo-User-Id');
  const demoEmail = request.headers.get('X-Demo-User-Email');
  const demoName = request.headers.get('X-Demo-User-Name');
  if (demoUserId) {
    return {
      id: demoUserId,
      email: demoEmail || 'demo@example.com',
      name: demoName || undefined,
    };
  }

  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    // Read Bearer token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const accessToken = authHeader.slice(7); // Remove 'Bearer ' prefix
    if (!accessToken) {
      return null;
    }

    // Validate the token using supabase.auth.getUser()
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      console.error('[server-auth] getUser error:', error.message, 'status:', error.status);
      return null;
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      name: (user.user_metadata as Record<string, unknown>)?.name as string | undefined,
    };
  } catch (err) {
    console.error('[server-auth] exception:', err);
    return null;
  }
}
