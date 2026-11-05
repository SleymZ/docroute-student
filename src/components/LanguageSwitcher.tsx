"use client";

import { Languages } from "lucide-react";

import { LOCALES, LOCALE_NAMES, isLocale } from "@/i18n/config";
import { setLocaleCookie, useLocale } from "@/i18n/client";

import styles from "./LanguageSwitcher.module.css";

// Site language (owner decision 2026-11-05). The choice is kept in a
// cookie and the page reloads in the new language; addresses stay the same.
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  return (
    <label className={compact ? `${styles.switcher} ${styles.compact}` : styles.switcher}>
      <Languages size={15} strokeWidth={1.8} aria-hidden="true" />
      <span className={styles.visuallyHidden}>Language</span>
      <select
        className={styles.select}
        value={locale}
        onChange={(event) => {
          const next = event.target.value;
          if (!isLocale(next) || next === locale) return;
          setLocaleCookie(next);
          window.location.reload();
        }}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} lang={code} translate="no">
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
