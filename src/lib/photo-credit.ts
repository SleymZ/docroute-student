/**
 * Wikimedia "Artist" fields are sometimes a whole attribution note ("These
 * images were created by Amonet. When reusing, please credit the author
 * as: …"). The credit line under a photo shows only the name; the full note
 * stays on the source page the credit links to.
 */
const LEADS = [
  /^(?:these|this) (?:images?|photos?|pictures?) (?:was|were) (?:created|taken|made) by\s+/i,
  /^(?:created|taken|photographed|photo|picture) by\s+/i,
  /^(?:author|photographer|photo)\s*:\s*/i,
];

const TAILS = [/\s*[.;]?\s*(?:when reusing|please credit|if you use|you may|you can|licensed under)\b[\s\S]*$/i];

const MAX_LENGTH = 48;

export function shortPhotoAuthor(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let text = raw.replace(/\s+/g, " ").trim();
  for (const tail of TAILS) text = text.replace(tail, "");
  for (const lead of LEADS) text = text.replace(lead, "");
  text = text.replace(/[\s.,;:]+$/, "").trim();
  if (!text) return null;
  if (text.length <= MAX_LENGTH) return text;
  // Still a sentence: keep its first part, cut at a word.
  const cut = text.slice(0, MAX_LENGTH);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : MAX_LENGTH).trim()}…`;
}
