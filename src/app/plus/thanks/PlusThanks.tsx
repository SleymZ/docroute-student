"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

import checkoutStyles from "@/components/PlusCheckout.module.css";
import storyStyles from "@/components/Stories.module.css";
import { contact } from "@/data/legal";
import { refreshAccess, useAccess } from "@/hooks/useAccess";

const POLL_MS = 3000;
const GIVE_UP_MS = 90_000;

/** Waits for the Whop webhook to switch the account to Plus. */
export function PlusThanks() {
  const { tier } = useAccess();
  const [waitedOut, setWaitedOut] = useState(false);

  useEffect(() => {
    if (tier === "plus") return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (Date.now() - started > GIVE_UP_MS) {
        window.clearInterval(timer);
        setWaitedOut(true);
        return;
      }
      void refreshAccess();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [tier]);

  if (tier === "plus") {
    return (
      <div className={checkoutStyles.box}>
        <p className={checkoutStyles.have}>
          <CheckCircle2 size={18} aria-hidden="true" /> Plus is on. Every step, your dates, PDF, PNG and My route are
          open now.
        </p>
        <div className={checkoutStyles.row}>
          <Link href="/home" className={storyStyles.primary}>
            Build my route
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
      <div className={checkoutStyles.box}>
        <p className={checkoutStyles.hint}>Sign in with the account you paid from to see Plus.</p>
        <div className={checkoutStyles.row}>
          <Link href="/auth?mode=login&next=/plus/thanks" className={storyStyles.primary}>
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={checkoutStyles.box} role="status">
      {waitedOut ? (
        <p className={checkoutStyles.hint}>
          Plus has not arrived yet. If the payment went through, it opens on its own within a few minutes; reload
          this page later. If you cancelled the payment, nothing was charged. Questions:{" "}
          <a href={contact.href}>{contact.label}</a>.
        </p>
      ) : (
        <p className={checkoutStyles.have}>
          <LoaderCircle size={18} className={checkoutStyles.spin} aria-hidden="true" /> Waiting for the payment
          confirmation from Whop. This usually takes a few seconds.
        </p>
      )}
      <div className={checkoutStyles.row}>
        <Link href="/plus" className={storyStyles.secondary}>
          Back to Plans
        </Link>
      </div>
    </div>
  );
}
