import React, { useState, useEffect } from "react";
import { demoAuthApi } from "@/lib/auth";
import { TurnstileWidget } from "./TurnstileWidget";

interface LoginFormProps {
  locale?: "zh" | "en";
  onSwitchToRegister?: () => void;
  returnTo?: string;
}

const translations = {
  zh: {
    title: "登录",
    email: "邮箱",
    password: "密码",
    submit: "登录",
    noAccount: "还没有账号？",
    register: "注册",
    orContinueWith: "其他方式登录",
    googleSignIn: "Google",
    githubSignIn: "GitHub",
    forgotPassword: "忘记密码？",
    resetPassword: "重置密码",
    resetPasswordTitle: "重置密码",
    resetPasswordSent: "重置链接已发送到您的邮箱",
    backToLogin: "返回登录",
    loading: "登录中...",
    error: "登录失败",
    magicLink: "邮箱验证码登录",
    sendMagicLink: "发送验证码",
    magicLinkSent: "验证码已发送，请查收邮箱",
    verifyHuman: "请先完成人机验证",
  },
  en: {
    title: "Sign In",
    email: "Email",
    password: "Password",
    submit: "Sign In",
    noAccount: "Don't have an account?",
    register: "Register",
    orContinueWith: "or continue with",
    googleSignIn: "Google",
    githubSignIn: "GitHub",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset Password",
    resetPasswordTitle: "Reset Password",
    resetPasswordSent: "Reset link sent to your email",
    backToLogin: "Back to Login",
    loading: "Signing in...",
    error: "Sign in failed",
    magicLink: "Magic Link",
    sendMagicLink: "Send Link",
    magicLinkSent: "Check your email for the login link",
    verifyHuman: "Please complete verification first",
  },
};

export default function LoginForm({
  locale = "zh",
  onSwitchToRegister,
  returnTo,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [magicLinkToken, setMagicLinkToken] = useState("");
  const [forgotToken, setForgotToken] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const t = translations[locale];

  // Get returnTo from URL if not provided via props
  const getReturnTo = () => {
    if (returnTo) return returnTo;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlRedirect = params.get("redirect");
      if (urlRedirect) return urlRedirect;
    }
    return null;
  };

  // Redirect after successful login
  const redirectAfterLogin = () => {
    const finalReturnTo = getReturnTo();
    if (finalReturnTo) {
      window.location.href = finalReturnTo;
    } else {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  // Guard: check auth state on mount using demoAuthApi directly
  useEffect(() => {
    let fallbackTimeout: ReturnType<typeof setTimeout>;

    const checkAuth = async () => {
      try {
        fallbackTimeout = setTimeout(() => {
          setAuthChecked(true);
          setIsLoggedIn(false);
        }, 3000);
        const user = await demoAuthApi.getUser();
        clearTimeout(fallbackTimeout);
        setIsLoggedIn(!!user);
      } catch {
        clearTimeout(fallbackTimeout);
        setIsLoggedIn(false);
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await demoAuthApi.signIn(email, password);
      if (result.success) {
        redirectAfterLogin();
      } else {
        setError(result.error || t.error);
      }
    } catch (err) {
      setError(t.error);
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('google');
    if (result.error) setError(result.error);
  };

  const handleGithubSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('github');
    if (result.error) setError(result.error);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await demoAuthApi.signInWithMagicLink(magicLinkEmail);
      if (result.success) {
        setMagicLinkSent(true);
      } else {
        setError(result.error || "发送失败");
      }
    } catch (err) {
      setError("发送失败");
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use magic link flow for password reset
      const result = await demoAuthApi.signInWithMagicLink(forgotPasswordEmail);
      if (result.success) {
        setForgotPasswordSent(true);
      } else {
        setError(result.error || "发送失败");
      }
    } catch (err) {
      setError("发送失败");
    }

    setIsLoading(false);
  };

  // Redirect if already logged in (background check, don't block form render)
  if (isLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-gray-600 mb-4">
          {locale === "zh" ? "您已登录" : "You are already logged in"}
        </p>
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {locale === "zh" ? "返回首页" : "Go to Home"}
        </button>
      </div>
    );
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">{t.resetPasswordTitle}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {forgotPasswordSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {t.resetPasswordSent}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordSent(false);
                setForgotPasswordEmail("");
                setError("");
              }}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              {t.backToLogin}
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              {locale === "zh"
                ? "输入您的注册邮箱，我们将发送重置密码链接"
                : "Enter your registered email, we'll send a password reset link"}
            </p>
            <div>
              <label
                htmlFor="forgotEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.email}
              </label>
              <input
                type="email"
                id="forgotEmail"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="email@example.com"
              />
            </div>

            {/* Turnstile Verification */}
            <div className="mt-4">
              <TurnstileWidget
                onVerify={(token) => setForgotToken(token)}
                onExpire={() => setForgotToken("")}
              />
              {!forgotToken && (
                <p className="text-xs text-gray-500 mt-1">
                  {t.verifyHuman}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!forgotToken || isLoading}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.loading : t.resetPassword}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError("");
                setForgotToken("");
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              ← {t.backToLogin}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Show login form
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{t.title}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {showMagicLink ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label
              htmlFor="magicEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.email}
            </label>
            <input
              type="email"
              id="magicEmail"
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="email@example.com"
            />
          </div>

          {/* Turnstile Verification */}
          <div className="mt-4">
            <TurnstileWidget
              onVerify={(token) => setMagicLinkToken(token)}
              onExpire={() => setMagicLinkToken("")}
            />
            {!magicLinkToken && (
              <p className="text-xs text-gray-500 mt-1">
                {t.verifyHuman}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!magicLinkToken || isLoading}
            className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t.loading : t.sendMagicLink}
          </button>

          {magicLinkSent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {t.magicLinkSent}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowMagicLink(false);
              setMagicLinkToken("");
              setError("");
            }}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            ← {locale === "zh" ? "返回邮箱密码登录" : "Back to email login"}
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.email}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.password}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {t.forgotPassword}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.loading : t.submit}
            </button>
          </form>

          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={() => setShowMagicLink(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {t.magicLink}
            </button>
          </div>

          {/* OAuth Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t.orContinueWith}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[140px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">{t.googleSignIn}</span>
              </button>

              <button
                type="button"
                onClick={handleGithubSignIn}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[140px]"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-sm font-medium">{t.githubSignIn}</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t.noAccount}{" "}
            <button
              onClick={
                onSwitchToRegister ??
                (() => (window.location.href = "/auth/register"))
              }
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t.register}
            </button>
          </p>
        </>
      )}
    </div>
  );
}
