/**
 * Authentication module — unified wrapper around Supabase JS client.
 *
 * Single source of truth: supabase-js handles all session storage and token refresh.
 * No manual localStorage/sessionStorage manipulation for Supabase sessions.
 *
 * Demo session (sessionStorage) is kept as fallback only when Supabase is NOT configured.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '@supabase/supabase-js';

export type DemoUser = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  created_at: string;
  role?: 'admin' | 'member' | 'vip';
  isVerified?: boolean;
  isVerifiedOffer?: boolean;
};

export type UserRole = 'admin' | 'member' | 'vip';

export interface AuthResult {
  success: boolean;
  error?: string;
  verificationRequired?: boolean;
  message?: string;
  oauthProvider?: string;
}

export interface OAuthResult {
  error?: string;
}

export interface MagicLinkResult {
  success: boolean;
  error?: string;
}

// ─── OAuth account detection ────────────────────────────────────────────────────

/**
 * Check if an email has an OAuth-linked account (Google/GitHub) in Supabase.
 * Calls the /api/auth/check-user server-side endpoint which uses a
 * SECURITY DEFINER RPC function, keeping the service role key off the client.
 * Returns the provider name ('google' | 'github') if found, null otherwise.
 */
async function getOAuthProviderForEmail(email: string): Promise<string | null> {
  if (!isSupabaseConfigured || !email) return null;
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await fetch(`${origin}/api/auth/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase() }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.exists && json.provider) return json.provider as string;
    return null;
  } catch (_) {
    return null;
  }
}

const DEMO_SESSION_KEY = 'demo_session';

function getDemoUserFromSession(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionData = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (sessionData) return JSON.parse(sessionData);
  } catch (e) {
    console.error('[auth] Failed to parse demo session:', e);
  }
  return null;
}

export function saveDemoSession(user: DemoUser): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('[auth] Failed to save demo session:', e);
  }
}

export function clearDemoSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

// ─── Internal state ───────────────────────────────────────────────────────────

let currentUser: DemoUser | null = null;
let isInitialized = false;

type AuthChangeCallback = (user: DemoUser | null) => void;
const authChangeListeners = new Set<AuthChangeCallback>();

let demoStorageListenerSetUp = false;

/**
 * Synchronously read Supabase session from localStorage.
 * Used by getCurrentUser() for instant session detection (before async init).
 * Supports both current and legacy Supabase localStorage key formats.
 */
function readSupabaseSessionFromStorage(): DemoUser | null {
  if (typeof window === 'undefined') return null;

  // Find the Supabase auth token key (sb- prefix or supabase key)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    // Match: sb-{ref}-auth-token OR keys containing 'supabase' + 'auth'
    if (!key.startsWith('sb-')) continue;
    if (!key.includes('auth') && !key.includes('token')) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const accessToken = parsed?.tokens?.access_token || parsed?.access_token;
      if (!accessToken) continue;

      // Validate: must be a real Supabase RS256 JWT with sub claim
      const parts = accessToken.split('.');
      if (parts.length !== 3) continue;

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      if (header.alg !== 'RS256') continue; // Supabase always uses RS256

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.sub || typeof payload.sub !== 'string') continue;

      const userData = parsed?.user || parsed?.tokens?.user;
      if (userData) {
        return toDemoUser(userData as User);
      }
    } catch (_) {
      // Invalid entry — skip
    }
  }
  return null;
}

// ─── Supabase User → DemoUser conversion ──────────────────────────────────────

function toDemoUser(user: User | null): DemoUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.user_metadata?.full_name || '',
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    created_at: user.created_at,
    role: user.user_metadata?.role || 'member',
    isVerified: user.email_confirmed_at != null || user.confirmed_at != null,
    isVerifiedOffer: user.user_metadata?.is_verified_offer || false,
  };
}

/**
 * Get Supabase access token for API authentication.
 * Returns Bearer token to include in Authorization headers.
 * Must be called in async context.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch (_) {
    return null;
  }
}

// ─── Auth init (async — use onAuthStateChange for synchronous reactive updates) ─

/**
 * Initialize auth and fetch current session.
 * Reads from localStorage synchronously FIRST, then validates async with Supabase.
 * Components should use onAuthStateChange for reactive updates.
 */
export async function initAuth(): Promise<DemoUser | null> {
  if (typeof window === 'undefined') return null;

  // Already initialized — return cached (don't re-fetch)
  if (isInitialized) return currentUser;

  // FIRST: Try to read synchronously from localStorage (fast path for OAuth)
  const syncUser = getCurrentUser();
  if (syncUser) {
    currentUser = syncUser;
    isInitialized = true;
    notifyAuthChange(syncUser);
    return syncUser;
  }

  if (!isSupabaseConfigured) {
    currentUser = getDemoUserFromSession();
    isInitialized = true;
    notifyAuthChange(currentUser);
    return currentUser;
  }

  // Async validation via Supabase (validates token with server)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      currentUser = toDemoUser(session.user);
    } else {
      currentUser = getDemoUserFromSession();
    }
  } catch (error) {
    console.error('[auth] initAuth error:', error);
    currentUser = getDemoUserFromSession();
  }

  isInitialized = true;
  notifyAuthChange(currentUser);
  return currentUser;
}

// ─── Sync user getter ──────────────────────────────────────────────────────────

/**
 * Get current user synchronously — reads from localStorage for instant detection.
 * Use this for the FIRST render (before async initAuth completes).
 * After first render, use onAuthStateChange for reactive updates.
 */
export function getCurrentUser(): DemoUser | null {
  // Return cached if already loaded
  if (currentUser !== null) return currentUser;

  // Try to detect from Supabase localStorage synchronously (OAuth session)
  if (isSupabaseConfigured && typeof window !== 'undefined') {
    const supabaseUser = readSupabaseSessionFromStorage();
    if (supabaseUser) {
      currentUser = supabaseUser;
      return currentUser;
    }
  }

  // Fallback to demo session
  const demoUser = getDemoUserFromSession();
  if (demoUser) {
    currentUser = demoUser;
    return currentUser;
  }

  return null;
}

// ─── Auth state subscription ──────────────────────────────────────────────────

let supabaseListenerSetUp = false;

/**
 * Subscribe to auth state changes. Fires IMMEDIATELY with current user
 * (synchronously from localStorage for existing OAuth sessions).
 * This is the primary way components should get reactive auth updates.
 */
export function onAuthStateChange(callback: AuthChangeCallback): () => void {
  authChangeListeners.add(callback);

  // Fire IMMEDIATELY — read from localStorage synchronously first.
  // This ensures OAuth sessions are detected even before async initAuth completes.
  const immediateUser = getCurrentUser();
  if (immediateUser) {
    // We found user from localStorage but currentUser might not be set yet
    currentUser = immediateUser;
    callback(immediateUser);
  } else {
    // No cached user — fire with null if we already know the auth state
    callback(currentUser);
  }

  if (isSupabaseConfigured && typeof window !== 'undefined' && !supabaseListenerSetUp) {
    supabaseListenerSetUp = true;
    supabase.auth.onAuthStateChange((event, session) => {
      const user = toDemoUser(session?.user ?? null);
      currentUser = user;
      isInitialized = true;
      authChangeListeners.forEach(cb => cb(user));
    });
  }

  // Demo session cross-tab sync (only when Supabase not configured)
  if (typeof window !== 'undefined' && !demoStorageListenerSetUp && !isSupabaseConfigured) {
    demoStorageListenerSetUp = true;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DEMO_SESSION_KEY) {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        currentUser = newUser;
        authChangeListeners.forEach(cb => cb(newUser));
      }
    };
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    authChangeListeners.delete(callback);
  };
}

export function notifyAuthChange(user: DemoUser | null): void {
  authChangeListeners.forEach(cb => cb(user));
}

// ─── Auth API (delegates to supabase-js) ─────────────────────────────────────

export const demoAuthApi = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      const demoUser: DemoUser = {
        id: 'demo-' + Math.random().toString(36).substring(2, 15),
        email,
        name: email.split('@')[0],
        created_at: new Date().toISOString(),
        role: 'member',
      };
      saveDemoSession(demoUser);
      currentUser = demoUser;
      notifyAuthChange(demoUser);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          // Check if this email has an OAuth account
          const provider = await getOAuthProviderForEmail(email);
          if (provider === 'google') {
            return { success: false, error: '此账号使用 Google 登录，请点击上方"Google"按钮直接登录，无需密码', oauthProvider: 'google' };
          }
          if (provider === 'github') {
            return { success: false, error: '此账号使用 GitHub 登录，请点击上方"GitHub"按钮直接登录，无需密码', oauthProvider: 'github' };
          }
          return { success: false, error: '邮箱或密码错误，请检查后重试', oauthProvider: provider || undefined };
        }
        if (msg.includes('email not confirmed')) {
          return { success: false, error: '请先验证邮箱后再登录' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('[auth] signIn error:', err);
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return { success: false, error: '请求超时，请重试' };
      }
      return { success: false, error: err?.message || '发生未知错误' };
    }
  },

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      const demoUser: DemoUser = {
        id: 'demo-' + Math.random().toString(36).substring(2, 15),
        email,
        name,
        created_at: new Date().toISOString(),
        role: 'member',
      };
      saveDemoSession(demoUser);
      currentUser = demoUser;
      notifyAuthChange(demoUser);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
          return { success: false, error: '操作过于频繁，请稍后再试（90秒后重试）' };
        }
        // Email already registered — check if it's an OAuth account
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
          const provider = await getOAuthProviderForEmail(email);
          if (provider === 'google') {
            return { success: false, error: '此邮箱已通过 Google 注册，请直接使用 Google 登录', oauthProvider: 'google' };
          }
          if (provider === 'github') {
            return { success: false, error: '此邮箱已通过 GitHub 注册，请直接使用 GitHub 登录', oauthProvider: 'github' };
          }
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        if (data.session) {
          return { success: true };
        }
        return {
          success: false,
          error: '请前往邮箱查收验证邮件，完成账号激活后再登录。验证邮件可能位于垃圾邮件文件夹。',
          verificationRequired: true,
        };
      }

      return {
        success: false,
        error: '请前往邮箱查收验证邮件，完成账号激活后再登录。验证邮件可能位于垃圾邮件文件夹。',
        verificationRequired: true,
      };
    } catch (err: any) {
      console.error('[auth] signUp error:', err);
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return { success: false, error: '请求超时，请重试' };
      }
      return { success: false, error: err?.message || '发生未知错误' };
    }
  },

  async signOut(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Clear ALL Supabase auth-related localStorage keys before nulling currentUser.
      // readSupabaseSessionFromStorage() scans for sb-* keys, so we must remove all of them.
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('sb-') && (key.includes('auth') || key.includes('token'))) {
          localStorage.removeItem(key);
        }
      }
    }
    clearDemoSession();
    currentUser = null;
    notifyAuthChange(null);

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[auth] signOut error:', err);
      }
    }
  },

  async getUser(): Promise<DemoUser | null> {
    return currentUser;
  },

  isLoggedIn(): boolean {
    return currentUser !== null;
  },

  async signInWithOAuth(provider: 'google' | 'github', returnTo = '/user'): Promise<OAuthResult> {
    if (!isSupabaseConfigured) {
      return { error: 'Demo mode: OAuth not available' };
    }
    try {
      sessionStorage.setItem('oauth_return_to', returnTo);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return { error: error?.message };
    } catch (err) {
      console.error('[auth] OAuth signIn error:', err);
      return { error: '发生未知错误' };
    }
  },

  async signInWithMagicLink(email: string): Promise<MagicLinkResult> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Demo mode: Magic link not available' };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        if (error.message.toLowerCase().includes('user not found') ||
            error.message.toLowerCase().includes('invalid')) {
          return { success: false, error: '该邮箱尚未注册，请先注册账号' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error('[auth] MagicLink error:', err);
      return { success: false, error: '发生未知错误' };
    }
  },

  async verifyAndLogin(_email: string, _code: string): Promise<AuthResult> {
    return { success: true };
  },
};

export default demoAuthApi;
