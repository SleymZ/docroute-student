import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.env.REPO_ROOT ?? process.cwd();
const source = readFileSync(join(root, "scripts/send-plus-email.mjs"), "utf8");

test("the Plus email sender is a dry run unless --send is given", () => {
  assert.match(source, /const shouldSend = args\.includes\("--send"\)/);
  assert.match(source, /Dry run: nothing sent/);
});

test("the Plus email sender never contains a key and reads it from the environment", () => {
  assert.doesNotMatch(source, /re_[A-Za-z0-9]{10,}/);
  assert.match(source, /process\.env\.RESEND_API_KEY/);
  assert.match(source, /process\.env\.SITE_URL/);
});

test("the Plus email parser lowercases, removes duplicates and drops invalid addresses", async () => {
  const { parseEmails } = await import("../scripts/send-plus-email.mjs");
  const emails = parseEmails('email\nA@Example.com\n"b@example.org"\nbad\na@example.com\n');
  assert.deepEqual(emails, ["a@example.com", "b@example.org"]);
  assert.throws(() => parseEmails("address\nx@y.z\n"), /header line "email"/);
});
