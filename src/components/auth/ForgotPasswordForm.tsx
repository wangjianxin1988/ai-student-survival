import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface ForgotPasswordFormProps {
  locale?: "zh" | "en";
}

const translations = {
  zh: {
    title: "重置密码",
    subtitle: "输入您的注册邮箱，我们会发送验证码",
    email: "邮箱地址",
    sendCode: "发送验证码",
    codeSent: "验证码已发送，请查看邮箱",
    code: "验证码",
    verify: "验证",
    verifyLoading: "验证中...",
    resend: "重新发送验证码",
    resent: "✅ 已重新发送",
    newPassword: "新密码",
    confirmNewPassword: "确认新密码",
    passwordPlaceholder: "至少6个字符",
    confirmPlaceholder: "再次输入新密码",
    resetBtn: "重置密码",
    resetting: "重置中...",
    successTitle: "密码重置成功！",
    successDesc: "请使用新密码登录",
    goToLogin: "前往登录",
    backToLogin: "← 返回登录",
    enterEmail: "请输入邮箱地址",
    notRegistered: "该邮箱尚未注册",
    enterCode: "请输入6位验证码",
    codeExpired: "验证码已过期，请重新发送",
    codeWrong: "验证码错误，请重新输入",
    pwdTooShort: "密码至少6个字符",
    pwdMismatch: "两次密码输入不一致",
    sending: "发送中...",
    loading: "处理中...",
    networkError: "网络错误，请稍后重试",
    emailVerified: "✅ 邮箱验证成功，请设置新密码",
    stepDesc: {
      email: "输入您的注册邮箱，我们会发送验证码",
      verify: "请输入邮箱中收到的6位验证码",
      password: "请设置您的新密码",
    },
  },
  en: {
    title: "Reset Password",
    subtitle: "Enter your email to receive a verification code",
    email: "Email address",
    sendCode: "Send Code",
    codeSent: "Code sent, check your email",
    code: "Verification Code",
    verify: "Verify",
    verifyLoading: "Verifying...",
    resend: "Resend Code",
    resent: "✅ Resent",
    newPassword: "New Password",
    confirmNewPassword: "Confirm Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPlaceholder: "Re-enter new password",
    resetBtn: "Reset Password",
    resetting: "Resetting...",
    successTitle: "Password Reset!",
    successDesc: "Please log in with your new password",
    goToLogin: "Go to Login",
    backToLogin: "← Back to Login",
    enterEmail: "Please enter your email",
    notRegistered: "Email not registered",
    enterCode: "Please enter the 6-digit code",
    codeExpired: "Code expired, please resend",
    codeWrong: "Invalid code, please try again",
    pwdTooShort: "Password must be at least 6 characters",
    pwdMismatch: "Passwords do not match",
    sending: "Sending...",
    loading: "Processing...",
    networkError: "Network error, please try again",
    emailVerified: "✅ Email verified, set your new password",
    stepDesc: {
      email: "Enter your email to receive a verification code",
      verify: "Enter the 6-digit code from your email",
      password: "Set your new password",
    },
  },
};

export default function ForgotPasswordForm({ locale = "zh" }: ForgotPasswordFormProps) {
  const t = translations[locale];
  const [step, setStep] = useState<"email" | "verify" | "password" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTime, setResendTime] = useState(0);

  const handleSendCode = async () => {
    if (!email.trim()) { setError(t.enterEmail); return; }
    setError("");
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) { setError("Supabase not configured"); return; }
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("not found") || msg.includes("invalid")) setError(t.notRegistered);
        else setError(error.message);
        return;
      }
      setStep("verify");
    } catch { setError(t.networkError); }
    finally { setIsLoading(false); }
  };

  const handleVerify = async () => {
    if (code.length !== 6) { setError(t.enterCode); return; }
    setError("");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(), token: code, type: "email",
      } as any);
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired")) setError(t.codeExpired);
        else if (msg.includes("invalid") || msg.includes("otp")) setError(t.codeWrong);
        else setError(error.message);
        return;
      }
      setStep("password");
    } catch { setError(t.networkError); }
    finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    if (resendTime > 0) return;
    setError("");
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOtp({
        email: email.trim(), options: { shouldCreateUser: false },
      });
      setCode("");
      setResendTime(60);
      const timer = setInterval(() => {
        setResendTime((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) { setError(t.pwdTooShort); return; }
    if (newPassword !== confirmPassword) { setError(t.pwdMismatch); return; }
    setError("");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { setError(error.message); return; }
      await supabase.auth.signOut();
      setStep("success");
    } catch { setError(t.networkError); }
    finally { setIsLoading(false); }
  };

  const handleCodeInput = (val: string) => {
    setCode(val.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="mt-2 text-gray-600">{t.stepDesc[step] || ""}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {step === "email" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your@email.com" autoComplete="email" />
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <button onClick={handleSendCode} disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
              {isLoading ? t.sending : t.sendCode}
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✉️ {t.codeSent}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.code}</label>
              <input type="text" value={code} onChange={(e) => handleCodeInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000" maxLength={6} autoComplete="one-time-code" />
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <button onClick={handleVerify} disabled={code.length !== 6 || isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
              {isLoading ? t.verifyLoading : t.verify}
            </button>
            <button onClick={handleResend} disabled={isLoading || resendTime > 0}
              className="w-full text-sm text-primary-600 hover:text-primary-700 underline disabled:opacity-50">
              {resendTime > 0 ? `${t.resend} (${resendTime}s)` : t.resend}
            </button>
          </div>
        )}

        {step === "password" && (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{t.emailVerified}</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.newPassword}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.passwordPlaceholder} minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmNewPassword}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.confirmPlaceholder} minLength={6} />
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
            <button onClick={handleResetPassword} disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
              {isLoading ? t.resetting : t.resetBtn}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">{t.successTitle}</h2>
            <p className="text-gray-600 mb-4">{t.successDesc}</p>
            <a href="/auth/login"
              className="inline-block px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors">
              {t.goToLogin}
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <a href="/auth/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">{t.backToLogin}</a>
      </div>
    </div>
  );
}
