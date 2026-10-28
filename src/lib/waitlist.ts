/**
 * Waitlist for the full route ("I want the full route"). People leave an
 * email with explicit consent (GDPR Art. 6(1)(a) and 7). The table only
 * accepts inserts from the site; nobody can read it through the API — the
 * operator reads it in the Supabase dashboard.
 *
 * Kept free of Supabase imports so the rules can be unit-tested.
 */

/** Routes a signup can come from; the database checks the same list. */
export const waitlistRoutes = ["study-sk", "study-cz", "work-sk", "work-cz"] as const;
export type WaitlistRoute = (typeof waitlistRoutes)[number];

/**
 * Version of the consent wording below. Stored with every signup so we can
 * show what the person agreed to (Art. 7(1)). Change it whenever the
 * wording changes.
 */
export const WAITLIST_CONSENT_VERSION = "2026-10-28";

/** How long an entry may be kept at most, in months (also in the policy). */
export const WAITLIST_MAX_MONTHS = 12;

/** Postgres error code for a unique violation: the email is already listed. */
const UNIQUE_VIOLATION = "23505";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * A deliberately simple check (one "@", a dot in the domain, no spaces, at
 * most 254 characters). The database applies the same rule.
 */
export function isValidEmail(value: string) {
  const email = normalizeEmail(value);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type WaitlistInsert = {
  email: string;
  route: WaitlistRoute;
  consent_version: string;
};

export function buildWaitlistInsert(
  email: string,
  route: WaitlistRoute,
): WaitlistInsert {
  return {
    email: normalizeEmail(email),
    route,
    consent_version: WAITLIST_CONSENT_VERSION,
  };
}

/**
 * Turns the insert result into what the person sees. A duplicate counts
 * as success, so the form never reveals whether an address is listed.
 */
export function waitlistOutcome(
  error: { code?: string } | null,
): "joined" | "failed" {
  if (!error || error.code === UNIQUE_VIOLATION) return "joined";
  return "failed";
}
