"use client";

import { useEffect, useRef } from "react";

const HCAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ||
  "dcdac736-6afc-4d58-b41e-a630c2762566";

type HCaptchaChallengeProps = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function HCaptchaChallenge({
  onVerify,
  onExpire,
}: HCaptchaChallengeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const renderCaptcha = () => {
      if (!containerRef.current || !window.hcaptcha || widgetIdRef.current) {
        return;
      }

      widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
        sitekey: HCAPTCHA_SITE_KEY,
        callback: onVerify,
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": () => {
          onExpire?.();
        },
      });
    };

    if (window.hcaptcha) {
      renderCaptcha();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.hcaptcha.com/1/api.js?render=explicit"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", renderCaptcha);
      return () => existingScript.removeEventListener("load", renderCaptcha);
    }

    const script = document.createElement("script");
    script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderCaptcha);
    document.body.appendChild(script);

    return () => script.removeEventListener("load", renderCaptcha);
  }, [onExpire, onVerify]);

  return (
    <div className="flex justify-center">
      <div ref={containerRef} />
    </div>
  );
}

export function resetHCaptcha() {
  if (typeof window === "undefined") return;
  window.hcaptcha?.reset();
}
