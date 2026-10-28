/**
 * Facts about who runs DocRoute and on what terms. The Terms of Use,
 * Privacy Policy, Cookie Policy and footer all read from here, so a change
 * (a new contact address, a business registration, paid features) is made
 * once and shows everywhere.
 */

export const legalInfo = {
  /** Full name of the private individual who runs the site. */
  operatorName: "[OWNER FULL NAME]",
  /** Country where the operator lives; Slovak law applies. */
  operatorCountry: "Slovakia",
  /** Address people use for questions, data requests and complaints. */
  contactEmail: "[CONTACT EMAIL]",
  /**
   * DocRoute is run by a private individual as a free, non-commercial
   * beta. There is no business registration (no IČO) and no payment of any
   * kind. When that changes, the terms must be updated before any payment
   * is taken.
   */
  isCommercial: false,
  /** Minimum age to create an account (GDPR digital-consent age in Slovakia). */
  minimumAccountAge: 16,
  /** Date the current versions of the documents take effect. */
  termsUpdated: "2026-10-28",
  privacyUpdated: "2026-10-28",
  cookiesUpdated: "2026-10-28",
  /** Slovak data protection authority, where anyone can complain. */
  supervisoryAuthority: {
    name: "Office for Personal Data Protection of the Slovak Republic (Úrad na ochranu osobných údajov SR)",
    address: "Hraničná 12, 820 07 Bratislava 27, Slovakia",
    url: "https://dataprotection.gov.sk",
  },
} as const;

export const legalPages = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookies" },
] as const;

/**
 * Everything DocRoute keeps in the browser. Only strictly necessary items:
 * no analytics, advertising or third-party tracking. The Cookie Policy
 * renders this list, so it must stay in sync with the code (tests check the
 * keys against the source).
 */
export const browserStorageItems = [
  {
    name: "sb-<project>-auth-token (may be split into .0, .1 …)",
    kind: "Cookie (first-party)",
    purpose:
      "Keeps you signed in and lets the server load your own profile. Set only when you sign in.",
    duration: "Until you sign out; at most 400 days",
  },
  {
    name: "sb-<project>-auth-token-code-verifier",
    kind: "Cookie (first-party)",
    purpose:
      "Protects the sign-in with Google or an email link from being hijacked. Used only during sign-in.",
    duration: "Removed once sign-in finishes",
  },
  {
    name: "docroute-theme",
    kind: "Local storage",
    purpose: "Remembers light or dark mode if you choose one.",
    duration: "Until you clear site data",
  },
  {
    name: "docroute:saved-universities:… and docroute:route-progress:…",
    kind: "Local storage",
    purpose:
      "Remembers universities you saved and route tasks you ticked off, on this device, when you are not signed in.",
    duration: "Until you clear site data or sign in (then moved to your account)",
  },
  {
    name: "docroute-cookie-notice",
    kind: "Local storage",
    purpose: "Remembers that you closed the cookie notice.",
    duration: "Until you clear site data",
  },
] as const;

export const COOKIE_NOTICE_STORAGE_KEY = "docroute-cookie-notice";
