import {
  currentResidenceStatuses,
  degreeLevels,
  studyIntakes,
  type CurrentResidenceStatus,
  type DegreeLevel,
  type StudyIntake,
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
    case "destination-residence":
      return `Residence permit for ${destinationName}`;
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
