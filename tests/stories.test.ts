import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  avatarPath,
  avatarPublicUrl,
  initials,
  isUuid,
  storyExcerpt,
  storyLimits,
  storyPurposes,
  validateProfile,
  validateStory,
} from "../src/lib/stories";

const root = process.env.REPO_ROOT ?? process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const sql = read("supabase/migrations/20261030120000_profiles_and_stories.sql");
const userId = "11111111-2222-4333-8444-555555555555";

const goodStory = {
  title: "From Kyiv to Nitra",
  body: "I applied with my maturita results and the residence permit took two months. ".repeat(2),
  purpose: "study",
  fromCountryCode: "ua",
  toCountryCode: "SK",
  movedYear: 2026,
  university: "  Constantine the Philosopher University ",
};

test("a valid story is normalised for the database", () => {
  const { errors, value } = validateStory(goodStory, 2026);
  assert.deepEqual(errors, []);
  assert.equal(value.from_country_code, "UA");
  assert.equal(value.university, "Constantine the Philosopher University");
});

test("story limits are enforced in the form", () => {
  const { errors } = validateStory(
    { ...goodStory, title: "Hi", body: "short", purpose: "tourism", toCountryCode: "UA", movedYear: 2031 },
    2026,
  );
  assert.equal(errors.length, 5);
  assert.deepEqual(validateStory({ ...goodStory, university: "" }, 2026).value.university, null);
});

test("public names cannot be emails or markup", () => {
  assert.equal(validateProfile({ displayName: "ana@example.sk", bio: "" }).errors.length, 1);
  assert.equal(validateProfile({ displayName: "<b>A</b>", bio: "" }).errors.length, 1);
  const ok = validateProfile({ displayName: "  Ana   K. ", bio: "  " });
  assert.deepEqual(ok, { errors: [], value: { display_name: "Ana K.", bio: null } });
});

test("form limits match the database checks", () => {
  assert.match(sql, new RegExp(`between ${storyLimits.displayName.min} and ${storyLimits.displayName.max}`));
  assert.match(sql, new RegExp(`between 1 and ${storyLimits.bio.max}`));
  assert.match(sql, new RegExp(`between ${storyLimits.title.min} and ${storyLimits.title.max}`));
  assert.match(sql, new RegExp(`between ${storyLimits.body.min} and ${storyLimits.body.max}`));
  assert.match(sql, new RegExp(`between ${storyLimits.year.min} and ${storyLimits.year.max}`));
  assert.match(sql, new RegExp(`>= ${storyLimits.perAccount} then`));
  assert.match(sql, new RegExp(`purpose in \\(${storyPurposes.map((p) => `'${p}'`).join(", ")}\\)`));
});

test("avatar paths fit the database rule and stay in the owner's folder", () => {
  const path = avatarPath(userId, 1793379187697);
  assert.equal(path, `${userId}/avatar-1793379187697.webp`);
  assert.match(path, /^[0-9a-f-]{36}\/avatar-[0-9]{10,16}\.(webp|jpg|png)$/);
  assert.equal(
    avatarPublicUrl("https://x.supabase.co/", path),
    `https://x.supabase.co/storage/v1/object/public/avatars/${path}`,
  );
  assert.equal(avatarPublicUrl("https://x.supabase.co", null), null);
});

test("authors can never publish their own story", () => {
  assert.match(sql, /grant insert \(user_id, title, body, purpose, from_country_code, to_country_code, moved_year, university\)/);
  assert.doesNotMatch(sql, /grant (insert|update)[^;]*status[^;]*success_stories/);
  assert.match(sql, /new\.status := 'pending'/);
  assert.match(sql, /using \(status = 'published' or user_id = \(select auth\.uid\(\)\)\)/);
});

test("profile photos can only be written to the owner's folder", () => {
  const writes = sql.match(/create policy "Avatar (upload|update|delete) own folder"[^;]*;/g) ?? [];
  assert.equal(writes.length, 3);
  for (const policy of writes) {
    assert.match(policy, /\(storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)\)::text/);
  }
  assert.match(sql, /allowed_mime_types[^;]*image\/webp/);
});

test("deleting an account also deletes the public profile and stories", () => {
  assert.match(sql, /delete from public\.success_stories where user_id = current_user_id/);
  assert.match(sql, /delete from public\.public_profiles where user_id = current_user_id/);
  assert.match(sql, /delete from public\.waitlist_signups where email = current_email/);
  assert.match(sql, /revoke all on function public\.delete_my_account\(\) from anon/);
  const controls = read("src/components/AccountDataControls.tsx");
  assert.match(controls, /storage\s*\.from\(AVATAR_BUCKET\)\s*\.remove/);
  assert.match(controls, /from\("success_stories"\)/);
});

test("helpers", () => {
  assert.equal(initials("ana  karenina"), "AK");
  assert.equal(initials(""), "?");
  assert.ok(isUuid(userId));
  assert.ok(!isUuid("../etc"));
  assert.ok(storyExcerpt("word ".repeat(100), 50).endsWith("…"));
});

test("terms and privacy describe public stories", () => {
  assert.match(read("src/app/terms/page.tsx"), /id="stories"/);
  assert.match(read("src/app/privacy/page.tsx"), /id="stories"/);
});
