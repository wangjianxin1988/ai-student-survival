import React, { useState } from "react";
import MathCaptcha from "./MathCaptcha";

interface ContactFormProps {
  locale?: "zh" | "en";
}

const translations = {
  zh: {
    title: "联系开发者",
    subtitle: "有问题或建议？我们很乐意听到您的反馈！",
    name: "姓名",
    namePlaceholder: "您的姓名",
    email: "邮箱",
    emailPlaceholder: "your@email.com",
    type: "反馈类型",
    typeFeedback: "功能反馈",
    typeBug: "问题报告",
    typeFeature: "功能建议",
    typeOther: "其他",
    message: "反馈内容",
    messagePlaceholder: "请详细描述您的问题或建议...",
    submit: "发送反馈",
    submitting: "发送中...",
    success: "反馈已发送！感谢您的反馈。",
    error: "发送失败，请稍后重试",
    rateLimited: "提交过于频繁，请稍后再试",
    validationError: "请填写所有必填字段",
    invalidEmail: "请输入有效的邮箱地址",
    messageTooShort: "反馈内容太短，请详细描述",
    developerWechat: "开发者微信",
    developerEmail: "开发者邮箱",
    contactDirect: "也可以直接联系开发者",
  },
  en: {
    title: "Contact Developer",
    subtitle: "Have questions or suggestions? We'd love to hear your feedback!",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "your@email.com",
    type: "Feedback Type",
    typeFeedback: "Feedback",
    typeBug: "Bug Report",
    typeFeature: "Feature Request",
    typeOther: "Other",
    message: "Message",
    messagePlaceholder:
      "Please describe your question or suggestion in detail...",
    submit: "Send Feedback",
    submitting: "Sending...",
    success: "Feedback sent! Thank you for your feedback.",
    error: "Failed to send. Please try again later.",
    rateLimited: "Submitting too frequently. Please try again later.",
    validationError: "Please fill in all required fields",
    invalidEmail: "Please enter a valid email address",
    messageTooShort: "Message too short. Please provide more details.",
    developerWechat: "Developer WeChat",
    developerEmail: "Developer Email",
    contactDirect: "You can also contact the developer directly",
  },
};

export default function ContactForm({ locale = "zh" }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"feedback" | "bug" | "feature" | "other">(
    "feedback",
  );
  const [message, setMessage] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "rateLimited"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const t = translations[locale];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      setErrorMessage(
        locale === "zh" ? "请先完成验证" : "Please complete verification first",
      );
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          type,
          message,
          captchaVerified,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setType("feedback");
        setMessage("");
        setCaptchaVerified(false);
      } else {
        setStatus("error");
        if (result.error?.code === "RATE_LIMITED") {
          setStatus("rateLimited");
          setErrorMessage(t.rateLimited);
        } else if (result.error?.code === "VALIDATION_ERROR") {
          setErrorMessage(t.validationError);
        } else if (result.error?.code === "INVALID_EMAIL") {
          setErrorMessage(t.invalidEmail);
        } else if (result.error?.code === "MESSAGE_TOO_SHORT") {
          setErrorMessage(t.messageTooShort);
        } else {
          setErrorMessage(result.error?.message || t.error);
        }
      }
    } catch {
      setStatus("error");
      setErrorMessage(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaVerify = (verified: boolean) => {
    setCaptchaVerified(verified);
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t.success}
        </h3>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          {locale === "zh" ? "发送另一条反馈" : "Send another feedback"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Developer Contact Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-2">{t.contactDirect}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-medium">
              {t.developerWechat}:
            </span>
            <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-mono">
              jian_xin_happy
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('jian_xin_happy')}
              className="text-blue-600 hover:text-blue-800"
              title={locale === "zh" ? "复制微信号" : "Copy WeChat ID"}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-medium">
              {t.developerEmail}:
            </span>
            <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-mono">
              {import.meta.env.PUBLIC_DEVELOPER_EMAIL || '18801400211@163.com'}
            </code>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.name} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.email} *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.type} *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="feedback">{t.typeFeedback}</option>
            <option value="bug">{t.typeBug}</option>
            <option value="feature">{t.typeFeature}</option>
            <option value="other">{t.typeOther}</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.message} *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.messagePlaceholder}
            rows={5}
            required
            minLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
        </div>

        {/* Captcha */}
        <div>
          <MathCaptcha onVerify={handleCaptchaVerify} locale={locale} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !captchaVerified}
          className="w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
