"use client";

import { useSyncExternalStore } from "react";

import {
  readCookieConsent,
  saveCookieConsent,
  subscribeCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

import styles from "./CookieNotice.module.css";

const labels: Record<CookieConsent, string> = {
  all: "Accept all",
  necessary: "Necessary only",
};

/** Lets a visitor see and change their cookie choice at any time. */
export function CookieSettings() {
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    readCookieConsent,
    () => null,
  );

  return (
    <div>
      <p role="status">
        Your current choice:{" "}
        <strong>{consent ? labels[consent] : "not chosen yet"}</strong>.
      </p>
      <div className={styles.buttons} style={{ maxWidth: 420 }}>
        <button type="button" onClick={() => saveCookieConsent("necessary")}>
          {labels.necessary}
        </button>
        <button type="button" onClick={() => saveCookieConsent("all")}>
          {labels.all}
        </button>
      </div>
    </div>
  );
}
