import React, { useState, useEffect } from 'react';
import { demoAuthApi } from '@/lib/auth';

interface LoginFormProps {
  locale?: 'zh' | 'en';
  onSwitchToRegister?: () => void;
  returnTo?: string;
}

const translations = {
  zh: {
    title: '登录',
    email: '邮箱',
    password: '密码',
    submit: '登录',
    noAccount: '还没有账号？',
    register: '注册',
    orContinueWith: '其他方式登录',
    googleSignIn: 'Google',
    githubSignIn: 'GitHub',
    appleSignIn: 'Apple',
    wechatSignIn: '微信',
    qqSignIn: 'QQ',
    weiboSignIn: '微博',
    forgotPassword: '忘记密码？',
    loading: '登录中...',
    error: '登录失败',
    demoMode: '演示模式',
    demoModeHint: 'Supabase未配置，使用演示账号登录',
    magicLink: '邮箱验证码登录',
    sendMagicLink: '发送验证码',
    magicLinkSent: '验证码已发送，请查收邮箱',
    verifyTitle: '验证设备',
    verifyDesc: '新设备登录验证，请输入发送到您邮箱的验证码',
    verificationCode: '验证码',
    verifyButton: '验证',
    verifySuccess: '验证成功，正在跳转...',
  },
  en: {
    title: 'Sign In',
    email: 'Email',
    password: 'Password',
    submit: 'Sign In',
    noAccount: "Don't have an account?",
    register: 'Register',
    orContinueWith: 'or continue with',
    googleSignIn: 'Google',
    githubSignIn: 'GitHub',
    appleSignIn: 'Apple',
    wechatSignIn: 'WeChat',
    qqSignIn: 'QQ',
    weiboSignIn: 'Weibo',
    forgotPassword: 'Forgot password?',
    loading: 'Signing in...',
    error: 'Sign in failed',
    demoMode: 'Demo Mode',
    demoModeHint: 'Supabase not configured, using demo account',
    magicLink: 'Magic Link',
    sendMagicLink: 'Send Link',
    magicLinkSent: 'Check your email for the login link',
    verifyTitle: 'Verify Device',
    verifyDesc: 'New device login. Please enter the verification code sent to your email.',
    verificationCode: 'Verification Code',
    verifyButton: 'Verify',
    verifySuccess: 'Verified! Redirecting...',
  },
};

export default function LoginForm({ locale = 'zh', onSwitchToRegister, returnTo }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isDemoMode] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  const t = translations[locale];

  // Get returnTo from URL if not provided via props (for ?redirect=xxx from middleware)
  const getReturnTo = () => {
    if (returnTo) return returnTo;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRedirect = params.get('redirect');
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
        window.location.href = '/';
      }
    }
  };

  // Guard: check auth state on mount and prevent showing form if already logged in
  useEffect(() => {
    demoAuthApi.getUser().then((user) => {
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    setError('');
    setIsLoading(true);

    try {
      const result = await demoAuthApi.verifyAndLogin(pendingEmail, verificationCode);
      if (result.success) {
        setVerificationMessage(t.verifySuccess);
        setTimeout(() => {
          redirectAfterLogin();
        }, 1500);
      } else {
        setError(result.error || '验证码错误');
      }
    } catch (err) {
      setError('验证失败');
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('google');
    if (result.error) {
      setError(result.error);
    }
  };

  const handleGithubSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('github');
    if (result.error) {
      setError(result.error);
    }
  };

  const handleAppleSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('apple');
    if (result.error) {
      setError(result.error);
    }
  };

  const handleWechatSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('wechat');
    if (result.error) {
      setError(result.error);
    }
  };

  const handleQQSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('qq');
    if (result.error) {
      setError(result.error);
    }
  };

  const handleWeiboSignIn = async () => {
    const result = await demoAuthApi.signInWithOAuth('weibo');
    if (result.error) {
      setError(result.error);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await demoAuthApi.signInWithMagicLink(magicLinkEmail);
      if (result.success) {
        setMagicLinkSent(true);
        setTimeout(() => {
          redirectAfterLogin();
        }, 1500);
      } else {
        setError(result.error || '发送失败');
      }
    } catch (err) {
      setError('发送失败');
    }

    setIsLoading(false);
  };

  // Demo login - creates a demo account and logs in
  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Use magic link flow which auto-creates a demo user
      const demoEmail = 'demo@mittoai.com';
      const result = await demoAuthApi.signInWithMagicLink(demoEmail);
      if (result.success) {
        redirectAfterLogin();
      } else {
        setError(result.error || '演示登录失败');
      }
    } catch (err) {
      setError('演示登录失败');
    }

    setIsLoading(false);
  };

  // Guard: Don't show form if auth check not complete or if user is already logged in
  if (!authChecked) {
    return (
      <div className="w-full max-w-md mx-auto flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">{locale === 'zh' ? '加载中...' : 'Loading...'}</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-gray-600 mb-4">{locale === 'zh' ? '您已登录' : 'You are already logged in'}</p>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {locale === 'zh' ? '返回首页' : 'Go to Home'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{t.title}</h2>

      {isDemoMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          <div className="font-medium">{t.demoMode}</div>
          <div className="text-yellow-600 mb-3">{t.demoModeHint}</div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {locale === 'zh' ? '演示登录' : 'Demo Login'}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {showVerification ? (
        <form onSubmit={handleVerification} className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-900 mb-1">{t.verifyTitle}</h3>
            <p className="text-sm text-blue-700">{verificationMessage}</p>
          </div>
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
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
              setVerificationCode('');
              setPendingEmail('');
              setVerificationMessage('');
            }}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回登录
          </button>
        </form>
      ) : showMagicLink ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="magicEmail" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                <span className="px-2 bg-white text-gray-500">{t.orContinueWith}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium">{t.googleSignIn}</span>
              </button>

              <button
                onClick={handleGithubSignIn}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-sm font-medium">{t.githubSignIn}</span>
              </button>

              <button
                onClick={handleAppleSignIn}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-sm font-medium">{t.appleSignIn}</span>
              </button>
            </div>

            {/* Chinese Social Login Options */}
            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{locale === 'zh' ? '国内登录' : 'China Login'}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <button
                  onClick={handleWechatSignIn}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#07C160">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.031-.406-.031zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                  <span className="text-sm font-medium">{t.wechatSignIn}</span>
                </button>

                <button
                  onClick={handleQQSignIn}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#12B7F5">
                    <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.396 1.025.127 0 .319-.058.49-.158.658-.385 1.457-1.088 1.852-1.378.49-.361.593-.346.727-.158.339.475.903 1.025 1.57 1.48.332.227.618.361.86.361.242 0 .528-.134.86-.361.667-.455 1.231-1.005 1.57-1.48.134-.188.237-.203.727.158.395.29 1.194.993 1.852 1.378.171.1.363.158.49.158.226 0 .396-.36.396-1.025 0-.749-.183-3.472-.183-5.955V9.325C18.293 3.364 14.268 2 12.003 2z"/>
                  </svg>
                  <span className="text-sm font-medium">{t.qqSignIn}</span>
                </button>

                <button
                  onClick={handleWeiboSignIn}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#E6162D">
                    <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.584.396-.926.441-1.854-.003-2.441-.811-1.074-3.389-.669-5.499.88-.984.723-1.581 1.584-1.581 2.615 0 1.127.732 1.818 1.978 2.023 1.207.199 2.175-.259 2.175-.259-.166.54-.51.994-.959 1.291-.63.42-1.551.47-2.348.175-1.094-.406-1.566-1.573-1.566-1.573-.11-.315.031-.655.347-.816.315-.16.687-.072.928.173.02.021.039.032.059.059.02.021.039.039.059.059.021-.021.039-.039.059-.059.021-.02.039-.032.059-.059.02.021.039.039.059.059.021-.021.039-.039.059-.059.021.021.039.039.059.059.021-.021.039-.039.059-.059.021.021.039.039.059.059l.236.189c.378.297.873.461 1.365.398 1.307-.162 2.222-1.486 2.05-2.956-.175-1.483-1.404-2.5-2.707-2.341-.65.079-1.21.378-1.654.818-.27.268-.498.569-.689.891-.158-.033-.313-.051-.459-.051-.868 0-1.726.321-2.414.869-.002.001-1.461 1.177-.331 2.477.813.936 2.137 1.116 2.956.399.819-.719.963-1.912.319-2.664.435.232.959.363 1.517.363.572 0 1.087-.132 1.522-.365-.434.752-.569 1.63-.321 2.461.348 1.164 1.394 1.928 2.538 1.928.172 0 .339-.018.509-.047-.193-.26-.32-.559-.32-.883 0-.692.365-1.297.908-1.588z"/>
                  </svg>
                  <span className="text-sm font-medium">{t.weiboSignIn}</span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t.noAccount}{' '}
            <button
              onClick={onSwitchToRegister ?? (() => window.location.href = '/auth/register')}
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
