/**
 * The visitor's cookie choice. Today DocRoute stores only strictly
 * necessary items, so both choices behave the same. Any optional tool
 * added later (analytics, embeds) must check `hasOptionalConsent()` first
 * and load only when it returns true.
 */

export type CookieConsent = "all" | "necessary";

export const COOKIE_CONSENT_STORAGE_KEY = "docroute-cookie-consent";
export const COOKIE_CONSENT_EVENT = "docroute-cookie-consent-change";

export function parseCookieConsent(value: string | null): CookieConsent | null {
  return value === "all" || value === "necessary" ? value : null;
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    return parseCookieConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
    );
  } catch {
    return memoryConsent;
  }
}

let memoryConsent: CookieConsent | null = null;

export function saveCookieConsent(consent: CookieConsent) {
  memoryConsent = consent;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, consent);
  } catch {
    // Storage unavailable: the choice lasts for this visit only.
  }
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function hasOptionalConsent() {
  return readCookieConsent() === "all";
}

export function subscribeCookieConsent(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
