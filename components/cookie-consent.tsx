"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_KEY = "yuubin-cookie-consent";
const DISMISSED_KEY = "yuubin-cookie-consent-dismissed";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isAuthPage = pathname.startsWith("/auth");
    const hasConsent = window.localStorage.getItem(CONSENT_KEY) !== null;
    const dismissedForSession =
      window.sessionStorage.getItem(DISMISSED_KEY) === "true";

    setVisible(!isAuthPage && !hasConsent && !dismissedForSession);
  }, [pathname]);

  const saveConsent = (value: "accepted" | "essential") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  const dismissForSession = () => {
    window.sessionStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-sm border border-border bg-card p-3 shadow-xl">
      <button
        type="button"
        onClick={dismissForSession}
        aria-label="Close cookie consent"
        className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-3 pr-7 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-serif text-base font-bold text-foreground">
            Cookie Consent
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Yuubin uses essential cookies and browser storage for login sessions,
            security, theme preferences, and remembering your sign-in choice.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => saveConsent("essential")}
            className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => saveConsent("accepted")}
            className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
