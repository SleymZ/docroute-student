// "My route": the one route a signed-in person has confirmed. The route page
// address is stored as-is (path + answers in the query), so /my-route can
// reopen exactly that route with its move date.

export type RoutePurpose = "study" | "work" | "family" | "business";

export type ConfirmedRouteInput = {
  routePath: string;
  routeKey: string | null;
  title: string;
  purpose: RoutePurpose;
  countryCode: string;
  /** Actionable task ids of the confirmed checklist (for "X of Y done"). */
  stepIds: string[];
};

export type ConfirmedRoute = ConfirmedRouteInput & {
  confirmedAt: string;
  updatedAt: string;
};

export const purposeLabels: Record<RoutePurpose, string> = {
  study: "Study",
  work: "Work",
  family: "Family",
  business: "Business",
};

const internalOrigin = "https://docroute.invalid";

/** The stored route address, or null when it is not one of our route pages.
 *  Mirrors the database check (starts with /route/, no "//", "\\" or spaces). */
export function normaliseRoutePath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/route/") || value.includes("\\") || value.includes("//")) {
    return null;
  }
  if (/\s/.test(value)) return null;
  try {
    const url = new URL(value, internalOrigin);
    if (url.origin !== internalOrigin || !url.pathname.startsWith("/route/")) return null;
    // Page-only switches are not part of the route.
    url.searchParams.delete("edit");
    url.searchParams.delete("confirm");
    const search = url.searchParams.toString();
    const path = `${url.pathname}${search ? `?${search}` : ""}`;
    return path.length >= 8 && path.length <= 2000 ? path : null;
  } catch {
    return null;
  }
}

/** The route without its move date: the answers that define the route
 *  (citizenship, status, programme…). */
export function routeIdentity(routePath: string) {
  const url = new URL(routePath, internalOrigin);
  url.searchParams.delete("move");
  url.searchParams.delete("edit");
  url.searchParams.delete("confirm");
  url.searchParams.sort();
  return `${url.pathname}?${url.searchParams.toString()}`;
}

/** Whether the page shows the confirmed route. Every answer in the address
 *  counts (a guide with another citizenship is another route, even though
 *  its progress key is the same); only the move date may differ, and it is
 *  saved again. */
export function isSameRoute(
  confirmed: Pick<ConfirmedRouteInput, "routePath"> | null,
  current: Pick<ConfirmedRouteInput, "routePath">,
) {
  if (!confirmed) return false;
  return routeIdentity(confirmed.routePath) === routeIdentity(current.routePath);
}

export function myRouteLoginHref(returnPath: string) {
  return `/auth?mode=signup&next=${encodeURIComponent(returnPath)}`;
}

export function clampTitle(title: string) {
  const clean = title.replace(/\s+/g, " ").trim();
  return clean.length > 160 ? `${clean.slice(0, 157)}…` : clean || "My route";
}
