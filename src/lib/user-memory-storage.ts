export function readStoredSet(key: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(key) ?? "[]",
    );

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(
      parsed.filter(
        (value): value is string =>
          typeof value === "string" && value.length > 0,
      ),
    );
  } catch {
    return new Set<string>();
  }
}

export function writeStoredSet(
  key: string,
  values: ReadonlySet<string>,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify([...values]),
    );
  } catch {
    // Storage can be unavailable in private browsing or restricted frames.
  }
}

export function removeStoredSet(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Keep the in-memory state when browser storage is unavailable.
  }
}
