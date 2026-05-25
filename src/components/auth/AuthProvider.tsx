import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithGithub: () => Promise<{ error?: string }>;
  signInWithMagicLink: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo session key — mirrors auth.ts
const DEMO_SESSION_KEY = 'demo_session';

function getDemoUserFromSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionData = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (sessionData) {
      const demoUser = JSON.parse(sessionData);
      return {
        id: demoUser.id,
        email: demoUser.email || '',
        name: demoUser.name,
        avatar_url: demoUser.avatar,
      };
    }
  } catch (e) {
    console.error('[AuthProvider] Failed to parse demo session:', e);
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Init auth and subscribe to changes — supabase-js is the single source of truth
  useEffect(() => {
    async function initAuth() {
      // 5s safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => setLoading(false), 5000);

      if (!isSupabaseConfigured) {
        // Already set from useState init, just confirm
        clearTimeout(timeoutId);
        setLoading(false);
      } else {
        // Initial state already set from getCurrentUser() in useState init.
        // For Supabase, async validation is informational only (updates user metadata).
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // Single auth listener — supabase-js owns session management
  useEffect(() => {
    if (!isSupabaseConfigured || typeof window === 'undefined') return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
      } else {
        // No Supabase session — check demo fallback
        const demoUser = getDemoUserFromSession();
        setUser(demoUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Demo session cross-tab sync (only when Supabase not configured)
  useEffect(() => {
    if (isSupabaseConfigured || typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DEMO_SESSION_KEY) {
        if (e.newValue) {
          const demoUser = JSON.parse(e.newValue);
          setUser({ id: demoUser.id, email: demoUser.email || '', name: demoUser.name, avatar_url: demoUser.avatar });
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch {
        return { success: false, error: "发生未知错误" };
      }
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
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
      } catch {
        return { success: false, error: "发生未知错误" };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { error: "Demo mode: OAuth not available" };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  }, []);

  const signInWithGithub = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { error: "Demo mode: OAuth not available" };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  }, []);

  const signInWithMagicLink = useCallback(
    async (email: string) => {
      if (!isSupabaseConfigured) {
        return { success: false, error: "Demo mode: Magic link not available" };
      }
      try {
        // Supabase sends magic link regardless of whether the email exists
        // (for security - don't reveal whether an account exists)
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch {
        return { success: false, error: "发生未知错误" };
      }
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithGithub,
        signInWithMagicLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Safe default values for SSR and fallback scenarios
const safeDefault: AuthContextType = {
  user: null,
  loading: true,
  signIn: async () => ({ success: false, error: "Auth not initialized" }),
  signUp: async () => ({ success: false, error: "Auth not initialized" }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: "Auth not initialized" }),
  signInWithGithub: async () => ({ error: "Auth not initialized" }),
  signInWithMagicLink: async () => ({ success: false, error: "Auth not initialized" }),
};

export function useAuth() {
  const context = useContext(AuthContext);
  // Return safe default during SSR instead of throwing
  // This prevents SSR hydration errors while maintaining type safety
  if (context === undefined) {
    return safeDefault;
  }
  return context;
}