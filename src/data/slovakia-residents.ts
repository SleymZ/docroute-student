import type { RouteSource } from "@/types/route-preview";

// Rules for people who do not use the first-time third-country residence
// procedure: EU, EEA and Swiss citizens (registration of residence) and
// third-country citizens who already hold Slovak residence. Checked on
// 2026-10-28 against IOM Migration Information Centre pages updated in 2026.
export const slovakiaEuRegistrationRules = {
  id: "sk-eu-registration-2026-07-16",
  jurisdiction: "Slovakia",
  checkedAt: "2026-10-28",
  // Notice of stay, unless the accommodation provider reports it.
  noticeOfStayWorkingDays: 10,
  // Register within 30 days after the first three months from entry.
  registrationAfterMonths: 3,
  registrationWithinDays: 30,
  // Report changes of name, nationality or document data.
  changeReportWorkingDays: 10,
  residenceCardFeesEur: { standard: 10, expedited: 39 },
  residenceCardValidityYears: 10,
  permanentResidenceAfterYears: 5,
  subsistenceMinimumEur: 295.22,
};

export const slovakiaResidentRules = {
  checkedAt: "2026-10-28",
  // Third-country citizens: notify the end of the residence purpose.
  purposeEndReportWorkingDays: 3,
  addressChangeReportWorkingDays: 5,
  healthInsuranceWorkingDays: 3,
};

export const slovakiaResidentSources = [
  {
    id: "iom-eu-citizens",
    title: "Residence of Union citizens (updated 16 July 2026)",
    publisher: "IOM Migration Information Centre Slovakia",
    url: "https://mic.iom.sk/en/residence/eu-citizens/242-residence-of-union-citizens.html",
    checkedAt: "2026-10-28",
    authority: "authoritative-guidance" as const,
  },
  {
    id: "iom-change-of-purpose",
    title: "Change of the purpose or type of residence permit (updated 4 March 2026)",
    publisher: "IOM Migration Information Centre Slovakia",
    url: "https://mic.iom.sk/en/where-next/951-change-of-the-purpose-or-type-of-residence-permit.html",
    checkedAt: "2026-10-28",
    authority: "authoritative-guidance" as const,
  },
  {
    id: "iom-reporting-duties",
    title: "Reporting residence and other important obligations (updated 14 July 2026)",
    publisher: "IOM Migration Information Centre Slovakia",
    url: "https://mic.iom.sk/en/residence/general-information/225-reporting-residence-and-other-important-changes.html",
    checkedAt: "2026-10-28",
    authority: "authoritative-guidance" as const,
  },
  {
    id: "iom-permanent-residence",
    title: "Permanent residence (updated 14 July 2026)",
    publisher: "IOM Migration Information Centre Slovakia",
    url: "https://mic.iom.sk/en/residence/permanent-residence.html",
    checkedAt: "2026-10-28",
    authority: "authoritative-guidance" as const,
  },
] satisfies RouteSource[];
