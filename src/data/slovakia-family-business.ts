import type { RouteSource } from "@/types/route-preview";

// Temporary residence in Slovakia for family reunification and for business
// (trade licence or company executive), third-country citizens. Checked on
// 2026-10-29 against the IOM Migration Information Centre pages: family
// reunification (Slovak page updated 30 July 2026), application for
// temporary residence (23 July 2026), documenting the purpose (11 August
// 2026), business by type of residence (19 August 2026), the 15 July 2026
// amendment overview (13 August 2026) and the right to work of family
// members (2 March 2026). IOM states its pages are not legally binding.
//
// Only amounts and periods published there are used. The business
// articles themselves (trade licence, company executive) could not be
// opened by the tools; their 3-year validity comes from the IOM list page.
export const slovakiaFamilyBusinessRules = {
  checkedAt: "2026-10-29",
  documentMaxAgeDays: 90,
  accommodationMinMonths: 6,
  processingDays: 90,
  // Family members of a Blue Card holder when applications are filed together.
  processingDaysBlueCardFamily: 30,
  entryWithinDaysOfApproval: 180,
  reportArrivalWorkingDays: 3,
  healthInsuranceWorkingDays: 3,
  healthInsuranceProofDays: 30,
  medicalReportDays: 30,
  residenceCardFeesEur: { standard: 10, expedited: 39 },
  family: {
    feeEur: 200,
    maxYears: 5,
    workPermitMonths: 9,
    noBusinessChangeMonths: 24,
  },
  business: {
    feeEurPolice: 330,
    feeEurEmbassy: 350,
    validityYears: 3,
    // Subsistence minimum used by IOM (July 2026).
    subsistenceMinimumEur: 295.22,
    personalFundsOverOneYearEur: 3542.64,
    soleTraderAccountEur: 5904.4,
    executiveAccountEur: 29522,
    // IOM's own reading of the renewal threshold for sole traders (2025 tax
    // period): about half of the non-taxable part of 5,753.79 EUR.
    soleTraderRenewalIncomeEur: 2876.9,
    executiveMinimumTaxEur: { min: 340, max: 11520 },
  },
  sources: [
    {
      id: "iom-family-reunification",
      title: "Temporary residence – family reunification (updated 30 July 2026)",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/sk/pobyt2/prechodny-pobyt/993-prechodny-pobyt-zlucenie-rodiny.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-family-work-rights",
      title: "Right to work with family-reunification residence (updated 2 March 2026)",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/en/where-next/947-temporary-residence-for-family-reunification.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-temporary-residence-application",
      title: "Application for temporary residence (updated 23 July 2026)",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/en/residence/temporary-residence/233-application-for-temporary-residence.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-purpose-documents-2026",
      title: "How to document the purpose of residence (updated 11 August 2026)",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/en/residence/temporary-residence/234-how-to-document-the-purpose-of-residence.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-business-by-residence",
      title: "Business by type of residence (updated 19 August 2026)",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/sk/podnikanie/zakladne-informacie/291-podnikanie-osob-podla-typu-pobytu.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-temporary-residence-list",
      title: "Temporary residence: purposes and validity",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/sk/pobyt2/prechodny-pobyt.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-amendment-2026-overview",
      title: "Most important changes from 15 July 2026 (updated 13 August 2026)",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/sk/novinky/980-zmeny-v-novele-zakona-o-pobyte-cudzincov.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-trade-licence-basics",
      title: "Trade business: basic information (updated 17 November 2020)",
      publisher: "IOM Migration Information Centre",
      url: "https://mic.iom.sk/sk/podnikanie/zivnostenske-podnikanie/187-zivnostenske-podnikanie.html",
      checkedAt: "2026-10-29",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "sk-act-404-2011",
      title: "Act No. 404/2011 Coll. on Residence of Foreigners (version from 15 July 2026)",
      publisher: "Slov-Lex, Ministry of Justice of the Slovak Republic",
      url: "https://static.slov-lex.sk/static/SK/ZZ/2011/404/20260715.html",
      checkedAt: "2026-10-23",
      authority: "official" as const,
    },
  ] satisfies RouteSource[],
};
