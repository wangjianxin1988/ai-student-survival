import { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

// Cloudflare Turnstile sitekey
// Test key: 1x00000000000000000000AA (always passes, no user interaction needed)
// Real key: Set PUBLIC_TURNSTILE_SITE_KEY environment variable
const SITE_KEY =
  (import.meta.env as any).PUBLIC_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";
const IS_TEST_KEY = SITE_KEY === "1x00000000000000000000AA";

declare global {
  interface Window {
    onloadTurnstileCallback: () => void;
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "invisible";
          tabindex?: number;
          language?: string;
          retryInterval?: number;
          retry?: "auto" | "never";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Stable unique ID (not reactive) to avoid Cloudflare auto-placement conflicts
  const widgetId = useRef(`turnstile-${Math.random().toString(36).slice(2, 8)}`);

  // Keep callbacks stable to prevent re-renders
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onVerifyRef.current = onVerify; }, [onVerify]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (widgetIdRef.current) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const renderWidget = (token?: string) => {
      if (!containerRef.current || widgetIdRef.current) return;
      if (token) {
        // For test keys, emit token directly without rendering widget
        onVerifyRef.current(token);
        widgetIdRef.current = "test-widget";
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (tk) => onVerifyRef.current(tk),
        "error-callback": () => setHasError(true),
        "expired-callback": () => {
          widgetIdRef.current = null;
          onExpireRef.current?.();
        },
        theme: "light",
        size: "normal",
        tabindex: 0,
        retry: "auto",
        retryInterval: 8000,
      });
    };

    if (window.turnstile) {
      // Script already loaded
      setIsReady(true);
      renderWidget();
    } else if (!document.getElementById("cf-turnstile-script")) {
      // Load script
      window.onloadTurnstileCallback = () => {
        setIsReady(true);
        renderWidget();
      };
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = () => setHasError(true);
      document.head.appendChild(script);
    } else {
      // Script tag exists but window.turnstile not ready yet
      window.onloadTurnstileCallback = () => {
        setIsReady(true);
        renderWidget();
      };
      pollInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollInterval!);
          setIsReady(true);
          renderWidget();
        }
      }, 50);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (widgetIdRef.current && widgetIdRef.current !== "test-widget" && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      }
      widgetIdRef.current = null;
    };
  }, []);

  // For test keys: emit token when ready, even if widget not rendered
  useEffect(() => {
    if (!isReady || !IS_TEST_KEY || widgetIdRef.current) return;
    widgetIdRef.current = "test-widget";
    onVerifyRef.current("TEST_TOKEN_DUMMY");
  }, [isReady]);

  if (hasError) {
    return (
      <div className={className}>
        <p className="text-xs text-red-500">
          人机验证加载失败，请刷新页面重试
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} id={widgetId.current} />
      {!widgetIdRef.current && !hasError && (
        <p className="text-xs text-gray-400 mt-1">加载验证组件中...</p>
      )}
    </div>
  );
}
