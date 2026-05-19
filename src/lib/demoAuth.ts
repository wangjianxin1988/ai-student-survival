/**
 * Demo Authentication System
 * Provides a fallback auth system for testing without Supabase configuration
 */

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  points?: number;
}

const DEMO_USERS_KEY = 'demo_users';
const DEMO_SESSION_KEY = 'demo_session';

// Generate a simple UUID
function generateId(): string {
  return 'demo-' + Math.random().toString(36).substring(2, 15);
}

// Get demo users from localStorage
function getDemoUsers(): Record<string, DemoUser & { password: string }> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(DEMO_USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Save demo users to localStorage
function saveDemoUsers(users: Record<string, DemoUser & { password: string }>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

// Get current session
export function getDemoSession(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(DEMO_SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Save session
function saveDemoSession(user: DemoUser): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

// Clear session
export function clearDemoSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

export const demoAuth = {
  // Sign in with email/password (demo mode)
  async signIn(email: string, password: string): Promise<{ user: DemoUser | null; error: string | null }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getDemoUsers();
    const user = Object.values(users).find(u => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...demoUser } = user;
      saveDemoSession(demoUser);
      return { user: demoUser, error: null };
    }

    return { user: null, error: '邮箱或密码错误' };
  },

  // Register new user (demo mode)
  async signUp(email: string, password: string, name: string): Promise<{ user: DemoUser | null; error: string | null }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getDemoUsers();
    const existing = Object.values(users).find(u => u.email === email);

    if (existing) {
      return { user: null, error: '该邮箱已被注册' };
    }

    const newUser: DemoUser & { password: string } = {
      id: generateId(),
      email,
      password,
      name: name || email.split('@')[0],
      created_at: new Date().toISOString(),
      points: 100, // 新用户初始100积分
    };

    users[newUser.id] = newUser;
    saveDemoUsers(users);

    const { password: _, ...demoUser } = newUser;
    saveDemoSession(demoUser);
    return { user: demoUser, error: null };
  },

  // Sign out
  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    clearDemoSession();
  },

  // Get current user
  async getUser(): Promise<DemoUser | null> {
    return getDemoSession();
  },

  // OAuth providers (demo mode - just redirects to demo login)
  async signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<{ error?: string }> {
    // In demo mode, OAuth would need real Supabase configuration
    // For demo purposes, we'll show a message
    alert(`${provider} 登录需要配置 Supabase。\n\n当前为演示模式，请使用邮箱注册登录。`);
    return { error: undefined };
  },

  // Magic link (demo mode)
  async signInWithMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In demo mode, just auto-sign-in for testing
    const users = getDemoUsers();
    const user = Object.values(users).find(u => u.email === email);

    if (user) {
      const { password: _, ...demoUser } = user;
      saveDemoSession(demoUser);
      return { success: true };
    }

    // Create a temporary user for demo
    const tempUser: DemoUser & { password: string } = {
      id: generateId(),
      email,
      password: '',
      name: email.split('@')[0],
      created_at: new Date().toISOString(),
    };
    users[tempUser.id] = tempUser;
    saveDemoUsers(users);

    const { password: _, ...demoUser } = tempUser;
    saveDemoSession(demoUser);
    return { success: true };
  },

  // Check if user is logged in (sync)
  isLoggedIn(): boolean {
    return getDemoSession() !== null;
  },

  // Get current user synchronously
  getCurrentUser(): DemoUser | null {
    return getDemoSession();
  }
};

export default demoAuth;