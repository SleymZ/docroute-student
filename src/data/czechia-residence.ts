import type { RouteSource } from "@/types/route-preview";

// Czech residence rules for study and work, checked on 2026-10-28 against
// the Ministry of the Interior's Information Portal for Foreigners
// (ipc.gov.cz) and the Ministry of Foreign Affairs (mzv.gov.cz). The Act on
// the Residence of Foreign Nationals (No. 326/1999 Coll.) is the legal
// basis; its sections were not checked one by one.
export const czechiaResidenceRules = {
  id: "cz-residence-2026-10-28",
  jurisdiction: "Czechia",
  checkedAt: "2026-10-28",
  study: {
    // Legal processing time of the long-term residence permit for study.
    processingDays: 60,
    feeCzk: 2500,
    // Funds: 15× the subsistence minimum plus 2× for each further month,
    // as published by the portal (subsistence minimum 3,130 CZK).
    subsistenceMinimumCzk: 3130,
    fundsSemesterCzk: 78250,
    fundsYearCzk: 115810,
  },
  work: {
    employeeCardProcessingDays: 60,
    employeeCardComplexProcessingDays: 90,
    blueCardProcessingDays: 90,
    consularFeeCzk: 5000,
    inCountryFeeCzk: 2500,
    employeeCardMaxYears: 2,
    blueCardMaxYears: 3,
    blueCardSalaryMultiplier: 1.5,
    endOfEmploymentReportWorkingDays: 3,
  },
  documentMaxAgeDays: 180,
  // With a D/VR visa: register at a Ministry of the Interior office.
  registerWithVisaDays: 30,
  // Entry without a visa (biometric passport): register within 3 days.
  registerWithoutVisaDays: 3,
  cardCollectionDays: 60,
  extensionEarliestDays: 120,
  addressChangeWorkingDays: 30,
  dataChangeWorkingDays: 3,
  eu: {
    // Report the stay if it will last more than 30 days.
    registerWithinDays: 30,
    certificateFeeCzk: 200,
    certificateValidityYears: 10,
    addressChangeWorkingDays: 30,
  },
};

export const czechiaSources = [
  {
    id: "cz-act-326-1999",
    title: "Act No. 326/1999 Coll. on the Residence of Foreign Nationals",
    publisher: "Zákony pro lidi (consolidated Czech legislation)",
    url: "https://www.zakonyprolidi.cz/cs/1999-326",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-study-permit",
    title: "Long-term residence permit for the purpose of studies (updated 27 July 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/long-term-residence-permit-in-the-czech-republic-for-the-purpose-of-studies/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-study-visa",
    title: "Long-term visa for the purpose of studies (updated 27 July 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-visa/long-term-visa-for-the-purpose-of-studies/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-mzv-study",
    title: "Long-stay visa and residence permit: study",
    publisher: "Ministry of Foreign Affairs of the Czech Republic",
    url: "https://mzv.gov.cz/jnp/en/information_for_aliens/long_stay_visa/study_long_term.html",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-funds",
    title: "Proof of funds for the stay (updated 30 September 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/forms-and-documents/documents/proof-of-funds-for-the-residence-finances/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-formal",
    title: "Formal requirements of documents (updated 27 July 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/forms-and-documents/documents/formal-requirements/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-obligations",
    title: "Obligations of third-country nationals (updated 24 August 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/obligations-for-foreigners/obligations-of-third-country-nationals-general-information/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-time-limits",
    title: "Processing periods (updated 25 June 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/administrative-proceedings/time-limits/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-employee-card",
    title: "Employee card (updated 12 October 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/employee-card/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-blue-card",
    title: "Blue card (updated 14 September 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/blue-card/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-free-access",
    title: "Free access to the labour market (updated 27 July 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/life-in-the-czech-republic/free-access-to-the-labour-market/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-eu-obligations",
    title: "Obligations of EU citizens and their family members (updated 24 August 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/obligations-for-foreigners/obligations-for-eu-citizens-and-their-family-members/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
  {
    id: "cz-ipc-eu-certificate",
    title: "Registration certificate for EU citizens (updated 15 September 2026)",
    publisher: "Ministry of the Interior – Information Portal for Foreigners",
    url: "https://ipc.gov.cz/en/visa-and-residence-permit-types/eu-nationals/registration-certificate/",
    checkedAt: "2026-10-28",
    authority: "official" as const,
  },
] satisfies RouteSource[];
