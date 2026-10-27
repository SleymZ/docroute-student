import assert from "node:assert/strict";
import { test } from "node:test";

import { verifiedPrograms } from "../src/data/verified-programs";
import catalog from "../src/data/universities.json";
import { getAdmissionDate } from "../src/lib/admission-date";
import { buildRoutePreview } from "../src/lib/build-route-preview";
import { matchProgram, matchPrograms, slovakTestRule } from "../src/lib/match-programs";
import {
  createProfileSearchParams,
  getProfileProgressId,
  parseApplicantProfile,
} from "../src/lib/profile-query";
import type {
  ApplicantLanguage,
  ApplicantProfile,
  WaiverEvidence,
} from "../src/types/admission";

const program = verifiedPrograms[0];
const today = "2026-10-19";

function profile(patch: Partial<ApplicantProfile> = {}): ApplicantProfile {
  return {
    destinationCountryCode: "SK",
    studyCategory: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    citizenshipCountryCode: "IL",
    educationCountryCode: "SK",
    currentResidenceStatus: "destination-residence",
    educationStatus: "final-year",
    gradeScale: "slovak-1-5",
    languages: [
      {
        code: "en",
        level: "C1",
        willingToStudyIn: true,
        proof: "certificate",
        certificateName: "IELTS",
      },
      { code: "sk", level: "B1", willingToStudyIn: true, proof: "none" },
      { code: "ru", level: "native", willingToStudyIn: false, proof: "none" },
    ],
    waiverEvidence: [],
    ...patch,
  };
}

function match(patch: Partial<ApplicantProfile> = {}) {
  return matchProgram(profile(patch), program, today);
}

for (const [label, patch] of [
  ["another country", { destinationCountryCode: "CZ" }],
  ["another subject", { studyCategory: "Medicine" }],
  ["master's degree", { degreeLevel: "master" }],
  ["another intake", { intake: "2028/29" }],
] as const) {
  test(`exact filtering excludes ${label}`, () => {
    assert.deepEqual(
      matchPrograms(profile(patch), verifiedPrograms, today),
      [],
    );
    const direct = match(patch);
    assert.equal(direct.status, "unavailable");
    assert.equal(direct.canBuildRoute, false);
    assert.deepEqual(direct.requiredDocuments, []);
    assert.equal(buildRoutePreview(profile(patch), direct), null);
  });
}

test("four verified programs are returned for the exact first scenario", () => {
  assert.equal(matchPrograms(profile(), verifiedPrograms, today).length, 4);
});

test("an unknown policy never borrows UNIZA's matching thresholds", () => {
  const result = matchProgram(
    profile(),
    { ...program, admissionPolicy: "another-faculty" },
    today,
  );
  assert.equal(result.status, "more-information");
  assert.equal(result.canBuildRoute, false);
});

test("published deadline remains usable on its final day", () => {
  assert.equal(
    matchProgram(profile(), program, "2027-03-31").canBuildRoute,
    true,
  );
});

test("a passed deadline cannot produce an active preview", () => {
  const result = matchProgram(profile(), program, "2027-04-01");
  assert.equal(result.status, "unavailable");
  assert.equal(result.canBuildRoute, false);
  assert.equal(buildRoutePreview(profile(), result), null);
  assert.match(result.summary, /later round/);
});

for (const date of ["", "invalid", "2027-02-30"]) {
  test(`an invalid evaluation date (${date}) fails safely`, () => {
    const result = matchProgram(profile(), program, date);
    assert.equal(result.status, "more-information");
    assert.equal(result.canBuildRoute, false);
  });
}

test("admission calendar uses Slovakia's date across a UTC midnight boundary", () => {
  assert.equal(
    getAdmissionDate(new Date("2027-03-31T22:00:00Z")),
    "2027-04-01",
  );
  assert.equal(
    getAdmissionDate(new Date("2027-03-31T21:59:59Z")),
    "2027-03-31",
  );
});

test("English alone does not satisfy a Slovak-taught program", () => {
  const result = match({
    languages: profile().languages.filter((language) => language.code === "en"),
  });
  assert.equal(result.status, "preparation-required");
  assert.equal(
    result.checks.find((item) => item.id === "language")?.status,
    "missing",
  );
  assert.equal(
    result.checks.find((item) => item.id === "study-language")?.status,
    "missing",
  );
});

test("knowing Slovak and agreeing to study in it are separate conditions", () => {
  const result = match({
    educationCountryCode: "IL",
    languages: profile().languages.map((language) => ({
      ...language,
      willingToStudyIn: language.code === "en",
    })),
  });
  assert.equal(
    result.checks.find((item) => item.id === "language")?.status,
    "action",
  );
  assert.equal(
    result.checks.find((item) => item.id === "study-language")?.status,
    "missing",
  );
});

for (const proof of ["none", "school", "certificate"] as const) {
  test(`${proof} does not automatically replace UNIZA's specific test`, () => {
    const result = match({
      educationCountryCode: "IL",
      languages: [{ code: "sk", level: "C1", willingToStudyIn: true, proof }],
    });
    assert.equal(
      result.checks.find((item) => item.id === "language")?.status,
      "action",
    );
  });
}

test("an explicitly reported qualifying UNIZA result satisfies the test check", () => {
  const result = match({
    educationCountryCode: "IL",
    languages: [
      { code: "sk", level: "B1", willingToStudyIn: true, proof: "uniza-test" },
    ],
  });
  assert.equal(
    result.checks.find((item) => item.id === "language")?.status,
    "met",
  );
});

test("a claimed test with an insufficient reported level is not accepted", () => {
  const result = match({
    educationCountryCode: "IL",
    languages: [
      { code: "sk", level: "A2", willingToStudyIn: true, proof: "uniza-test" },
    ],
  });
  assert.equal(
    result.checks.find((item) => item.id === "language")?.status,
    "missing",
  );
});

test("a foreign citizen with Slovak schooling is asked to confirm the test exemption", () => {
  // FRI rules do not say whether "foreign applicant" means citizenship or
  // schooling abroad, so DocRoute must not decide either way.
  const result = match();
  const language = result.checks.find((item) => item.id === "language");
  assert.equal(language?.status, "unknown");
  assert.equal(result.status, "more-information");
  const document = result.requiredDocuments.find(
    (item) => item.id === "uniza-language-result",
  );
  assert.equal(document?.conditional, true);
  assert.ok(
    !result.requiredDocuments.some(
      (item) => item.id === "recognition-decision",
    ),
  );
});

for (const [citizenship, education] of [
  ["CZ", "UA"],
  ["UA", "CZ"],
  ["SK", "DE"],
] as const) {
  test(`citizenship ${citizenship} with school in ${education} is not auto-exempt`, () => {
    assert.equal(
      slovakTestRule(program, {
        citizenshipCountryCode: citizenship,
        educationCountryCode: education,
      }),
      "unclear",
    );
  });
}

test("foreign citizenship and schooling abroad always require the UNIZA test", () => {
  assert.equal(
    slovakTestRule(program, { citizenshipCountryCode: "UA", educationCountryCode: "UA" }),
    "required",
  );
});

test("Czech citizenship exemption does not invent a numerical CEFR threshold", () => {
  const result = match({
    citizenshipCountryCode: "CZ",
    educationCountryCode: "CZ",
    languages: [
      { code: "sk", level: "A1", willingToStudyIn: true, proof: "none" },
      { code: "cs", level: "native", willingToStudyIn: false, proof: "none" },
    ],
  });
  const language = result.checks.find((item) => item.id === "language");
  assert.equal(language?.status, "action");
  assert.match(language!.detail, /no CEFR threshold/);
  assert.ok(
    !result.requiredDocuments.some(
      (item) => item.id === "uniza-language-result",
    ),
  );
});

for (const evidence of [
  "math-matura-60",
  "scio-math-60",
  "scio-general-70",
  "ccna",
  "regional-olympiad",
] as WaiverEvidence[]) {
  test(`${evidence} offers a possible waiver, not guaranteed admission`, () => {
    const result = match({ waiverEvidence: [evidence] });
    assert.equal(result.entranceRoute, "waived");
    assert.equal(
      result.checks.find((item) => item.id === "entrance-route")?.status,
      "action",
    );
    assert.ok(
      result.requiredDocuments.some((item) => item.id === "waiver-evidence"),
    );
    assert.ok(
      !result.requiredDocuments.some(
        (item) => item.appliesWhen === "entrance-exam",
      ),
    );
  });
}

for (const evidence of ["math-matura", "olympiad"] as WaiverEvidence[]) {
  test(`legacy ${evidence} needs clarification rather than granting a waiver`, () => {
    const result = match({ waiverEvidence: [evidence] });
    assert.equal(result.entranceRoute, "needs-information");
    assert.equal(result.status, "more-information");
    assert.ok(
      result.requiredDocuments.find((item) => item.id === "waiver-evidence")
        ?.conditional,
    );
    assert.ok(
      result.requiredDocuments.find(
        (item) => item.appliesWhen === "entrance-exam",
      )?.conditional,
    );
  });
}

for (const [average, expected] of [
  [1, "waived"],
  [1.7, "waived"],
  [1.71, "exam"],
  [5, "exam"],
  [0, "exam"],
  [-1, "exam"],
  [Number.NaN, "exam"],
  [6, "exam"],
] as const) {
  test(`Slovak grade average ${average} gives the correct entrance route`, () => {
    assert.equal(
      match({ penultimateYearAverage: average }).entranceRoute,
      expected,
    );
  });
}

test("foreign grades cannot be automatically reclassified as a Slovak waiver", () => {
  assert.equal(
    match({ educationCountryCode: "IL", penultimateYearAverage: 1.4 })
      .entranceRoute,
    "needs-information",
  );
  assert.equal(
    match({ gradeScale: "other", penultimateYearAverage: 1.4 }).entranceRoute,
    "exam",
  );
});

test("FRI course waiver requires an average of at most 2.00", () => {
  assert.equal(
    match({ waiverEvidence: ["fri-course"], penultimateYearAverage: 2 })
      .entranceRoute,
    "waived",
  );
  assert.equal(
    match({ waiverEvidence: ["fri-course"], penultimateYearAverage: 2.01 })
      .entranceRoute,
    "exam",
  );
  assert.equal(
    match({ waiverEvidence: ["fri-course"] }).entranceRoute,
    "needs-information",
  );
});

test("a final-year applicant still owes a final certificate on a waiver route", () => {
  const result = match({ waiverEvidence: ["ccna"] });
  assert.ok(
    result.requiredDocuments.some(
      (item) =>
        item.id === "graduation-certificate-later" && item.due === "enrolment",
    ),
  );
});

test("completed education requires the certificate with the application", () => {
  const result = match({ educationStatus: "completed" });
  assert.ok(
    result.requiredDocuments.some(
      (item) =>
        item.id === "graduation-certificate" && item.due === "application",
    ),
  );
  assert.ok(
    !result.requiredDocuments.some(
      (item) => item.id === "graduation-certificate-later",
    ),
  );
});

test("recognition depends on education country, not citizenship", () => {
  assert.ok(
    match({ educationCountryCode: "IL" }).requiredDocuments.some(
      (item) => item.id === "recognition-decision",
    ),
  );
  assert.ok(
    !match({ citizenshipCountryCode: "IL" }).requiredDocuments.some(
      (item) => item.id === "recognition-decision",
    ),
  );
});

test("preview preserves admission-day chronology and does not duplicate recognition", () => {
  const applicant = profile({ educationCountryCode: "IL" });
  const route = buildRoutePreview(
    applicant,
    matchProgram(applicant, program, today),
  );
  assert.ok(route);
  const admission = route.stages.find(
    (stage) => stage.id === "admission-conditions",
  )!;
  const enrolment = route.stages.find(
    (stage) => stage.id === "admission-enrolment",
  )!;
  assert.ok(
    admission.tasks.some(
      (task) => task.id === "admission-exam-identity-and-certificate",
    ),
  );
  assert.ok(!enrolment.tasks.some((task) => task.id.includes("exam-identity")));
  assert.equal(
    enrolment.tasks.filter((task) => /recognition/.test(task.id)).length,
    1,
  );
  assert.ok(
    enrolment.tasks.some(
      (task) => task.id === "later-graduation-certificate-later",
    ),
  );
});

test("every generated requirement and document has a resolvable official source", () => {
  for (const item of verifiedPrograms) {
    assert.ok(
      catalog.universities.some(
        (university) => university.id === item.universityId,
      ),
    );
    const ids = new Set(item.sources.map((source) => source.id));
    for (const detail of [
      ...item.documents,
      ...item.minimumRequirements,
      ...matchProgram(profile(), item, today).checks,
    ]) {
      assert.ok(detail.sourceIds.length);
      assert.ok(detail.sourceIds.every((id) => ids.has(id)));
    }
    assert.ok(
      item.sources.every((source) =>
        new URL(source.url).hostname.endsWith("uniza.sk"),
      ),
    );
  }
});

test("all known languages and precise evidence survive URL round-trip", () => {
  const applicant = profile({
    waiverEvidence: ["math-matura-60", "regional-olympiad"],
    penultimateYearAverage: 1.5,
  });
  assert.deepEqual(
    parseApplicantProfile(createProfileSearchParams(applicant)),
    applicant,
  );
});

test("new UNIZA proof and legacy evidence remain readable", () => {
  const applicant = profile({
    languages: [
      { code: "sk", level: "B1", proof: "uniza-test", willingToStudyIn: true },
    ],
    waiverEvidence: ["math-matura"],
  });
  const restored = parseApplicantProfile(createProfileSearchParams(applicant));
  assert.equal(restored?.languages[0].proof, "uniza-test");
  assert.equal(restored?.waiverEvidence[0], "math-matura");
});

for (const invalidAverage of ["0", "-1", "0.9", "5.1", "Infinity", "NaN"]) {
  test(`profile URL rejects invalid Slovak average ${invalidAverage}`, () => {
    const params = createProfileSearchParams(profile());
    params.set("average", invalidAverage);
    assert.equal(parseApplicantProfile(params), null);
  });
}

test("duplicate language rows and malformed country codes are rejected", () => {
  const params = createProfileSearchParams(profile());
  params.append("lang", params.getAll("lang")[0]);
  assert.equal(parseApplicantProfile(params), null);
  params.delete("lang");
  params.append("lang", "sk|B1|1|none|");
  params.set("citizenship", "INVALID");
  assert.equal(parseApplicantProfile(params), null);
});

test("checklist progress changes with the profile but not language-row ordering", () => {
  const original = profile();
  assert.equal(
    getProfileProgressId(original),
    getProfileProgressId({
      ...original,
      languages: [...original.languages].reverse(),
    }),
  );
  assert.notEqual(
    getProfileProgressId(original),
    getProfileProgressId({ ...original, educationCountryCode: "IL" }),
  );
  assert.notEqual(
    getProfileProgressId(original),
    getProfileProgressId({
      ...original,
      languages: original.languages.map((language): ApplicantLanguage => ({
        ...language,
        willingToStudyIn: false,
      })),
    }),
  );
});

test("the route lists the UNIZA Slovak test once", () => {
  const applicant = profile({ educationCountryCode: "IL" });
  const preview = buildRoutePreview(applicant, matchProgram(applicant, program, today));
  const tasks = preview!.stages.flatMap((stage) => stage.tasks);
  assert.ok(tasks.some((task) => task.id === "route-language"));
  assert.ok(!tasks.some((task) => task.id === "admission-uniza-language-result"));
});

test("the best match status is 'Steps remaining', never a sure fit", () => {
  const result = match({
    educationCountryCode: "IL",
    educationStatus: "completed",
    languages: [
      { code: "sk", level: "B2", willingToStudyIn: true, proof: "uniza-test" },
    ],
  });
  assert.equal(result.status, "conditional");
});
