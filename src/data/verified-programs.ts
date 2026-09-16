export type VerifiedProgram = {
  universityHost: string;
  category: string;
  programName: string;
  degree: string;
  languages: string[];
  sourceUrl: string;
  checkedAt: string;
};

export const verifiedPrograms: readonly VerifiedProgram[] = [];