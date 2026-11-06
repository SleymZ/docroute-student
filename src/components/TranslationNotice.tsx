"use client";

import { useLocale } from "@/i18n/client";

import styles from "./SiteFooter.module.css";

// Shown in every language but English: the interface is translated, while
// part of the official data (route steps, programmes, legal pages) is still
// shown as published, in English. Kept until the catalogs cover them.
export function TranslationNotice() {
  const locale = useLocale();
  if (locale === "en") return null;
  return (
    <p className={styles.translation}>
      The interface is translated. Some official details (requirements, programmes, legal pages) are still shown in
      English, as published. The English text and the linked official sources prevail.
    </p>
  );
}
