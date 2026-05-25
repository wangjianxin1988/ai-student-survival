import type { APIRoute } from 'astro';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  if (!isSupabaseConfigured) {
    return new Response(JSON.stringify({ error: 'not configured' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  return new Response(JSON.stringify({
    total: data?.users?.length || 0,
    error: error?.message || null,
    first5: data?.users?.slice(0, 5).map(u => ({
      id: u.id,
      email: u.email,
      identities: (u.identities || []).map(i => i.provider),
    })) || [],
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
