import {
  currentResidenceStatuses,
  degreeLevels,
  studyIntakes,
  type ApplicantLanguage,
  type CurrentResidenceStatus,
  type DegreeLevel,
  type StudyIntake,
  type WaiverEvidence,
} from "@/types/admission";

const legacyResidenceStatuses: Record<string, CurrentResidenceStatus> = {
  "outside-slovakia": "non-eu-passport-no-residence",
  "slovak-residence": "destination-residence",
  "eu-residence": "other-eu-residence",
  "slovak-national-visa": "destination-national-visa",
  "visa-free": "visa-free-entry",
};

// EU member states plus EEA (IS, LI, NO) and Switzerland: citizens of these
// countries do not use the third-country student residence procedure.
// ISO 3166-1 alpha-2 codes (Greece is GR here, not the EU's "EL").
const euEeaSwissCountryCodes = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  "IS", "LI", "NO",
  "CH",
]);

export function isEuEeaSwissCitizen(countryCode: string) {
  return euEeaSwissCountryCodes.has(countryCode.toUpperCase());
}

// Citizenship is the authority; a status label alone never changes the route.
// Only clear contradictions are reported, so dual or unusual situations are
// not blocked ("ZZ" = other country is never treated as a contradiction).
export function findResidenceStatusConflict(
  citizenshipCountryCode: string,
  status: CurrentResidenceStatus,
) {
  if (!citizenshipCountryCode || citizenshipCountryCode === "ZZ") {
    return null;
  }

  const euCitizen = isEuEeaSwissCitizen(citizenshipCountryCode);

  if (status === "eu-eea-swiss-passport" && !euCitizen) {
    return "You selected an EU, EEA or Swiss passport, but your citizenship is outside the EU, EEA and Switzerland. Select the citizenship of that passport or choose your actual residence status.";
  }

  if (status === "non-eu-passport-no-residence" && euCitizen) {
    return "You selected a non-EU passport, but your citizenship is in the EU, EEA or Switzerland. Select the passport you will travel with or choose the EU, EEA or Swiss passport status.";
  }

  return null;
}

// Labels shared by the profile form and the account page.
export const waiverEvidenceLabels: Record<WaiverEvidence, string> = {
  "math-matura": "Mathematics maturita (percentile not given)",
  "math-matura-60": "External mathematics maturita 60+",
  "scio-math-60": "SCIO Mathematics 60+",
  "scio-general-70": "SCIO General 70+",
  ccna: "CCNA or higher",
  "fri-course": "FRI preparatory course",
  olympiad: "Competition (scope not given)",
  "regional-olympiad": "Qualifying olympiad result",
};

// Older saved profiles may hold evidence that is too vague to confirm a waiver.
export const legacyWaiverEvidence: ReadonlySet<WaiverEvidence> = new Set([
  "math-matura",
  "olympiad",
]);

export const languageProofLabels: Record<ApplicantLanguage["proof"], string> = {
  none: "No proof yet",
  school: "School record",
  certificate: "Certificate or test",
  "uniza-test": "UNIZA Slovak test",
};

export function isDegreeLevel(value: string): value is DegreeLevel {
  return degreeLevels.includes(value as DegreeLevel);
}

export function isStudyIntake(value: string): value is StudyIntake {
  return studyIntakes.includes(value as StudyIntake);
}

export function normalizeCurrentResidenceStatus(
  value: string | null | undefined,
): CurrentResidenceStatus | null {
  if (!value) {
    return null;
  }

  const normalized = legacyResidenceStatuses[value] ?? value;

  return currentResidenceStatuses.includes(
    normalized as CurrentResidenceStatus,
  )
    ? (normalized as CurrentResidenceStatus)
    : null;
}

export function formatDegreeLevel(value: DegreeLevel) {
  return value === "master" ? "Master's" : "Bachelor's";
}

export function getResidenceStatusLabel(
  status: CurrentResidenceStatus,
  destinationName: string,
) {
  switch (status) {
    case "eu-eea-swiss-passport":
      return "EU, EEA or Swiss passport";
    case "non-eu-passport-no-residence":
      return "Non-EU passport · no residence permit";
    case "destination-study-residence":
      return `Temporary residence for study in ${destinationName}`;
    case "destination-residence":
      return `Temporary residence in ${destinationName} for another purpose (work, family…)`;
    case "destination-permanent-residence":
      return `Permanent or long-term residence in ${destinationName}`;
    case "other-eu-residence":
      return "Residence permit in another EU / EEA country";
    case "destination-national-visa":
      return `National visa for ${destinationName}`;
    case "visa-free-entry":
      return `Visa-free stay in ${destinationName}`;
    case "temporary-protection":
      return "Temporary protection or equivalent status";
    case "other":
      return "Another status / not sure";
  }
}
