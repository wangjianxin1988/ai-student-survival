/**
 * Supabase Authentication Module
 *
 * This module provides authentication functionality using Supabase.
 * It replaces the previous demo/localStorage-based auth system.
 * Falls back to sessionStorage-based demo auth when Supabase is not configured OR
 * when Supabase is configured but user is not logged in.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '@supabase/supabase-js';

// Re-export User type as DemoUser for backwards compatibility
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
}

export interface OAuthResult {
  error?: string;
}

export interface MagicLinkResult {
  success: boolean;
  error?: string;
}

// Demo session storage key
const DEMO_SESSION_KEY = 'demo_session';

// Convert Supabase User to DemoUser format
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

// Read demo user from sessionStorage (for fallback when Supabase is not configured)
function getDemoUserFromSession(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionData = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
  } catch (e) {
    console.error('Failed to parse demo session:', e);
  }
  return null;
}

// Save demo user to sessionStorage
export function saveDemoSession(user: DemoUser): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save demo session:', e);
  }
}

// Clear demo session
export function clearDemoSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

// Current user cache (synchronous access)
let currentUser: DemoUser | null = null;
let isInitialized = false;

// Auth state change listeners
type AuthChangeCallback = (user: DemoUser | null) => void;
const authChangeListeners: Set<AuthChangeCallback> = new Set();

// Track if demo storage listener is set up
let demoStorageListenerSetUp = false;

/**
 * Initialize the auth module - fetches current session
 * Should be called on app startup
 */
export async function initAuth(): Promise<DemoUser | null> {
  if (typeof window === 'undefined') return null;

  if (isInitialized) {
    return currentUser;
  }

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        currentUser = toDemoUser(session.user);
        isInitialized = true;
        return currentUser;
      }
      // No Supabase session - fall through to demo session check
    } catch (error) {
      console.error('Error initializing Supabase auth:', error);
      // Fall through to demo auth on error
    }
  }

  // Fallback to demo session (either Supabase not configured or no Supabase user)
  currentUser = getDemoUserFromSession();
  isInitialized = true;
  return currentUser;
}

/**
 * Get the current user from cache (synchronous)
 * For async initialization, call initAuth() first
 * Falls back to demo session if Supabase is not configured OR
 * if Supabase is configured but no user is logged in
 */
export function getCurrentUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;

  // If we have a cached user, return it
  if (currentUser !== null) {
    return currentUser;
  }

  // Always try demo session as fallback
  // This handles both:
  // 1. Supabase not configured
  // 2. Supabase configured but no Supabase user logged in
  currentUser = getDemoUserFromSession();
  return currentUser;
}

/**
 * Subscribe to auth state changes
 * Returns unsubscribe function
 */
export function onAuthStateChange(callback: AuthChangeCallback): () => void {
  authChangeListeners.add(callback);

  // Immediately notify of current state if we have a cached user
  if (currentUser) {
    callback(currentUser);
  }

  if (isSupabaseConfigured && typeof window !== 'undefined') {
    // Initialize auth if not yet done
    if (!isInitialized) {
      initAuth().then(user => {
        callback(user);
      });
    }

    supabase.auth.onAuthStateChange((event, session) => {
      const user = toDemoUser(session?.user ?? null);
      currentUser = user;
      authChangeListeners.forEach(cb => cb(user));
    });
  }

  // Always set up demo session storage listener for cross-tab sync
  // This handles the case where Supabase is configured but no Supabase user
  // is logged in (i.e., demo mode on a Supabase-enabled site)
  if (typeof window !== 'undefined' && !demoStorageListenerSetUp) {
    demoStorageListenerSetUp = true;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEMO_SESSION_KEY) {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        currentUser = newUser;
        authChangeListeners.forEach(cb => cb(newUser));
      }
    };
    window.addEventListener('storage', handleStorageChange);
  }

  return () => {
    authChangeListeners.delete(callback);
  };
}

/**
 * Notify all listeners of auth change
 */
export function notifyAuthChange(user: DemoUser | null): void {
  currentUser = user;
  authChangeListeners.forEach(cb => cb(user));
}

// Supabase Auth API wrapper
export const demoAuthApi = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      // Demo mode: create/update demo session
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const user = toDemoUser(data.user);
      currentUser = user;
      notifyAuthChange(user);

      return { success: true };
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return { success: false, error: '请求超时，请重试' };
      }
      return { success: false, error: err?.message || '发生未知错误' };
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      // Demo mode: create demo session
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
        options: {
          data: { name },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const user = toDemoUser(data.user);
        currentUser = user;
        notifyAuthChange(user);
        return { success: true };
      }

      return { success: false, error: '注册未完成' };
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return { success: false, error: '请求超时，请重试' };
      }
      return { success: false, error: err?.message || '发生未知错误' };
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
        currentUser = null;
        notifyAuthChange(null);
      } catch (err) {
        console.error('Sign out error:', err);
      }
    } else {
      // Demo mode: clear session
      clearDemoSession();
      currentUser = null;
      notifyAuthChange(null);
    }
  },

  /**
   * Get current user (synchronous, returns cached value)
   */
  async getUser(): Promise<DemoUser | null> {
    return getCurrentUser();
  },

  /**
   * Check if logged in
   */
  isLoggedIn(): boolean {
    return getCurrentUser() !== null;
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'github'): Promise<OAuthResult> {
    if (!isSupabaseConfigured) {
      return { error: 'Demo mode: OAuth not available' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error: error?.message };
    } catch (err) {
      console.error('OAuth sign in error:', err);
      return { error: '发生未知错误' };
    }
  },

  /**
   * Sign in with magic link (email OTP)
   * Only sends magic link if the email is already registered
   */
  async signInWithMagicLink(email: string): Promise<MagicLinkResult> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Demo mode: Magic link not available' };
    }

    try {
      // First check if user exists by attempting to get user profile
      // This will fail for non-existent users
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      // If profile not found, user doesn't exist
      if (profileError || !profileData) {
        return { success: false, error: '该邮箱尚未注册，请先注册账号' };
      }

      // User exists, now send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Handle specific error cases
        if (error.message.toLowerCase().includes('user not found') ||
            error.message.toLowerCase().includes('invalid')) {
          return { success: false, error: '该邮箱尚未注册，请先注册账号' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Magic link error:', err);
      return { success: false, error: '发生未知错误' };
    }
  },

  /**
   * Verify and complete login (for OAuth or magic link)
   */
  async verifyAndLogin(email: string, code: string): Promise<AuthResult> {
    // With Supabase, verification is handled automatically
    // This is a no-op for backwards compatibility
    return { success: true };
  },
};

export default demoAuthApi;