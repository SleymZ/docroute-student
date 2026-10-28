"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  readCookieConsent,
  saveCookieConsent,
  subscribeCookieConsent,
} from "@/lib/cookie-consent";

import styles from "./CookieNotice.module.css";

/**
 * Cookie choice shown until the visitor picks one. Both buttons have the
 * same weight, so refusing is as easy as accepting. The server renders
 * nothing, so the banner never flashes for someone who already chose.
 */
export function CookieNotice() {
  const chosen = useSyncExternalStore(
    subscribeCookieConsent,
    () => readCookieConsent() !== null,
    () => true,
  );

  if (chosen) return null;

  return (
    <aside
      className={styles.notice}
      aria-labelledby="cookie-notice-title"
      role="region"
    >
      <div className={styles.text}>
        <p id="cookie-notice-title" className={styles.title}>
          Cookies on DocRoute
        </p>
        <p>
          We use necessary cookies to keep you signed in and remember your
          progress. With your permission we may later add privacy-friendly
          statistics to improve the site; today nothing optional is used. No
          ads, no tracking. <Link href="/cookies">Details and settings</Link>
        </p>
      </div>
      <div className={styles.buttons}>
        <button type="button" onClick={() => saveCookieConsent("necessary")}>
          Necessary only
        </button>
        <button type="button" onClick={() => saveCookieConsent("all")}>
          Accept all
        </button>
      </div>
    </aside>
  );
}
