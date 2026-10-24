export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "docroute-theme";
export const THEME_CHANGE_EVENT = "docroute-theme-change";

/**
 * Runs in <head> before the page paints, so a stored choice never flashes
 * the other theme. Without a stored choice no attribute is set and CSS
 * follows the system setting (color-scheme: light dark).
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export function readStoredTheme(storage: Pick<Storage, "getItem">): Theme | null {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function resolveTheme(
  stored: Theme | null,
  systemPrefersDark: boolean,
): Theme {
  return stored ?? (systemPrefersDark ? "dark" : "light");
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
