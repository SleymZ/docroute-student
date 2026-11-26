import { englishTaught, europeDoc as doc, europePrograms as programs, europeSource as source } from "@/data/verified-europe-helpers";
import type { AdmissionProgram } from "@/types/admission";

// Austrian programme verified on 2026-11-26: the only one of the ten
// checked whose winter 2027/28 dates are already published. University of
// Vienna law was taken out again: review found a separate 2027/28 entrance
// procedure page (aufnahmeverfahren.univie.ac.at) that was not checked. Austria's
// student residence permit is a DocRoute-checked route (study-routes.ts).
// Still "coming soon": TU Wien, Vienna and Graz informatics, JKU AI,
// Innsbruck, Salzburg (2026/27 dates only) and Medical University of
// Vienna (MedAT 2027 dates are provisional).

const austria = ["AT"];

// ------------------------------------------------------------------ WU BBE

const wuSources = [
  source("wu-bbe-selection-2027", "BBE selection procedure, winter semester 2027/28", "WU Vienna University of Economics and Business", "https://www.wu.ac.at/en/programs/bachelors-programs/business-and-economics/overview/selection-procedure-bbe-1"),
  source("wu-enrolment-periods", "Admission periods for first admission (winter semester 2027/28)", "WU Vienna University of Economics and Business", "https://www.wu.ac.at/en/programs/application-and-admission/zulassungsfristen-fuer-die-erstzulassung"),
  source("wu-language", "Language requirements (English for the BBE)", "WU Vienna University of Economics and Business", "https://www.wu.ac.at/en/programs/application-and-admission/language"),
  source("wu-legalisation", "Legalization and translation of documents, by country", "WU Vienna University of Economics and Business", "https://www.wu.ac.at/en/programs/application-and-admission/legalize"),
  source("wu-tuition", "Tuition fees and ÖH dues", "WU Vienna University of Economics and Business", "https://www.wu.ac.at/en/students/getting-organized/tuition-fees-students-union-oeh-dues"),
  source("wu-selection-procedures", "Selection and application procedures", "WU Vienna University of Economics and Business", "https://www.wu.ac.at/en/programs/application-and-admission/selection-and-application-procedures"),
];

const wu = programs(
  {
    universityId: "7b57cee5aedcca1bb376",
    universityHost: "wu-wien.ac.at",
    universityName: "WU Vienna University of Economics and Business",
    faculty: "Bachelor's Program in Business and Economics (BBE)",
    country: "Austria",
    countryCode: "AT",
    city: "Vienna",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-05-24",
      admissionDate: "2027-07-07",
      feeLabel: "Registration fee shown in WU's registration tool (amount not on the 2027 page)",
      applicationUrl: "https://www.wu.ac.at/en/programs/bachelors-programs/business-and-economics/overview/selection-procedure-bbe-1",
      languageProofDueLabel: "At the latest at personal admission",
    },
    languagePolicy: {
      generalStatement: "Taught in English; no German needed. English at B2: IELTS Academic 6.0, TOEFL iBT 85 (4.5 on the new scale), Cambridge FCE/CAE/CPE, PTE Academic 70 or Oxford Test of English 125.",
    },
    documents: [
      doc("wu-register", "Register and pay by 24 May 2027", "Register online with WU's registration tool and pay the registration fee between 1 March and 24 May 2027. You can register before you have your school-leaving certificate.", "always", "application", ["wu-bbe-selection-2027", "wu-selection-procedures"], "1 March – 24 May 2027"),
      doc("wu-osa", "Online Self-Assessment by 2 June 2027", "Complete step 1, the Online Self-Assessment, by 2 June 2027, 12:00 noon CEST.", "always", "application", ["wu-bbe-selection-2027"], "By 2 June 2027, 12:00 CEST"),
      doc("wu-exam", "Entrance exam on 7 July 2027", "Step 2: the BBE entrance examination on 7 July 2027 at VIECON (Messe Wien), conducted in English. It runs only if registrations exceed the 240 places.", "entrance-exam", "admission-day", ["wu-bbe-selection-2027"], "7 July 2027"),
      doc("wu-certificate", "School-leaving certificate, legalised and translated", "Needed to complete admission. Legalisation depends on the issuing country (full legalisation, apostille, a bilateral agreement or EU rules): follow WU's page for your country.", "foreign-education", "enrolment", ["wu-legalisation", "wu-selection-procedures"]),
      doc("wu-english", "English at B2", "IELTS Academic 6.0, TOEFL iBT 85 (4.5 on the new scale), Cambridge FCE/CAE/CPE, PTE Academic 70, Oxford Test of English 125 or a B2 certificate from an Austrian university language centre. Exempt: a passing English grade on an EU/EEA/Swiss school-leaving certificate.", "foreign-language-test", "enrolment", ["wu-language"], "At the latest at personal admission"),
    ],
    minimumRequirements: [
      { id: "wu-places", title: "240 places in winter 2027/28", description: "The selection procedure runs only if more people register than there are places.", sourceIds: ["wu-bbe-selection-2027"] },
      { id: "wu-enrolment", title: "Admission period 12 July – 5 September 2027", description: "The general admission period for bachelor's programmes in winter 2027/28.", sourceIds: ["wu-enrolment-periods"] },
      { id: "wu-tuition", title: "Tuition for non-EU/EEA students", description: "€726.72 a semester plus ÖH student union dues of €26.20 (the page names no year).", sourceIds: ["wu-tuition"] },
    ],
    sources: wuSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: [],
        proof: "IELTS Academic 6.0, TOEFL iBT 85 (4.5 new scale), Cambridge FCE/CAE/CPE, PTE Academic 70, Oxford Test of English 125, or a B2 certificate from an Austrian university language centre. Exempt: a passing English grade on an EU/EEA/Swiss school-leaving certificate.",
        sourceIds: ["wu-language"],
      },
      recognition: {
        exemptSchools: austria,
        text: "Your school-leaving certificate completes the admission; legalisation follows the rules for the issuing country on WU's legalisation page.",
        sourceIds: ["wu-legalisation", "wu-selection-procedures"],
      },
      entrance: {
        label: "Online Self-Assessment and entrance exam",
        dueLabel: "Self-assessment by 2 June 2027; exam 7 July 2027",
        text: "Two steps if registrations exceed 240: the Online Self-Assessment by 2 June 2027 (12:00 CEST), then the entrance exam on 7 July 2027 at Messe Wien.",
        sourceIds: ["wu-bbe-selection-2027"],
      },
    },
  },
  [{ id: "wu-bbe-bsc-2027", programName: "Business and Economics (BBE, English)", localProgramName: "Bachelor's Program in Business and Economics" }],
);

export const verifiedAustriaPrograms: readonly AdmissionProgram[] = [...wu];
