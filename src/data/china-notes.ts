import type { RouteSource } from "@/types/route-preview";

import type { NotePurpose } from "./citizenship-notes";
import type { RestrictionNote } from "./russia-belarus";

// Extra steps for citizens of the People's Republic of China in the
// countries with verified routes (SK, CZ, AT, DE, CH), read on the official
// pages on 2026-11-05. Only what each page states is restated. The general
// notes (visa list, apostille) still come from citizenship-notes.ts; these
// add what is specific to applying from China. Hong Kong and Macao passports
// have their own codes (HK, MO) and are not covered here.

export const CHINA_CHECKED = "2026-11-05";

function src(id: string, title: string, publisher: string, url: string): RouteSource {
  return { id, title, publisher, url, checkedAt: CHINA_CHECKED, authority: "official" };
}

export const chinaSources = {
  mfaApostille: src(
    "cn-mfa-apostille",
    "Consular Legalisation/Apostillisation in China",
    "Ministry of Foreign Affairs of the People's Republic of China",
    "https://cs.mfa.gov.cn/lh/lsrz_149494/zzg/",
  ),
  deStudyVisa: src(
    "de-china-natvisum-studium-2024",
    "National visa for study (§ 16b AufenthG): information sheet and checklist (July 2024)",
    "German Embassy Beijing",
    "https://china.diplo.de/blob/1302044/3a2b548d9c46572797f72d2f1b7ed126/pdf-merkblatt-natvisum-studium-data.pdf",
  ),
  atChina: src(
    "at-bmbwf-china-admission-2022",
    "Recommendation on admission of applicants with Chinese certificates (in force from 1 March 2022)",
    "Federal Ministry of Education, Science and Research (BMBWF), Austria",
    "https://www.BMBWF.gv.at/dam/jcr:2413c9f0-dbd0-466d-a7ce-7af765f16be1/2.4.13.8%20China_EmpfZul_M%C3%A4rz_2022E.pdf",
  ),
  chStudent: src(
    "ch-embassy-china-student-2025",
    "National visa D for students: requirements (China, April 2025)",
    "Embassy of Switzerland in Beijing",
    "https://www.schweiz-china.eda.admin.ch/dam/en/eda-cms/8aDIJc0DJVL6/131.3_Student_EN.pdf",
  ),
  czBeijing: src(
    "cz-embassy-beijing-appointment",
    "Visas: registration for long-term visa, residence permit and employee card applications (updated 16 September 2026)",
    "Embassy of the Czech Republic in Beijing",
    "https://mzv.gov.cz/beijing/en/consular_information/visas_1/appointment/index.html",
  ),
  czShanghai: src(
    "cz-cg-shanghai-visas",
    "Visas (updated 2 October 2026)",
    "Consulate General of the Czech Republic in Shanghai",
    "https://mzv.gov.cz/shanghai/en/visa_consular/visa_services/visas.html",
  ),
  czPrograms: src(
    "cz-embassy-beijing-economic-migration",
    "Economic migration programs",
    "Embassy of the Czech Republic in Beijing",
    "https://mzv.gov.cz/beijing/en/consular_information/visas_1/economic_migration_programs/index.html",
  ),
  nationalityLaw: {
    ...src(
      "cn-nia-nationality-law",
      "Nationality Law of the People's Republic of China (Articles 3 and 9)",
      "National Immigration Administration of China",
      "https://en.nia.gov.cn/n147418/n147458/c155976/content.html",
    ),
    checkedAt: "2026-11-06",
  },
  skEmployment: src(
    "sk-vac-china-national-visa-employment",
    "Checklist: national visa (D) for employment purposes, visa application centres in China",
    "Ministry of Foreign and European Affairs of the Slovak Republic (visa application centre, China)",
    "https://slovakia.blscn.cn/assets/pdf/national/checklists/employment-purpose.pdf",
  ),
} satisfies Record<string, RouteSource>;

/** How Chinese documents are apostilled: replaces the general apostille
 *  note for Chinese passports. */
export function chinaDocumentsNote(documents: string): RestrictionNote {
  return {
    id: "citizen-documents",
    title: "Apostille Chinese documents through the MFA or a local foreign affairs office",
    description: `China applies the Apostille Convention since 7 November 2023, so ${documents} no longer need consular legalisation. Documents such as academic qualifications are issued as notarial certificates by a Chinese notary office and then apostilled by the Ministry of Foreign Affairs or an authorised local foreign affairs office, which handles documents only from its own province. Translations may still be needed.`,
    sources: [chinaSources.mfaApostille],
  };
}

/** Extra notes for a Chinese passport in one destination and purpose. */
export function chinaNotes(destination: string, purpose: NotePurpose): RestrictionNote[] {
  const country = destination.toUpperCase();
  const notes: RestrictionNote[] = [];

  if (country === "DE" && purpose === "study") {
    notes.push({
      id: "cn-de-aps",
      title: "APS certificate before the German study visa",
      description:
        "If your school-leaving certificate is from China, German universities admit you only with an APS certificate (Kultusministerkonferenz recommendation), and you go through the APS procedure in Beijing before you apply for the visa. The visa checklist asks for the APS certificate, confirmation or fax. The APS website lists the exceptions. The study visa can be filed at the German mission or at APS.",
      sources: [chinaSources.deStudyVisa],
    });
  }

  if (country === "AT" && purpose === "study") {
    notes.push({
      id: "cn-at-aps",
      title: "APS verification and gaokao for Austrian universities",
      description:
        "Austria's ministry recommends that applicants with Chinese certificates submit a verification from APS Beijing, which checks that the documents are genuine (with an interview where needed). For a first degree it recommends the senior secondary certificate, the huikao and the gaokao with at least 70 % of the maximum score; a state-recognised Chinese bachelor's of at least three years can replace them. Each university's rectorate decides case by case.",
      sources: [chinaSources.atChina],
    });
  }

  if (country === "CH" && purpose === "study") {
    notes.push({
      id: "cn-ch-student-visa",
      title: "Swiss student visa from China: VFS appointment, notarised diplomas",
      description:
        "Apply in person at the Swiss Embassy in Beijing or the Consulates General in Shanghai or Guangzhou, with an appointment booked through VFS Global. Previous certificates and diplomas must be notarised and translated into French, German or Italian; for English-taught studies an IELTS or TOEFL result is required.",
      sources: [chinaSources.chStudent],
    });
  }

  if (country === "CZ") {
    // Separate ids for study/other and work: the country page shows both.
    notes.push({
      id: purpose === "work" ? "cn-cz-appointment-work" : "cn-cz-appointment",
      title: "Czech long-term applications in China need registration first",
      description:
        purpose === "work"
          ? "The Czech Embassy in Beijing books employee card submissions only by e-mail (address on its appointment page) and assigns appointments to applicants in its economic migration programmes (Highly Qualified Worker, Key and Research Staff). The Consulate General in Shanghai covers Shanghai, Anhui, Jiangsu and Zhejiang and books through its online scheduling page; other provinces go to Beijing."
          : "The Czech Embassy in Beijing accepts long-term visa and residence permit applications only after registration by e-mail (address on its appointment page); it also runs a Student Facilitation Program. The Consulate General in Shanghai covers Shanghai, Anhui, Jiangsu and Zhejiang and books through its online scheduling page; other provinces go to Beijing.",
      sources: purpose === "work" ? [chinaSources.czBeijing, chinaSources.czPrograms, chinaSources.czShanghai] : [chinaSources.czBeijing, chinaSources.czShanghai],
    });
  }

  if (country === "SK" && purpose === "work") {
    notes.push({
      id: "cn-sk-employment-visa",
      title: "Slovak national visa for employment from China",
      description:
        "To apply for the residence permit you can get a national visa (D) for employment at a Slovak visa application centre in China. It needs a Chinese criminal record certificate with an apostille and an official Slovak translation by a translator registered with the Slovak Ministry of Justice, no older than 90 days (issued within 45 days of the application is recommended), plus one from any country where you lived over 90 days in the last three years.",
      sources: [chinaSources.skEmployment],
    });
  }

  return notes;
}

/** China does not recognise dual nationality: matters for anyone planning
 *  to naturalise later, including people already living in the country. */
export function chinaNationalityNote(): RestrictionNote {
  return {
    id: "cn-dual-nationality",
    title: "China does not recognise dual nationality",
    description:
      "Under the Nationality Law, a Chinese national who settles abroad and is naturalised, or acquires a foreign nationality of their own accord, loses Chinese nationality automatically. A residence permit does not affect it; keep this in mind before you apply for citizenship later.",
    sources: [chinaSources.nationalityLaw],
  };
}
