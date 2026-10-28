"use client";

import { useEffect } from "react";

import { ANALYTICS_SCRIPT_SRC, prepareAnalyticsEvent } from "@/lib/analytics";
import { hasOptionalConsent, subscribeCookieConsent } from "@/lib/cookie-consent";

type VaQueue = ((...args: unknown[]) => void) & { q?: unknown[] };

declare global {
  interface Window {
    va?: VaQueue;
    vaq?: unknown[][];
  }
}

function load() {
  if (document.querySelector(`script[src="${ANALYTICS_SCRIPT_SRC}"]`)) return;
  window.va =
    window.va ||
    function (...args: unknown[]) {
      (window.vaq = window.vaq || []).push(args);
    };
  // Re-checks consent on every event, so "Necessary only" later stops
  // sending even though the script stays loaded until the next page load.
  window.va("beforeSend", (event: { url: string }) =>
    prepareAnalyticsEvent(event, hasOptionalConsent()),
  );
  const script = document.createElement("script");
  script.src = ANALYTICS_SCRIPT_SRC;
  script.defer = true;
  document.head.appendChild(script);
}

/**
 * Loads visit statistics only when the visitor chose "Accept all" on the
 * cookie banner (or on /cookies), and only on the production site.
 */
export function ConsentedAnalytics() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") return;
    const check = () => {
      if (hasOptionalConsent()) load();
    };
    check();
    return subscribeCookieConsent(check);
  }, []);

  return null;
}
