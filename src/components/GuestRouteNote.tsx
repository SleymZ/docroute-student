"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { UserRound } from "lucide-react";

import { signUpHref } from "@/lib/access";
import styles from "./Plus.module.css";

/**
 * Guests see the short route without an account (owner decision
 * 2026-11-17). Their ticks stay in this browser; this note offers a free
 * account to keep them, and sign-up brings them back to the same route.
 */
export function GuestRouteNote() {
  // Read the address on every render: route screens change their query
  // (variant, citizenship) in place, and sign-up must return to the route
  // the guest is looking at now.
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const href = signUpHref(query ? `${pathname}?${query}` : pathname);
  return (
    <div className={styles.feature} data-guest="" data-print-hide="">
      <span className={styles.featureIcon} aria-hidden="true">
        <UserRound size={17} />
      </span>
      <div>
        <strong>Short route, no account needed</strong>
        <p>Ticks stay in this browser only. A free account keeps them on every device.</p>
        <Link href={href} className={styles.featureLink}>
          Create a free account
        </Link>
      </div>
    </div>
  );
}
