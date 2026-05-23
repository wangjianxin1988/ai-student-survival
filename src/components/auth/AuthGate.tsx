import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getLocaleHref } from "@/lib/i18n";

interface AuthGateProps {
  children: React.ReactNode;
  locale?: "zh" | "en";
  fallback?: React.ReactNode;
}

/**
 * AuthGate - Client-side auth check component
 * Shows content only when user is logged in, otherwise shows fallback or redirects to login
 */
export default function AuthGate({ children, locale = "zh", fallback }: AuthGateProps) {
  const { user, loading } = useAuth();

  // Show loading state during auth initialization
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not logged in, show fallback or redirect prompt
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {locale === "zh" ? "登录后即可使用此功能" : "Please sign in to use this feature"}
          </h2>
          <p className="text-gray-500 mb-6">
            {locale === "zh"
              ? "此操作需要登录账号，请先登录或注册。"
              : "This action requires a signed-in account. Please sign in or register."}
          </p>
          <a
            href={getLocaleHref("/auth/login", locale)}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {locale === "zh" ? "登录" : "Sign In"}
          </a>
        </div>
      </div>
    );
  }

  // User is logged in, show content
  return <>{children}</>;
}

/**
 * useRequireAuth - Hook that returns user or redirects to login
 * For use inside existing components
 */
export function useRequireAuth(redirectTo: string = "/auth/login") {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
  };
}