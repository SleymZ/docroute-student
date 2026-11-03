import { euPortalCountries, euPortalSource, PORTAL_CHECKED, WORK_PORTAL_CHECKED } from "@/data/eu-immigration-portal";
import type { RouteSource, RouteStage, RouteTask } from "@/types/route-preview";

import type { CountryGuide } from "./country-guides";

// Work, family and business guides for the EU countries and Switzerland
// that do not have a verified DocRoute guide yet. Each is a checklist that
// points to the official pages for that country and category; it states no
// fee, threshold or deadline. Slovakia (its own routes), Czechia (work:
// /route/czechia; family and business: verified guides) and Austria
// (verified guides) are excluded.

export const LINKED_GUIDE_VERSION = "linked-guides-2026-11-02";
export const LINKED_WORK_GUIDE_VERSION = "linked-work-guides-2026-11-03";

export type LinkedPurpose = "family" | "business" | "work";

const excluded = new Set(["SK", "CZ", "AT"]);

const nationalSources: Record<string, Record<LinkedPurpose, RouteSource>> = {
  DK: {
    work: {
      id: "dk-nyidanmark-work",
      title: "You want to apply: work (Fast-track, Pay Limit, Positive Lists and other schemes)",
      publisher: "Danish Agency for International Recruitment and Integration (New to Denmark)",
      url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work",
      checkedAt: WORK_PORTAL_CHECKED,
      authority: "official",
    },
    family: {
      id: "dk-nyidanmark-family-reunification",
      title: "You want to apply for family reunification",
      publisher: "Danish Agency for International Recruitment and Integration (New to Denmark)",
      url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Family/Family-reunification",
      checkedAt: PORTAL_CHECKED,
      authority: "official",
    },
    business: {
      id: "dk-nyidanmark-startup-denmark",
      title: "Start-up Denmark: residence and work permit for entrepreneurs",
      publisher: "Danish Agency for International Recruitment and Integration (New to Denmark)",
      url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Start-up-Denmark",
      checkedAt: PORTAL_CHECKED,
      authority: "official",
    },
  },
  CH: {
    work: {
      id: "ch-sem-work-non-eu",
      title: "Working in Switzerland: non-EU/EFTA nationals (last modification 5 Jul 2026)",
      publisher: "State Secretariat for Migration SEM",
      url: "https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta-angehoerige.html",
      checkedAt: WORK_PORTAL_CHECKED,
      authority: "official",
    },
    family: {
      id: "ch-family-reunification",
      title: "Application for family reunification in Switzerland",
      publisher: "Swiss Confederation, ch.ch",
      url: "https://www.ch.ch/en/foreign-nationals-in-switzerland/living-in-switzerland/family-reunification/",
      checkedAt: PORTAL_CHECKED,
      authority: "official",
    },
    business: {
      id: "ch-kmu-foreign-business",
      title: "Foreign national: setting up a business",
      publisher: "State Secretariat for Economic Affairs SECO, SME portal",
      url: "https://www.kmu.admin.ch/en/foreign-national-setting-up-a-business",
      checkedAt: PORTAL_CHECKED,
      authority: "official",
    },
  },
};

export const linkedGuideCountries: readonly string[] = [
  ...Object.keys(euPortalCountries).filter((code) => !excluded.has(code)),
  "CH",
].sort();

export function linkedCountryName(countryCode: string) {
  if (countryCode === "CH") return "Switzerland";
  return euPortalCountries[countryCode]?.name ?? countryCode;
}

function guideSource(countryCode: string, purpose: LinkedPurpose): RouteSource | null {
  const national = nationalSources[countryCode]?.[purpose];
  if (national) return national;
  return euPortalSource(
    purpose === "family" ? "family-member" : purpose === "work" ? "employed-worker" : "self-employed-worker",
    countryCode,
  );
}

// The second work page: the EU Blue Card, or Ireland's highly-qualified
// (Critical Skills) page. Denmark and Switzerland use one national page.
function highlyQualifiedSource(countryCode: string): RouteSource | null {
  if (countryCode === "DK" || countryCode === "CH") return null;
  if (countryCode === "IE") return euPortalSource("highly-qualified-worker", countryCode);
  return euPortalSource("eu-blue-card", countryCode);
}

function task(id: string, title: string, description: string, sourceId: string, status: RouteTask["status"] = "action"): RouteTask {
  return { id, title, description, status, sourceIds: [sourceId] };
}

function familyStages(countryCode: string, name: string, sourceId: string): RouteStage[] {
  const swiss = countryCode === "CH";
  return [
    {
      id: "family-check",
      number: "01",
      eyebrow: "CHECK ELIGIBILITY",
      title: "Check that your relative can bring you",
      description: `Family reunification in ${name} depends on your relative's own status in the country and on your relationship.`,
      timing: "Before anything else",
      tasks: [
        task(
          "family-who",
          "Check who can join and who can sponsor",
          swiss
            ? "Read the sections on who can join you and on the conditions (housing, income, and any language requirement)."
            : "On the official page, check which relatives can join, which residence statuses allow your relative to sponsor you, and the conditions the sponsor must meet (for example income, housing or health insurance).",
          sourceId,
        ),
        task(
          "family-limits",
          "Check deadlines and waiting periods",
          swiss
            ? "The page has a section on time limits for applying; missing them can make reunification harder."
            : "Some countries set a waiting period before the sponsor can apply, or deadlines after the sponsor's own permit. The official page says what applies.",
          sourceId,
          "attention",
        ),
      ],
    },
    {
      id: "family-apply",
      number: "02",
      eyebrow: "DOCUMENTS AND APPLICATION",
      title: "Prepare documents and apply",
      description: "Where to apply and whether you need a visa first are set out on the official page.",
      timing: "After the check",
      tasks: [
        task(
          "family-documents",
          "Prepare proof of the family relationship",
          "Collect the documents the page lists, usually starting with your passport and certificates proving the relationship, and check whether they must be legalised or apostilled and translated.",
          sourceId,
        ),
        task(
          "family-where",
          "Find out where to apply and whether you need a visa first",
          swiss
            ? "Read the section on where to apply. Some nationalities also need an entry visa."
            : "The application may be filed by the sponsor in the country or by you at the embassy or consulate. The page says which, and whether you need a visa to enter.",
          sourceId,
          "attention",
        ),
      ],
    },
    {
      id: "family-after",
      number: "03",
      eyebrow: "AFTER APPROVAL",
      title: "After approval",
      description: "Your rights as a family member.",
      timing: "After the decision",
      tasks: [
        task(
          "family-rights",
          "Read your rights as a family member",
          swiss
            ? "The page explains your rights and duties after family reunification."
            : "The page explains whether you may work, how long the permit lasts and when you can apply for long-term or permanent residence.",
          sourceId,
          "information",
        ),
      ],
    },
  ];
}

function businessStages(countryCode: string, name: string, sourceId: string): RouteStage[] {
  const swiss = countryCode === "CH";
  const denmark = countryCode === "DK";
  return [
    {
      id: "business-check",
      number: "01",
      eyebrow: "CHECK ELIGIBILITY",
      title: `Check the conditions for self-employment in ${name}`,
      description: swiss
        ? "Switzerland restricts permits for people from outside the EU/EFTA to a highly qualified workforce; self-employed founders from third states must meet the Swiss labour-market requirements."
        : denmark
          ? "Denmark's scheme for founders is Start-up Denmark: an expert panel appointed by the Danish Business Authority must approve the business idea first."
          : "What a self-employment or business permit requires is set out on the official page for this country.",
      timing: "Before anything else",
      tasks: [
        task(
          "business-conditions",
          "Read the conditions for your business",
          denmark
            ? "Read who can apply and how the business plan is assessed before you prepare anything else."
            : "On the official page, check what must be shown (for example a business plan, funds or investment, qualifications or licences) and whether an authority must first confirm the business is of benefit to the economy.",
          sourceId,
        ),
        task(
          "business-register",
          "Check how the business must be registered",
          "Find out whether the company or trade must be registered before or after the residence application, and with which office.",
          sourceId,
          "attention",
        ),
      ],
    },
    {
      id: "business-apply",
      number: "02",
      eyebrow: "APPLICATION",
      title: "Apply for the visa or permit",
      description: "Where to apply and whether you need a visa first are set out on the official page.",
      timing: "When the business documents are ready",
      tasks: [
        task(
          "business-where",
          "Find out where to apply and whether you need a visa first",
          "Some countries expect the application at the embassy or consulate before you travel, others in the country. Check the page for your nationality.",
          sourceId,
          "attention",
        ),
        task(
          "business-documents",
          "Prepare the application documents",
          "Collect the documents the page lists and check whether they must be legalised or apostilled and translated.",
          sourceId,
        ),
      ],
    },
    {
      id: "business-after",
      number: "03",
      eyebrow: "AFTER APPROVAL",
      title: "After approval",
      description: "What the permit allows.",
      timing: "After the decision",
      tasks: [
        task(
          "business-rights",
          "Read what the permit allows",
          "The page explains how long the permit lasts, whether you may change activity or employer, and the path to long-term residence.",
          sourceId,
          "information",
        ),
      ],
    },
  ];
}

function workStages(countryCode: string, name: string, sourceId: string, highlySourceId: string | null): RouteStage[] {
  const swiss = countryCode === "CH";
  const denmark = countryCode === "DK";
  const ireland = countryCode === "IE";
  const cyprus = countryCode === "CY";
  const permitTasks: RouteTask[] = [
    task(
      "work-permit-type",
      "Find the permit that fits your job",
      swiss
        ? "Switzerland admits workers from outside the EU/EFTA only if they are highly qualified (managers, specialists, other qualified staff), usually with a university degree and several years of experience."
        : denmark
          ? "Denmark has several schemes (Fast-track, Pay Limit, Positive Lists, researchers and others). Pick the one that matches your job offer before you prepare anything else."
          : "On the official page, check the permit for employed workers: whether you need a job offer first, whether the employer must get a work permit or a labour-market check, and whether the job must be on a shortage list.",
      sourceId,
    ),
  ];
  if (highlySourceId) {
    permitTasks.push(
      task(
        "work-highly-qualified",
        ireland ? "Check the Critical Skills Employment Permit" : "Check whether the EU Blue Card suits you",
        ireland
          ? "Ireland does not issue the EU Blue Card. For highly skilled jobs it has the Critical Skills Employment Permit; the page lists the conditions."
          : cyprus
            ? "The portal says Cyprus is currently issuing no EU Blue Cards, although the revised directive has been transposed. Use the employed-worker permit unless the page has changed."
            : "With a higher-education qualification (or professional experience where the country accepts it) and a well-paid job offer, the EU Blue Card may be faster and gives more rights. The page lists the conditions for this country.",
        highlySourceId,
        cyprus ? "attention" : "action",
      ),
    );
  }
  return [
    {
      id: "work-check",
      number: "01",
      eyebrow: "JOB OFFER AND PERMIT",
      title: `Choose the right work permit for ${name}`,
      description: swiss
        ? "The employer must also show that no suitable person from Switzerland or the EU/EFTA could be found, and pay customary wages."
        : "Which permit applies depends on your job, qualification and salary. The official pages set out each one.",
      timing: "Before anything else",
      tasks: permitTasks,
    },
    {
      id: "work-apply",
      number: "02",
      eyebrow: "APPLICATION",
      title: "Apply for the visa or permit",
      description: "Who files the application (you or the employer) and whether you need a visa first are set out on the official page.",
      timing: "After the job offer",
      tasks: [
        task(
          "work-where",
          "Find out who applies, where, and whether you need a visa first",
          "In some countries the employer starts the procedure in the country; in others you apply at the embassy or consulate before you travel. Check the page for your situation.",
          sourceId,
          "attention",
        ),
        task(
          "work-documents",
          "Prepare the application documents",
          "Collect the documents the page lists (usually the contract or job offer and proof of qualifications) and check whether they must be legalised or apostilled and translated.",
          sourceId,
        ),
      ],
    },
    {
      id: "work-after",
      number: "03",
      eyebrow: "AFTER APPROVAL",
      title: "After approval",
      description: "What the permit allows.",
      timing: "After the decision",
      tasks: [
        task(
          "work-rights",
          "Read what the permit allows",
          "The page explains how long the permit lasts, whether you may change employer, whether your family can join you, and the path to long-term residence.",
          sourceId,
          "information",
        ),
      ],
    },
  ];
}

export function hasLinkedGuide(countryCode: string, purpose: string) {
  return (
    (purpose === "family" || purpose === "business" || purpose === "work") &&
    linkedGuideCountries.includes(countryCode.toUpperCase())
  );
}

export function buildLinkedGuide(countryCode: string, purpose: LinkedPurpose): CountryGuide | null {
  const code = countryCode.toUpperCase();
  if (!hasLinkedGuide(code, purpose)) return null;
  const source = guideSource(code, purpose);
  if (!source) return null;
  const highly = purpose === "work" ? highlyQualifiedSource(code) : null;
  const name = linkedCountryName(code);
  const title =
    purpose === "family" ? `Joining family in ${name}` : purpose === "work" ? `Working in ${name}` : `Doing business in ${name}`;
  const intro =
    purpose === "family"
      ? `A checklist for citizens of countries outside the EU, EEA and Switzerland joining a relative who lives in ${name}.`
      : purpose === "work"
        ? `A checklist for citizens of countries outside the EU, EEA and Switzerland who want to take up a job in ${name}.`
        : `A checklist for citizens of countries outside the EU, EEA and Switzerland who want to be self-employed or run a business in ${name}.`;
  const stages =
    purpose === "family"
      ? familyStages(code, name, source.id)
      : purpose === "work"
        ? workStages(code, name, source.id, highly?.id ?? null)
        : businessStages(code, name, source.id);
  return {
    version: purpose === "work" ? LINKED_WORK_GUIDE_VERSION : LINKED_GUIDE_VERSION,
    country: code,
    countryName: name,
    purpose,
    coverage: "official-link",
    title,
    intro,
    notCovered:
      purpose === "work"
        ? "a step-by-step route verified by DocRoute for this country (fees, salary thresholds and deadlines), seasonal work and intra-company transfers. Each step links to the official page."
        : "a step-by-step route verified by DocRoute for this country (fees, thresholds and deadlines). Each step links to the official page; family members of EU citizens follow different rules.",
    variants: [
      {
        id: "third-country",
        label: "Non-EU citizen",
        summary: "Each step points to the official page for this country.",
        keyFacts: [
          { label: "Coverage", value: "Official links; not verified step by step" },
          { label: "Official page", value: source.publisher },
        ],
        stages,
      },
    ],
    sources: highly ? [source, highly] : [source],
    disclaimer:
      "DocRoute is a preparation tool, not legal advice. The immigration authority decides. This checklist only points to official pages; recheck every requirement there before you apply.",
  };
}
