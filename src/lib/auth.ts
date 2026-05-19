/**
 * Direct Auth Module - Bypasses React Context for use in Astro islands
 * This provides a direct interface to demo auth that doesn't rely on React Context hydration
 *
 * SECURITY WARNING - DEMO MODE ONLY
 * ==================================
 * This module is designed exclusively for DEMO/DEVELOPMENT environments.
 *
 * DEMO MODE CHARACTERISTICS (these are INTENTIONAL security tradeoffs for demos):
 * - Passwords are stored in localStorage (plaintext) for demo convenience
 * - No real authentication backend is used
 * - Session management is simplified for demo purposes
 *
 * PRODUCTION REQUIREMENTS:
 * - NEVER use this module in production with real user data
 * - Production must use proper authentication (OAuth, JWT, etc.)
 * - Passwords must be hashed with bcrypt/argon2 and stored securely
 * - Sessions must be managed server-side with httpOnly cookies
 *
 * This module should only be used when DEMO_MODE environment variable is set.
 */

// Types
export type UserRole = 'admin' | 'member' | 'vip';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  created_at: string;
  role?: UserRole; // 'admin' | 'member' | 'vip'
  isVerified?: boolean; // Email verification status
  isVerifiedOffer?: boolean; // Verified offer poster
}

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

// Storage keys
const DEMO_USERS_KEY = 'demo_users';
const DEMO_SESSION_KEY = 'demo_session'; // Using localStorage for persistence
const DEMO_COOKIE_KEY = 'demo_auth';

// Generate UUID
function generateId(): string {
  return 'demo-' + Math.random().toString(36).substring(2, 15);
}

// Get demo users from localStorage
function getDemoUsers(): Record<string, DemoUser & { password: string }> {
  if (typeof window === 'undefined') return {} as Record<string, DemoUser & { password: string }>;
  const stored = localStorage.getItem(DEMO_USERS_KEY);
  return stored ? JSON.parse(stored) : {} as Record<string, DemoUser & { password: string }>;
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

// Cookie-based session for SSR pages
export function setDemoAuthCookie(user: DemoUser): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  document.cookie = `${DEMO_COOKIE_KEY}=${JSON.stringify(user)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function clearDemoAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${DEMO_COOKIE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function getDemoAuthCookie(): DemoUser | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === DEMO_COOKIE_KEY) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Event listeners for auth state changes
type AuthChangeCallback = (user: DemoUser | null) => void;
const authChangeListeners: Set<AuthChangeCallback> = new Set();

export function onAuthStateChange(callback: AuthChangeCallback): () => void {
  authChangeListeners.add(callback);
  // Immediately notify of current state
  if (currentUser) {
    callback(currentUser);
  }
  return () => authChangeListeners.delete(callback);
}

function notifyAuthChange(user: DemoUser | null): void {
  authChangeListeners.forEach(cb => cb(user));
}

// Export for use in other components
export { notifyAuthChange };

// Device fingerprint and verification
const DEVICE_LIST_KEY = 'demo_user_devices';
const VERIFICATION_CODE_KEY = 'demo_verification_codes';
const VERIFICATION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  os: string;
  screen: string;
  timezone: string;
  firstSeen: number;
  lastSeen: number;
  isVerified: boolean;
}

export interface VerificationCode {
  code: string;
  email: string;
  expiresAt: number;
  deviceFingerprint: string;
}

/**
 * Generate device fingerprint
 */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
  ];

  let hash = 0;
  const combined = components.join('|');
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + '-' + navigator.userAgent.substring(0, 20).replace(/\s/g, '_');
}

/**
 * Get detailed device info
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      fingerprint: 'server',
      browser: 'unknown',
      os: 'unknown',
      screen: 'unknown',
      timezone: 'unknown',
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      isVerified: false,
    };
  }

  const ua = navigator.userAgent;
  let browser = 'unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return {
    fingerprint: getDeviceFingerprint(),
    browser,
    os,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    isVerified: false,
  };
}

/**
 * Get stored device list for a user
 */
function getUserDevices(): Record<string, Record<string, DeviceInfo>> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(DEVICE_LIST_KEY);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Save device list for a user
 */
function saveUserDevices(devices: Record<string, Record<string, DeviceInfo>>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICE_LIST_KEY, JSON.stringify(devices));
}

/**
 * Check if device is known and verified for a user
 */
export function checkDeviceStatus(userId: string): { isKnown: boolean; isVerified: boolean } {
  const devices = getUserDevices();
  const userDevices = devices[userId] || {};
  const currentFingerprint = getDeviceFingerprint();
  const device = userDevices[currentFingerprint];

  if (!device) {
    return { isKnown: false, isVerified: false };
  }

  return { isKnown: true, isVerified: device.isVerified };
}

/**
 * Register a new device for a user
 */
export function registerDevice(userId: string, verified: boolean = false): void {
  const devices = getUserDevices();
  const currentFingerprint = getDeviceFingerprint();
  const deviceInfo = getDeviceInfo();

  if (!devices[userId]) {
    devices[userId] = {};
  }

  const existing = devices[userId][currentFingerprint];
  devices[userId][currentFingerprint] = {
    ...deviceInfo,
    firstSeen: existing?.firstSeen || Date.now(),
    lastSeen: Date.now(),
    isVerified: verified || existing?.isVerified || false,
  };

  saveUserDevices(devices);
}

/**
 * Mark device as verified
 */
export function verifyDevice(userId: string): void {
  const devices = getUserDevices();
  const currentFingerprint = getDeviceFingerprint();

  if (devices[userId] && devices[userId][currentFingerprint]) {
    devices[userId][currentFingerprint].isVerified = true;
    devices[userId][currentFingerprint].lastSeen = Date.now();
    saveUserDevices(devices);
  }
}

/**
 * Generate verification code
 */
export function generateVerificationCode(email: string): string {
  if (typeof window === 'undefined') return '';

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const verification: VerificationCode = {
    code,
    email,
    expiresAt: Date.now() + VERIFICATION_EXPIRY_MS,
    deviceFingerprint: getDeviceFingerprint(),
  };

  const codes = getVerificationCodes();
  codes[email] = verification;
  saveVerificationCodes(codes);

  return code;
}

/**
 * Get verification codes storage
 */
function getVerificationCodes(): Record<string, VerificationCode> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(VERIFICATION_CODE_KEY);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Save verification codes
 */
function saveVerificationCodes(codes: Record<string, VerificationCode>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERIFICATION_CODE_KEY, JSON.stringify(codes));
}

/**
 * Verify a code
 */
export function verifyCode(email: string, code: string): { success: boolean; error?: string } {
  const codes = getVerificationCodes();
  const stored = codes[email];

  if (!stored) {
    return { success: false, error: '验证码已过期，请重新获取' };
  }

  if (Date.now() > stored.expiresAt) {
    delete codes[email];
    saveVerificationCodes(codes);
    return { success: false, error: '验证码已过期，请重新获取' };
  }

  if (stored.code !== code) {
    return { success: false, error: '验证码错误' };
  }

  // Clean up used code
  delete codes[email];
  saveVerificationCodes(codes);

  return { success: true };
}

// Current user cache (synced with sessionStorage on init)
let currentUser: DemoUser | null = null;

export function getCurrentUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  if (!currentUser) {
    currentUser = getDemoSession();
  }
  return currentUser;
}

// Initialize current user from session
export function initAuth(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  currentUser = getDemoSession();
  return currentUser;
}

// Demo Auth API - Direct callable functions
export const demoAuthApi = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`[登录] 尝试登录: ${email}`);
    console.log(`[登录] localStorage中的账号数量: ${Object.keys(getDemoUsers()).length}`);
    console.log(`[登录] localStorage中的所有账号:`, Object.values(getDemoUsers()).map(u => u.email));

    const users = getDemoUsers();
    const user = Object.values(users).find(u => u.email === email && u.password === password);

    if (user) {
      console.log(`[登录] 找到账号: ${email}`);
      // Check device status - require verification on new devices
      const deviceStatus = checkDeviceStatus(user.id);

      if (!deviceStatus.isKnown) {
        // New device - generate verification code
        const code = generateVerificationCode(email);
        console.log(`[演示模式] 您的验证码是: ${code}`); // 演示用

        return {
          success: false,
          error: 'VERIFICATION_REQUIRED',
          verificationRequired: true,
          message: `新设备登录验证：您的验证码是 ${code}（演示模式下显示在控制台）`,
        };
      }

      const { password: _, ...demoUser } = user;
      saveDemoSession(demoUser);
      setDemoAuthCookie(demoUser);
      currentUser = demoUser;
      notifyAuthChange(demoUser);
      console.log(`[登录] 登录成功: ${email}`);
      return { success: true };
    }

    console.log(`[登录] 未找到账号或密码错误: ${email}`);
    console.log(`[登录] localStorage内容:`, users);
    return { success: false, error: '邮箱或密码错误' };
  },

  async verifyAndLogin(email: string, code: string): Promise<AuthResult> {
    const result = verifyCode(email, code);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Find user and complete login
    const users = getDemoUsers();
    const user = Object.values(users).find(u => u.email === email);

    if (user) {
      const { password: _, ...demoUser } = user;
      saveDemoSession(demoUser);
      setDemoAuthCookie(demoUser);
      currentUser = demoUser;
      notifyAuthChange(demoUser);

      // Mark device as verified
      registerDevice(user.id, true);

      return { success: true };
    }

    return { success: false, error: '用户不存在' };
  },

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`[注册] 尝试注册账号: ${email}`);

    const users = getDemoUsers();
    const existing = Object.values(users).find(u => u.email === email);

    if (existing) {
      console.log(`[注册] 账号已存在: ${email}`);
      return { success: false, error: '该邮箱已被注册' };
    }

    const newUser: DemoUser & { password: string } = {
      id: generateId(),
      email,
      password,
      name: name || email.split('@')[0],
      created_at: new Date().toISOString(),
    };

    users[newUser.id] = newUser;
    saveDemoUsers(users);
    console.log(`[注册] 账号已保存到localStorage: ${email}, 共 ${Object.keys(users).length} 个账号`);

    const { password: _, ...demoUser } = newUser;
    saveDemoSession(demoUser);
    setDemoAuthCookie(demoUser);
    currentUser = demoUser;
    notifyAuthChange(demoUser);

    // Register device as verified for new users
    registerDevice(newUser.id, true);

    console.log(`[注册] 注册并登录成功: ${email}`);
    return { success: true };
  },

  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    clearDemoSession();
    clearDemoAuthCookie();
    currentUser = null;
    notifyAuthChange(null);
  },

  async getUser(): Promise<DemoUser | null> {
    return getCurrentUser();
  },

  isLoggedIn(): boolean {
    return getDemoSession() !== null;
  },

  async signInWithOAuth(provider: 'google' | 'github' | 'apple' | 'wechat' | 'qq' | 'weibo' | 'discord' | 'twitter'): Promise<OAuthResult> {
    // In demo mode, OAuth would need real Supabase configuration
    alert(`${provider} 登录需要配置 Supabase。\n\n当前为演示模式，请使用邮箱注册登录。`);
    return { error: undefined };
  },

  async signInWithMagicLink(email: string): Promise<MagicLinkResult> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In demo mode, just auto-sign-in for testing
    const users = getDemoUsers();
    const user = Object.values(users).find(u => u.email === email);

    if (user) {
      const { password: _, ...demoUser } = user;
      saveDemoSession(demoUser);
      currentUser = demoUser;
      notifyAuthChange(demoUser);
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
    currentUser = demoUser;
    notifyAuthChange(demoUser);
    return { success: true };
  },
};

// Export singleton
export default demoAuthApi;
