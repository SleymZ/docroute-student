import type { RouteSource } from "@/types/route-preview";

// Temporary residence for employment in Slovakia for third-country citizens.
// Checked on 2026-10-23 against the IOM Migration Information Centre pages
// (employment and single-permit pages updated 11 August 2026, EU Blue Card
// page updated 15 July 2026, i.e. after the amendment of the Foreigners
// Residence Act in force from 15 July 2026). IOM states its pages are not
// legally binding; the Act is listed as the legal basis.
//
// Only periods and amounts published on these pages are used. Labour Office
// processing time for the vacancy confirmation is NOT published there, so it
// is never turned into a date.
export const slovakiaWorkRules = {
  id: "sk-employment-residence-2026-07-15",
  jurisdiction: "Slovakia",
  checkedAt: "2026-10-23",
  applicationFeeEur: 250,
  residenceCardFeesEur: {
    standard: 10,
    expedited: 39,
  },
  documentMaxAgeDays: 90,
  // Employer reports the vacancy at least this many working days before
  // requesting the Labour Office confirmation (single permit).
  vacancyReportWorkingDays: 20,
  // The residence application must be filed within this many days after the
  // Labour Office confirmation is issued (single permit and EU Blue Card).
  fileWithinDaysOfConfirmation: 180,
  missingDocumentsDays: 15,
  accommodationMinMonths: 6,
  processingDays: {
    singlePermit: 60,
    singlePermitShortage: 30,
    blueCard: 30,
    slovakGraduate: 90,
  },
  maxYears: {
    singlePermit: 2,
    blueCard: 5,
    slovakGraduate: 5,
  },
  blueCard: {
    salaryMultiplier: 1.2,
    minContractMonths: 6,
  },
  entryWithinDaysOfApproval: 180,
  reportArrivalWorkingDays: 3,
  healthInsuranceWorkingDays: 3,
  medicalReportDays: 30,
  unemploymentNoticeWorkingDays: 7,
  sources: [
    {
      id: "sk-act-404-2011",
      title: "Act No. 404/2011 Coll. on Residence of Foreigners (version from 15 July 2026)",
      publisher: "Slov-Lex, Ministry of Justice of the Slovak Republic",
      url: "https://static.slov-lex.sk/static/SK/ZZ/2011/404/20260715.html",
      checkedAt: "2026-10-23",
      authority: "official" as const,
    },
    {
      id: "iom-employment-residence",
      title: "Temporary residence – employment",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/residence/temporary-residence/983-temporary-residence-employment.html",
      checkedAt: "2026-10-23",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-single-permit",
      title: "Single permit",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/work/3.html",
      checkedAt: "2026-10-23",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-vacancy-reporting",
      title: "Reporting a vacancy and the situation on the labour market",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/work/reporting-a-vacancy-and-the-situation-on-the-labour-market.html",
      checkedAt: "2026-10-23",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-blue-card",
      title: "Temporary residence – EU Blue Card",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/residence/temporary-residence/236-modra-karta-eu-2.html",
      checkedAt: "2026-10-23",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-purpose-documents",
      title: "How to document the purpose of residence",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/residence/temporary-residence/234-how-to-document-the-purpose-of-residence.html",
      checkedAt: "2026-10-23",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-residence-amendment-2026",
      title: "Changes to the Foreigners Residence Act from 15 July 2026",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/news/981-changes-in-the-amendment-to-the-foreigners-residence-act.html",
      checkedAt: "2026-10-23",
      authority: "authoritative-guidance" as const,
    },
  ] satisfies RouteSource[],
};
