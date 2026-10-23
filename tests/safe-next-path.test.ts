import assert from "node:assert/strict";
import { test } from "node:test";

import { safeNextPath } from "../src/lib/safe-next-path";

test("same-site paths, queries and hashes are kept", () => {
  assert.equal(safeNextPath("/account"), "/account");
  assert.equal(
    safeNextPath("/route/preview?country=SK&lang=sk%7CB1%7C1%7Cnone%7C#top"),
    "/route/preview?country=SK&lang=sk%7CB1%7C1%7Cnone%7C#top",
  );
});

for (const value of [
  undefined,
  null,
  "",
  "account",
  "https://evil.com",
  "//evil.com",
  "/\\evil.com",
  "/\\/evil.com",
  "/\t/evil.com",
  "/\n/evil.com",
  "\\\\evil.com",
]) {
  test(`unsafe redirect target ${JSON.stringify(value)} falls back to Explore`, () => {
    assert.equal(safeNextPath(value), "/explore");
  });
}
