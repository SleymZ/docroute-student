import { normalizeCurrentResidenceStatus } from "@/lib/profile-options";
import type { CurrentResidenceStatus } from "@/types/admission";

export type YesNo = "yes" | "no";
export type YesNoUnsure = "yes" | "no" | "unsure";

// Answers for the Slovak work route. Kept in the URL (the page is noindex),
// like the study profile, so a route survives reloads and can be reopened.
export type WorkProfile = {
  destinationCountryCode: "SK";
  citizenshipCountryCode: string;
  currentResidenceStatus: CurrentResidenceStatus;
  jobOffer: YesNo;
  // Graduated from a secondary school or university in Slovakia.
  slovakGraduate: YesNo;
  // Self-reported EU Blue Card conditions: university degree (or ICT
  // professional skills), salary at least 1.2x the Slovak average wage
  // (the average wage for degrees from the last three years) and a contract
  // of at least six months.
  blueCardConditions: YesNoUnsure;
  // Job is on the regional labour-shortage list.
  shortageOccupation: YesNoUnsure;
};

export type WorkAuthorisationRoute =
  | "single-permit"
  | "blue-card"
  | "slovak-graduate";

export function selectWorkRoute(profile: WorkProfile): WorkAuthorisationRoute {
  if (profile.slovakGraduate === "yes") return "slovak-graduate";
  if (profile.blueCardConditions === "yes") return "blue-card";
  return "single-permit";
}

const yesNo = (value: string | null): YesNo | null =>
  value === "yes" || value === "no" ? value : null;

const yesNoUnsure = (value: string | null): YesNoUnsure | null =>
  value === "yes" || value === "no" || value === "unsure" ? value : null;

export function parseWorkProfile(params: URLSearchParams): WorkProfile | null {
  if ((params.get("country") ?? "SK").toUpperCase() !== "SK") return null;

  const citizenship = (params.get("citizenship") ?? "").toUpperCase();
  const status = normalizeCurrentResidenceStatus(params.get("residenceStatus"));
  const jobOffer = yesNo(params.get("offer"));
  const slovakGraduate = yesNo(params.get("skGraduate"));
  const blueCardConditions = yesNoUnsure(params.get("blueCard"));
  const shortageOccupation = yesNoUnsure(params.get("shortage"));

  if (
    !/^[A-Z]{2}$/.test(citizenship) ||
    !status ||
    !jobOffer ||
    !slovakGraduate ||
    !blueCardConditions ||
    !shortageOccupation
  ) {
    return null;
  }

  return {
    destinationCountryCode: "SK",
    citizenshipCountryCode: citizenship,
    currentResidenceStatus: status,
    jobOffer,
    slovakGraduate,
    blueCardConditions,
    shortageOccupation,
  };
}

export function createWorkProfileSearchParams(profile: WorkProfile) {
  return new URLSearchParams({
    country: profile.destinationCountryCode,
    citizenship: profile.citizenshipCountryCode,
    residenceStatus: profile.currentResidenceStatus,
    offer: profile.jobOffer,
    skGraduate: profile.slovakGraduate,
    blueCard: profile.blueCardConditions,
    shortage: profile.shortageOccupation,
  });
}

// Progress ticks belong to one set of answers; changing an answer that
// changes the checklist starts a fresh progress list.
export function getWorkProgressId(profile: WorkProfile) {
  return [
    profile.citizenshipCountryCode,
    profile.currentResidenceStatus,
    profile.jobOffer,
    selectWorkRoute(profile),
    profile.shortageOccupation,
  ].join("|");
}
