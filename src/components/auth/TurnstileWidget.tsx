import { useEffect, useLayoutEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

// Cloudflare Turnstile sitekey
// Test key: 1x00000000000000000000AA (always passes)
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
  const renderedRef = useRef(false);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  // Keep callbacks stable
  useEffect(() => { onVerifyRef.current = onVerify; }, [onVerify]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  // Use useLayoutEffect so test-key token fires synchronously before paint,
  // preventing the register button from flashing as disabled on initial render.
  useLayoutEffect(() => {
    if (renderedRef.current) return;
    renderedRef.current = true;

    // Test keys: emit token immediately, no widget needed
    if (IS_TEST_KEY) {
      onVerifyRef.current("TEST_TOKEN_DUMMY");
      return;
    }

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onVerifyRef.current(token),
        "error-callback": () => { /* handled by widget UI */ },
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
      renderWidget();
    } else if (!document.getElementById("cf-turnstile-script")) {
      window.onloadTurnstileCallback = () => renderWidget();
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = () => { renderedRef.current = false; };
      document.head.appendChild(script);
    } else {
      window.onloadTurnstileCallback = () => renderWidget();
      pollInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollInterval!);
          renderWidget();
        }
      }, 50);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      }
      widgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, []);

  return (
    <div className={className}>
      {!IS_TEST_KEY && (
        <div ref={containerRef} />
      )}
    </div>
  );
}
