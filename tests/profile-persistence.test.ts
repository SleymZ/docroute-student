import assert from "node:assert/strict";
import { test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  loadApplicantProfile,
  saveApplicantProfile,
} from "../src/lib/supabase/applicant-profile";
import type { ApplicantProfile } from "../src/types/admission";
import type { Database } from "../src/types/database";

const applicant: ApplicantProfile = {
  destinationCountryCode: "SK",
  studyCategory: "Computer Science",
  degreeLevel: "bachelor",
  intake: "2027/28",
  citizenshipCountryCode: "IL",
  educationCountryCode: "SK",
  currentResidenceStatus: "destination-residence",
  educationStatus: "final-year",
  gradeScale: "slovak-1-5",
  penultimateYearAverage: 1.7,
  languages: [
    { code: "sk", level: "B1", willingToStudyIn: true, proof: "uniza-test" },
  ],
  waiverEvidence: ["math-matura-60", "regional-olympiad"],
};

test("new evidence and language proof persist in existing JSON columns without a migration", async () => {
  let saved: Record<string, unknown> | null = null;
  const supabase = {
    from(table: string) {
      assert.equal(table, "applicant_profiles");
      return {
        async upsert(row: Record<string, unknown>) {
          saved = row;
          return { error: null };
        },
        select() {
          return {
            eq(column: string, userId: string) {
              assert.equal(column, "user_id");
              assert.equal(userId, "test-user");
              return {
                async maybeSingle() {
                  return { data: saved, error: null };
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient<Database>;
  await saveApplicantProfile(supabase, "test-user", applicant);
  assert.deepEqual(
    await loadApplicantProfile(supabase, "test-user"),
    applicant,
  );
});

test("old ambiguous evidence loads but is never rewritten as precise evidence", async () => {
  const row = {
    destination_country_code: "SK",
    study_category: "Computer Science",
    degree_level: "bachelor",
    intake: "2027/28",
    citizenship_country_code: "IL",
    education_country_code: "SK",
    current_residence_status: "slovak-residence",
    education_status: "final-year",
    grade_scale: "slovak-1-5",
    penultimate_year_average: 1.7,
    languages: [
      { code: "sk", level: "B1", willingToStudyIn: true, proof: "none" },
    ],
    waiver_evidence: ["math-matura", "olympiad"],
  };
  const supabase = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                async maybeSingle() {
                  return { data: row, error: null };
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient<Database>;
  const loaded = await loadApplicantProfile(supabase, "test-user");
  assert.deepEqual(loaded?.waiverEvidence, ["math-matura", "olympiad"]);
  assert.equal(loaded?.currentResidenceStatus, "destination-residence");
  row.penultimate_year_average = 0.5;
  assert.equal(await loadApplicantProfile(supabase, "test-user"), null);
});
