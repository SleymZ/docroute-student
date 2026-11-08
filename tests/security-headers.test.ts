import assert from "node:assert/strict";
import { test } from "node:test";

import nextConfig, { securityHeaders } from "../next.config";

test("every page gets the security headers", async () => {
  const keys = securityHeaders.map((header) => header.key);
  for (const key of ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Content-Security-Policy"]) {
    assert.ok(keys.includes(key), key);
  }
  // Only frame-ancestors: a script policy would need every host listed first.
  assert.equal(securityHeaders.find((header) => header.key === "Content-Security-Policy")?.value, "frame-ancestors 'none'");
  const rules = await nextConfig.headers!();
  assert.deepEqual(rules, [{ source: "/:path*", headers: securityHeaders }]);
});
