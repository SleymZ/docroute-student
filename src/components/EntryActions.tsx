"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CircleUserRound, LogIn } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import styles from "./EntryScreen.module.css";

const SITE_PATH = "/home";
// How long the leaving animation plays before the site opens.
const LEAVE_MS = 1150;

/** "Start your journey": plays the leaving animation, then opens the site.
 *  It is a normal link, so it also works without JavaScript, in a new tab
 *  and with reduced motion (then it opens at once). */
export function EnterButton() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(SITE_PATH);
  }, [router]);

  function enter(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    event.preventDefault();
    const root = event.currentTarget.closest<HTMLElement>("[data-entry]");
    root?.setAttribute("data-leaving", "true");
    window.setTimeout(() => router.push(SITE_PATH), LEAVE_MS);
  }

  return (
    <Link href={SITE_PATH} className={styles.enter} onClick={enter}>
      Start your journey
      <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
    </Link>
  );
}

/** Log in, or a link to the profile when already signed in. */
export function EntryAccountLink() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    void createSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (active) setSignedIn(Boolean(data.session?.user));
      });
    return () => {
      active = false;
    };
  }, []);

  return signedIn ? (
    <Link href="/account" className={styles.account}>
      <CircleUserRound size={17} aria-hidden="true" />
      My profile
    </Link>
  ) : (
    <Link href={`/auth?mode=login&next=${SITE_PATH}`} className={styles.account}>
      <LogIn size={16} aria-hidden="true" />
      Log in
    </Link>
  );
}
