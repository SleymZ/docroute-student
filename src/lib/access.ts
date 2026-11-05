// Who can use what (owner decision 2026-11-05, full table in docs/ACCESS.md).
//
// - guest: not signed in. Browses universities (Explore, Top 100, university
//   pages) and stories. Any route ("Build my route", every /route/* page,
//   the profile match) asks to sign up first (src/proxy.ts).
// - free: signed in, no Plus. A short plan: the first steps of every stage,
//   no dates or deadline planner, no PDF/PNG, no email reminders, no saving
//   to My route.
// - plus: everything: the full checklist, own move date and deadline
//   planner, My route, PDF and PNG, email reminders.
//
// Until payments exist the owner grants Plus by SQL (table account_plans).

export type AccessTier = "guest" | "free" | "plus";

export type PlanFeature =
  | "browse"
  | "buildRoute"
  | "fullChecklist"
  | "dates"
  | "saveMyRoute"
  | "exportFiles"
  | "emailReminders";

const featureTiers: Record<PlanFeature, readonly AccessTier[]> = {
  browse: ["guest", "free", "plus"],
  buildRoute: ["free", "plus"],
  fullChecklist: ["plus"],
  dates: ["plus"],
  saveMyRoute: ["plus"],
  exportFiles: ["plus"],
  emailReminders: ["plus"],
};

export function canUse(tier: AccessTier, feature: PlanFeature): boolean {
  return featureTiers[feature].includes(tier);
}

/** Steps a Free plan shows from each stage; the rest is a Plus teaser. */
export const FREE_STEPS_PER_STAGE = 2;

export function limitTasks<T>(tasks: readonly T[], tier: AccessTier): { shown: T[]; hidden: number } {
  if (canUse(tier, "fullChecklist")) return { shown: [...tasks], hidden: 0 };
  const shown = tasks.slice(0, FREE_STEPS_PER_STAGE);
  return { shown, hidden: tasks.length - shown.length };
}

export type PlanRow = {
  plan: "free" | "plus";
  plus_until: string | null;
};

/** Plus only while the row says plus and the end date (if any) is ahead. */
export function tierFromPlan(row: PlanRow | null | undefined, now: Date = new Date()): "free" | "plus" {
  if (!row || row.plan !== "plus") return "free";
  if (row.plus_until && new Date(row.plus_until).getTime() <= now.getTime()) return "free";
  return "plus";
}

/**
 * Paths a guest cannot open: building a route needs an account. Everything
 * else (home, Explore, Top 100, university pages, stories, legal pages)
 * stays public.
 */
export function needsAccount(pathname: string): boolean {
  return (
    pathname === "/route" ||
    pathname.startsWith("/route/") ||
    pathname === "/explore/profile" ||
    pathname === "/my-route" ||
    pathname === "/stories/new"
  );
}

export function signUpHref(nextPath: string): string {
  return `/auth?${new URLSearchParams({ mode: "signup", next: nextPath }).toString()}`;
}

export const planNames: Record<AccessTier, string> = {
  guest: "Guest",
  free: "Free",
  plus: "Plus",
};
