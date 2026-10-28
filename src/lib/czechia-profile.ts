import { normalizeCurrentResidenceStatus } from "@/lib/profile-options";
import type { YesNo, YesNoUnsure } from "@/lib/work-profile";
import type { CurrentResidenceStatus } from "@/types/admission";

export type CzechPurpose = "study" | "work";

// Answers for the Czech study or work residence route. Kept in the URL
// (the page is noindex), like the Slovak routes.
export type CzechProfile = {
  destinationCountryCode: "CZ";
  purpose: CzechPurpose;
  citizenshipCountryCode: string;
  currentResidenceStatus: CurrentResidenceStatus;
  // Work only.
  jobOffer?: YesNo;
  // Graduated from a Czech secondary school, higher vocational school,
  // conservatory or university (free access to the labour market).
  czechGraduate?: YesNo;
  // Self-reported Blue Card conditions.
  blueCardConditions?: YesNoUnsure;
};

export type CzechWorkProcedure = "employee-card" | "blue-card" | "free-access";

export const czechWorkLabels: Record<CzechWorkProcedure, string> = {
  "employee-card": "Employee card",
  "blue-card": "EU Blue Card",
  "free-access": "Employee card with free access to the labour market",
};

export function selectCzechWorkProcedure(profile: CzechProfile): CzechWorkProcedure {
  if (profile.czechGraduate === "yes") return "free-access";
  if (profile.blueCardConditions === "yes") return "blue-card";
  return "employee-card";
}

const yesNo = (value: string | null): YesNo | null =>
  value === "yes" || value === "no" ? value : null;

const yesNoUnsure = (value: string | null): YesNoUnsure | null =>
  value === "yes" || value === "no" || value === "unsure" ? value : null;

export function parseCzechProfile(params: URLSearchParams): CzechProfile | null {
  if ((params.get("country") ?? "CZ").toUpperCase() !== "CZ") return null;

  const purpose = params.get("purpose");
  const citizenship = (params.get("citizenship") ?? "").toUpperCase();
  const status = normalizeCurrentResidenceStatus(params.get("residenceStatus"));

  if ((purpose !== "study" && purpose !== "work") || !/^[A-Z]{2}$/.test(citizenship) || !status) {
    return null;
  }

  if (purpose === "study") {
    return {
      destinationCountryCode: "CZ",
      purpose,
      citizenshipCountryCode: citizenship,
      currentResidenceStatus: status,
    };
  }

  const jobOffer = yesNo(params.get("offer"));
  const czechGraduate = yesNo(params.get("czGraduate"));
  const blueCardConditions = yesNoUnsure(params.get("blueCard"));
  if (!jobOffer || !czechGraduate || !blueCardConditions) return null;

  return {
    destinationCountryCode: "CZ",
    purpose,
    citizenshipCountryCode: citizenship,
    currentResidenceStatus: status,
    jobOffer,
    czechGraduate,
    blueCardConditions,
  };
}

export function createCzechProfileSearchParams(profile: CzechProfile) {
  const params = new URLSearchParams({
    country: "CZ",
    purpose: profile.purpose,
    citizenship: profile.citizenshipCountryCode,
    residenceStatus: profile.currentResidenceStatus,
  });
  if (profile.purpose === "work") {
    params.set("offer", profile.jobOffer ?? "");
    params.set("czGraduate", profile.czechGraduate ?? "");
    params.set("blueCard", profile.blueCardConditions ?? "");
  }
  return params;
}

export function getCzechProgressId(profile: CzechProfile) {
  return [
    profile.purpose,
    profile.citizenshipCountryCode,
    profile.currentResidenceStatus,
    profile.purpose === "work" ? selectCzechWorkProcedure(profile) : "",
    profile.jobOffer ?? "",
  ].join("|");
}
