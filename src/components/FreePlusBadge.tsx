import Link from "next/link";
import { Sparkles } from "lucide-react";

import { FREE_PLUS_LAST_DAY, freePlusActive } from "@/lib/access";

import styles from "./FreePlusBadge.module.css";

/** The free Plus month, as a link to /plus (owner decision 2026-11-18, for
 *  promotion). Renders nothing once the month is over. */
export function FreePlusBadge({ className = "" }: { className?: string }) {
  if (!freePlusActive()) return null;
  return (
    <Link href="/plus" className={`${styles.badge} ${className}`}>
      <Sparkles size={15} aria-hidden="true" />
      <span>Plus is free for every account until {FREE_PLUS_LAST_DAY}</span>
    </Link>
  );
}
