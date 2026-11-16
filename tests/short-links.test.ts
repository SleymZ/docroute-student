import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  SHORT_LINK_CHANNELS,
  SHORT_LINK_PATTERN,
  isPreviewFetch,
  parseShortLink,
  shortLinkDestination,
} from "@/lib/short-links";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const migration = "supabase/migrations/20261116120000_link_clicks.sql";

test("short link codes: channel, language and an optional video number", () => {
  assert.deepEqual(parseShortLink("tt-ru"), { code: "tt-ru", channel: "tt", locale: "ru", video: null });
  assert.deepEqual(parseShortLink("IG-EN-03"), { code: "ig-en-03", channel: "ig", locale: "en", video: "03" });
  for (const bad of ["", "tt", "tt-de", "zz-ru", "tt-ru-3", "tt-ru-003", "tt-ru-ab", "../tt-ru", "tt-ru?x=1"]) {
    assert.equal(parseShortLink(bad), null, bad);
  }
  for (const channel of Object.keys(SHORT_LINK_CHANNELS)) assert.ok(parseShortLink(`${channel}-en`), channel);
});

test("a short link forwards with campaign tags only", () => {
  assert.equal(
    shortLinkDestination(parseShortLink("tt-ru-07")!),
    "/home?utm_source=tiktok&utm_medium=social&utm_campaign=ru&utm_content=v07",
  );
  assert.equal(shortLinkDestination(parseShortLink("qr-en")!), "/home?utm_source=qr&utm_medium=print&utm_campaign=en");
});

test("link previews in chats are not counted as clicks", () => {
  for (const ua of [
    "TelegramBot (like TwitterBot)",
    "WhatsApp/2.23.20.0",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Mozilla/5.0 (compatible; Googlebot/2.1)",
    "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0",
  ]) {
    assert.equal(isPreviewFetch(ua, "GET"), true, ua);
  }
  assert.equal(isPreviewFetch(null, "GET"), true);
  const phone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 300.0";
  assert.equal(isPreviewFetch(phone, "GET"), false);
  assert.equal(isPreviewFetch(phone, "HEAD"), true);
});

test("the database accepts exactly the codes the site makes and stores no visitor data", () => {
  const sql = read(migration);
  const sqlPatterns = [...sql.matchAll(/'\^\(tt[^']+\$'/g)].map((m) => m[0].slice(1, -1));
  assert.equal(sqlPatterns.length, 2);
  for (const pattern of sqlPatterns) assert.equal(pattern, SHORT_LINK_PATTERN.source);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table public\.link_clicks from public, anon, authenticated/);
  assert.match(sql, /security definer\s+set search_path = ''/);
  assert.match(sql, /grant execute on function public\.count_link_click\(text\) to anon, authenticated/);
  // The table has only the link code, the day and a total.
  const table = sql.match(/create table if not exists public\.link_clicks \(([\s\S]*?)\);/)![1];
  assert.deepEqual(table.trim().split(/,\s*\n/).map((line) => line.trim().split(/\s+/)[0]), ["code", "day", "clicks", "primary"]);
  assert.match(sql.trim(), /notify pgrst, 'reload schema';$/);
});

test("the /go route exists, skips the session proxy and is in the privacy policy", () => {
  assert.ok(existsSync(join(root, "src/app/go/[code]/route.ts")));
  assert.match(read("src/proxy.ts"), /api\/webhooks\|go\/\|/);
  assert.match(read("src/app/privacy/page.tsx"), /short links \(addresses starting with \/go\/[^"]*No IP address, no cookie/);
});
