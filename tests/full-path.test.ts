import assert from "node:assert/strict";
import { test } from "node:test";

import { pendingProgramGroups } from "../src/data/pending-programs";
import { thirdCountryStudySource } from "../src/data/study-residence-links";
import {
  answersFromProfile,
  buildFullPath,
  findFullPathGroup,
  fullPathHref,
  parseFullPathAnswers,
  type FullPathAnswers,
} from "../src/lib/full-path";
import type { ApplicantProfile } from "../src/types/admission";

const nonEu: FullPathAnswers = {
  citizenshipCountryCode: "UA",
  currentResidenceStatus: "non-eu-passport-no-residence",
};

function group(id: string) {
  const found = findFullPathGroup(id);
  if (!found) throw new Error(`missing group ${id}`);
  return found;
}

test("every coming-soon listing builds a full path with resolvable sources", () => {
  for (const entry of pendingProgramGroups) {
    for (const answers of [
      nonEu,
      { citizenshipCountryCode: "DE", currentResidenceStatus: "eu-eea-swiss-passport" } as const,
    ]) {
      const path = buildFullPath(entry, answers);
      assert.ok(path.stages.length >= 2, entry.id);
      assert.equal(path.stages.at(-1)?.id === "admission", false);
      assert.ok(path.stages.some((stage) => stage.id === "residence" || stage.id.startsWith("residence")), entry.id);
      const sourceIds = new Set(path.sources.map((source) => source.id));
      const taskIds = new Set<string>();
      for (const stage of path.stages) {
        for (const task of stage.tasks) {
          assert.equal(taskIds.has(task.id), false, `${entry.id}: duplicate task ${task.id}`);
          taskIds.add(task.id);
          for (const sourceId of task.sourceIds) {
            assert.ok(sourceIds.has(sourceId), `${entry.id}: ${task.id} cites unknown ${sourceId}`);
          }
        }
      }
      path.stages.forEach((stage, index) => assert.equal(stage.number, String(index + 1).padStart(2, "0")));
      // Progress keys must fit the database limit (240 characters).
      const key = `full-${entry.id}:${path.version}:${answers.citizenshipCountryCode}-${answers.currentResidenceStatus}`;
      assert.ok(key.length <= 240, key);
    }
  }
});

test("every country outside Slovakia and Czechia has an official student-residence page", () => {
  for (const entry of pendingProgramGroups) {
    if (entry.countryCode === "SK" || entry.countryCode === "CZ") continue;
    const source = thirdCountryStudySource(entry.countryCode, entry.country);
    if (!source) throw new Error(`${entry.countryCode} (${entry.id}) has no official student-residence page`);
    assert.match(source.url, /^https:\/\/(home-affairs\.ec\.europa\.eu|www\.nyidanmark\.dk|www\.ch\.ch)\//);
  }
});

test("Slovak and Czech listings use the verified residence routes", () => {
  const sk = buildFullPath(group("uniba-fmfi-computing-bsc-2027"), nonEu);
  assert.equal(sk.residenceCoverage, "verified");
  assert.ok(sk.sources.some((source) => source.id === "iom-study-residence-application"));

  const cz = buildFullPath(group("vut-fit-computing-bsc-2027"), nonEu);
  assert.equal(cz.residenceCoverage, "verified");
  assert.ok(cz.sources.some((source) => source.id.startsWith("cz-")));

  const slovak = buildFullPath(group("uniba-fmfi-computing-bsc-2027"), {
    citizenshipCountryCode: "SK",
    currentResidenceStatus: "eu-eea-swiss-passport",
  });
  assert.equal(slovak.residenceCoverage, "none");
});

test("other countries: link to the official page, EU rules for EU citizens", () => {
  const delft = group("tudelft-cse-bsc-2027");
  const third = buildFullPath(delft, nonEu);
  assert.equal(third.residenceCoverage, "official-link");
  const residence = third.stages.find((stage) => stage.id === "residence")!;
  assert.ok(residence.tasks.some((task) => task.id === "read-official-residence"));
  assert.ok(third.sources.some((source) => source.id === "eu-portal-student-nl"));

  const eu = buildFullPath(delft, { citizenshipCountryCode: "SK", currentResidenceStatus: "eu-eea-swiss-passport" });
  const euTasks = eu.stages.find((stage) => stage.id === "residence")!.tasks.map((task) => task.id);
  assert.deepEqual(euTasks, ["eu-insurance", "eu-register"]);

  const dutch = buildFullPath(delft, { citizenshipCountryCode: "NL", currentResidenceStatus: "eu-eea-swiss-passport" });
  assert.equal(dutch.residenceCoverage, "none");

  const already = buildFullPath(delft, { citizenshipCountryCode: "UA", currentResidenceStatus: "destination-residence" });
  assert.ok(already.stages.find((stage) => stage.id === "residence")!.tasks.some((task) => task.id === "ask-current-status"));
});

test("Switzerland: EU/EFTA registration or a permit before arrival", () => {
  const eth = group("ethz-informatik-bsc-2027");
  const eu = buildFullPath(eth, { citizenshipCountryCode: "AT", currentResidenceStatus: "eu-eea-swiss-passport" });
  assert.ok(eu.stages.at(-1)!.tasks.some((task) => task.id === "ch-eu-register"));
  const third = buildFullPath(eth, nonEu);
  assert.ok(third.stages.at(-1)!.tasks.some((task) => task.id === "ch-apply-before"));
  // Existing residents are not told to follow the first-arrival procedure.
  for (const status of ["destination-study-residence", "destination-permanent-residence"] as const) {
    const resident = buildFullPath(eth, { citizenshipCountryCode: "UA", currentResidenceStatus: status });
    const ids = resident.stages.at(-1)!.tasks.map((task) => task.id);
    assert.deepEqual(ids, ["ask-current-status", "read-official-residence"]);
  }
});

test("admission stages come only from the reference rules", () => {
  for (const entry of pendingProgramGroups) {
    const path = buildFullPath(entry, nonEu);
    const rules = entry.referenceRules;
    const apply = path.stages.find((stage) => stage.id === "apply");
    if (!rules) {
      assert.equal(apply, undefined);
      continue;
    }
    assert.deepEqual(apply!.tasks.map((task) => task.title), [...rules.overview.applicationDocuments]);
    const watch = path.stages[0].tasks.some((task) => task.id === "watch-rules");
    assert.equal(watch, entry.status !== "rules-published", entry.id);
  }
});

test("answers parse from the URL and from a profile", () => {
  assert.deepEqual(parseFullPathAnswers(new URLSearchParams("citizenship=ua&status=other")), {
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "other",
  });
  assert.equal(parseFullPathAnswers(new URLSearchParams("citizenship=UA&status=nope")), null);
  assert.equal(parseFullPathAnswers(new URLSearchParams("status=other")), null);
  assert.equal(fullPathHref("x"), "/route/full?group=x");
  assert.equal(
    fullPathHref("x", nonEu),
    "/route/full?group=x&citizenship=UA&status=non-eu-passport-no-residence",
  );

  const profile = {
    destinationCountryCode: "SK",
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "destination-study-residence",
  } as ApplicantProfile;
  assert.deepEqual(answersFromProfile(profile, "SK"), {
    citizenshipCountryCode: "UA",
    currentResidenceStatus: "destination-study-residence",
  });
  // A Slovak study permit is "other EU residence" for a Dutch programme.
  assert.equal(answersFromProfile(profile, "NL")?.currentResidenceStatus, "other-eu-residence");
  assert.equal(answersFromProfile(null, "NL"), null);
});
