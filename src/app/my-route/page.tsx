import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck2, Compass, ListChecks, MapPinned } from "lucide-react";

import { Header } from "@/components/Header";
import { PlusFeature } from "@/components/Plus";
import { tierFromPlan } from "@/lib/access";
import { RemoveMyRoute } from "@/components/RemoveMyRoute";
import storyStyles from "@/components/Stories.module.css";
import { normaliseRoutePath, purposeLabels } from "@/lib/confirmed-route";
import { formatPlanDate } from "@/lib/residence/deadlines";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { countCompletedSteps, loadConfirmedRoute } from "@/lib/supabase/confirmed-route";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import styles from "./MyRoute.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My route",
  robots: { index: false, follow: false },
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export default async function MyRoutePage() {
  if (!isSupabaseConfigured()) redirect("/home");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=login&next=/my-route");

  // My route is a Plus feature; without Plus the empty state explains it.
  const { data: planRow } = await supabase
    .from("account_plans")
    .select("plan, plus_until")
    .eq("user_id", user.id)
    .maybeSingle();
  const plus = tierFromPlan(planRow) === "plus";

  let failed = false;
  let route: Awaited<ReturnType<typeof loadConfirmedRoute>> = null;
  let done = 0;
  try {
    route = await loadConfirmedRoute(supabase, user.id);
    if (route?.routeKey) done = await countCompletedSteps(supabase, user.id, route.routeKey, route.stepIds);
  } catch {
    failed = true;
  }

  // Only our own route pages are opened from here (the database checks the
  // same rule).
  const href = route ? normaliseRoutePath(route.routePath) : null;
  const total = route && route.stepIds.length > 0 ? route.stepIds.length : null;
  const progress = total ? Math.min(100, Math.round((done / total) * 100)) : null;
  const moveDate = href ? new URL(href, "https://docroute.invalid").searchParams.get("move") : null;

  return (
    <main>
      <Header />
      <div className={storyStyles.page}>
        <header className={storyStyles.hero}>
          <div>
            <p className={storyStyles.eyebrow}>MY ROUTE</p>
            <h1>
              The route you <span>confirmed.</span>
            </h1>
            <p className={storyStyles.lead}>
              Open it any time to continue: ticks and the move date are saved with your account.
            </p>
          </div>
        </header>

        {failed ? (
          <p className={storyStyles.notice}>My route could not be loaded. Reload the page in a moment.</p>
        ) : (!route || !href) && !plus ? (
          <section className={storyStyles.empty}>
            <h2>My route is part of Plus</h2>
            <PlusFeature feature="save" />
          </section>
        ) : !route || !href ? (
          <section className={storyStyles.empty}>
            <h2>No confirmed route yet</h2>
            <p>
              Build a route, then press <strong>Confirm this route</strong> at the top of it. It will appear here.
            </p>
            <div className={styles.emptyActions}>
              <Link href="/home#route-builder" className={storyStyles.primary}>
                <Compass size={16} aria-hidden="true" />
                Build my route
              </Link>
              <Link href="/route/guide" className={storyStyles.secondary}>
                <MapPinned size={16} aria-hidden="true" />
                Residence guides
              </Link>
            </div>
          </section>
        ) : (
          <article className={styles.card}>
            <div className={styles.tags}>
              <span>{purposeLabels[route.purpose]}</span>
              <span>{regionNames.of(route.countryCode) ?? route.countryCode}</span>
            </div>
            <h2>{route.title}</h2>

            <dl className={styles.facts}>
              <div>
                <dt>
                  <CalendarCheck2 size={15} aria-hidden="true" /> Confirmed
                </dt>
                <dd>{formatPlanDate(route.confirmedAt.slice(0, 10))}</dd>
              </div>
              {moveDate && (
                <div>
                  <dt>
                    <MapPinned size={15} aria-hidden="true" /> Move date
                  </dt>
                  <dd>{formatPlanDate(moveDate)}</dd>
                </div>
              )}
              {total !== null && route.routeKey && (
                <div>
                  <dt>
                    <ListChecks size={15} aria-hidden="true" /> Progress
                  </dt>
                  <dd>
                    {done} of {total} steps done
                  </dd>
                </div>
              )}
            </dl>

            {progress !== null && (
              <div className={styles.bar} aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            )}

            <div className={styles.actions}>
              <Link href={href} className={storyStyles.primary}>
                Open my route
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <RemoveMyRoute userId={user.id} />
            </div>
            <p className={styles.hint}>
              To switch to another route, open it and press <strong>Confirm this route</strong>; it replaces this one.
              Rules can change: each step shows its official source and the date DocRoute checked it.
            </p>
          </article>
        )}
      </div>
    </main>
  );
}
