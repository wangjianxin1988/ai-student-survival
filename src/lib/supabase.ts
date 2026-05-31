import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { MapMarker, MapMarkerCategory } from './types';

// Read from environment variables
// Cloudflare Pages runtime: wrangler.toml vars exposed as process.env.SUPABASE_URL / process.env.SUPABASE_ANON_KEY
// GitHub Actions build: env vars exposed as import.meta.env.PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY
export const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL as string | undefined)
  || (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined)
  || 'https://giynvpfnzzelzwpmsgtf.supabase.co';
export const supabaseAnonKey = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined)
  || (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined)
  || '';
// NOTE: Service role key is read LAZY at call time, not module load time.
// On Cloudflare Pages, process.env is populated by the adapter AFTER module init,
// so we must NOT evaluate it at module level.
let _cloudflareEnv: Record<string, any> | null = null;

/** Called by middleware to inject Cloudflare env bindings. */
export function setCloudflareEnv(env: Record<string, any>) {
  _cloudflareEnv = env;
}

/** Lazily resolve the service role key — tries multiple sources at call time. */
function getServiceRoleKey(): string {
  // Source 1: Cloudflare env bindings (set by middleware)
  if (_cloudflareEnv?.SUPABASE_SERVICE_ROLE_KEY) {
    return _cloudflareEnv.SUPABASE_SERVICE_ROLE_KEY;
  }
  // Source 2: import.meta.env (Vite/Astro loads .env at dev/build time)
  // In local dev, Vite reads .env and makes vars available here.
  // In CF Pages build, the build step injects env vars.
  try {
    const viteKey = (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY;
    if (viteKey && typeof viteKey === 'string' && viteKey.length > 10) return viteKey;
  } catch { /* ignore */ }
  // Source 3: process.env (populated at runtime by Cloudflare adapter)
  if (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  // Source 4: globalThis env bindings
  try {
    const cf = (globalThis as any).__env__;
    if (cf?.SUPABASE_SERVICE_ROLE_KEY) return cf.SUPABASE_SERVICE_ROLE_KEY;
  } catch { /* ignore */ }
  return '';
}

// Check if Supabase is properly configured
// FORCE_DEMO_AUTH env var: when true, bypasses Supabase even when configured (for demo/testing)
// Note: Only available during SSR/build; for runtime check, use isDemoMode()
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Runtime demo mode check: checks for a cookie or localStorage flag
// Set by: document.cookie = 'demo_auth=1' or localStorage.setItem('demo_auth', '1')
export function isDemoMode(): boolean {
  if (typeof document === 'undefined') return false;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') return true;
    if (localStorage.getItem('__demo_auth__') === '1') return true;
  } catch { /* ignore */ }
  return false;
}

// Lazy-loaded Supabase client to avoid WebSocket initialization during build
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!isSupabaseConfigured) {
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch: () => Promise.reject(new Error('Supabase not configured')) },
    });
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,     // ✅ Enable token auto-refresh
      persistSession: true,        // ✅ Enable session persistence (localStorage)
    },
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        // Supabase auth operations (especially signup) can take up to 15s
        const timeout = setTimeout(() => controller.abort(), 15000);
        return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
      },
    },
  });

  return _supabase;
}

// Proxy that lazily initializes the client
// This avoids importing/supabase-js during the build phase
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Admin client with service role key (bypasses RLS) - for server-side operations only
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdminClient(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  // Re-read service key lazily at call time (process.env may be available now)
  const serviceKey = getServiceRoleKey();

  if (!serviceKey || !supabaseUrl.includes('supabase.co')) {
    // Fallback to anon client if service key not configured
    // DO NOT cache — the key may become available later (e.g., after .env update)
    console.warn('SUPABASE_SERVICE_ROLE_KEY not configured, using anon client for admin operations');
    return getSupabaseClient();
  }

  _supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
      },
    },
  });

  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseAdminClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Get a Supabase admin client that reads the service role key from Cloudflare runtime env.
 * Use this in API routes when the default supabaseAdmin falls back to anon client.
 * Usage: const admin = getSupabaseAdminForRequest(Astro.locals);
 */
export function getSupabaseAdminForRequest(locals?: Record<string, any>): SupabaseClient {
  const cfKey = locals?.runtime?.env?.SUPABASE_SERVICE_ROLE_KEY;
  if (cfKey && typeof cfKey === 'string' && cfKey.length > 10) {
    return createClient(supabaseUrl, cfKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (url: any, options: any) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
        },
      },
    });
  }
  return supabaseAdmin;
}

// Database types (snake_case, matches Supabase schema)
export interface DbTool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: 'writing' | 'coding' | 'design' | 'research' | 'communication';
  subcategory: string | null;
  pricing: 'free' | 'freemium' | 'paid';
  price_detail: Record<string, any>;
  url: string;
  image_url: string | null;
  rating: number;
  rating_count: number;
  dimensions: Record<string, any>;
  tags: string[];
  features: string[];
  alternatives: string[];
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbPaymentSolution {
  id: string;
  title: string;
  category: 'virtual_card' | 'gift_card' | 'regional_pricing' | 'troubleshooting';
  content: string;
  excerpt: string | null;
  tool_ids: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  reliability: 'high' | 'medium' | 'low';
  tags: string[];
  rating: number;
  rating_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbUniversityPolicy {
  id: string;
  university_name: string;
  university_name_en: string | null;
  university_slug: string;
  country: string;
  country_en: string | null;
  region: string | null;
  city: string | null;
  flag_emoji: string | null;
  qs_rank: number | null;
  times_rank: number | null;
  usnews_rank: number | null;
  overall_policy: 'allowed' | 'restricted' | 'prohibited' | 'case_by_case' | null;
  overall_summary: string | null;
  teaching_policy: string | null;
  assignment_policy: string | null;
  group_project_policy: string | null;
  exam_policy: string | null;
  thesis_policy: string | null;
  research_policy: string | null;
  coding_policy: string | null;
  allowed_tools: string[];
  restricted_tools: string[];
  prohibited_tools: string[];
  citation_requirement: string | null;
  disclosure_requirement: string | null;
  penalty: string | null;
  data_privacy: string | null;
  source_url: string | null;
  source_url_backup: string | null;
  policy_document_title: string | null;
  last_updated: string | null;
  next_review_date: string | null;
  version: string | null;
  verified: boolean;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPromptTemplate {
  id: string;
  title: string;
  content: string;
  description: string | null;
  category: 'application' | 'thesis' | 'job' | 'daily' | 'research';
  tool_id: string | null;
  author_id: string | null;
  rating: number;
  rating_count: number;
  usage_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  update_source_url?: string;
  update_source_type?: 'github' | 'changelog' | 'blog' | 'none';
}

// Application types (camelCase, for frontend use)
export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'writing' | 'coding' | 'design' | 'research' | 'communication' | 'agent';
  subcategory: string;
  pricing: 'free' | 'freemium' | 'paid';
  priceDetail: { monthly?: number; yearly?: number; currency: string };
  url: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  dimensions: { easeOfUse: number; features: number; value: number };
  tags: string[];
  features: string[];
  alternatives: string[];
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  details?: {
    howToUse: Array<{ step: number; title: string; description: string }>;
    useCases: Array<{ title: string; description: string }>;
    tips: string[];
    updateNotes: string;
  };
  updateSourceUrl?: string;
  updateSourceType?: 'github' | 'changelog' | 'blog' | 'none';
  /** Affiliate link – if present, the "访问官网" button uses this URL (with tracking params). */
  affiliateUrl?: string;
}

export interface PaymentSolution {
  id: string;
  title: string;
  category: 'virtual_card' | 'gift_card' | 'regional_pricing' | 'troubleshooting';
  content: string;
  excerpt: string;
  toolIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  reliability: 'high' | 'medium' | 'low';
  tags: string[];
  rating: number;
  ratingCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  /** Referral / affiliate link for this payment platform. */
  referralUrl?: string;
}

export interface UniversityPolicy {
  id: string;
  universityName: string;
  universityNameEn: string;
  universitySlug: string;
  country: string;
  countryEn: string;
  region: string;
  city: string;
  flagEmoji: string;
  qsRank: number;
  timesRank: number;
  usnewsRank: number;
  overallPolicy: 'allowed' | 'restricted' | 'prohibited' | 'case_by_case';
  overallSummary: string;
  teachingPolicy: string;
  assignmentPolicy: string;
  groupProjectPolicy: string;
  examPolicy: string;
  thesisPolicy: string;
  researchPolicy: string;
  codingPolicy: string;
  allowedTools: string[];
  restrictedTools: string[];
  prohibitedTools: string[];
  citationRequirement: string;
  disclosureRequirement: string;
  penalty: string;
  dataPrivacy: string;
  sourceUrl: string;
  sourceUrlBackup: string;
  policyDocumentTitle: string;
  lastUpdated: string;
  nextReviewDate: string;
  version: string;
  verified: boolean;
  verifiedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  description: string;
  category: 'application' | 'thesis' | 'job' | 'daily' | 'research';
  toolId: string;
  authorId: string;
  rating: number;
  ratingCount: number;
  usageCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Transform database row to application type
export function transformTool(dbTool: DbTool): Tool {
  const priceDetail = dbTool.price_detail as Record<string, any>;
  const dimensions = dbTool.dimensions as Record<string, any>;
  return {
    id: dbTool.id,
    name: dbTool.name,
    slug: dbTool.slug,
    description: dbTool.description || '',
    category: dbTool.category,
    subcategory: dbTool.subcategory || '',
    pricing: dbTool.pricing,
    priceDetail: {
      currency: priceDetail?.currency || 'USD',
      monthly: priceDetail?.monthly,
      yearly: priceDetail?.yearly,
    },
    url: dbTool.url,
    imageUrl: dbTool.image_url || `https://placehold.co/400x200/6366f1/ffffff?text=${encodeURIComponent(dbTool.name)}`,
    rating: dbTool.rating || 0,
    ratingCount: dbTool.rating_count || 0,
    dimensions: {
      easeOfUse: dimensions?.easeOfUse ?? 0,
      features: dimensions?.features ?? 0,
      value: dimensions?.value ?? 0,
    },
    tags: dbTool.tags || [],
    features: dbTool.features || [],
    alternatives: dbTool.alternatives || [],
    isNew: dbTool.is_new || false,
    createdAt: dbTool.created_at,
    updatedAt: dbTool.updated_at,
  };
}

export function transformUniversityPolicy(db: DbUniversityPolicy): UniversityPolicy {
  return {
    id: db.id,
    universityName: db.university_name,
    universityNameEn: db.university_name_en || db.university_name,
    universitySlug: db.university_slug,
    country: db.country,
    countryEn: db.country_en || db.country,
    region: db.region || '',
    city: db.city || '',
    flagEmoji: db.flag_emoji || '🏛️',
    qsRank: db.qs_rank || 0,
    timesRank: db.times_rank || 0,
    usnewsRank: db.usnews_rank || 0,
    overallPolicy: db.overall_policy || 'case_by_case',
    overallSummary: db.overall_summary || '',
    teachingPolicy: db.teaching_policy || '',
    assignmentPolicy: db.assignment_policy || '',
    groupProjectPolicy: db.group_project_policy || '',
    examPolicy: db.exam_policy || '',
    thesisPolicy: db.thesis_policy || '',
    researchPolicy: db.research_policy || '',
    codingPolicy: db.coding_policy || '',
    allowedTools: db.allowed_tools || [],
    restrictedTools: db.restricted_tools || [],
    prohibitedTools: db.prohibited_tools || [],
    citationRequirement: db.citation_requirement || '',
    disclosureRequirement: db.disclosure_requirement || '',
    penalty: db.penalty || '',
    dataPrivacy: db.data_privacy || '',
    sourceUrl: db.source_url || '',
    sourceUrlBackup: db.source_url_backup || '',
    policyDocumentTitle: db.policy_document_title || '',
    lastUpdated: db.last_updated || '',
    nextReviewDate: db.next_review_date || '',
    version: db.version || '1.0',
    verified: db.verified || false,
    verifiedBy: db.verified_by || '',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// API helper functions
export interface DbCampusMarker {
  id: string;
  user_id: string | null;
  university_id: string;
  name: string;
  category: string;
  description: string | null;
  coordinates: { lat: number; lng: number };
  images: string[];
  tags: string[];
  rating: number;
  rating_count: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Transform database row to application type
export function transformCampusMarker(db: DbCampusMarker): MapMarker {
  return {
    id: db.id,
    universityId: db.university_id,
    universityName: '',
    name: db.name,
    nameZh: db.name,
    category: db.category as MapMarkerCategory,
    description: db.description || '',
    descriptionZh: db.description || '',
    coordinates: db.coordinates,
    images: db.images || [],
    rating: db.rating || 0,
    ratingCount: db.rating_count || 0,
    tags: db.tags || [],
    createdAt: db.created_at,
  };
}

export async function getCampusMarkers(params?: {
  universityId?: string;
  status?: string;
  category?: string;
  limit?: number;
}) {
  let query = supabase
    .from('campus_markers')
    .select('*')
    .eq('status', params?.status || 'approved');

  if (params?.universityId) {
    query = query.eq('university_id', params.universityId);
  }
  if (params?.category) {
    query = query.eq('category', params.category);
  }
  if (params?.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbCampusMarker[]).map(transformCampusMarker);
}

export async function createCampusMarker(marker: {
  universityId: string;
  name: string;
  category: string;
  description: string;
  coordinates: { lat: number; lng: number };
  images?: string[];
  tags?: string[];
}) {
  const { data, error } = await supabase
    .from('campus_markers')
    .insert({
      university_id: marker.universityId,
      name: marker.name,
      category: marker.category,
      description: marker.description,
      coordinates: marker.coordinates,
      images: marker.images || [],
      tags: marker.tags || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbCampusMarker;
}

export async function getMyCampusMarkers() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return [];

  const { data, error } = await supabase
    .from('campus_markers')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DbCampusMarker[];
}

export async function getTools(params?: {
  category?: string;
  pricing?: string;
  search?: string;
  limit?: number;
}) {
  let query = supabase.from('tools').select('*');

  if (params?.category) {
    query = query.eq('category', params.category);
  }
  if (params?.pricing) {
    query = query.eq('pricing', params.pricing);
  }
  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }
  if (params?.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query.order('rating', { ascending: false });

  if (error) throw error;
  return (data as DbTool[]).map(transformTool);
}

export async function getToolBySlug(slug: string) {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return transformTool(data as DbTool);
}

export async function getPaymentSolutions(params?: {
  category?: string;
  toolId?: string;
}) {
  let query = supabase.from('payment_solutions').select('*');

  if (params?.category) {
    query = query.eq('category', params.category);
  }
  if (params?.toolId) {
    query = query.contains('tool_ids', [params.toolId]);
  }

  const { data, error } = query.order('rating', { ascending: false });

  if (error) throw error;
  return data as DbPaymentSolution[];
}

export async function getUniversityPolicies(params?: {
  country?: string;
  search?: string;
  overallPolicy?: string;
  limit?: number;
}) {
  let query = supabase.from('university_policies').select('*');

  if (params?.country) {
    query = query.eq('country', params.country);
  }
  if (params?.overallPolicy) {
    query = query.eq('overall_policy', params.overallPolicy);
  }
  if (params?.search) {
    query = query.or(`university_name.ilike.%${params.search}%,university_name_en.ilike.%${params.search}%`);
  }
  if (params?.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query.order('qs_rank', { ascending: true });

  if (error) throw error;
  return (data as DbUniversityPolicy[]).map(transformUniversityPolicy);
}

export async function getPromptTemplates(params?: {
  category?: string;
  toolId?: string;
  search?: string;
}) {
  let query = supabase.from('prompt_templates').select('*');

  if (params?.category) {
    query = query.eq('category', params.category);
  }
  if (params?.toolId) {
    query = query.eq('tool_id', params.toolId);
  }
  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%`);
  }

  const { data, error } = await query.order('rating', { ascending: false });

  if (error) throw error;
  return data as DbPromptTemplate[];
}
