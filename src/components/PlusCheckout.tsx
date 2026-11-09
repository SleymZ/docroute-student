"use client";

import Link from "next/link";
import { useState } from "react";
import { CreditCard, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";

import { useAccess } from "@/hooks/useAccess";
import storyStyles from "./Stories.module.css";
import styles from "./PlusCheckout.module.css";

type CheckoutError = "consent-required" | "sign-in-required" | "already-plus" | "payments-off" | "checkout-failed" | "offline";

const errorText: Record<CheckoutError, string> = {
  "consent-required": "Tick the box above to continue.",
  "sign-in-required": "Your session has ended. Sign in again, then come back to this page.",
  "already-plus": "This account already has Plus.",
  "payments-off": "Payments are switched off right now. Please try again later.",
  "checkout-failed": "The payment page could not be opened. Please try again in a minute.",
  offline: "No connection. Check your internet and try again.",
};

/** Buying Plus on /plus: sign-up first, then one consent box and a button
 *  that opens Whop's own checkout. Card details never touch DocRoute. */
export function PlusCheckout({ price, ordersUrl }: { price: string | null; ordersUrl: string }) {
  const { tier, loading } = useAccess();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);
  const [manageUrl, setManageUrl] = useState<string | null>(null);

  if (loading) {
    return (
      <div className={styles.box} aria-busy="true">
        <LoaderCircle size={18} className={styles.spin} aria-hidden="true" />
      </div>
    );
  }

  if (tier === "plus") {
    return (
      <div className={styles.box}>
        <p className={styles.have}>
          <Sparkles size={16} aria-hidden="true" /> You have Plus. Every step, date and export is open.
        </p>
        <div className={styles.row}>
          <Link href="/home" className={storyStyles.primary}>
            Go to my routes
          </Link>
          <Link href="/account" className={storyStyles.secondary}>
            My plan
          </Link>
        </div>
      </div>
    );
  }

  if (tier === "guest") {
    return (
      <div className={styles.box}>
        {price && <p className={styles.price}>{price}</p>}
        <p className={styles.hint}>Plus is tied to your DocRoute account. Create a free account or sign in first.</p>
        <div className={styles.row}>
          <Link href="/auth?mode=signup&next=/plus" className={storyStyles.primary}>
            Create a free account
          </Link>
          <Link href="/auth?mode=login&next=/plus" className={storyStyles.secondary}>
            Log in
          </Link>
        </div>
      </div>
    );
  }

  async function startCheckout() {
    if (!consent) {
      setError("consent-required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true }),
      });
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: CheckoutError; manageUrl?: string | null };
      if (response.ok && body.url) {
        window.location.assign(body.url);
        return;
      }
      if (body.error === "already-plus") setManageUrl(body.manageUrl ?? null);
      setError(body.error && body.error in errorText ? body.error : "checkout-failed");
    } catch {
      setError("offline");
    }
    setBusy(false);
  }

  return (
    <div className={styles.box}>
      {price && <p className={styles.price}>{price}</p>}
      <label className={styles.consent}>
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>
          I want Plus to start as soon as I pay. I understand that once it has started I lose my 14-day right of
          withdrawal. I have read the <Link href="/terms#plus">Terms of Use</Link>.
        </span>
      </label>
      <div className={styles.row}>
        <button type="button" className={storyStyles.primary} onClick={startCheckout} disabled={busy}>
          {busy ? <LoaderCircle size={16} className={styles.spin} aria-hidden="true" /> : <CreditCard size={16} aria-hidden="true" />}
          Continue to payment
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {errorText[error]}
          {error === "already-plus" && (
            <>
              {" "}
              <a href={manageUrl ?? ordersUrl} target="_blank" rel="noreferrer">
                Manage it on Whop
              </a>
            </>
          )}
        </p>
      )}
      <p className={styles.fine}>
        <ShieldCheck size={14} aria-hidden="true" />
        <span>
          Payment, VAT and the receipt are handled by Whop, our payment provider and merchant of record. You can
          cancel any time in your Whop orders; Plus stays open until the paid period ends.
        </span>
      </p>
    </div>
  );
}
