import assert from "node:assert/strict";
import test from "node:test";

import { PRODUCTION_URL, getSiteUrl } from "@/lib/site-url";

function withEnv(env: Record<string, string | undefined>, run: () => void) {
  const saved = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    run();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("on Vercel the site always names docroute.app", () => {
  assert.equal(PRODUCTION_URL, "https://docroute.app");
  withEnv({ NEXT_PUBLIC_SITE_URL: undefined, VERCEL: "1", VERCEL_PROJECT_PRODUCTION_URL: "docroute-student.vercel.app" }, () => {
    assert.equal(getSiteUrl(), "https://docroute.app");
  });
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://example.test/", VERCEL: "1" }, () => {
    assert.equal(getSiteUrl(), "https://example.test");
  });
  withEnv({ NEXT_PUBLIC_SITE_URL: undefined, VERCEL: undefined }, () => {
    assert.equal(getSiteUrl(), "http://localhost:3000");
  });
});
