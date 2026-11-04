// Browser-only helpers for story photos: shrink and re-encode the picture
// (which also drops EXIF data such as GPS location), upload it to the
// author's folder, and remove files when a photo or story is deleted.
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  STORY_PHOTO_BUCKET,
  STORY_PHOTO_SIZE,
  storyLimits,
  storyPhotoPath,
} from "@/lib/stories";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

// Pictures larger than this are refused before any processing.
export const MAX_SOURCE_PHOTO_BYTES = 15 * 1024 * 1024;
export const acceptedPhotoTypes = /^image\/(jpeg|png|webp)$/;

export async function prepareStoryPhoto(
  file: File,
): Promise<{ blob: Blob; extension: "webp" | "jpg" }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, STORY_PHOTO_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  for (const quality of [0.82, 0.7, 0.55]) {
    const webp = await encode("image/webp", quality);
    if (webp && webp.type === "image/webp") {
      if (webp.size <= storyLimits.photoBytes) return { blob: webp, extension: "webp" };
      continue;
    }
    // Older Safari cannot write WebP: fall back to JPEG.
    const jpeg = await encode("image/jpeg", quality);
    if (jpeg && jpeg.type === "image/jpeg" && jpeg.size <= storyLimits.photoBytes) {
      return { blob: jpeg, extension: "jpg" };
    }
  }
  throw new Error("The picture is too large even after compression");
}

/** Uploads one photo and registers it for the story. If the database refuses
 *  the row (for example the 4-photo limit), the uploaded file is removed. */
export async function uploadStoryPhoto(
  supabase: Client,
  userId: string,
  storyId: string,
  file: File,
) {
  const prepared = await prepareStoryPhoto(file);
  const path = storyPhotoPath(userId, storyId, Date.now(), prepared.extension);
  const upload = await supabase.storage.from(STORY_PHOTO_BUCKET).upload(path, prepared.blob, {
    contentType: prepared.extension === "webp" ? "image/webp" : "image/jpeg",
    upsert: false,
  });
  if (upload.error) throw upload.error;
  const { error } = await supabase
    .from("story_photos")
    .insert({ story_id: storyId, user_id: userId, path });
  if (error) {
    await supabase.storage.from(STORY_PHOTO_BUCKET).remove([path]);
    throw error;
  }
}

/** Removes one photo: the row first (so it disappears at once), then the file. */
export async function removeStoryPhoto(supabase: Client, photo: { id: string; path: string }) {
  const { error } = await supabase.from("story_photos").delete().eq("id", photo.id);
  if (error) throw error;
  await supabase.storage.from(STORY_PHOTO_BUCKET).remove([photo.path]);
}

/** Every file in one story's folder ("<author>/<story>/"). */
export async function removeStoryFolder(supabase: Client, authorId: string, storyId: string) {
  const folder = `${authorId}/${storyId}`;
  const { data, error } = await supabase.storage.from(STORY_PHOTO_BUCKET).list(folder, {
    limit: 100,
  });
  if (error) throw error;
  if (data?.length) {
    const { error: removeError } = await supabase.storage
      .from(STORY_PHOTO_BUCKET)
      .remove(data.map((file) => `${folder}/${file.name}`));
    if (removeError) throw removeError;
  }
}

/** Every story photo of the signed-in account, before the account is deleted. */
export async function removeAllStoryPhotos(supabase: Client, userId: string) {
  const { data: folders, error } = await supabase.storage
    .from(STORY_PHOTO_BUCKET)
    .list(userId, { limit: 100 });
  if (error) throw error;
  for (const entry of folders ?? []) {
    // Folders are listed without an id; files directly in the user folder
    // (none are expected) are removed too.
    if (entry.id) {
      const { error: removeError } = await supabase.storage
        .from(STORY_PHOTO_BUCKET)
        .remove([`${userId}/${entry.name}`]);
      if (removeError) throw removeError;
    } else {
      await removeStoryFolder(supabase, userId, entry.name);
    }
  }
}
