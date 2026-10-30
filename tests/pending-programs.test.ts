import assert from "node:assert/strict";
import { test } from "node:test";

import {
  findPendingProgramGroups,
  pendingProgramGroups,
} from "../src/data/pending-programs";
import catalog from "../src/data/universities.json";
import { findVerifiedProgram, verifiedPrograms } from "../src/data/verified-programs";
import { matchPrograms } from "../src/lib/match-programs";
import type { ApplicantProfile } from "../src/types/admission";

const profile: ApplicantProfile = {
  destinationCountryCode: "SK",
  studyCategory: "Computer Science",
  degreeLevel: "bachelor",
  intake: "2027/28",
  citizenshipCountryCode: "UA",
  educationCountryCode: "UA",
  currentResidenceStatus: "non-eu-passport-no-residence",
  educationStatus: "final-year",
  gradeScale: "other",
  languages: [
    { code: "sk", level: "B2", willingToStudyIn: true, proof: "none" },
  ],
  waiverEvidence: [],
};

// Official domains a university moved to after the catalog import.
const hostAliases: Record<string, string[]> = {
  "vutbr.cz": ["vut.cz"],
  "tuwien.ac.at": ["tuwien.at"],
  // MedAT is run jointly by the Austrian medical universities on its own site.
  "meduniwien.at": ["meduniwien.ac.at", "medizinstudieren.at"],
  // Semmelweis and WU moved to new domains after the catalog import.
  "sote.hu": ["semmelweis.hu"],
  "wu-wien.ac.at": ["wu.ac.at"],
  // Added 2026-10-30: TalTech, TU Liberec and Salzburg use newer domains.
  "ttu.ee": ["taltech.ee"],
  "vslib.cz": ["tul.cz"],
  "sbg.ac.at": ["plus.ac.at"],
  "aubg.bg": ["aubg.edu"],
  // Saarland's computer science faculty runs its own campus site.
  "uni-saarland.de": ["saarland-informatics-campus.de"],
  "uta.fi": ["tuni.fi"],
  "jacobs-university.de": ["constructor.university"],
  "unibocconi.eu": ["unibocconi.it"],
  "en.ktu.edu": ["ktu.edu"],
  "hj.se": ["ju.se"],
  "pjwstk.edu.pl": ["pja.edu.pl"],
  "am.wroc.pl": ["umw.edu.pl"],
  "info.kma.lt": ["lsmu.lt"],
};

function onUniversityDomain(hostname: string, universityHost: string) {
  return [universityHost, ...(hostAliases[universityHost] ?? [])].some(
    (domain) => hostname === domain || hostname.endsWith("." + domain),
  );
}

function host(website: string) {
  return new URL(website).hostname.replace(/^www\./, "");
}

test("each pending group points at an existing catalog institution", () => {
  for (const group of pendingProgramGroups) {
    const university = catalog.universities.find(
      (item) => item.id === group.universityId,
    );
    if (!university) {
      assert.fail(`${group.id} has no catalog entry`);
    }
    assert.equal(host(university.website), group.universityHost);
    assert.equal(university.countryCode, group.countryCode);
  }
});

test("a pending group never duplicates a verified program scope", () => {
  for (const group of pendingProgramGroups) {
    assert.equal(
      verifiedPrograms.some(
        (program) =>
          program.universityId === group.universityId &&
          program.category === group.category &&
          program.degreeLevel === group.degreeLevel &&
          program.intake === group.intake,
      ),
      false,
      `${group.id} is already verified; remove the pending entry`,
    );
  }
});

test("pending programs never produce a match, route or checklist", () => {
  const matches = matchPrograms(profile, verifiedPrograms, "2026-10-23");
  assert.ok(matches.length > 0);
  for (const group of pendingProgramGroups) {
    assert.equal(
      matches.some((match) => match.program.universityId === group.universityId),
      false,
    );
    assert.equal(findVerifiedProgram(group.id), null);
  }
});

test("pending groups cite official sources with a check date", () => {
  for (const group of pendingProgramGroups) {
    assert.ok(group.programs.length > 0);
    assert.ok(group.sources.length > 0);
    for (const source of group.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:");
      assert.ok(
        onUniversityDomain(url.hostname, group.universityHost),
        `${source.url} is not on the university's own domain`,
      );
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test("Slovak computing faculties are listed for the exact scope only", () => {
  const exact = findPendingProgramGroups({
    countryCode: "SK",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
  });
  assert.deepEqual(
    exact.map((group) => group.id),
    [
      "uniba-fmfi-computing-bsc-2027",
      "stu-fiit-computing-bsc-2027",
      "tuke-fei-computing-bsc-2027",
      "ukf-fpvai-ai-bsc-2027",
      "upjs-pf-informatika-bsc-2027",
      "stu-fei-ai-bsc-2027",
      "stu-fiit-en-bsc-2027",
    ],
  );
  assert.deepEqual(
    findPendingProgramGroups({
      countryCode: "SK",
      category: "Computer Science",
      intake: "2028/29",
    }),
    [],
  );
  assert.deepEqual(
    findPendingProgramGroups({ countryCode: "SK", category: "Dentistry" }),
    [],
  );
});

test("reference rules are never later than the intake, sourced and name real programs", () => {
  for (const group of pendingProgramGroups) {
    const previous = group.referenceRules;
    if (!previous) continue;
    const startYear = (intake: string) => Number(intake.slice(0, 4));
    assert.match(previous.intake, /^\d{4}\/\d{2}$/);
    assert.ok(
      startYear(previous.intake) <= startYear(group.intake),
      `${group.id}: reference rules must not be later than ${group.intake}`,
    );
    // Rules for the intake itself go with the "rules-published" status.
    assert.equal(
      previous.intake === group.intake,
      group.status === "rules-published",
      `${group.id}: status and reference intake disagree`,
    );
    assert.ok(previous.facts.length > 0);
    assert.ok(previous.sources.length > 0);
    assert.match(previous.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    for (const source of previous.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:");
      assert.ok(
        onUniversityDomain(url.hostname, group.universityHost),
        `${source.url} is not on the university's own domain`,
      );
    }
    const names = new Set(group.programs.map((program) => program.localProgramName));
    for (const item of previous.programRules) {
      assert.ok(names.has(item.localProgramName), `${item.localProgramName} is not in ${group.id}`);
    }
  }
});

test("Comenius FMFI shows its approved 2026/27 rules for orientation", () => {
  const [group] = findPendingProgramGroups({ universityHost: "uniba.sk" });
  assert.equal(group.referenceRules?.intake, "2026/27");
  assert.equal(group.referenceRules?.programRules.length, group.programs.length);
  const informatika = group.referenceRules?.programRules.find(
    (item) => item.localProgramName === "Informatika",
  );
  assert.match(informatika?.rule ?? "", /percentile 60\+/);
});

test("each group carries a known status and unique ids", () => {
  const ids = new Set<string>();
  for (const group of pendingProgramGroups) {
    assert.ok(
      ["rules-awaiting-approval", "rules-not-published", "rules-published"].includes(
        group.status,
      ),
    );
    assert.ok(!ids.has(group.id), `duplicate ${group.id}`);
    ids.add(group.id);
  }
});

test("last year's rules fill all three requirement cards", () => {
  for (const group of pendingProgramGroups) {
    const overview = group.referenceRules?.overview;
    if (!group.referenceRules) continue;
    assert.ok(overview, `${group.id} has no overview`);
    assert.ok(overview.applicationDocuments.length > 0);
    assert.ok(overview.entranceRequirements.length > 0);
    assert.ok(overview.afterAdmission.length > 0);
  }
});

test("Slovak medicine is listed as long-cycle and found from a bachelor profile", () => {
  const medicine = findPendingProgramGroups({
    countryCode: "SK",
    category: "Medicine",
    degreeLevel: "bachelor",
    intake: "2027/28",
  });
  assert.deepEqual(
    medicine.map((group) => group.id).sort(),
    ["uniba-jlf-medicine-2027", "uniba-lf-medicine-2027", "upjs-lf-medicine-2027"],
  );
  for (const group of medicine) assert.equal(group.degreeLevel, "long-cycle");
  assert.deepEqual(
    findPendingProgramGroups({ countryCode: "SK", category: "Medicine", degreeLevel: "master" }),
    [],
  );
});

test("German entries never match", () => {
  const german = findPendingProgramGroups({ countryCode: "DE", category: "Computer Science" });
  assert.deepEqual(german.map((group) => group.id), [
    "tum-informatics-bsc-2027",
    "kit-informatics-bsc-2027",
    "saarland-cs-bsc-2027",
    "constructor-cs-bsc-2027",
  ]);
  assert.equal(findVerifiedProgram("tum-informatics-bsc-2027"), null);
});

test("Czech computing faculties are listed with their rule status", () => {
  const czech = findPendingProgramGroups({
    countryCode: "CZ",
    category: "Computer Science",
    degreeLevel: "bachelor",
    intake: "2027/28",
  });
  assert.deepEqual(czech.map((group) => group.id), [
    "vut-fit-computing-bsc-2027",
    "muni-fi-computing-bsc-2027",
    "upce-fei-it-bsc-2027",
    "mendelu-pef-oi-bsc-2027",
    "tul-fm-it-bsc-2027",
    "zcu-fav-bsc-2027",
  ]);
  for (const group of czech) {
    const published = group.status === "rules-published";
    assert.equal(group.referenceRules?.intake, published ? "2027/28" : "2026/27", group.id);
  }
});

test("Austrian entries cover computing and MedAT medicine", () => {
  assert.deepEqual(
    findPendingProgramGroups({ countryCode: "AT", category: "Computer Science" }).map(
      (group) => group.id,
    ),
    [
      "tuwien-informatics-bsc-2027",
      "univie-informatics-bsc-2027",
      "jku-ai-bsc-2027",
      "tugraz-informatik-bsc-2027",
      "uibk-informatik-bsc-2027",
      "plus-informatik-bsc-2027",
    ],
  );
  const medat = findPendingProgramGroups({ countryCode: "AT", category: "Medicine", degreeLevel: "bachelor" });
  assert.deepEqual(medat.map((group) => group.id), ["meduniwien-medicine-2027"]);
});

test("law and economics are listed as fields with sourced coming-soon faculties", async () => {
  const { programOptions } = await import("../src/data/demo-destinations");
  assert.deepEqual([...programOptions], ["Medicine", "Law", "Economics & Business", "Computer Science"]);

  const skLaw = findPendingProgramGroups({ countryCode: "SK", category: "Law", degreeLevel: "bachelor", intake: "2027/28" });
  assert.deepEqual(skLaw.map((group) => group.id), ["uniba-praf-law-bsc-2027"]);
  // Czech law is a five-year master's found from a bachelor-level profile.
  const czLaw = findPendingProgramGroups({ countryCode: "CZ", category: "Law", degreeLevel: "bachelor", intake: "2027/28" });
  assert.deepEqual(czLaw.map((group) => group.id), ["cuni-prf-law-2027", "muni-law-2027"]);
  for (const group of czLaw) {
    assert.equal(group.degreeLevel, "long-cycle");
    assert.equal(group.status, "rules-published");
  }
  const economics = ["SK", "CZ"].flatMap((countryCode) =>
    findPendingProgramGroups({ countryCode, category: "Economics & Business", degreeLevel: "bachelor" }),
  );
  assert.deepEqual(economics.map((group) => group.id), ["euba-economics-bsc-2027", "vse-nf-economics-bsc-2027"]);
  for (const group of economics) assert.equal(group.status, "rules-not-published");
});

test("Czech medicine adds two faculties next to the Slovak ones", async () => {
  const { formatPendingDegree } = await import("../src/data/pending-programs");
  const czMedicine = findPendingProgramGroups({ countryCode: "CZ", category: "Medicine", degreeLevel: "bachelor" });
  assert.deepEqual(czMedicine.map((group) => group.id), ["cuni-lf1-medicine-2027", "muni-lf-medicine-2027", "upol-md-english-2027", "muni-md-english-2027"]);
  assert.equal(formatPendingDegree("long-cycle", "Medicine"), "Long-cycle master's (MUDr./MDDr.)");
  assert.equal(formatPendingDegree("long-cycle", "Law"), "Long-cycle master's (Mgr.)");
});

test("no profile in a new field gets a verified match", () => {
  for (const studyCategory of ["Law", "Economics & Business", "Medicine"]) {
    for (const destinationCountryCode of ["SK", "CZ"]) {
      assert.deepEqual(
        matchPrograms({ ...profile, studyCategory, destinationCountryCode }, verifiedPrograms, "2026-10-29"),
        [],
      );
    }
  }
});

test("European listings cover many countries, each with sources on the university's own domain", async () => {
  const { europePendingGroups } = await import("../src/data/pending-programs-europe");
  assert.ok(europePendingGroups.length >= 25);
  const countries = new Set(europePendingGroups.map((group) => group.countryCode));
  for (const code of ["NL", "PL", "HU", "HR", "IT", "FI", "LT", "IE"]) assert.ok(countries.has(code), code);
  for (const group of europePendingGroups) {
    assert.equal(group.intake, "2027/28");
    for (const item of [...group.sources, ...(group.referenceRules?.sources ?? [])]) {
      assert.ok(onUniversityDomain(new URL(item.url).hostname, group.universityHost), `${group.id}: ${item.url}`);
    }
    // Rules for the intake itself must be marked as published, and vice versa.
    assert.equal(group.referenceRules?.intake === "2027/28", group.status === "rules-published", group.id);
  }
  // Every listed field exists in the form.
  const { programOptions } = await import("../src/data/demo-destinations");
  for (const group of europePendingGroups) assert.ok(programOptions.includes(group.category as never), group.category);
});

test("Dutch computing listings are found from a Netherlands profile", () => {
  const nl = findPendingProgramGroups({ countryCode: "NL", category: "Computer Science", degreeLevel: "bachelor", intake: "2027/28" });
  assert.deepEqual(nl.map((group) => group.id), [
    "tudelft-cse-bsc-2027",
    "tue-cse-bsc-2027",
    "rug-cs-bsc-2027",
    "utwente-tcs-bsc-2027",
    "vu-cs-bsc-2027",
    "utwente-bit-bsc-2027",
  ]);
});

test("Switzerland: ETH, EPFL, UZH, Bern and Basel are coming-soon computing listings with the latest published rules", () => {
  const swiss = findPendingProgramGroups({ countryCode: "CH", category: "Computer Science", degreeLevel: "bachelor", intake: "2027/28" });
  assert.deepEqual(
    swiss.map((group) => group.universityHost).sort(),
    ["epfl.ch", "ethz.ch", "unibas.ch", "unibe.ch", "uzh.ch"],
  );
  for (const group of swiss) {
    assert.equal(group.status, "rules-not-published", group.id);
    assert.equal(group.referenceRules?.intake, "2026/27", group.id);
    assert.ok(group.referenceRules?.facts.some((fact) => fact.value.includes("CHF")), `${group.id}: fee in CHF`);
  }
});

test("STU FIIT 2027/28 rules (regulation 2/2026) are published, not last year's", () => {
  const [fiit] = pendingProgramGroups.filter((group) => group.id === "stu-fiit-computing-bsc-2027");
  assert.equal(fiit.status, "rules-published");
  assert.equal(fiit.referenceRules?.intake, "2027/28");
  assert.match(fiit.referenceRules?.approvedNote ?? "", /30 September 2026/);
});
