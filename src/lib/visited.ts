// Remembers that this browser has opened DocRoute before, so the entry page
// at / is shown only on the first visit. Strictly necessary: it only
// decides which page opens, holds no identifier and is listed in the
// Cookie Policy (src/data/legal.ts).
export const VISITED_COOKIE = "docroute-visited";
// One year, in seconds.
export const VISITED_MAX_AGE = 60 * 60 * 24 * 365;

/** Supabase keeps the session in `sb-<project>-auth-token`, possibly split
 *  into `.0`, `.1` …; the short-lived code verifier does not count. */
export function hasAuthCookie(names: readonly string[]) {
  return names.some((name) => /^sb-.+-auth-token(\.\d+)?$/.test(name));
}
