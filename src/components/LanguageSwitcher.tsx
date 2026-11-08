"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";

import { LOCALES, LOCALE_NAMES, isLocale, type Locale } from "@/i18n/config";
import { setLocaleCookie, useLocale } from "@/i18n/client";
import { flagSrc } from "@/lib/flags";

import styles from "./LanguageSwitcher.module.css";

/** Flag shown next to each language (a country where it is spoken). */
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "GB",
  ru: "RU",
  es: "ES",
  zh: "CN",
  hi: "IN",
};

// Site language (owner decision 2026-11-05). The choice is kept in a
// cookie and the page reloads in the new language; addresses stay the same.
// A button with the flag and the language name opens a short list; the
// footer copy opens upwards so it never runs off the page.
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.focus();
  }, [open, active, listId]);

  function openList() {
    setActive(Math.max(0, LOCALES.indexOf(locale)));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(next: string) {
    if (!isLocale(next) || next === locale) {
      close();
      return;
    }
    setLocaleCookie(next);
    window.location.reload();
  }

  function onListKey(event: KeyboardEvent<HTMLDivElement>) {
    const last = LOCALES.length - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + LOCALES.length) % LOCALES.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : last);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${compact ? styles.compact : styles.footer}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Language: ${LOCALE_NAMES[locale]}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            openList();
          }
        }}
      >
        <Image
          src={flagSrc(LOCALE_FLAGS[locale])}
          alt=""
          width={22}
          height={16}
          unoptimized
          className={styles.flag}
        />
        <span className={styles.name} lang={locale} translate="no">
          {compact ? locale.toUpperCase() : LOCALE_NAMES[locale]}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={open ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
        />
      </button>

      {open && (
        <div
          className={styles.menu}
          id={listId}
          role="listbox"
          aria-label="Language"
          onKeyDown={onListKey}
        >
          {LOCALES.map((code, index) => {
            const selected = code === locale;
            return (
              <button
                key={code}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={index === active ? 0 : -1}
                className={styles.option}
                onClick={() => choose(code)}
                onFocus={() => setActive(index)}
              >
                <Image
                  src={flagSrc(LOCALE_FLAGS[code])}
                  alt=""
                  width={22}
                  height={16}
                  unoptimized
                  className={styles.flag}
                />
                <span className={styles.optionName} lang={code} translate="no">
                  {LOCALE_NAMES[code]}
                </span>
                <span className={styles.code} translate="no">
                  {code.toUpperCase()}
                </span>
                {selected ? (
                  <Check size={15} strokeWidth={2.2} aria-hidden="true" className={styles.check} />
                ) : (
                  <span className={styles.checkSpace} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
