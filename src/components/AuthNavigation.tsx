"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleUserRound,
  LogIn,
} from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import styles from "./Header.module.css";

export function AuthNavigation() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setSignedIn(Boolean(data.user));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={styles.actions}>
      {signedIn ? (
        <Link href="/account" className={styles.login}>
          <CircleUserRound size={17} aria-hidden="true" />
          <span>My profile</span>
        </Link>
      ) : (
        <Link href="/auth?mode=login" className={styles.login}>
          <LogIn size={16} aria-hidden="true" />
          <span>Log in</span>
        </Link>
      )}

      <Link
        href="/#route-builder"
        className={styles.buildRoute}
      >
        <span>Build my route</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}
