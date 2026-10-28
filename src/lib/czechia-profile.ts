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
  // Study only, when the person holds a permit from another EU / EEA
  // country ("other-eu-residence"). Older links without these answers
  // still work; the filing place is then "unclear".
  euPermitPurpose?: EuPermitPurpose;
  euPermitIssuer?: EuPermitIssuer;
  // The permit was issued for an exchange programme or a university
  // agreement and carries a note about it (one-year mobility).
  exchangeProgramme?: YesNoUnsure;
};

export type EuPermitPurpose = "study" | "other";
// "eu": an EU country other than Ireland and Denmark (e.g. Slovakia).
// "excluded": Ireland, Denmark, or a non-EU country (Norway, Iceland,
// Liechtenstein, Switzerland).
export type EuPermitIssuer = "eu" | "excluded";

export function asksEuPermit(purpose: string, status: string) {
  return purpose === "study" && status === "other-eu-residence";
}

/**
 * Holders of a long-term residence permit or long-term visa for study from
 * an EU country other than Ireland and Denmark may file the first Czech
 * study permit application in Czechia (ipc.gov.cz, study permit page).
 */
export function holdsEuStudyPermit(profile: CzechProfile) {
  return (
    asksEuPermit(profile.purpose, profile.currentResidenceStatus) &&
    profile.euPermitPurpose === "study" &&
    profile.euPermitIssuer === "eu"
  );
}

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
    const profile: CzechProfile = {
      destinationCountryCode: "CZ",
      purpose,
      citizenshipCountryCode: citizenship,
      currentResidenceStatus: status,
    };
    if (asksEuPermit(purpose, status)) {
      const permit = params.get("euPermit");
      const issuer = params.get("euIssuer");
      if (permit === "study" || permit === "other") profile.euPermitPurpose = permit;
      if (issuer === "eu" || issuer === "excluded") profile.euPermitIssuer = issuer;
      const exchange = yesNoUnsure(params.get("exchange"));
      if (permit === "study" && exchange) profile.exchangeProgramme = exchange;
    }
    return profile;
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
  if (profile.euPermitPurpose) params.set("euPermit", profile.euPermitPurpose);
  if (profile.euPermitIssuer) params.set("euIssuer", profile.euPermitIssuer);
  if (profile.exchangeProgramme) params.set("exchange", profile.exchangeProgramme);
  return params;
}

export function getCzechProgressId(profile: CzechProfile) {
  const permit = profile.euPermitPurpose
    ? [`${profile.euPermitPurpose}-${profile.euPermitIssuer ?? ""}`]
    : [];
  return [
    profile.purpose,
    profile.citizenshipCountryCode,
    profile.currentResidenceStatus,
    profile.purpose === "work" ? selectCzechWorkProcedure(profile) : "",
    profile.jobOffer ?? "",
    ...permit,
  ].join("|");
}
