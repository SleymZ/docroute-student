import {
  cefrLevels,
  waiverEvidenceOptions,
  type ApplicantLanguage,
  type ApplicantProfile,
  type EducationStatus,
  type GradeScale,
  type WaiverEvidence,
} from "@/types/admission";
import {
  isDegreeLevel,
  isStudyIntake,
  normalizeCurrentResidenceStatus,
} from "@/lib/profile-options";

type SearchParamsReader = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

const educationStatuses = new Set<EducationStatus>([
  "completed",
  "final-year",
  "earlier-year",
]);

const gradeScales = new Set<GradeScale>(["slovak-1-5", "other"]);

function serializeLanguage(language: ApplicantLanguage) {
  return [
    language.code,
    language.level,
    language.willingToStudyIn ? "1" : "0",
    language.proof,
    encodeURIComponent(language.certificateName ?? ""),
  ].join("|");
}

function parseLanguage(value: string): ApplicantLanguage | null {
  const [code, level, willing, proof, encodedName = ""] = value.split("|");

  if (
    !code ||
    !cefrLevels.includes(level as ApplicantLanguage["level"]) ||
    !/^(?:[a-z]{2}|other)$/.test(code) ||
    !["0", "1"].includes(willing) ||
    !["none", "school", "certificate", "uniza-test"].includes(proof) ||
    (proof === "uniza-test" && code !== "sk")
  ) {
    return null;
  }

  let certificateName = "";

  try {
    certificateName = decodeURIComponent(encodedName);
  } catch {
    certificateName = "";
  }

  return {
    code,
    level: level as ApplicantLanguage["level"],
    willingToStudyIn: willing === "1",
    proof: proof as ApplicantLanguage["proof"],
    ...(certificateName ? { certificateName } : {}),
  };
}

export function createProfileSearchParams(profile: ApplicantProfile) {
  const params = new URLSearchParams({
    country: profile.destinationCountryCode,
    program: profile.studyCategory,
    degree: profile.degreeLevel,
    intake: profile.intake,
    citizenship: profile.citizenshipCountryCode,
    educationCountry: profile.educationCountryCode,
    residenceStatus: profile.currentResidenceStatus,
    educationStatus: profile.educationStatus,
    gradeScale: profile.gradeScale,
  });

  if (profile.penultimateYearAverage !== undefined) {
    params.set("average", String(profile.penultimateYearAverage));
  }

  for (const language of profile.languages) {
    params.append("lang", serializeLanguage(language));
  }

  for (const evidence of profile.waiverEvidence) {
    params.append("waiver", evidence);
  }

  return params;
}

export function parseApplicantProfile(
  params: SearchParamsReader,
): ApplicantProfile | null {
  const destinationCountryCode = params.get("country")?.toUpperCase() ?? "";
  const studyCategory = params.get("program")?.trim() ?? "";
  const citizenshipCountryCode = params.get("citizenship")?.toUpperCase() ?? "";
  const educationCountryCode =
    params.get("educationCountry")?.toUpperCase() ?? "";
  const rawDegreeLevel = params.get("degree") ?? "bachelor";
  const rawIntake = params.get("intake") ?? "2027/28";

  const rawEducationStatus = params.get("educationStatus");
  const rawGradeScale = params.get("gradeScale");
  const residenceStatus = normalizeCurrentResidenceStatus(
    params.get("residenceStatus") ?? "non-eu-passport-no-residence",
  );
  const rawAverage = params.get("average");

  if (
    !destinationCountryCode ||
    !studyCategory ||
    !citizenshipCountryCode ||
    !educationCountryCode ||
    ![
      destinationCountryCode,
      citizenshipCountryCode,
      educationCountryCode,
    ].every((code) => /^[A-Z]{2}$/.test(code)) ||
    !isDegreeLevel(rawDegreeLevel) ||
    !isStudyIntake(rawIntake) ||
    !residenceStatus ||
    !rawEducationStatus ||
    !educationStatuses.has(rawEducationStatus as EducationStatus) ||
    !rawGradeScale ||
    !gradeScales.has(rawGradeScale as GradeScale)
  ) {
    return null;
  }

  const languages = params
    .getAll("lang")
    .map(parseLanguage)
    .filter((language): language is ApplicantLanguage => language !== null);

  if (languages.length === 0) {
    return null;
  }

  const average = rawAverage ? Number(rawAverage) : undefined;
  if (
    average !== undefined &&
    (!Number.isFinite(average) ||
      average <= 0 ||
      (rawGradeScale === "slovak-1-5" && (average < 1 || average > 5)))
  ) {
    return null;
  }

  if (
    new Set(languages.map((language) => language.code)).size !==
    languages.length
  ) {
    return null;
  }

  const waiverEvidence = params
    .getAll("waiver")
    .filter((value): value is WaiverEvidence =>
      waiverEvidenceOptions.includes(value as WaiverEvidence),
    );

  return {
    destinationCountryCode,
    studyCategory,
    degreeLevel: rawDegreeLevel,
    intake: rawIntake,
    citizenshipCountryCode,
    educationCountryCode,
    currentResidenceStatus: residenceStatus,
    educationStatus: rawEducationStatus as EducationStatus,
    gradeScale: rawGradeScale as GradeScale,
    penultimateYearAverage:
      average !== undefined && Number.isFinite(average) ? average : undefined,
    languages,
    waiverEvidence,
  };
}

// Stable opaque namespace for checklist progress, not an auth or privacy boundary.
export function getProfileProgressId(profile: ApplicantProfile) {
  const canonical = createProfileSearchParams({
    ...profile,
    languages: [...profile.languages].sort((a, b) =>
      a.code.localeCompare(b.code, "en"),
    ),
    waiverEvidence: [...profile.waiverEvidence].sort(),
  }).toString();
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    hash = Math.imul(hash ^ canonical.charCodeAt(index), 16777619);
  }
  return (hash >>> 0).toString(36);
}
