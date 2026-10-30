// Public profiles and moving stories. Limits mirror the database checks in
// supabase/migrations/20261030120000_profiles_and_stories.sql (a test ties
// them together), so the form rejects what the database would reject.

export const AVATAR_BUCKET = "avatars";
export const AVATAR_SIZE = 256;

export const storyPurposes = ["study", "work", "family", "business"] as const;
export type StoryPurpose = (typeof storyPurposes)[number];

export const storyPurposeLabels: Record<StoryPurpose, string> = {
  study: "Study",
  work: "Work",
  family: "Family",
  business: "Business",
};

export const storyLimits = {
  displayName: { min: 2, max: 40 },
  bio: { max: 280 },
  title: { min: 5, max: 100 },
  body: { min: 80, max: 4000 },
  university: { min: 2, max: 120 },
  year: { min: 2020, max: 2035 },
  perAccount: 5,
} as const;

export type PublicProfile = {
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_path: string | null;
  updated_at: string;
};

export type StoryStatus = "pending" | "published" | "hidden";

export type SuccessStory = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  purpose: StoryPurpose;
  from_country_code: string;
  to_country_code: string;
  moved_year: number;
  university: string | null;
  status: StoryStatus;
  created_at: string;
  published_at: string | null;
};

export type ProfileInput = { displayName: string; bio: string };

export type StoryInput = {
  title: string;
  body: string;
  purpose: string;
  fromCountryCode: string;
  toCountryCode: string;
  movedYear: number;
  university: string;
};

function collapse(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function validateProfile(input: ProfileInput) {
  const errors: string[] = [];
  const displayName = collapse(input.displayName);
  const bio = input.bio.trim();

  if (
    displayName.length < storyLimits.displayName.min ||
    displayName.length > storyLimits.displayName.max
  ) {
    errors.push(
      `Name must be ${storyLimits.displayName.min}–${storyLimits.displayName.max} characters.`,
    );
  }
  if (/[<>@]/.test(displayName)) {
    errors.push("Name cannot contain <, > or @ (do not use your email).");
  }
  if (bio.length > storyLimits.bio.max) {
    errors.push(`About you must be at most ${storyLimits.bio.max} characters.`);
  }

  return {
    errors,
    value: { display_name: displayName, bio: bio || null },
  };
}

export function validateStory(input: StoryInput, currentYear: number) {
  const errors: string[] = [];
  const title = collapse(input.title);
  const body = input.body.trim();
  const university = collapse(input.university);
  const from = input.fromCountryCode.toUpperCase();
  const to = input.toCountryCode.toUpperCase();

  if (title.length < storyLimits.title.min || title.length > storyLimits.title.max) {
    errors.push(`Title must be ${storyLimits.title.min}–${storyLimits.title.max} characters.`);
  }
  if (body.length < storyLimits.body.min || body.length > storyLimits.body.max) {
    errors.push(`Story must be ${storyLimits.body.min}–${storyLimits.body.max} characters.`);
  }
  if (!storyPurposes.includes(input.purpose as StoryPurpose)) {
    errors.push("Choose why you moved.");
  }
  if (!/^[A-Z]{2}$/.test(from)) errors.push("Choose the country you moved from.");
  if (!/^[A-Z]{2}$/.test(to)) errors.push("Choose the country you moved to.");
  if (/^[A-Z]{2}$/.test(from) && from === to) {
    errors.push("The two countries must be different.");
  }
  const maxYear = Math.min(storyLimits.year.max, currentYear + 1);
  if (
    !Number.isInteger(input.movedYear) ||
    input.movedYear < storyLimits.year.min ||
    input.movedYear > maxYear
  ) {
    errors.push(`Year must be between ${storyLimits.year.min} and ${maxYear}.`);
  }
  if (
    university &&
    (university.length < storyLimits.university.min ||
      university.length > storyLimits.university.max)
  ) {
    errors.push(
      `University must be ${storyLimits.university.min}–${storyLimits.university.max} characters.`,
    );
  }

  return {
    errors,
    value: {
      title,
      body,
      purpose: input.purpose as StoryPurpose,
      from_country_code: from,
      to_country_code: to,
      moved_year: input.movedYear,
      university: university || null,
    },
  };
}

// Path inside the avatars bucket: "<user id>/avatar-<timestamp>.webp". The
// database only accepts this shape inside the owner's folder.
export function avatarPath(userId: string, now: number) {
  return `${userId}/avatar-${now}.webp`;
}

export function avatarPublicUrl(supabaseUrl: string, path: string | null) {
  if (!path) return null;
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${AVATAR_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function initials(name: string) {
  const parts = collapse(name).split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => Array.from(part)[0] ?? "");
  return letters.join("").toUpperCase() || "?";
}

export function storyExcerpt(body: string, max = 220) {
  const text = collapse(body);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
