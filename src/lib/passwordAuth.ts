/**
 * Password Protection Module
 * Simple password verification for demo/protected access mode
 *
 * The password is set via environment variable ADMIN_PASSWORD
 * and verified against it. Status is stored in sessionStorage.
 */

// Environment variable name for the admin password
const ADMIN_PASSWORD_KEY = 'ADMIN_PASSWORD';

// Default password for development (should be overridden in production)
const DEFAULT_PASSWORD = 'demo-access-2024';

/**
 * Get the admin password from environment
 * In browser context, this uses import.meta.env
 */
export function getAdminPassword(): string {
  // For SSR/Node context
  if (typeof process !== 'undefined' && process.env?.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }
  // For browser context with Vite
  if (typeof import.meta !== 'undefined' && import.meta.env?.ADMIN_PASSWORD) {
    return import.meta.env.ADMIN_PASSWORD;
  }
  return DEFAULT_PASSWORD;
}

/**
 * Verify if the provided password matches the admin password
 */
export function verifyPassword(password: string): boolean {
  if (!password) return false;
  const adminPassword = getAdminPassword();
  return password === adminPassword;
}

/**
 * Session storage key for password verification status
 */
const PW_VERIFIED_KEY = 'pw_verified';

/**
 * Check if the user has verified the password in this session
 */
export function isPasswordVerified(): boolean {
  if (typeof window === 'undefined') return true; // SSR - allow through
  return sessionStorage.getItem(PW_VERIFIED_KEY) === 'true';
}

/**
 * Set the password as verified in session storage
 */
export function setPasswordVerified(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(PW_VERIFIED_KEY, 'true');
  }
}

/**
 * Clear the password verification (logout)
 */
export function clearPasswordVerified(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(PW_VERIFIED_KEY);
  }
}

/**
 * Get remaining verification status info (for debugging)
 */
export function getPasswordAuthStatus(): { verified: boolean; hasEnvPassword: boolean } {
  return {
    verified: isPasswordVerified(),
    hasEnvPassword: getAdminPassword() !== DEFAULT_PASSWORD,
  };
}
