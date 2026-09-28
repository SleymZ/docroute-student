"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "@/app/account/AccountPage.module.css";

export function AccountSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createSupabaseBrowserClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      className={styles.signOut}
      disabled={busy}
      onClick={signOut}
    >
      <LogOut size={16} aria-hidden="true" />
      {busy ? "Signing out..." : "Log out"}
    </button>
  );
}