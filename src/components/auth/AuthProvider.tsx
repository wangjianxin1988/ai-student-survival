import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getCurrentUser,
  onAuthStateChange,
  demoAuthApi,
  type DemoUser,
} from "@/lib/auth";

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
  ) => Promise<{ success: boolean; error?: string; oauthProvider?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string; verificationRequired?: boolean; oauthProvider?: string }>;
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

function toUser(demoUser: DemoUser | null): User | null {
  if (!demoUser) return null;
  return {
    id: demoUser.id,
    email: demoUser.email,
    name: demoUser.name,
    avatar_url: demoUser.avatar,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => toUser(getCurrentUser()));
  const [loading, setLoading] = useState(true);

  // Subscribe to auth.ts's single onAuthStateChange — this is the ONE listener
  // that all components (LoginForm, RegisterForm, UserMenu) share.
  // auth.ts fires notifyAuthChange whenever currentUser changes (from any flow:
  // email/password, OAuth, magic link, signOut).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Subscribe to auth.ts's unified auth state
    const unsubscribe = onAuthStateChange((demoUser) => {
      setUser(toUser(demoUser));
    });

    // Safety timeout — don't leave loading=true forever
    const timeoutId = setTimeout(() => setLoading(false), 3000);

    // Fire once immediately (getCurrentUser already set initial state)
    setLoading(false);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
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
      // Delegate to demoAuthApi so auth.ts's onAuthStateChange fires
      const result = await demoAuthApi.signIn(email, password);
      if (result.success) {
        // Auth state update is handled by onAuthStateChange subscription above
        return { success: true };
      }
      return { success: false, error: result.error, oauthProvider: result.oauthProvider };
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      // Delegate to demoAuthApi so auth.ts's onAuthStateChange fires
      const result = await demoAuthApi.signUp(email, password, name);
      if (result.success) {
        return { success: true };
      }
      return {
        success: false,
        error: result.error,
        verificationRequired: result.verificationRequired,
        oauthProvider: result.oauthProvider,
      };
    },
    [],
  );

  const signOut = useCallback(async () => {
    // Use demoAuthApi.signOut — it clears localStorage and calls notifyAuthChange(null)
    // Our onAuthStateChange subscription above will catch this and update state
    await demoAuthApi.signOut();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Delegate to demoAuthApi
    const result = await demoAuthApi.signInWithOAuth('google');
    return { error: result.error };
  }, []);

  const signInWithGithub = useCallback(async () => {
    // Delegate to demoAuthApi
    const result = await demoAuthApi.signInWithOAuth('github');
    return { error: result.error };
  }, []);

  const signInWithMagicLink = useCallback(
    async (email: string) => {
      // Delegate to demoAuthApi
      const result = await demoAuthApi.signInWithMagicLink(email);
      return { success: result.success, error: result.error };
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