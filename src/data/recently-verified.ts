// Newly verified programmes for the strip on the entry page and /home
// (owner request 2026-11-24). Newest first, 3–5 lines. When a new faculty is
// verified, put its programme at the top and drop the last one. Every id must
// be a programme in verifiedPrograms; `addedOn` is the day its verified
// route went live (git history of src/data/verified-programs*.ts).
export const recentlyVerified = [
  { programId: "tudelft-cse-bsc-2027", addedOn: "2026-11-26" },
  { programId: "eur-ibeb-bsc-2027", addedOn: "2026-11-26" },
  { programId: "wu-bbe-bsc-2027", addedOn: "2026-11-26" },
  { programId: "rug-iel-llb-2027", addedOn: "2026-11-26" },
  { programId: "constructor-cs-bsc-2027", addedOn: "2026-11-26" },
] as const;
