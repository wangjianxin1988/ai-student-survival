import React, { useState, useEffect } from "react";
import { getCurrentUser, initAuth, type DemoUser } from "@/lib/auth";
import { defaultLocale } from "@/i18n";

const ONBOARDING_KEY = "demo_onboarding_complete";

interface OnboardingStep {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: React.ReactNode;
  link?: string;
  linkText?: string;
  linkTextZh?: string;
}

const translations = {
  zh: {
    title: "欢迎来到MI TO AI留学生存指南",
    subtitle: "让我们快速带你了解核心功能",
    skip: "跳过",
    next: "下一步",
    done: "开始探索",
    stepOf: "第 {current} 步，共 {total} 步",
  },
  en: {
    title: "Welcome to MI TO AI Student Survival Guide",
    subtitle: "Let us quickly show you the key features",
    skip: "Skip",
    next: "Next",
    done: "Start Exploring",
    stepOf: "Step {current} of {total}",
  },
};

// Helper to generate locale-aware href
function getLocaleHref(path: string, loc: "zh" | "en"): string {
  if (loc === defaultLocale) {
    return path;
  }
  return `/${loc}${path}`;
}

interface OnboardingGuideProps {
  locale?: "zh" | "en";
}

export default function OnboardingGuide({
  locale = "zh",
}: OnboardingGuideProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const t = translations[locale];

  const steps: OnboardingStep[] = [
    {
      id: "tools",
      title: "AI Tools Library",
      titleZh: "AI工具库",
      description:
        "Browse and compare 100+ AI tools for writing, coding, design, and research. See ratings and reviews from other students.",
      descriptionZh:
        "浏览和对比100+款AI工具，涵盖写作、编程、设计和研究。支持按分类筛选和用户评分。",
      icon: (
        <svg
          className="w-12 h-12 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      link: getLocaleHref("/tools", locale),
      linkText: "Browse Tools",
      linkTextZh: "浏览工具库",
    },
    {
      id: "payment",
      title: "Payment Solutions",
      titleZh: "支付解决方案",
      description:
        "解决了留学生支付AI工具的难题！虚拟卡、礼品卡、地区定价全攻略。",
      descriptionZh:
        "解决了留学生支付AI工具的难题！虚拟卡、礼品卡、地区定价全攻略。",
      icon: (
        <svg
          className="w-12 h-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      link: getLocaleHref("/payment", locale),
      linkText: "View Solutions",
      linkTextZh: "查看方案",
    },
    {
      id: "policies",
      title: "University AI Policies",
      titleZh: "大学AI政策",
      description:
        "首家全面收录海外大学AI使用政策的数据库。了解你的学校允许使用哪些AI工具。",
      descriptionZh:
        "首家全面收录海外大学AI使用政策的数据库。了解你的学校允许使用哪些AI工具。",
      icon: (
        <svg
          className="w-12 h-12 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      link: getLocaleHref("/policies", locale),
      linkText: "View Policies",
      linkTextZh: "查看政策",
    },
    {
      id: "offers",
      title: "Offer Showcase",
      titleZh: "Offer展示",
      description:
        "分享你的录取结果，查看别人的申请经验。了解不同背景被录取的可能性。",
      descriptionZh:
        "分享你的录取结果，查看别人的申请经验。了解不同背景被录取的可能性。",
      icon: (
        <svg
          className="w-12 h-12 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      link: getLocaleHref("/offers", locale),
      linkText: "View Offers",
      linkTextZh: "查看Offer",
    },
    {
      id: "prompts",
      title: "Prompt Templates",
      titleZh: "Prompt模板库",
      description:
        "精选40+高质量Prompt模板，覆盖申请文书、学术论文、求职面试等场景，一键复制使用。",
      descriptionZh:
        "精选40+高质量Prompt模板，覆盖申请文书、学术论文、求职面试等场景，一键复制使用。",
      icon: (
        <svg
          className="w-12 h-12 text-purple-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      link: getLocaleHref("/prompts", locale),
      linkText: "View Templates",
      linkTextZh: "查看模板",
    },
  ];

  useEffect(() => {
    // Initialize auth first so OAuth sessions are detected synchronously
    initAuth().then(currentUser => {
      setUser(currentUser);

      // Check if onboarding has been completed
      if (typeof window !== "undefined") {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed && currentUser) {
          // Small delay to show after page load
          setTimeout(() => setIsVisible(true), 1000);
        }
      }
    });
  }, []);

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  if (!user || !isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleSkip}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8 text-white">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-sm"
          >
            {t.skip}
          </button>
          <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
          <p className="text-white/80">{t.subtitle}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-white"
                    : index < currentStep
                      ? "bg-white/60"
                      : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-gray-50 rounded-full">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {locale === "zh"
                ? currentStepData.titleZh
                : currentStepData.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === "zh"
                ? currentStepData.descriptionZh
                : currentStepData.description}
            </p>

            {currentStepData.link && (
              <a
                href={currentStepData.link}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                {locale === "zh"
                  ? currentStepData.linkTextZh
                  : currentStepData.linkText}
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {t.stepOf
              .replace("{current}", String(currentStep + 1))
              .replace("{total}", String(steps.length))}
          </span>

          <div className="flex items-center gap-3">
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                {t.next}
              </button>
            )}

            {currentStep === steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                {t.done}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
