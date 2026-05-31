import React, { useState } from "react";

interface ForgotPasswordFormProps {
  locale?: "zh" | "en";
}

const translations = {
  zh: {
    title: "重置密码",
    subtitle: "输入您的注册邮箱，我们会发送重置密码链接",
    email: "邮箱地址",
    sendLink: "发送重置链接",
    linkSent: "重置链接已发送，请查看您的邮箱",
    linkSentDesc: "请在邮箱中点击重置密码链接来设置新密码。如果没有收到邮件，请检查垃圾邮件文件夹。",
    backToLogin: "← 返回登录",
    enterEmail: "请输入邮箱地址",
    notRegistered: "该邮箱尚未注册",
    sending: "发送中...",
    networkError: "网络错误，请稍后重试",
    goToLogin: "前往登录",
  },
  en: {
    title: "Reset Password",
    subtitle: "Enter your registered email and we will send a reset link",
    email: "Email address",
    sendLink: "Send Reset Link",
    linkSent: "Reset link sent, please check your email",
    linkSentDesc: "Please click the password reset link in your email to set a new password. If you don't see it, check your spam folder.",
    backToLogin: "← Back to Login",
    enterEmail: "Please enter your email",
    notRegistered: "Email not registered",
    sending: "Sending...",
    networkError: "Network error, please try again",
    goToLogin: "Go to Login",
  },
};

export default function ForgotPasswordForm({ locale = "zh" }: ForgotPasswordFormProps) {
  const t = translations[locale];
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) { setError(t.enterEmail); return; }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        const msg = (data.message || '').toLowerCase();
        if (msg.includes("not found")) setError(t.notRegistered);
        else setError(data.message || t.networkError);
      }
    } catch {
      setError(t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="mt-2 text-gray-600">{t.subtitle}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {!sent ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendResetLink(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your@email.com" autoComplete="email" />
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <button onClick={handleSendResetLink} disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
              {isLoading ? t.sending : t.sendLink}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2 text-green-700">{t.linkSent}</h2>
            <p className="text-gray-600 mb-6 text-sm">{t.linkSentDesc}</p>
            <a href={locale === "en" ? "/en/auth/login" : "/auth/login"}
              className="inline-block px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors">
              {t.goToLogin}
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <a href={locale === "en" ? "/en/auth/login" : "/auth/login"} className="text-sm text-gray-600 hover:text-primary-600 transition-colors">{t.backToLogin}</a>
      </div>
    </div>
  );
}
