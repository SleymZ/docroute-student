import { citizenshipStage, isExistingResidentStatus } from "@/data/citizenship-notes";
import { czechiaSources } from "@/data/czechia-residence";
import {
  euStudentResidenceSource,
  thirdCountryStudySource,
} from "@/data/study-residence-links";
import {
  isCurrentReference,
  pendingProgramGroups,
  type PendingProgramGroup,
} from "@/data/pending-programs";
import { slovakiaResidenceRules } from "@/data/slovakia-residence";
import { slovakiaResidentSources } from "@/data/slovakia-residents";
import { czechStudyRoute } from "@/lib/build-route-preview";
import { isEuEeaSwissCitizen } from "@/lib/profile-options";
import { profileForDestination } from "@/lib/route-options";
import { buildSlovakiaResidenceStage } from "@/lib/residence/slovakia";
import {
  currentResidenceStatuses,
  type ApplicantProfile,
  type CurrentResidenceStatus,
} from "@/types/admission";
import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

// The full study path for a "coming soon" programme: from choosing it to
// living in the country. Admission stages come from the faculty's published
// reference rules (never matched against a profile); residence comes from
// the verified Slovak and Czech routes, or, elsewhere, from a link to the
// official student-residence page with nothing stated beyond what is needed
// to read it. Verified programmes keep their personalised Preview Route.

export const FULL_PATH_VERSION = "full-path-2026-11-01";

export type FullPathAnswers = {
  citizenshipCountryCode: string;
  currentResidenceStatus: CurrentResidenceStatus;
};

// "verified": DocRoute's own Slovak or Czech residence route;
// "official-link": a checklist that points to the official page;
// "none": no residence permit needed (citizens of the country).
export type ResidenceCoverage = "verified" | "official-link" | "none";

export type FullPath = {
  version: string;
  group: PendingProgramGroup;
  answers: FullPathAnswers;
  residenceCoverage: ResidenceCoverage;
  stages: RouteStage[];
  sources: RouteSource[];
  keyFacts: ReadonlyArray<{ label: string; value: string }>;
  disclaimer: string;
};

const verifiedResidenceCountries = new Set(["SK", "CZ"]);
const euCountries = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

// Country names as they read inside a sentence ("in the Netherlands").
export function countryLabel(group: Pick<PendingProgramGroup, "countryCode" | "country">) {
  return group.countryCode === "NL" ? "the Netherlands" : group.country;
}

export function findFullPathGroup(id: string | null) {
  if (!id) return null;
  return pendingProgramGroups.find((group) => group.id === id) ?? null;
}

export function isFullPathStatus(value: string | null): value is CurrentResidenceStatus {
  return Boolean(value && (currentResidenceStatuses as readonly string[]).includes(value));
}

export function parseFullPathAnswers(params: {
  get(name: string): string | null;
}): FullPathAnswers | null {
  const citizenship = params.get("citizenship")?.toUpperCase() ?? "";
  const status = params.get("status");
  if (!/^[A-Z]{2}$/.test(citizenship) || !isFullPathStatus(status)) return null;
  return { citizenshipCountryCode: citizenship, currentResidenceStatus: status };
}

export function fullPathHref(groupId: string, answers?: FullPathAnswers | null) {
  const params = new URLSearchParams({ group: groupId });
  if (answers) {
    params.set("citizenship", answers.citizenshipCountryCode);
    params.set("status", answers.currentResidenceStatus);
  }
  return `/route/full?${params.toString()}`;
}

/** Citizenship and status from an applicant profile, translated to the
 *  programme's country (a Slovak study permit is "other EU residence" for a
 *  Dutch programme). */
export function answersFromProfile(
  profile: ApplicantProfile | null,
  countryCode: string,
): FullPathAnswers | null {
  if (!profile) return null;
  const local = profileForDestination(profile, countryCode);
  return {
    citizenshipCountryCode: local.citizenshipCountryCode,
    currentResidenceStatus: local.currentResidenceStatus,
  };
}

function officialSources(group: PendingProgramGroup): RouteSource[] {
  const seen = new Set<string>();
  return [...group.sources, ...(group.referenceRules?.sources ?? [])]
    .filter((source) => (seen.has(source.id) ? false : (seen.add(source.id), true)))
    .map((source) => ({ ...source, authority: "official" as const }));
}

function admissionStages(group: PendingProgramGroup): RouteStage[] {
  const rules = group.referenceRules;
  const groupSourceIds = group.sources.map((source) => source.id);
  const programmeList = group.programs.map((program) => program.programName).join(", ");

  const watchTask: RouteTask | null =
    group.status === "rules-published"
      ? null
      : {
          id: "watch-rules",
          title: `Watch for the approved ${group.intake} rules`,
          description:
            group.status === "rules-awaiting-approval"
              ? "The faculty's rules for this intake are a draft. Recheck the official page until the approved version appears; dates and requirements below can change."
              : "The faculty has not published rules for this intake yet. Recheck the official page; dates and requirements below can change.",
          status: "action",
          dueLabel: "Recheck every month",
          sourceIds: groupSourceIds,
        };

  const choose: RouteStage = {
    id: "choose",
    number: "01",
    eyebrow: "CHOOSE AND CHECK",
    title: `Check ${group.universityName} for ${group.intake}`,
    description: `${group.faculty}: ${programmeList}. ${group.statusNote}`,
    timing: "Now",
    tasks: [
      {
        id: "read-rules",
        title: rules
          ? isCurrentReference(group)
            ? `Read the published ${rules.intake} rules`
            : `Read last year's (${rules.intake}) rules for orientation`
          : "Read the faculty's admission pages",
        description: rules
          ? `${rules.approvedNote} DocRoute did not check your profile against them.`
          : "DocRoute has not summarised this faculty's rules. Use the official pages linked here.",
        status: "action",
        sourceIds: rules ? rules.sources.map((source) => source.id) : groupSourceIds,
      },
      ...(watchTask ? [watchTask] : []),
    ],
  };

  if (!rules) return [choose];

  const note = isCurrentReference(group)
    ? `From the faculty's published ${rules.intake} rules (reference; not checked against your profile).`
    : `From last year's (${rules.intake}) rules, for orientation only: the ${group.intake} rules may differ.`;
  const ruleSourceIds = rules.sources.map((source) => source.id);
  const toTasks = (prefix: string, items: readonly string[]): RouteTask[] =>
    items.map((item, index) => ({
      id: `${prefix}-${index + 1}`,
      title: item,
      description: note,
      status: isCurrentReference(group) ? "action" : "attention",
      sourceIds: ruleSourceIds,
    }));

  return [
    choose,
    {
      id: "apply",
      number: "02",
      eyebrow: "APPLICATION",
      title: "Prepare and submit the application",
      description: "Documents and steps the faculty lists for the application.",
      timing: isCurrentReference(group) ? `${rules.intake} rules` : `Based on ${rules.intake} rules`,
      tasks: toTasks("apply", rules.overview.applicationDocuments),
    },
    {
      id: "entrance",
      number: "03",
      eyebrow: "ENTRANCE REQUIREMENTS",
      title: "Meet the entrance requirements",
      description: "Exams, tests, grades or selection the faculty uses.",
      timing: isCurrentReference(group) ? `${rules.intake} rules` : `Based on ${rules.intake} rules`,
      tasks: toTasks("entrance", rules.overview.entranceRequirements),
    },
    {
      id: "enrol",
      number: "04",
      eyebrow: "ADMISSION → ENROLMENT",
      title: "Accept the offer and enrol",
      description: "What happens after the decision. The admission or enrolment confirmation is the proof of purpose for a student residence permit.",
      timing: "After the decision",
      tasks: [
        ...toTasks("enrol", rules.overview.afterAdmission),
        {
          id: "keep-admission-letter",
          title: "Keep the official admission or enrolment confirmation",
          description:
            "Ask the university for the official confirmation as soon as you are admitted. You will need it for the residence or registration step below.",
          status: "information",
          sourceIds: ruleSourceIds,
        },
      ],
    },
  ];
}

// A complete ApplicantProfile for the residence builders, which only read
// citizenship and current status.
function residenceProfile(group: PendingProgramGroup, answers: FullPathAnswers): ApplicantProfile {
  return {
    destinationCountryCode: group.countryCode,
    studyCategory: group.category,
    degreeLevel: group.degreeLevel === "master" ? "master" : "bachelor",
    intake: group.intake,
    citizenshipCountryCode: answers.citizenshipCountryCode,
    educationCountryCode: answers.citizenshipCountryCode,
    currentResidenceStatus: answers.currentResidenceStatus,
    educationStatus: "final-year",
    gradeScale: "other",
    languages: [],
    waiverEvidence: [],
  };
}

const alreadyResident = new Set<CurrentResidenceStatus>([
  "destination-study-residence",
  "destination-residence",
  "destination-permanent-residence",
  "destination-national-visa",
]);

function linkedResidenceStages(
  group: PendingProgramGroup,
  answers: FullPathAnswers,
): { coverage: ResidenceCoverage; stages: RouteStage[]; sources: RouteSource[] } {
  const country = countryLabel(group);
  const citizenship = answers.citizenshipCountryCode;

  if (citizenship === group.countryCode) {
    return {
      coverage: "none",
      sources: [],
      stages: [
        {
          id: "residence",
          number: "05",
          eyebrow: "RESIDENCE",
          title: "No residence permit needed",
          description: `You reported citizenship of ${country}, so there is no foreign student residence step.`,
          timing: "—",
          tasks: [],
        },
      ],
    };
  }

  const euCitizen = isEuEeaSwissCitizen(citizenship);
  const destinationEu = euCountries.has(group.countryCode);

  if (euCitizen && group.countryCode === "CH") {
    const source = thirdCountryStudySource("CH", country)!;
    return {
      coverage: "official-link",
      sources: [source],
      stages: [
        {
          id: "residence",
          number: "05",
          eyebrow: "REGISTRATION (EU/EFTA)",
          title: "Register as an EU/EFTA student in Switzerland",
          description:
            "EU/EFTA students do not apply for a visa. For a stay longer than 90 days in six months you register with the cantonal immigration and employment market authority.",
          timing: "After arrival",
          tasks: [
            {
              id: "ch-eu-register",
              title: "Register with the cantonal authority",
              description:
                "Bring proof of admission (matriculation), proof of enough money to live without social welfare, and accident and health insurance. Check the canton's own page for the deadline.",
              status: "action",
              sourceIds: [source.id],
            },
          ],
        },
      ],
    };
  }

  if (euCitizen && destinationEu) {
    const eu = isEuEeaSwissCitizen(citizenship) && euCountries.has(citizenship);
    return {
      coverage: "official-link",
      sources: [euStudentResidenceSource],
      stages: [
        {
          id: "residence",
          number: "05",
          eyebrow: "REGISTRATION (EU)",
          title: `Live in ${country} as an EU student`,
          description: eu
            ? "EU citizens need no visa or residence permit to study in another EU country. After 3 months the country may ask you to register."
            : "These are the EU rules for EU citizens. Iceland, Liechtenstein, Norway and Swiss citizens should confirm the registration step with the country's own authority.",
          timing: "Before and after arrival",
          tasks: [
            {
              id: "eu-insurance",
              title: `Arrange comprehensive health insurance valid in ${country}`,
              description: "One of the three conditions for an EU student's right to stay longer than 3 months.",
              status: "action",
              sourceIds: [euStudentResidenceSource.id],
            },
            {
              id: "eu-register",
              title: "Register your residence if the country requires it",
              description:
                "The country may require registration after 3 months. You then show proof of enrolment, proof of health insurance and a declaration that you have enough resources; no other documents may be asked. Check the local rules for where and when.",
              status: "attention",
              dueLabel: "After 3 months, if required",
              sourceIds: [euStudentResidenceSource.id],
            },
          ],
        },
      ],
    };
  }

  const source = thirdCountryStudySource(group.countryCode, country);
  const sourceIds = source ? [source.id] : [];
  const tasks: RouteTask[] = [];

  if (alreadyResident.has(answers.currentResidenceStatus)) {
    tasks.push({
      id: "ask-current-status",
      title: `Ask whether your current ${country} status covers study`,
      description:
        "You already hold a residence status or visa for this country. Ask the immigration authority whether you need a new permit, an extension or a change of purpose before you start studying.",
      status: "attention",
      sourceIds,
    });
  }

  if (alreadyResident.has(answers.currentResidenceStatus)) {
    // First-arrival steps (a visa, a permit before arrival) do not apply to
    // someone already living there; the authority's answer decides.
    tasks.push({
      id: "read-official-residence",
      title: `Read the official student-residence page for ${country}`,
      description:
        "Use it to prepare for the authority's answer: what an extension or a change of purpose to study requires.",
      status: "action",
      sourceIds,
    });
  } else if (group.countryCode === "CH") {
    tasks.push(
      {
        id: "ch-apply-before",
        title: "Apply for a residence permit before you arrive",
        description:
          "Non-EU/EFTA students apply to the cantonal immigration and employment market authority before arriving; some nationalities also need a visa from a Swiss representation abroad.",
        status: "action",
        sourceIds,
      },
      {
        id: "ch-documents",
        title: "Prepare the study documents",
        description:
          "A study plan with your study goal, proof of admission to a recognised institution, a CV and confirmation that you will leave Switzerland after your studies, plus proof of enough money and health insurance.",
        status: "action",
        sourceIds,
      },
    );
  } else {
    tasks.push(
      {
        id: "read-official-residence",
        title: `Read the official student-residence page for ${country}`,
        description:
          "DocRoute has not verified this country's student residence procedure yet. The official page lists the conditions, where to apply and your rights while studying.",
        status: "action",
        sourceIds,
      },
      {
        id: "check-visa",
        title: "Check whether you need a visa before you travel",
        description:
          "Some nationalities need an entry visa first, others apply only after arrival. The official page says which applies to you.",
        status: "attention",
        sourceIds,
      },
      {
        id: "collect-conditions",
        title: "Collect the proofs the page asks for",
        description:
          "Check on the official page which proofs apply, typically including your admission confirmation, money for living costs and health insurance, and prepare them in the form it asks for.",
        status: "action",
        sourceIds,
      },
    );
  }

  return {
    coverage: "official-link",
    sources: source ? [source] : [],
    stages: [
      {
        id: "residence",
        number: "05",
        eyebrow: "VISA AND RESIDENCE",
        title: `Student residence in ${country}`,
        description:
          group.countryCode === "CH"
            ? "From the Swiss federal portal. DocRoute has not built a dated Swiss residence route."
            : `Not verified by DocRoute yet: follow the official page. A source-checked residence route for ${country} is coming.`,
        timing: "Start right after admission",
        tasks,
      },
    ],
  };
}

function residenceStages(group: PendingProgramGroup, answers: FullPathAnswers) {
  if (!verifiedResidenceCountries.has(group.countryCode)) {
    return linkedResidenceStages(group, answers);
  }
  const profile = residenceProfile(group, answers);
  if (group.countryCode === "CZ") {
    const route = czechStudyRoute(profile);
    return {
      coverage: (answers.citizenshipCountryCode === "CZ" ? "none" : "verified") as ResidenceCoverage,
      stages: route.stages.filter((stage) => stage.id !== "admission"),
      sources: czechiaSources as RouteSource[],
    };
  }
  const stage = buildSlovakiaResidenceStage(profile);
  return {
    coverage: (answers.citizenshipCountryCode === "SK" ? "none" : "verified") as ResidenceCoverage,
    stages: [stage],
    sources: [...slovakiaResidenceRules.sources, ...slovakiaResidentSources] as RouteSource[],
  };
}

export function buildFullPath(group: PendingProgramGroup, answers: FullPathAnswers): FullPath {
  const admission = admissionStages(group);
  const residence = residenceStages(group, answers);
  const passport = citizenshipStage(answers.citizenshipCountryCode, group.countryCode, countryLabel(group), "study", {
    existingResident: isExistingResidentStatus(answers.currentResidenceStatus),
  });
  const stages = [...admission, ...(passport ? [passport.stage] : []), ...residence.stages].map((stage, index) => ({
    ...stage,
    number: String(index + 1).padStart(2, "0"),
  }));
  const usedIds = new Set(stages.flatMap((stage) => stage.tasks.flatMap((task) => task.sourceIds)));
  const seen = new Set<string>();
  const sources = [...officialSources(group), ...residence.sources, ...(passport?.sources ?? [])].filter(
    (source) => usedIds.has(source.id) && !seen.has(source.id) && (seen.add(source.id), true),
  );
  const rules = group.referenceRules;

  return {
    version: `${FULL_PATH_VERSION}-${group.checkedAt}`,
    group,
    answers,
    residenceCoverage: residence.coverage,
    stages,
    sources,
    keyFacts: rules
      ? rules.facts.map((fact) => ({
          label: isCurrentReference(group) ? fact.label : `${fact.label} (${rules.intake})`,
          value: fact.value,
        }))
      : [],
    disclaimer:
      "DocRoute is a preparation tool, not legal advice. The university decides on admission and the immigration authority on residence. Admission steps come from the faculty's published rules and were not checked against your profile. Recheck every step on the official pages before you act.",
  };
}
