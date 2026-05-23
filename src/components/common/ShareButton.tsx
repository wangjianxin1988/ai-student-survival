import React, { useState, useEffect } from "react";

const translations = {
  zh: {
    share: "分享",
    copyLink: "复制链接",
    copied: "已复制!",
    shareTo: "分享到",
    twitter: "Twitter",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    weibo: "微博",
    wechat: "微信",
    qq: "QQ",
    qrCode: "二维码",
  },
  en: {
    share: "Share",
    copyLink: "Copy Link",
    copied: "Copied!",
    shareTo: "Share to",
    twitter: "Twitter",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    weibo: "Weibo",
    wechat: "WeChat",
    qq: "QQ",
    qrCode: "QR Code",
  },
};

interface ShareButtonProps {
  url?: string;
  title: string;
  description?: string;
  image?: string;
  locale?: "zh" | "en";
  showWeibo?: boolean;
  showWechat?: boolean;
  showQq?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ShareButton({
  url,
  title,
  description,
  image: _image,
  locale = "zh",
  showWeibo = true,
  showWechat = true,
  showQq = true,
  size = "md",
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || "");
  const t = translations[locale];

  useEffect(() => {
    if (!url) {
      setShareUrl(window.location.href);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: string) => {
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "weibo":
        shareUrl = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case "qq":
        shareUrl = `https://connect.qq.com/widget/shareqq/iframe_index.html?url=${encodedUrl}&title=${encodedTitle}&desc=${encodedDescription}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
    setShowMenu(false);
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="relative inline-block">
      {/* Main Share Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors ${sizeClasses[size]}`}
      >
        <svg
          className={iconSize[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {t.share}
      </button>

      {/* Share Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">
                  {copied ? t.copied : t.copyLink}
                </span>
              </div>
              {copied && (
                <svg
                  className="w-5 h-5 text-green-500"
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
              )}
            </button>

            <div className="border-t border-gray-100" />

            {/* Social Platforms */}
            <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">
              {t.shareTo}
            </div>

            <button
              onClick={() => handleShare("twitter")}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">{t.twitter}</span>
            </button>

            <button
              onClick={() => handleShare("facebook")}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#4267B2] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">{t.facebook}</span>
            </button>

            <button
              onClick={() => handleShare("linkedin")}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">{t.linkedin}</span>
            </button>

            {showWeibo && (
              <button
                onClick={() => handleShare("weibo")}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#E6162D] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.584.396-.926.441-1.854-.003-2.441-.811-1.074-3.389-.669-5.499.88-.984.723-1.581 1.584-1.581 2.615 0 1.127.732 1.818 1.978 2.023 1.207.199 2.175-.259 2.175-.259-.166.54-.51.994-.959 1.291-.63.42-1.551.47-2.348.175-1.094-.406-1.566-1.573-1.566-1.573-.11-.315.031-.655.347-.816.315-.16.687-.072.928.173.02.021.039.032.059.059.02.021.039.039.059.059.021-.021.039-.039.059-.059.021-.02.039-.032.059-.059.02.021.039.039.059.059.021-.021.039-.039.059-.059.021.021.039.039.059.059.021-.021.039-.039.059-.059.021.021.039.039.059.059l.236.189c.378.297.873.461 1.365.398 1.307-.162 2.222-1.486 2.05-2.956-.175-1.483-1.404-2.5-2.707-2.341-.65.079-1.21.378-1.654.818-.27.268-.498.569-.689.891-.158-.033-.313-.051-.459-.051-.868 0-1.726.321-2.414.869-.002.001-1.461 1.177-.331 2.477.813.936 2.137 1.116 2.956.399.819-.719.963-1.912.319-2.664.435.232.959.363 1.517.363.572 0 1.087-.132 1.522-.365-.434.752-.569 1.63-.321 2.461.348 1.164 1.394 1.928 2.538 1.928.172 0 .339-.018.509-.047-.193-.26-.32-.559-.32-.883 0-.692.365-1.297.908-1.588z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">{t.weibo}</span>
              </button>
            )}

            {showQq && (
              <button
                onClick={() => handleShare("qq")}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#12B7F5] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.396 1.025.127 0 .319-.058.49-.158.658-.385 1.457-1.088 1.852-1.378.49-.361.593-.346.727-.158.339.475.903 1.025 1.57 1.48.332.227.618.361.86.361.242 0 .528-.134.86-.361.667-.455 1.231-1.005 1.57-1.48.134-.188.237-.203.727.158.395.29 1.194.993 1.852 1.378.171.1.363.158.49.158.226 0 .396-.36.396-1.025 0-.749-.183-3.472-.183-5.955V9.325C18.293 3.364 14.268 2 12.003 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">{t.qq}</span>
              </button>
            )}

            {showWechat && (
              <div className="px-4 py-2.5 flex items-center gap-3 text-gray-400 cursor-not-allowed">
                <div className="w-8 h-8 rounded-full bg-[#07C160] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.031-.406-.031zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-400">{t.wechat}</span>
                <span className="text-xs text-gray-400">(QR)</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
