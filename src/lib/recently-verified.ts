import { recentlyVerified } from "@/data/recently-verified";
import { verifiedPrograms } from "@/data/verified-programs";
import { daysUntil, openDeadline, programmeHref } from "@/lib/deadline-list";

export type RecentlyVerifiedCard = {
  id: string;
  universityName: string;
  category: string;
  english: boolean;
  city: string;
  countryCode: string;
  addedOn: string;
  /** The round still open today, or null when every round has closed. */
  deadline: string | null;
  daysLeft: number | null;
  href: string;
};

/** The strip's programmes, newest first. Unknown ids are skipped. */
export function recentlyVerifiedCards(today: string): RecentlyVerifiedCard[] {
  return recentlyVerified.flatMap(({ programId, addedOn }) => {
    const program = verifiedPrograms.find((item) => item.id === programId);
    if (!program) return [];
    const open = openDeadline(program, today);
    return [
      {
        id: program.id,
        universityName: program.universityName,
        category: program.category,
        english: program.instructionLanguages.some((language) => language.code === "en"),
        city: program.city,
        countryCode: program.countryCode,
        addedOn,
        deadline: open?.deadline ?? null,
        daysLeft: open ? daysUntil(today, open.deadline) : null,
        href: programmeHref(program),
      },
    ];
  });
}
