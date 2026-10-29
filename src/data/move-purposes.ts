// Reasons for moving that DocRoute supports. Study, work, family
// reunification and business (Slovakia, third-country citizens) have routes
// built from official guidance; a purpose is only available once it has
// its own checked sources.
export const movePurposes = [
  { id: "study", label: "Study", available: true },
  { id: "work", label: "Work", available: true },
  { id: "family", label: "Family", available: true },
  { id: "business", label: "Business", available: true },
] as const;

export type MovePurpose = (typeof movePurposes)[number]["id"];
