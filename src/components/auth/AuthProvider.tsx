import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
          });
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      } catch (err) {
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
      } catch (err) {
        return { success: false, error: "发生未知错误" };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  }, []);

  const signInWithGithub = useCallback(async () => {
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
      try {
        // First check if user exists in our users table
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email.toLowerCase())
          .single();

        // If profile not found, user doesn't exist
        if (profileError || !profileData) {
          return { success: false, error: '该邮箱尚未注册，请先注册账号' };
        }

        // User exists, send magic link
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

export function useAuth() {
  const context = useContext(AuthContext);
  // Return a default context during SSR when AuthProvider hasn't hydrated yet
  if (context === undefined) {
    return {
      user: null,
      loading: true,
      signIn: async () => ({ success: false, error: "Auth not initialized" }),
      signUp: async () => ({ success: false, error: "Auth not initialized" }),
      signOut: async () => {},
      signInWithGoogle: async () => ({ error: "Auth not initialized" }),
      signInWithGithub: async () => ({ error: "Auth not initialized" }),
      signInWithMagicLink: async () => ({
        success: false,
        error: "Auth not initialized",
      }),
    };
  }
  return context;
}
