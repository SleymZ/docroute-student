// Decides how a signed-in user's saved set (favourites, completed route
// tasks) is reconciled with the server when a page loads.
//
// The server is the source of truth. The per-user browser cache only mirrors
// it for a fast first paint and is deliberately NOT merged back: otherwise an
// item removed on another device would be re-added from this device's stale
// cache. Only data the server cannot have yet is merged in:
// - guest values created before signing in on this device;
// - toggles made on this page while the server data was loading.
export function planUserSetSync(
  remote: ReadonlySet<string>,
  guest: ReadonlySet<string>,
  overrides: ReadonlyMap<string, boolean>,
) {
  const merged = new Set([...remote, ...guest]);

  for (const [value, shouldExist] of overrides) {
    if (shouldExist) {
      merged.add(value);
    } else {
      merged.delete(value);
    }
  }

  return {
    merged,
    toAdd: [...merged].filter((value) => !remote.has(value)),
    toRemove: [...remote].filter((value) => !merged.has(value)),
  };
}
