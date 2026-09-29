import type { SupabaseClient } from "@supabase/supabase-js";

import {
  cefrLevels,
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

import type {
  Database,
  Json,
} from "@/types/database";

type ApplicantProfileRow =
  Database["public"]["Tables"]["applicant_profiles"]["Row"];

const educationStatuses = new Set<EducationStatus>([
  "completed",
  "final-year",
  "earlier-year",
]);

const gradeScales = new Set<GradeScale>([
  "slovak-1-5",
  "other",
]);

const waiverEvidenceOptions =
  new Set<WaiverEvidence>([
    "math-matura",
    "scio-math-60",
    "scio-general-70",
    "ccna",
    "fri-course",
    "olympiad",
  ]);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value),
  );
}

function isApplicantLanguage(
  value: unknown,
): value is ApplicantLanguage {
  if (!isRecord(value)) {
    return false;
  }

  return Boolean(
    typeof value.code === "string" &&
      cefrLevels.includes(
        value.level as ApplicantLanguage["level"],
      ) &&
      typeof value.willingToStudyIn === "boolean" &&
      ["none", "school", "certificate"].includes(
        String(value.proof),
      ) &&
      (value.certificateName === undefined ||
        typeof value.certificateName === "string"),
  );
}

function rowToApplicantProfile(
  row: ApplicantProfileRow,
): ApplicantProfile | null {
  const residenceStatus = normalizeCurrentResidenceStatus(
    row.current_residence_status,
  );

  if (
    !isDegreeLevel(row.degree_level) ||
    !isStudyIntake(row.intake) ||
    !residenceStatus ||
    !educationStatuses.has(
      row.education_status as EducationStatus,
    ) ||
    !gradeScales.has(
      row.grade_scale as GradeScale,
    ) ||
    !Array.isArray(row.languages) ||
    !Array.isArray(row.waiver_evidence)
  ) {
    return null;
  }

  const languages =
    row.languages.filter(isApplicantLanguage);

  const waiverEvidence = row.waiver_evidence.filter(
    (value): value is WaiverEvidence =>
      typeof value === "string" &&
      waiverEvidenceOptions.has(
        value as WaiverEvidence,
      ),
  );

  if (languages.length === 0) {
    return null;
  }

  return {
    destinationCountryCode:
      row.destination_country_code,

    studyCategory: row.study_category,

    degreeLevel: row.degree_level,

    intake: row.intake,

    citizenshipCountryCode:
      row.citizenship_country_code,

    educationCountryCode:
      row.education_country_code,

    currentResidenceStatus: residenceStatus,

    educationStatus:
      row.education_status as EducationStatus,

    gradeScale:
      row.grade_scale as GradeScale,

    penultimateYearAverage:
      row.penultimate_year_average ?? undefined,

    languages,

    waiverEvidence,
  };
}

function languagesToJson(
  languages: ApplicantLanguage[],
): Json {
  return languages.map((language) => ({
    code: language.code,
    level: language.level,
    willingToStudyIn:
      language.willingToStudyIn,
    proof: language.proof,

    ...(language.certificateName
      ? {
          certificateName:
            language.certificateName,
        }
      : {}),
  }));
}

export async function loadApplicantProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("applicant_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? rowToApplicantProfile(data)
    : null;
}

export async function saveApplicantProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: ApplicantProfile,
) {
  const { error } = await supabase
    .from("applicant_profiles")
    .upsert(
      {
        user_id: userId,

        destination_country_code:
          profile.destinationCountryCode,

        study_category:
          profile.studyCategory,

        degree_level:
          profile.degreeLevel,

        intake:
          profile.intake,

        citizenship_country_code:
          profile.citizenshipCountryCode,

        education_country_code:
          profile.educationCountryCode,

        current_residence_status:
          profile.currentResidenceStatus,

        education_status:
          profile.educationStatus,

        grade_scale:
          profile.gradeScale,

        penultimate_year_average:
          profile.penultimateYearAverage ?? null,

        languages:
          languagesToJson(profile.languages),

        waiver_evidence:
          profile.waiverEvidence,

        profile_version: 2,
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    throw error;
  }
}
