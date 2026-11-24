// Newly verified programmes for the strip on the entry page and /home
// (owner request 2026-11-24). Newest first, 3–5 lines. When a new faculty is
// verified, put its programme at the top and drop the last one. Every id must
// be a programme in verifiedPrograms; `addedOn` is the day its verified
// route went live (git history of src/data/verified-programs*.ts).
export const recentlyVerified = [
  { programId: "uniba-lf-medicine-en-2027", addedOn: "2026-11-05" },
  { programId: "lfp-medicine-en-2027", addedOn: "2026-11-05" },
  { programId: "uniba-jlf-medicine-en-2027", addedOn: "2026-11-05" },
  { programId: "czu-pef-business-administration-en-2027", addedOn: "2026-11-05" },
  { programId: "upjs-pf-law-trilingual-bc-2027", addedOn: "2026-11-05" },
] as const;
