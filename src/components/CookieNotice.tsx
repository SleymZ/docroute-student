"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { COOKIE_NOTICE_STORAGE_KEY } from "@/data/legal";

import styles from "./CookieNotice.module.css";

const CLOSE_EVENT = "docroute-cookie-notice-closed";
let closedThisVisit = false;

function subscribe(onChange: () => void) {
  window.addEventListener(CLOSE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CLOSE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function isClosed() {
  if (closedThisVisit) return true;
  try {
    return window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * A one-time notice, not a consent banner: DocRoute stores only strictly
 * necessary items, which need no consent (see /cookies). It appears until
 * closed and stays closed on this device. The server renders nothing, so
 * the notice never flashes for someone who already closed it.
 */
export function CookieNotice() {
  const closed = useSyncExternalStore(subscribe, isClosed, () => true);

  function close() {
    closedThisVisit = true;
    try {
      window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, "1");
    } catch {
      // Storage unavailable: the notice stays closed for this visit only.
    }
    window.dispatchEvent(new Event(CLOSE_EVENT));
  }

  if (closed) return null;

  return (
    <aside className={styles.notice} aria-label="Cookie notice">
      <p>
        DocRoute uses only necessary cookies and browser storage — to keep you
        signed in and remember your progress. No tracking or ads.{" "}
        <Link href="/cookies">Details</Link>
      </p>
      <button type="button" onClick={close}>
        OK
      </button>
    </aside>
  );
}
