// Who can use what (owner decision 2026-11-05, full table in docs/ACCESS.md).
//
// - guest: not signed in. Browses universities (Explore, Top 100, university
//   pages) and stories. Any route ("Build my route", every /route/* page,
//   the profile match) asks to sign up first (src/proxy.ts).
// - free: signed in, no Plus. A short plan: only the important steps of every stage
//   are open (the rest are locked cards with no text),
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

/**
 * Free plan: only the important steps of each stage are open (owner decision
 * 2026-11-05). Important means the first step of the stage, which starts it,
 * and every step flagged "Needs attention". The other steps stay in place as
 * locked cards: the visitor sees that a step exists, but its title, text,
 * date and sources are never rendered, so a screenshot shows nothing.
 */
export function isImportantStep(task: { status: string }, index: number): boolean {
  return index === 0 || task.status === "attention";
}

export type StepAccess<T> = { task: T; locked: boolean };

export function stepAccess<T extends { status: string }>(tasks: readonly T[], tier: AccessTier): StepAccess<T>[] {
  const full = canUse(tier, "fullChecklist");
  return tasks.map((task, index) => ({ task, locked: !full && !isImportantStep(task, index) }));
}

export function lockedStepCount(tasks: readonly { status: string }[], tier: AccessTier): number {
  return stepAccess(tasks, tier).filter((item) => item.locked).length;
}

/** Ids of the steps a visitor may read (for sources lists and exports). */
export function openStepIds(stages: readonly { tasks: readonly { id: string; status: string }[] }[], tier: AccessTier): Set<string> {
  return new Set(stages.flatMap((stage) => stepAccess(stage.tasks, tier).filter((item) => !item.locked).map((item) => item.task.id)));
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
