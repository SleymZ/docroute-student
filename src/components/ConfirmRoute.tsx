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
  type RoutePurpose,
} from "@/lib/confirmed-route";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loadConfirmedRoute, saveConfirmedRoute } from "@/lib/supabase/confirmed-route";

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

  // Same route, new address (a new move date): keep My route up to date.
  // A pending save is flushed when the page is left or "Open My route" is
  // pressed, so a date changed just before leaving is not lost.
  const pendingSave = useRef<(() => Promise<void>) | null>(null);
  const needsSync =
    state.kind === "ready" &&
    Boolean(confirmed && current && isThis) &&
    (confirmed?.routePath !== current?.routePath || confirmed?.stepIds.join(",") !== stepKey);

  useEffect(() => {
    if (state.kind !== "ready" || !confirmed || !current || !needsSync) {
      pendingSave.current = null;
      return;
    }
    const userId = state.userId;
    const next = { ...confirmed, routePath: current.routePath, stepIds: stepKey ? stepKey.split(",") : [] };
    const save = async () => {
      pendingSave.current = null;
      try {
        const saved = await saveConfirmedRoute(createSupabaseBrowserClient(), userId, next);
        setState({ kind: "ready", userId, confirmed: saved });
      } catch {
        // Kept on this page; the next change tries again.
      }
    };
    pendingSave.current = save;
    const timer = window.setTimeout(() => void save(), 800);
    const flush = () => {
      if (pendingSave.current === save) void save();
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
      // Leaving the page (or a newer date): save what was picked now.
      flush();
    };
  }, [state, confirmed, current?.routePath, needsSync, stepKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
            const save = pendingSave.current;
            if (!save) return;
            event.preventDefault();
            void save().then(() => router.push("/my-route"));
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
