/**
 * Demo Authentication System - Password Protected Mode
 *
 * This module provides password protection for demo access.
 * After correct password verification, users can access the site.
 *
 * Supabase OAuth (Google/GitHub) is preserved for real user authentication.
 */

import { verifyPassword, isPasswordVerified, setPasswordVerified, clearPasswordVerified } from './passwordAuth';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  points?: number;
}

// Clear password verification (for logout from password gate)
export function clearPasswordGate(): void {
  clearPasswordVerified();
}

// Check if password gate is verified
export function isPasswordGateVerified(): boolean {
  return isPasswordVerified();
}

// Re-export password auth utilities
export { isPasswordVerified, setPasswordVerified, clearPasswordVerified, verifyPassword };

// Legacy exports for compatibility (no-op functions since we removed localStorage users)
export const demoAuth = {
  async signIn(): Promise<{ user: null; error: string }> {
    return { user: null, error: '本地用户系统已禁用，请使用密码访问或OAuth登录' };
  },

  async signUp(): Promise<{ user: null; error: string }> {
    return { user: null, error: '本地用户系统已禁用，请使用密码访问或OAuth登录' };
  },

  async signOut(): Promise<void> {
    // Just clear demo session if any
  },

  async getUser(): Promise<null> {
    return null;
  },

  async signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<{ error?: string }> {
    // This will be handled by the actual OAuth flow in AuthProvider
    alert(`${provider} 登录需要通过 Supabase OAuth 进行。请确保您已通过密码验证。`);
    return { error: '请先输入密码访问' };
  },

  async signInWithMagicLink(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: '本地用户系统已禁用' };
  },

  isLoggedIn(): boolean {
    return false;
  },

  getCurrentUser(): null {
    return null;
  }
};

export default demoAuth;
