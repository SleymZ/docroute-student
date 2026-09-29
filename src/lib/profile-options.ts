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
