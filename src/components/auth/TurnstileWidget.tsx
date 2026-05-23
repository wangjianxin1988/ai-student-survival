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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Stable unique ID (not reactive) to avoid Cloudflare auto-placement conflicts
  const widgetId = useRef(`turnstile-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (widgetIdRef.current) return;

    // Script loading + callback setup
    const loadScript = () => {
      window.onloadTurnstileCallback = () => setIsLoaded(true);
    };

    if (!document.getElementById("cf-turnstile-script")) {
      loadScript();
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = () => setHasError(true);
      document.head.appendChild(script);
    } else if (window.turnstile) {
      // Script already loaded in this session — proceed immediately
      setIsLoaded(true);
    } else {
      // Script tag already in DOM but window.turnstile not ready yet (cached script).
      // The onload already fired so callback won't be called.
      // Poll briefly until window.turnstile is available.
      loadScript();
      const poll = setInterval(() => {
        if (window.turnstile) {
          clearInterval(poll);
          setIsLoaded(true);
        }
      }, 50);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore errors during cleanup
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Render widget when script is ready
  useEffect(() => {
    if (!isLoaded || !containerRef.current || widgetIdRef.current) return;

    // Test keys use "always pass" mode which doesn't fire onVerify.
    // Emit dummy token immediately so forms can proceed without UI.
    if (IS_TEST_KEY) {
      onVerify("TEST_TOKEN_DUMMY");
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => {
        onVerify(token);
      },
      "error-callback": () => {
        setHasError(true);
      },
      "expired-callback": () => {
        widgetIdRef.current = null;
        onExpire?.();
      },
      theme: "light",
      size: "normal",
      tabindex: 0,
      retry: "auto",
      retryInterval: 8000,
    });

    setIsLoaded(false);
  }, [isLoaded, onVerify, onExpire]);

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
