import type { RouteSource } from "@/types/route-preview";

// Rechecked on 2026-10-23 against the IOM Migration Information Centre
// pages (updated July 2026, after the amendment in force from 15 July 2026).
// Concrete requirements cite IOM guidance; the Act is listed as the legal
// basis. The old minv.sk deep link now redirects to the ministry homepage,
// so it is no longer used as a source.
export const slovakiaResidenceRules = {
  id: "sk-study-residence-2026-07-15",
  jurisdiction: "Slovakia",
  purpose: "temporary residence for study",
  effectiveFrom: "2026-07-15",
  checkedAt: "2026-10-23",
  processingTimeDays: 90,
  maxInitialYears: 6,
  universityStudentWorkHoursPerMonth: 80,
  residenceCardFeesEur: {
    standard: 10,
    expedited: 39,
  },
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
      id: "iom-study-residence-application",
      title: "Application for temporary residence",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/residence/temporary-residence/233-application-for-temporary-residence.html",
      checkedAt: "2026-10-23",
      authority: "authoritative-guidance" as const,
    },
    {
      id: "iom-study-residence",
      title: "Temporary residence – study",
      publisher: "IOM Migration Information Centre Slovakia",
      url: "https://mic.iom.sk/en/residence/temporary-residence/985-temporary-residence-study.html",
      checkedAt: "2026-10-28",
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
