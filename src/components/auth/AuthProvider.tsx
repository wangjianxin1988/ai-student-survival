import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { demoAuth, type DemoUser } from '@/lib/demoAuth';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithGithub: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured;

  useEffect(() => {
    async function initAuth() {
      if (isDemoMode) {
        // Check for demo user in sessionStorage (browser only)
        if (typeof window !== 'undefined') {
          const demoUser = demoAuth.getCurrentUser();
          if (demoUser) {
            setUser({
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
            });
          }
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      const { user: demoUser, error } = await demoAuth.signIn(email, password);
      if (demoUser) {
        setUser({
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
        });
        setLoading(false);
        return { success: true };
      }
      return { success: false, error: error || '登录失败' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: '发生未知错误' };
    }
  }, [isDemoMode]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (isDemoMode) {
      const { user: demoUser, error } = await demoAuth.signUp(email, password, name);
      if (demoUser) {
        setUser({
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
        });
        setLoading(false);
        return { success: true };
      }
      return { success: false, error: error || '注册失败' };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: '发生未知错误' };
    }
  }, [isDemoMode]);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      await demoAuth.signOut();
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  }, [isDemoMode]);

  const signInWithGoogle = useCallback(async () => {
    if (isDemoMode) {
      return await demoAuth.signInWithOAuth('google');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  }, [isDemoMode]);

  const signInWithGithub = useCallback(async () => {
    if (isDemoMode) {
      return await demoAuth.signInWithOAuth('github');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  }, [isDemoMode]);

  const signInWithApple = useCallback(async () => {
    if (isDemoMode) {
      return await demoAuth.signInWithOAuth('apple');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  }, [isDemoMode]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (isDemoMode) {
      const { error } = await demoAuth.signInWithMagicLink(email);
      if (!error) {
        const demoUser = demoAuth.getCurrentUser();
        if (demoUser) {
          setUser({
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
          });
          setLoading(false);
          return { success: true };
        }
      }
      return { success: false, error: error || '发送失败' };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: '发生未知错误' };
    }
  }, [isDemoMode]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithGithub,
        signInWithApple,
        signInWithMagicLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Return a default context during SSR when AuthProvider hasn't hydrated yet
  if (context === undefined) {
    return {
      user: null,
      loading: true,
      isDemoMode: true,
      signIn: async () => ({ success: false, error: 'Auth not initialized' }),
      signUp: async () => ({ success: false, error: 'Auth not initialized' }),
      signOut: async () => {},
      signInWithGoogle: async () => ({ error: 'Auth not initialized' }),
      signInWithGithub: async () => ({ error: 'Auth not initialized' }),
      signInWithApple: async () => ({ error: 'Auth not initialized' }),
      signInWithMagicLink: async () => ({ success: false, error: 'Auth not initialized' }),
    };
  }
  return context;
}