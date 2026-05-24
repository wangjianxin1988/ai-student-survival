import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

// Demo session key - must match the key used in auth.ts
const DEMO_SESSION_KEY = 'demo_session';

// Read demo user from sessionStorage
function getDemoUserFromSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionData = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (sessionData) {
      const demoUser = JSON.parse(sessionData);
      // Convert DemoUser to User format
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

// Set demo user to sessionStorage (called from auth.ts demo login)
function setDemoUserToSession(demoUser: User) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
  } catch (e) {
    console.error('[AuthProvider] Failed to save demo session:', e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      console.log('[AuthProvider] Initializing auth...');
      console.log('[AuthProvider] isSupabaseConfigured:', isSupabaseConfigured);

      // Set a timeout to prevent infinite loading - after 5s, proceed anyway
      const timeoutId = setTimeout(() => {
        console.warn('[AuthProvider] Init timeout, proceeding anyway');
        setLoading(false);
      }, 5000);

      try {
        // First check demo session (for fallback/demo mode)
        const demoUser = getDemoUserFromSession();
        if (demoUser) {
          console.log('[AuthProvider] Demo session found:', demoUser.email);
          setUser(demoUser);
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        console.log('[AuthProvider] No demo session, checking Supabase...');

        // Then check Supabase if configured
        if (isSupabaseConfigured) {
          console.log('[AuthProvider] Supabase configured, getting session...');
          const {
            data: { session },
          } = await supabase.auth.getSession();

          console.log('[AuthProvider] Supabase session:', session ? 'found' : 'none');

          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
            });
            console.log('[AuthProvider] Set user from Supabase session');
          }
        } else {
          console.log('[AuthProvider] Supabase not configured, using demo mode');
        }
      } catch (err) {
        console.error("[AuthProvider] Init error:", err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  useEffect(() => {
    // Always set up storage event listener for demo session cross-tab sync
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === DEMO_SESSION_KEY) {
          console.log('[AuthProvider] Storage event:', e.newValue ? 'set' : 'removed');
          if (e.newValue) {
            try {
              const demoUser = JSON.parse(e.newValue);
              setUser({
                id: demoUser.id,
                email: demoUser.email || '',
                name: demoUser.name,
                avatar_url: demoUser.avatar,
              });
            } catch (err) {
              console.error('[AuthProvider] Failed to parse storage event:', err);
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);

      // Also poll for demo session changes (storage event doesn't fire in same tab)
      const pollInterval = setInterval(() => {
        const demoUser = getDemoUserFromSession();
        setUser(prevUser => {
          if (demoUser) {
            if (!prevUser || prevUser.id !== demoUser.id) {
              console.log('[AuthProvider] Polling detected demo user change');
              return {
                id: demoUser.id,
                email: demoUser.email || '',
                name: demoUser.name,
                avatar_url: demoUser.avatar,
              };
            }
          } else if (prevUser) {
            // Check if there's still a sessionStorage entry
            const currentDemo = sessionStorage.getItem(DEMO_SESSION_KEY);
            if (!currentDemo) {
              console.log('[AuthProvider] Polling detected logout');
              return null;
            }
          }
          return prevUser;
        });
      }, 500);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(pollInterval);
      };
    }
  }, []);

  // Also set up Supabase auth listener if configured
  useEffect(() => {
    if (isSupabaseConfigured && typeof window !== 'undefined') {
      console.log('[AuthProvider] Setting up Supabase auth listener');
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AuthProvider] Supabase auth event:', event);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });
        } else {
          // Check if there's a demo session before setting to null
          const demoUser = getDemoUserFromSession();
          if (demoUser) {
            setUser(demoUser);
          } else {
            setUser(null);
          }
        }
      });

      return () => subscription.unsubscribe();
    }
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
    // Clear demo session if it exists
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