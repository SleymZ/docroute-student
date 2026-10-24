"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type Theme,
  oppositeTheme,
  readStoredTheme,
  resolveTheme,
} from "@/lib/theme";

import styles from "./ThemeToggle.module.css";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);

  media.addEventListener("change", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Theme {
  const attribute = document.documentElement.dataset.theme;

  if (attribute === "light" || attribute === "dark") {
    return attribute;
  }

  return resolveTheme(
    readStoredTheme(window.localStorage),
    window.matchMedia(DARK_QUERY).matches,
  );
}

function getServerSnapshot(): Theme | null {
  return null;
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the choice then lasts
    // until the page is reloaded.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const next = theme ? oppositeTheme(theme) : null;
  const label = next
    ? `Switch to ${next} theme`
    : "Switch colour theme";

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className ?? ""}`}
      aria-label={label}
      title={label}
      onClick={() => applyTheme(oppositeTheme(getSnapshot()))}
    >
      {/* Both icons are rendered and CSS shows the one for the theme the
          button switches to, so the server HTML already shows the right
          icon before React hydrates. */}
      <Sun
        size={17}
        strokeWidth={1.8}
        aria-hidden="true"
        className={styles.sun}
      />
      <Moon
        size={17}
        strokeWidth={1.8}
        aria-hidden="true"
        className={styles.moon}
      />
    </button>
  );
}
