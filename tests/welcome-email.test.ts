import assert from "node:assert/strict";
import { test } from "node:test";

import { LOCALES } from "@/i18n/config";
import { sendWelcomeIfNew, WELCOME_WINDOW_MS, type WelcomeMail } from "@/lib/welcome";
import { welcomeCopy, welcomeEmail } from "@/lib/welcome-email";

const SITE = "https://docroute-student.vercel.app";

test("the welcome email exists in every site language with working links", () => {
  for (const locale of LOCALES) {
    const mail = welcomeEmail(locale, SITE + "/");
    const copy = welcomeCopy(locale);
    assert.ok(mail.subject.length > 10, locale);
    assert.equal(copy.steps.length, 3, locale);
    for (const path of ["/home", "/explore/top", "/explore/profile", "/privacy", "/email/docroute-logo.png"]) {
      assert.ok(mail.html.includes(SITE + path), `${locale}: ${path}`);
    }
    assert.ok(!mail.html.includes(SITE + "//"), `${locale}: double slash`);
    assert.ok(mail.text.includes(`${SITE}/home`), locale);
    assert.ok(mail.html.includes("docroutestu@gmail.com"), locale);
    if (locale !== "en") assert.notEqual(copy.title, welcomeCopy("en").title, `${locale} is translated`);
  }
});

function fakeSupabase(user: { email?: string; created_at?: string; user_metadata?: Record<string, unknown> } | null) {
  const updates: Record<string, unknown>[] = [];
  return {
    updates,
    auth: {
      getUser: async () => ({ data: { user } }),
      updateUser: async ({ data }: { data: Record<string, unknown> }) => { updates.push(data); return { error: null }; },
    },
  };
}

test("the welcome email goes once, only to new accounts", async () => {
  const now = Date.parse("2026-11-08T19:00:00Z");
  const sent: WelcomeMail[] = [];
  const send = async (mail: WelcomeMail) => { sent.push(mail); };

  const fresh = fakeSupabase({ email: "new@example.com", created_at: "2026-11-08T18:59:00Z", user_metadata: {} });
  assert.equal(await sendWelcomeIfNew({ supabase: fresh, locale: "ru", siteUrl: SITE, send, now }), "scheduled");
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "new@example.com");
  assert.equal(sent[0].subject, welcomeCopy("ru").subject);
  assert.ok(typeof fresh.updates[0].welcome_sent_at === "string");

  const again = fakeSupabase({ email: "new@example.com", created_at: "2026-11-08T18:59:00Z", user_metadata: { welcome_sent_at: "2026-11-08T19:00:00Z" } });
  assert.equal(await sendWelcomeIfNew({ supabase: again, locale: "ru", siteUrl: SITE, send, now }), "already-sent");

  const old = fakeSupabase({ email: "old@example.com", created_at: new Date(now - WELCOME_WINDOW_MS - 1000).toISOString() });
  assert.equal(await sendWelcomeIfNew({ supabase: old, locale: "en", siteUrl: SITE, send, now }), "not-new");

  assert.equal(await sendWelcomeIfNew({ supabase: fakeSupabase(null), locale: "en", siteUrl: SITE, send, now }), "no-user");
  assert.equal(sent.length, 1);
});

test("a failed delivery removes the claim so a later sign-in can try again", async () => {
  const now = Date.parse("2026-11-08T19:00:00Z");
  const fresh = fakeSupabase({ email: "new@example.com", created_at: "2026-11-08T18:59:00Z" });
  const tasks: (() => Promise<void>)[] = [];
  const result = await sendWelcomeIfNew({
    supabase: fresh, locale: "en", siteUrl: SITE, now,
    send: async () => { throw new Error("SMTP down"); },
    schedule: (task) => { tasks.push(task); },
  });
  assert.equal(result, "scheduled");
  assert.equal(fresh.updates.length, 1, "claimed before the response");
  const original = console.error; console.error = () => {};
  try { await tasks[0](); } finally { console.error = original; }
  assert.deepEqual(fresh.updates[1], { welcome_sent_at: null });
});
