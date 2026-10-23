// Reasons for moving that DocRoute is meant to support. Study (Slovakia,
// Computer Science) and work (Slovakia, third-country citizens) have
// verified routes. The others are listed so the product shape is visible,
// but they never open guessed requirements: each needs its own official
// sources before it becomes available.
export const movePurposes = [
  { id: "study", label: "Study", available: true },
  { id: "work", label: "Work", available: true },
  { id: "family", label: "Family", available: false },
  { id: "business", label: "Business", available: false },
] as const;

export type MovePurpose = (typeof movePurposes)[number]["id"];
