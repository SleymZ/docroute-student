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
  storyPhotoPath,
  storyPurposes,
  validateComment,
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
  // Browsers that cannot encode WebP (older Safari) upload a JPEG instead.
  assert.match(avatarPath(userId, 1793379187697, "jpg"), /^[0-9a-f-]{36}\/avatar-[0-9]{10,16}\.jpg$/);
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
  // A failed photo removal stops before the account is deleted.
  assert.ok(controls.indexOf("if (!photosRemoved)") < controls.indexOf('rpc("delete_my_account")'));
});

test("the story limit locks the profile row before counting", () => {
  const fix = read("supabase/migrations/20261030130000_story_limit_lock.sql");
  assert.match(fix, /public_profiles p where p\.user_id = new\.user_id for update;\s+if \(select count/);
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

const moderatorSql = read("supabase/migrations/20261031120000_story_moderators.sql");

test("only moderators can publish, and no email is stored in the repository", () => {
  assert.match(moderatorSql, /create policy "Moderators see all stories"/);
  assert.match(moderatorSql, /if not public\.is_story_moderator\(\) then/);
  assert.match(moderatorSql, /and updated_at = p_reviewed_at/);
  assert.match(moderatorSql, /revoke all on table public\.story_moderators from public, anon, authenticated/);
  assert.match(moderatorSql, /revoke all on function public\.moderate_story\(uuid, text, timestamptz\) from anon/);
  assert.doesNotMatch(moderatorSql, /@[a-z0-9-]+\.[a-z]{2,}/i);
});

const mediaSql = read("supabase/migrations/20261104120000_story_photos_comments_likes.sql");
const storyId = "99999999-8888-4777-8666-555555555555";

test("story photo paths fit the database rule and stay in the author's folder", () => {
  const path = storyPhotoPath(userId, storyId, 1793379187697);
  assert.equal(path, `${userId}/${storyId}/photo-1793379187697.webp`);
  assert.match(path, /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/photo-[0-9]{10,16}\.(webp|jpg)$/);
  assert.match(mediaSql, /photo-\[0-9\]\{10,16\}\\\.\(webp\|jpg\)\$/);
  assert.match(storyPhotoPath(userId, storyId, 1793379187697, "jpg"), /\.jpg$/);
});

test("photo, comment and like limits match the database", () => {
  assert.match(mediaSql, new RegExp(`>= ${storyLimits.photosPerStory} then`));
  assert.match(mediaSql, new RegExp(`between ${storyLimits.comment.min} and ${storyLimits.comment.max}`));
  assert.match(mediaSql, new RegExp(`\\) >= ${storyLimits.pendingComments} then`));
  assert.match(mediaSql, new RegExp(`false, ${storyLimits.photoBytes}, array\\['image/webp', 'image/jpeg'\\]`));
});

test("comments are validated before sending", () => {
  assert.deepEqual(validateComment("  Thanks!  "), { errors: [], value: "Thanks!" });
  assert.equal(validateComment(" a ").errors.length, 1);
  assert.equal(validateComment("x".repeat(storyLimits.comment.max + 1)).errors.length, 1);
});

test("photos and comments cannot skip moderation", () => {
  // nobody can write a comment's status; every API insert starts pending
  assert.match(mediaSql, /grant insert \(story_id, user_id, body\) on table public\.story_comments to authenticated/);
  assert.doesNotMatch(mediaSql, /grant update[^;]*story_comments/);
  assert.match(mediaSql, /new\.status := 'pending';/);
  // comments only on published stories, photos only on one's own story
  assert.match(mediaSql, /create policy "Comment on published stories"[^;]*s\.status = 'published'/);
  assert.match(mediaSql, /create policy "Own photo insert"[^;]*s\.user_id = \(select auth\.uid\(\)\)/);
  // an author's photo change sends the story back to review
  assert.match(mediaSql, /set status = 'pending',\s+published_at = null,\s+updated_at = now\(\)\s+where id = photo\.story_id;/);
  // a registered photo path can never be uploaded again (no silent swap)
  assert.match(mediaSql, /create policy "Story photo upload own folder"[^;]*not exists \(select 1 from public\.story_photos p where p\.path = name\)/);
  assert.doesNotMatch(mediaSql, /on storage\.objects for update[^;]*story-photos/);
  assert.match(mediaSql, /revoke all on function public\.moderate_comment\(uuid, text\) from public, anon/);
});

test("photos are private until their story is visible, likes stay anonymous", () => {
  assert.match(mediaSql, /values \('story-photos', 'story-photos', false,/);
  assert.match(mediaSql, /create policy "Story photo read"[^;]*exists \(select 1 from public\.story_photos p where p\.path = name\)/);
  assert.match(mediaSql, /create policy "Photos follow their story"[^;]*exists \(select 1 from public\.success_stories s where s\.id = story_id\)/);
  assert.match(mediaSql, /grant select, delete on table public\.story_likes to authenticated;/);
  assert.doesNotMatch(mediaSql, /grant [^;]*on table public\.story_likes to anon/);
  assert.match(mediaSql, /create policy "Own likes"[^;]*using \(user_id = \(select auth\.uid\(\)\)\)/);
});

test("account deletion removes story photos first and the export lists the new data", () => {
  const controls = read("src/components/AccountDataControls.tsx");
  assert.ok(controls.indexOf("removeAllStoryPhotos(supabase, userId)") > 0);
  assert.ok(controls.indexOf("removeAllStoryPhotos(supabase, userId)") < controls.indexOf('rpc("delete_my_account")'));
  for (const table of ["story_photos", "story_comments", "story_likes"]) {
    assert.match(controls, new RegExp(`from\\("${table}"\\)`));
  }
  // rows go with the account through foreign keys
  assert.match(mediaSql, /references public\.public_profiles \(user_id\) on delete cascade/);
  assert.match(mediaSql, /references auth\.users \(id\) on delete cascade/);
});
