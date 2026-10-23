const fallbackPath = "/explore";
const internalOrigin = "https://docroute.invalid";

// Returns a same-site path for post-authentication redirects. Browsers treat
// "\" like "/" and strip tabs/newlines, so prefix checks alone are not enough:
// "/\evil.com" resolves to https://evil.com/. Resolving against a fixed
// origin and comparing origins rejects every variant.
export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.includes("\\")) {
    return fallbackPath;
  }

  try {
    const url = new URL(value, internalOrigin);

    if (url.origin !== internalOrigin) {
      return fallbackPath;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallbackPath;
  }
}
