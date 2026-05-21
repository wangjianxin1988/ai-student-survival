import React, { useState, useEffect } from "react";
import { demoAuthApi } from "@/lib/auth";
import {
  isPasswordVerified,
  setPasswordVerified,
  verifyPassword,
} from "@/lib/passwordAuth";
import { useAuth } from "./AuthProvider";

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
    appleSignIn: "Apple",
    forgotPassword: "忘记密码？",
    loading: "登录中...",
    error: "登录失败",
    demoMode: "演示模式",
    demoModeHint: "Supabase未配置，使用演示账号登录",
    magicLink: "邮箱验证码登录",
    sendMagicLink: "发送验证码",
    magicLinkSent: "验证码已发送，请查收邮箱",
    verifyTitle: "验证设备",
    verifyDesc: "新设备登录验证，请输入发送到您邮箱的验证码",
    verificationCode: "验证码",
    verifyButton: "验证",
    verifySuccess: "验证成功，正在跳转...",
    passwordRequired: "请输入访问密码",
    passwordPlaceholder: "输入访问密码",
    enterSite: "进入网站",
    passwordError: "密码错误",
    passwordSuccess: "密码验证成功",
    passwordSuccessHint: "您已获得访问权限，可以使用以下方式登录或注册",
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
    appleSignIn: "Apple",
    forgotPassword: "Forgot password?",
    loading: "Signing in...",
    error: "Sign in failed",
    demoMode: "Demo Mode",
    demoModeHint: "Supabase not configured, using demo account",
    magicLink: "Magic Link",
    sendMagicLink: "Send Link",
    magicLinkSent: "Check your email for the login link",
    verifyTitle: "Verify Device",
    verifyDesc:
      "New device login. Please enter the verification code sent to your email.",
    verificationCode: "Verification Code",
    verifyButton: "Verify",
    verifySuccess: "Verified! Redirecting...",
    passwordRequired: "Password required",
    passwordPlaceholder: "Enter access password",
    enterSite: "Enter Site",
    passwordError: "Incorrect password",
    passwordSuccess: "Password verified",
    passwordSuccessHint:
      "You have access. Use the options below to login or register.",
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
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [passwordVerified, setPasswordVerifiedLocal] = useState(false);
  const [accessPassword, setAccessPassword] = useState("");

  const t = translations[locale];
  const { signInWithGoogle, signInWithGithub, signInWithApple } = useAuth();

  // Get returnTo from URL if not provided via props (for ?redirect=xxx from middleware)
  const getReturnTo = () => {
    if (returnTo) return returnTo;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlRedirect = params.get("redirect");
      if (urlRedirect) return urlRedirect;
    }
    return null;
  };

  // Helper to redirect after successful login
  const redirectAfterLogin = () => {
    const finalReturnTo = getReturnTo();
    if (finalReturnTo) {
      window.location.href = finalReturnTo;
    } else {
      // Try to go back to previous page, fallback to '/'
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  // Guard: check auth state on mount and check password verification
  useEffect(() => {
    const checkAuth = async () => {
      // Check password verification status
      if (isPasswordVerified()) {
        setPasswordVerifiedLocal(true);
      }

      // Check if user is logged in via demoAuthApi
      const user = await demoAuthApi.getUser();
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  // Handle password verification
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay for security
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (verifyPassword(accessPassword)) {
      setPasswordVerifiedLocal(true);
      setPasswordVerified();
    } else {
      setError(t.passwordError);
      setAccessPassword("");
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await demoAuthApi.signIn(email, password);
      if (result.success) {
        redirectAfterLogin();
      } else if (result.verificationRequired) {
        // New device detected - show verification form
        setPendingEmail(email);
        setVerificationMessage(result.message || t.verifyDesc);
        setShowVerification(true);
      } else {
        setError(result.error || t.error);
      }
    } catch (err) {
      setError(t.error);
    }

    setIsLoading(false);
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await demoAuthApi.verifyAndLogin(
        pendingEmail,
        verificationCode,
      );
      if (result.success) {
        setVerificationMessage(t.verifySuccess);
        setTimeout(() => {
          redirectAfterLogin();
        }, 1500);
      } else {
        setError(result.error || "验证码错误");
      }
    } catch (err) {
      setError("验证失败");
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (!passwordVerified) {
      setError("请先输入访问密码");
      return;
    }
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
    }
  };

  const handleGithubSignIn = async () => {
    if (!passwordVerified) {
      setError("请先输入访问密码");
      return;
    }
    const result = await signInWithGithub();
    if (result.error) {
      setError(result.error);
    }
  };

  const handleAppleSignIn = async () => {
    if (!passwordVerified) {
      setError("请先输入访问密码");
      return;
    }
    const result = await signInWithApple();
    if (result.error) {
      setError(result.error);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await demoAuthApi.signInWithMagicLink(magicLinkEmail);
      if (result.success) {
        setMagicLinkSent(true);
        setTimeout(() => {
          redirectAfterLogin();
        }, 1500);
      } else {
        setError(result.error || "发送失败");
      }
    } catch (err) {
      setError("发送失败");
    }

    setIsLoading(false);
  };

  // Guard: Don't show form if auth check not complete
  if (!authChecked) {
    return (
      <div className="w-full max-w-md mx-auto flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">
          {locale === "zh" ? "加载中..." : "Loading..."}
        </div>
      </div>
    );
  }

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

  // If password not verified, show password entry form
  if (!passwordVerified) {
    return (
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">MI TO AI</h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="accessPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.passwordRequired}
              </label>
              <input
                type="password"
                id="accessPassword"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder={t.passwordPlaceholder}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !accessPassword}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.loading : t.enterSite}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          演示模式密码保护 | 密码由管理员提供
        </p>

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
      </div>
    );
  }

  // Password verified - show login form with OAuth options
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{t.title}</h2>

      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        <div className="font-medium">{t.passwordSuccess}</div>
        <div className="text-green-600">{t.passwordSuccessHint}</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {showVerification ? (
        <form onSubmit={handleVerification} className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-900 mb-1">
              {t.verifyTitle}
            </h3>
            <p className="text-sm text-blue-700">{verificationMessage}</p>
          </div>
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.verificationCode}
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t.loading : t.verifyButton}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowVerification(false);
              setVerificationCode("");
              setPendingEmail("");
              setVerificationMessage("");
            }}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回登录
          </button>
        </form>
      ) : showMagicLink ? (
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
          <button
            type="submit"
            disabled={isLoading}
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
            onClick={() => setShowMagicLink(false)}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回邮箱密码登录
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
              onClick={() => setShowMagicLink(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {t.magicLink}
            </button>
          </div>

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

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                onClick={handleGithubSignIn}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

              <button
                onClick={handleAppleSignIn}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-sm font-medium">{t.appleSignIn}</span>
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
