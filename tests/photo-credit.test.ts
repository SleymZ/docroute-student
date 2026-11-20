import assert from "node:assert/strict";
import { test } from "node:test";

import { shortPhotoAuthor } from "@/lib/photo-credit";

test("a photo credit shows the author's name, not the whole reuse note", () => {
  assert.equal(
    shortPhotoAuthor("These images were created by Amonet . When reusing, please credit the author as: Amonet from Wikimedia Commons . If you"),
    "Amonet",
  );
  assert.equal(shortPhotoAuthor("Photo by Jan Novák"), "Jan Novák");
  assert.equal(shortPhotoAuthor("Petr Šmerkl"), "Petr Šmerkl");
  assert.equal(shortPhotoAuthor("  "), null);
  assert.equal(shortPhotoAuthor(null), null);
  const long = shortPhotoAuthor("Own work by someone who wrote a very long description of the photo and the place");
  assert.ok(long && long.length <= 49 && long.endsWith("…"), long ?? "");
});
