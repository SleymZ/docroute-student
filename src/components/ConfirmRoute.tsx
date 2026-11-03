"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LogIn, MapPinned, RefreshCw } from "lucide-react";

import {
  clampTitle,
  isSameRoute,
  myRouteLoginHref,
  normaliseRoutePath,
  type ConfirmedRoute,
  type ConfirmedRouteInput,
  type RoutePurpose,
} from "@/lib/confirmed-route";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  loadConfirmedRoute,
  saveConfirmedRoute,
  updateConfirmedRouteIfUnchanged,
} from "@/lib/supabase/confirmed-route";

import styles from "./ConfirmRoute.module.css";

type ConfirmRouteProps = {
  title: string;
  purpose: RoutePurpose;
  countryCode: string;
  routeKey: string | null;
  stepIds: string[];
  /** The address to store when it differs from the page address (answers
   *  taken from the saved profile are written into it). */
  routePath?: string | null;
};

type State =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "ready"; userId: string; confirmed: ConfirmedRoute | null }
  | { kind: "error"; userId: string | null };

// "Confirm this route" on every route page. Confirming needs an account: the
// route is then listed on /my-route ("My route") and can be reopened any time.
// One confirmed route per account; confirming another replaces it.
export function ConfirmRoute({ title, purpose, countryCode, routeKey, stepIds, routePath: pathOverride }: ConfirmRouteProps) {
  const stepKey = stepIds.join(",");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routePath = useMemo(
    () =>
      normaliseRoutePath(
        pathOverride ?? `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`,
      ),
    [pathOverride, pathname, searchParams],
  );
  const [state, setState] = useState<State>({ kind: "loading" });
  const [saving, setSaving] = useState(false);
  const [askReplace, setAskReplace] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ kind: "signed-out" });
      return;
    }
    const supabase = createSupabaseBrowserClient();
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setState({ kind: "signed-out" });
        return;
      }
      try {
        const confirmed = await loadConfirmedRoute(supabase, data.user.id);
        if (active) setState({ kind: "ready", userId: data.user.id, confirmed });
      } catch {
        if (active) setState({ kind: "error", userId: data.user.id });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const current = routePath ? { routePath, routeKey } : null;
  const confirmed = state.kind === "ready" ? state.confirmed : null;
  const isThis = Boolean(current && isSameRoute(confirmed, current));

  // Same route, new address (a new move date) or a new checklist version:
  // keep My route up to date. Saves run one after another (a slow older
  // request can never overwrite a newer date), and the latest pending save is
  // flushed when the page is left or "Open My route" is pressed.
  const pendingPayload = useRef<{ userId: string; route: ConfirmedRouteInput } | null>(null);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const needsSync =
    state.kind === "ready" &&
    Boolean(confirmed && current && isThis) &&
    (confirmed?.routePath !== current?.routePath ||
      confirmed?.routeKey !== routeKey ||
      confirmed?.stepIds.join(",") !== stepKey);

  // The stored address as last seen by this page; background saves only apply
  // while the row still has it.
  const storedPath = useRef<string | null>(null);
  if (confirmed && storedPath.current === null) storedPath.current = confirmed.routePath;

  function flushSave() {
    const payload = pendingPayload.current;
    if (payload) {
      pendingPayload.current = null;
      saveChain.current = saveChain.current.then(async () => {
        const expected = storedPath.current;
        if (!expected) return;
        try {
          const saved = await updateConfirmedRouteIfUnchanged(
            createSupabaseBrowserClient(),
            payload.userId,
            expected,
            payload.route,
          );
          // null: another route was confirmed meanwhile (here or on another
          // page); leave it alone and show what is stored now.
          const stored =
            saved ?? (await loadConfirmedRoute(createSupabaseBrowserClient(), payload.userId));
          storedPath.current = stored?.routePath ?? null;
          setState((previous) =>
            previous.kind === "ready" ? { kind: "ready", userId: payload.userId, confirmed: stored } : previous,
          );
        } catch {
          // Kept on this page; the next change tries again.
        }
      });
    }
    return saveChain.current;
  }

  useEffect(() => {
    if (state.kind !== "ready" || !confirmed || !current || !needsSync) {
      pendingPayload.current = null;
      return;
    }
    pendingPayload.current = {
      userId: state.userId,
      route: {
        ...confirmed,
        routePath: current.routePath,
        routeKey,
        stepIds: stepKey ? stepKey.split(",") : [],
      },
    };
    const timer = window.setTimeout(() => void flushSave(), 800);
    return () => window.clearTimeout(timer);
  }, [state, confirmed, current?.routePath, routeKey, needsSync, stepKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leaving the page: save what was picked, without waiting for the timer.
  useEffect(() => {
    const onHide = () => void flushSave();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      void flushSave();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!routePath || state.kind === "loading") {
    return <div className={styles.box} data-loading="true" aria-hidden="true" />;
  }

  async function confirm() {
    if (state.kind !== "ready" || !current) return;
    setSaving(true);
    setMessage(null);
    try {
      const saved = await saveConfirmedRoute(createSupabaseBrowserClient(), state.userId, {
        routePath: current.routePath,
        routeKey,
        title: clampTitle(title),
        purpose,
        countryCode,
        stepIds,
      });
      storedPath.current = saved.routePath;
      setState({ kind: "ready", userId: state.userId, confirmed: saved });
      setAskReplace(false);
    } catch {
      setMessage("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (state.kind === "signed-out") {
    return (
      <section className={styles.box} aria-label="Confirm this route">
        <span className={styles.icon}>
          <MapPinned size={18} aria-hidden="true" />
        </span>
        <div className={styles.copy}>
          <strong>Is this your route?</strong>
          <p>Confirm it to keep it in My route and come back to it any time. Confirming needs a free account.</p>
        </div>
        <Link href={myRouteLoginHref(routePath)} className={styles.primary}>
          <LogIn size={15} aria-hidden="true" />
          Sign up to confirm
        </Link>
      </section>
    );
  }

  if (state.kind === "error") {
    return (
      <section className={styles.box} aria-label="Confirm this route">
        <div className={styles.copy}>
          <strong>My route is unavailable right now</strong>
          <p>Your progress on this page is still saved. Try again later.</p>
        </div>
      </section>
    );
  }

  if (isThis) {
    return (
      <section className={styles.box} data-confirmed="true" aria-label="Your confirmed route">
        <span className={styles.icon}>
          <CheckCircle2 size={18} aria-hidden="true" />
        </span>
        <div className={styles.copy}>
          <strong>This is your confirmed route</strong>
          <p>It is saved in My route. Changes to the move date are saved there too.</p>
        </div>
        <Link
          href="/my-route"
          className={styles.secondary}
          onClick={(event) => {
            // Wait for pending and running saves so My route shows the new date.
            event.preventDefault();
            void flushSave().then(() => router.push("/my-route"));
          }}
        >
          Open My route
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.box} aria-label="Confirm this route">
      <span className={styles.icon}>
        <MapPinned size={18} aria-hidden="true" />
      </span>
      <div className={styles.copy}>
        <strong>Is this your route?</strong>
        {askReplace && confirmed ? (
          <p>
            You already confirmed <b>{confirmed.title}</b>. Confirming this one replaces it in My route. Ticks you
            made there stay saved.
          </p>
        ) : (
          <p>Confirm it to keep it in My route and come back to it any time.</p>
        )}
        {message && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        {askReplace && (
          <button type="button" className={styles.secondary} onClick={() => setAskReplace(false)}>
            Keep the old one
          </button>
        )}
        <button
          type="button"
          className={styles.primary}
          disabled={saving}
          onClick={() => (confirmed && !askReplace ? setAskReplace(true) : void confirm())}
        >
          {confirmed && !askReplace ? (
            <RefreshCw size={15} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={15} aria-hidden="true" />
          )}
          {saving ? "Saving…" : askReplace ? "Replace my route" : "Confirm this route"}
        </button>
      </div>
    </section>
  );
}
