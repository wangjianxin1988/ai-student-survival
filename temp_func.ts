export function getCurrentUser(): DemoUser | null {
  // Return cached if already loaded
  if (currentUser !== null) return currentUser;

  // Try to detect from Supabase localStorage synchronously (OAuth session)
  if (isSupabaseConfigured && typeof window !== 'undefined') {
    const supabaseUser = readSupabaseSessionFromStorage();
    if (supabaseUser) {
      currentUser = supabaseUser;
      return currentUser;
    }
  }

  // Fallback to demo session
  const demoUser = getDemoUserFromSession();
  if (demoUser) {
    currentUser = demoUser;
    return currentUser;
  }

  return null;
}