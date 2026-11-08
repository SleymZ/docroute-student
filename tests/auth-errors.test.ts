import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { authErrorMessage, authErrorMessages, linkErrorMessage } from "@/lib/auth-errors";

test("sign-in errors become plain sentences that say what to do", () => {
  assert.equal(authErrorMessage(new TypeError("Failed to fetch")), authErrorMessages.network);
  assert.equal(authErrorMessage({ name: "AuthRetryableFetchError", message: "", status: 0 }), authErrorMessages.network);
  assert.equal(authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" }), authErrorMessages.invalidCredentials);
  assert.equal(authErrorMessage({ code: "email_not_confirmed", message: "Email not confirmed" }), authErrorMessages.emailNotConfirmed);
  assert.equal(authErrorMessage({ code: "over_email_send_rate_limit", message: "email rate limit exceeded", status: 429 }), authErrorMessages.rateLimit);
  assert.equal(authErrorMessage({ code: "email_address_not_authorized", message: "Email address not authorized" }), authErrorMessages.emailNotAuthorized);
  assert.equal(authErrorMessage({ code: "weak_password", message: "Password should be at least 8 characters." }), authErrorMessages.weakPassword);
  assert.equal(authErrorMessage({ code: "same_password", message: "New password should be different from the old password." }), authErrorMessages.samePassword);
});

test("unknown errors keep Supabase's own words; empty ones get a fallback", () => {
  assert.equal(authErrorMessage(new Error("Something new")), "Something new");
  assert.equal(authErrorMessage(null), authErrorMessages.fallback);
});

test("an error in the address never shows free text", () => {
  assert.equal(linkErrorMessage(undefined), "");
  assert.equal(linkErrorMessage("Your account is locked. Call +1 555 0100"), authErrorMessages.link);
  assert.equal(linkErrorMessage("Email link is invalid or has expired"), authErrorMessages.link);
  assert.equal(linkErrorMessage("Email not confirmed"), authErrorMessages.emailNotConfirmed);
});

test("every new message is translated", () => {
  for (const lang of ["ru", "es", "zh", "hi"]) {
    const catalog = JSON.parse(readFileSync(join(process.env.REPO_ROOT ?? process.cwd(), `src/i18n/catalogs/${lang}.json`), "utf8"));
    for (const text of Object.values(authErrorMessages)) assert.ok(catalog[text], `${lang}: ${text}`);
  }
});

test("server errors are not shown as a lost connection", () => {
  assert.equal(
    authErrorMessage({ name: "AuthRetryableFetchError", message: "Error sending confirmation email", status: 500, code: "unexpected_failure" }),
    authErrorMessages.emailNotAuthorized,
  );
  assert.equal(authErrorMessage({ name: "AuthRetryableFetchError", message: "{}", status: 502 }), authErrorMessages.fallback);
  assert.equal(authErrorMessage({ name: "AuthRetryableFetchError", message: "Failed to fetch", status: 0 }), authErrorMessages.network);
});
