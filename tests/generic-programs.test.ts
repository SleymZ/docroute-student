import assert from "node:assert/strict";
import { test } from "node:test";

import { findVerifiedProgram, verifiedPrograms } from "../src/data/verified-programs";
import { buildRoutePreview } from "../src/lib/build-route-preview";
import { matchProgram } from "../src/lib/match-programs";
import { formatProgramDegree } from "../src/lib/profile-options";
import type { ApplicantProfile } from "../src/types/admission";

const today = "2026-11-05";

function profile(patch: Partial<ApplicantProfile> = {}): ApplicantProfile {
  return {
    destinationCountryCode: "SK",
    studyCategory: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
    citizenshipCountryCode: "UA",
    educationCountryCode: "UA",
    currentResidenceStatus: "non-eu-passport-no-residence",
    educationStatus: "final-year",
    gradeScale: "other",
    languages: [{ code: "sk", level: "B2", willingToStudyIn: true, proof: "certificate" }],
    waiverEvidence: [],
    ...patch,
  };
}

const generic = verifiedPrograms.filter((program) => program.admissionPolicy === "generic-2027");

test("35 programmes at 18 faculties verified on 2026-11-05 use the shared policy with their own dates", () => {
  assert.equal(generic.length, 35);
  assert.equal(new Set(generic.map((program) => program.faculty + program.universityId)).size, 18);
  for (const program of generic) {
    assert.ok(program.genericRules, program.id);
    assert.equal(program.intake, "2027/28");
    assert.ok(program.application.deadline > today, `${program.id}: deadline must be ahead`);
    assert.ok(program.application.admissionDate >= program.application.deadline || program.application.admissionDate > today, program.id);
    assert.ok(["SK", "CZ"].includes(program.countryCode), "residence routes exist only for SK and CZ");
    for (const source of program.sources) assert.match(source.checkedAt, /^2026-1[01]-\d{2}$/);
  }
});

test("FIIT: a Ukrainian school needs Slovak B2 and recognition; a Slovak school does not", () => {
  const fiit = findVerifiedProgram("stu-fiit-informatika-bsc-2027")!;
  const foreign = matchProgram(profile(), fiit, today);
  assert.equal(foreign.canBuildRoute, true);
  assert.equal(foreign.checks.find((item) => item.id === "language")!.status, "action");
  const ids = foreign.requiredDocuments.map((item) => item.id);
  assert.ok(ids.includes("fiit-slovak-b2") && ids.includes("fiit-foreign-school") && ids.includes("fiit-maturita-2027"));
  assert.ok(buildRoutePreview(profile(), foreign));

  const noSlovak = matchProgram(profile({ languages: [{ code: "sk", level: "A2", willingToStudyIn: true, proof: "none" }] }), fiit, today);
  assert.equal(noSlovak.checks.find((item) => item.id === "language")!.status, "missing");
  assert.equal(noSlovak.status, "preparation-required");

  const local = matchProgram(profile({ educationCountryCode: "SK", citizenshipCountryCode: "SK" }), fiit, today);
  const localIds = local.requiredDocuments.map((item) => item.id);
  assert.equal(local.checks.find((item) => item.id === "recognition")!.status, "met");
  assert.ok(!localIds.includes("fiit-slovak-b2") && !localIds.includes("fiit-foreign-school"));
});

test("a page without a language rule asks the applicant to confirm it", () => {
  const fi = findVerifiedProgram("muni-fi-informatika-bsc-2027")!;
  const result = matchProgram(
    profile({ destinationCountryCode: "CZ", languages: [{ code: "cs", level: "B2", willingToStudyIn: true, proof: "none" }] }),
    fi,
    today,
  );
  assert.equal(result.checks.find((item) => item.id === "language")!.status, "unknown");
  assert.equal(result.status, "more-information");
});

test("JLF: Czech citizens need no Slovak proof; medicine and law are long-cycle, never 'bachelor'", () => {
  const jlf = findVerifiedProgram("uniba-jlf-medicine-2027-sk")!;
  const czech = matchProgram(
    profile({ studyCategory: "Medicine", citizenshipCountryCode: "CZ", educationCountryCode: "CZ", languages: [{ code: "sk", level: "B1", willingToStudyIn: true, proof: "none" }] }),
    jlf,
    today,
  );
  assert.equal(czech.checks.find((item) => item.id === "language")!.status, "met");
  assert.equal(formatProgramDegree(jlf), "Long-cycle master's (6 years)");
  assert.equal(formatProgramDegree(findVerifiedProgram("cuni-prf-law-mgr-2027")!), "Long-cycle master's (5 years)");
  assert.equal(formatProgramDegree(findVerifiedProgram("vut-fit-it-bsc-2027")!), "Bachelor's");
});

test("past deadlines close the generic route like any other", () => {
  const fi = findVerifiedProgram("muni-fi-informatika-bsc-2027")!;
  const late = matchProgram(profile({ destinationCountryCode: "CZ" }), fi, "2027-03-01");
  assert.equal(late.canBuildRoute, false);
});

test("routes for generic programmes use the programme's own entrance step, never another faculty's exam", () => {
  const fmfi = findVerifiedProgram("uniba-fmfi-inf-bsc-2027")!;
  const p = profile({ educationCountryCode: "SK", citizenshipCountryCode: "SK" });
  const route = buildRoutePreview(p, matchProgram(p, fmfi, today))!;
  const entrance = route.stages.flatMap((stage) => stage.tasks).find((task) => task.id === "route-entrance")!;
  assert.equal(entrance.title, "Grades or maths percentile (no faculty exam)");
  assert.equal(entrance.dueLabel, "Send results by 30 April 2027");
  assert.doesNotMatch(JSON.stringify(route), /mathematics and logical-thinking exam/);
  for (const program of generic) assert.ok(program.genericRules!.entrance.dueLabel.length > 5, program.id);

  const jlf = findVerifiedProgram("uniba-jlf-medicine-2027-sk")!;
  const med = { ...p, studyCategory: "Medicine" };
  const jlfRoute = buildRoutePreview(med, matchProgram(med, jlf, today))!;
  const jlfEntrance = jlfRoute.stages.flatMap((stage) => stage.tasks).find((task) => task.id === "route-entrance")!;
  assert.equal(jlfEntrance.title, "National Comparative Exam (NPS)");
});

test("1. LF UK: a Slovak maturita covers Czech C1 and needs no recognition", () => {
  const lf1 = findVerifiedProgram("cuni-lf1-medicine-mudr-2027")!;
  const sk = profile({ destinationCountryCode: "CZ", studyCategory: "Medicine", educationCountryCode: "SK", citizenshipCountryCode: "SK", languages: [{ code: "cs", level: "B2", willingToStudyIn: true, proof: "none" }] });
  const result = matchProgram(sk, lf1, today);
  assert.equal(result.checks.find((item) => item.id === "language")!.status, "met");
  assert.equal(result.checks.find((item) => item.id === "recognition")!.status, "met");
  const ids = result.requiredDocuments.map((item) => item.id);
  assert.ok(!ids.includes("lf1-czech-c1") && !ids.includes("lf1-nostrification"));
  const ua = matchProgram({ ...sk, educationCountryCode: "UA", citizenshipCountryCode: "UA" }, lf1, today);
  assert.ok(ua.requiredDocuments.some((item) => item.id === "lf1-czech-c1"));
});

test("each field has verified 2027/28 programmes in Slovakia and Czechia", () => {
  const count = (category: string) => verifiedPrograms.filter((program) => program.category === category && program.intake === "2027/28").length;
  assert.ok(count("Computer Science") >= 10, "Computer Science");
  assert.equal(count("Medicine"), 10);
  assert.equal(count("Economics & Business"), 10);
  // Every full-time Czech or Slovak law programme with published 2027/28
  // rules on 2026-11-05; Slovak law faculties had not published theirs yet.
  assert.equal(count("Law"), 5);
  for (const program of verifiedPrograms) assert.ok(["SK", "CZ"].includes(program.countryCode), program.id);
});

test("medicine programmes: dentistry follows its faculty's own 2027/28 rules", () => {
  const jlf = findVerifiedProgram("uniba-jlf-dentistry-2027-sk")!;
  assert.equal(jlf.application.feeEur, 100);
  assert.equal(jlf.durationYears, 5);
  assert.ok(jlf.documents.some((item) => item.id === "jlf-smz"));
  assert.ok(!jlf.documents.some((item) => item.id === "jlf-application"));
  const muniDentistry = findVerifiedProgram("muni-lf-dentistry-mddr-2027")!;
  assert.ok(!muniDentistry.documents.some((item) => item.id === "muni-lf-bonus-waiver"), "exam waiver is for General Medicine only");
  assert.ok(findVerifiedProgram("muni-lf-medicine-mudr-2027")!.documents.some((item) => item.id === "muni-lf-bonus-waiver"));
  const lf1Dentistry = findVerifiedProgram("cuni-lf1-dentistry-mddr-2027")!;
  assert.ok(!lf1Dentistry.documents.some((item) => item.id === "lf1-waiver"), "1. LF dentistry has no exam waiver");
  assert.ok(findVerifiedProgram("cuni-lf1-medicine-mudr-2027")!.documents.some((item) => item.id === "lf1-waiver"));
  const slovakSchool = matchProgram(profile({ destinationCountryCode: "CZ", studyCategory: "Medicine", educationCountryCode: "SK", citizenshipCountryCode: "SK" }), findVerifiedProgram("muni-lf-medicine-mudr-2027")!, today);
  assert.equal(slovakSchool.checks.find((item) => item.id === "recognition")!.status, "met");
  const hk = matchProgram(profile({ destinationCountryCode: "CZ", studyCategory: "Medicine", languages: [{ code: "cs", level: "C1", willingToStudyIn: true, proof: "certificate" }] }), findVerifiedProgram("lfhk-medicine-mudr-2027")!, today);
  assert.equal(hk.canBuildRoute, true);
  assert.equal(hk.checks.find((item) => item.id === "language")!.status, "action");
  assert.ok(hk.requiredDocuments.some((item) => item.id === "lfhk-czech-c1"));
});

test("economics: Slovak B1 at FPEDAS, faculty Czech tests at VŠE", () => {
  const fpedas = matchProgram(profile({ studyCategory: "Economics & Business", languages: [{ code: "sk", level: "B1", willingToStudyIn: true, proof: "certificate" }] }), findVerifiedProgram("uniza-fpedas-financial-management-bc-2027")!, today);
  assert.equal(fpedas.checks.find((item) => item.id === "language")!.status, "action");
  assert.ok(fpedas.requiredDocuments.some((item) => item.id === "fpedas-slovak-b1"));
  const czechSchool = matchProgram(profile({ destinationCountryCode: "CZ", studyCategory: "Economics & Business", educationCountryCode: "CZ" }), findVerifiedProgram("vse-fmv-international-trade-bc-2027")!, today);
  assert.ok(!czechSchool.requiredDocuments.some((item) => item.id === "vse-fmv-czech-test"), "a Czech school needs no Czech test");
  const abroad = matchProgram(profile({ destinationCountryCode: "CZ", studyCategory: "Economics & Business" }), findVerifiedProgram("vse-fmv-international-trade-bc-2027")!, today);
  assert.ok(abroad.requiredDocuments.some((item) => item.id === "vse-fmv-czech-test"));
});

test("LF UP exempts Slovak certificates; ZČU payment needs the specific symbol", () => {
  const upol = matchProgram(profile({ destinationCountryCode: "CZ", studyCategory: "Medicine", educationCountryCode: "SK", citizenshipCountryCode: "SK" }), findVerifiedProgram("upol-lf-medicine-mudr-2027")!, today);
  assert.equal(upol.checks.find((item) => item.id === "recognition")!.status, "met");
  assert.match(findVerifiedProgram("zcu-fpr-law-mgr-2027")!.documents.find((item) => item.id === "zcu-fpr-application")!.description, /specific symbol/);
});
