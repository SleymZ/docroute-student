import { englishSchoolCountries, englishTaught, europeDoc as doc, europePrograms as programs, europeSource as source } from "@/data/verified-europe-helpers";
import type { AdmissionProgram, GenericAdmissionRules } from "@/types/admission";

// Dutch programmes verified on 2026-11-26 from each university's own pages
// for the 2027-2028 intake. Applications go through Studielink plus the
// university's own portal. The Netherlands has no DocRoute residence route:
// the study path links to the official page (study-residence-links.ts).
// Left as "coming soon" (docs/STATUS.md): TU/e and UvA (English minimum and
// application fee not on a readable official page), Twente Business & IT
// (no 2027-2028 deadline or fee on its page).

const nl = ["NL"];

function dutchRecognition(sourceIds: string[], text: string): GenericAdmissionRules["recognition"] {
  return { exemptSchools: nl, text, sourceIds };
}

// ------------------------------------------------------------------ TU Delft

const delftSources = [
  source("tudelft-cse-selection-2027", "Matching & Selection, BSc Computer Science and Engineering (2027-2028)", "Delft University of Technology", "https://www.tudelft.nl/en/onderwijs/opleidingen/bachelors/computer-science-and-engineering/bachelor-of-computer-science-and-engineering/from-application-to-enrollment/selection-procedure"),
  source("tudelft-bsc-procedure", "Application procedure, BSc with an international diploma", "Delft University of Technology", "https://www.tudelft.nl/onderwijs/toelating-en-aanmelding/bsc-international-diploma/application-procedure"),
  source("tudelft-bsc-documents", "Required documents, BSc with an international diploma", "Delft University of Technology", "https://www.tudelft.nl/onderwijs/toelating-en-aanmelding/bsc-international-diploma/required-documents"),
  source("tudelft-bsc-language", "Admission requirements, BSc with an international diploma (English)", "Delft University of Technology", "https://www.tudelft.nl/en/education/admission-and-application/bsc-international-diploma/admission-requirements"),
  source("tudelft-cse-fees", "Tuition and fees, BSc Computer Science and Engineering (2025-2026 table)", "Delft University of Technology", "https://www.tudelft.nl/en/onderwijs/opleidingen/bachelors/computer-science-and-engineering/bachelor-of-computer-science-and-engineering/from-application-to-enrollment/tuition-and-fees"),
];

const delft = programs(
  {
    universityId: "ade54660d668745b8ff8",
    universityHost: "tudelft.nl",
    universityName: "Delft University of Technology",
    faculty: "Electrical Engineering, Mathematics and Computer Science",
    country: "Netherlands",
    countryCode: "NL",
    city: "Delft",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-01-15",
      admissionDate: "2027-04-15",
      feeEur: 100,
      applicationUrl: "https://www.tudelft.nl/onderwijs/toelating-en-aanmelding/bsc-international-diploma/application-procedure",
      languageProofDueLabel: "With the application by 15 January 2027",
    },
    languagePolicy: {
      generalStatement: "English track (a foreign diploma admits you to the English track only). IELTS Academic 6.5, TOEFL iBT 90 (5 on the new scale) or Cambridge C1 Advanced, under two years old.",
    },
    documents: [
      doc("tudelft-studielink", "Studielink and a complete Osiaan file by 15 January 2027", "Register in Studielink, activate your NetID, then answer the questions, upload every document, pay the non-refundable €100 fee and submit in Osiaan by 15 January 2027, 23:59 CET. Late or incomplete files are not considered.", "always", "application", ["tudelft-cse-selection-2027", "tudelft-bsc-procedure"]),
      doc("tudelft-diploma", "Diploma and transcript", "Your official secondary-school diploma and final transcript, or an enrolment statement and your latest transcript if you are in your final year. Digital verification is preferred.", "always", "application", ["tudelft-bsc-documents"]),
      doc("tudelft-cv-passport", "CV and passport copy", "A CV in English of no more than three pages and a copy of your passport.", "always", "application", ["tudelft-bsc-documents"]),
      doc("tudelft-translation", "Translation of school documents", "Documents not in English or Dutch need a certified translation, preferably from your school, otherwise from a sworn translator. Other translations are not accepted.", "foreign-education", "application", ["tudelft-bsc-documents"]),
      doc("tudelft-english", "English test result", "IELTS Academic 6.5, TOEFL iBT 90 (5 on the new scale) or Cambridge C1 Advanced, less than two years old when you upload it.", "foreign-language-test", "application", ["tudelft-bsc-language"]),
      doc("tudelft-final-results", "Final results by 31 August 2027", "No results may be pending after 31 August. Your passport must stay valid at least six months after 1 September (a renewed passport by 1 May if needed).", "graduating-this-year", "enrolment", ["tudelft-bsc-documents"], "By 31 August 2027"),
    ],
    minimumRequirements: [
      { id: "tudelft-places", title: "590 places: 345 in the English track", description: "Numerus fixus. You get a ranking number only after completing the matching activities and the tests; the first email comes by Wednesday 20 January. Ranking numbers arrive in Studielink on 15 April.", sourceIds: ["tudelft-cse-selection-2027"] },
      { id: "tudelft-tuition", title: "Tuition (2025-2026 table)", description: "The programme page still shows 2025-2026: €17,310 a year for non-EU/EFTA students, €2,601 for EU/EFTA. Check the 2027-2028 rate before you accept.", sourceIds: ["tudelft-cse-fees"] },
      { id: "tudelft-maths", title: "Mathematics in your diploma", description: "Mathematics is a required exam subject; TU Delft checks whether your diploma is equivalent to the Dutch VWO.", sourceIds: ["tudelft-bsc-language"] },
    ],
    sources: delftSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: englishSchoolCountries,
        exemptSchools: englishSchoolCountries,
        proof: "IELTS Academic 6.5, TOEFL iBT 90 (5 on the new scale) or Cambridge C1 Advanced. Exempt: nationals of, or diplomas from, the USA, UK, Ireland, Australia, New Zealand or Canada.",
        sourceIds: ["tudelft-bsc-language"],
      },
      recognition: dutchRecognition(["tudelft-bsc-language", "tudelft-bsc-documents"], "TU Delft checks whether your diploma equals the Dutch VWO with mathematics after you apply. The page does not mention legalisation."),
      entrance: {
        label: "Mathematics and reasoning tests, then a ranking lottery",
        dueLabel: "From the email of 20 January 2027; ranking 15 April 2027",
        text: "Tests in mathematics and in systematic reasoning and logical thinking place you in a category; your ranking number is drawn within it. Matching activities are compulsory but do not count.",
        sourceIds: ["tudelft-cse-selection-2027"],
      },
    },
  },
  [{ id: "tudelft-cse-bsc-2027", programName: "Computer Science and Engineering", localProgramName: "Computer Science and Engineering" }],
);

// ---------------------------------------------------- University of Groningen

const rugShared = [
  source("rug-bachelor-non-dutch", "Registration bachelor's programme with a non-Dutch qualification", "University of Groningen", "https://www.rug.nl/education/application-enrolment-tuition-fees/admission/non-dutch-qualification/bachelor-non-dutch-qualification?lang=en"),
  source("rug-bachelor-documents", "Explanation of bachelor application documents", "University of Groningen", "https://www.rug.nl/education/application-enrolment-tuition-fees/admission/non-dutch-qualification/bachelor/explanations-bachelor-application-documents"),
];

const rugFeeDoc = doc("rug-fee", "Studielink and the €100 fee", "Apply in Studielink, pay the non-refundable €100 application fee (once per academic year) and upload your documents in the Progress Portal.", "always", "application", ["rug-bachelor-non-dutch"]);
const rugDiplomaDoc = doc("rug-diploma", "Diploma or school statement, and transcripts", "A copy of your diploma, or a school statement with the qualification name and expected graduation date, plus transcripts with the grading scale. Documents not in English, Dutch, German or French need a translation; your own translation is accepted for assessment.", "always", "application", ["rug-bachelor-documents"]);

const rugCsSources = [
  source("rug-cs-programme", "BSc Computing Science: admission (2027-2028)", "University of Groningen", "https://www.rug.nl/bachelors/computing-science/?lang=en"),
  source("rug-fse-language", "Language requirements for English-taught bachelor's (2025-2026 page)", "Faculty of Science and Engineering, University of Groningen", "https://www.rug.nl/fse/education/admission-application/apply-bsc/language?lang=en"),
  ...rugShared,
];

const rugCs = programs(
  {
    universityId: "9d05dffc0fa9db8f8009",
    universityHost: "rug.nl",
    universityName: "University of Groningen",
    faculty: "Faculty of Science and Engineering",
    country: "Netherlands",
    countryCode: "NL",
    city: "Groningen",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-05-01",
      admissionDate: "2027-05-01",
      feeEur: 100,
      applicationUrl: "https://www.rug.nl/bachelors/computing-science/?lang=en",
      languageProofDueLabel: "With the application by 1 May 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in English. The faculty's language page (2025-2026) asks for IELTS Academic 6.5 with 6.5 in every section, TOEFL iBT 90 or Cambridge C1/C2.",
    },
    documents: [
      rugFeeDoc,
      rugDiplomaDoc,
      doc("rug-cs-english", "English test result", "IELTS Academic 6.5 (6.5 in each section), TOEFL iBT 90 (reading and listening 21) or Cambridge C1 Advanced or C2 Proficiency; IELTS and TOEFL no more than two years old.", "foreign-language-test", "application", ["rug-fse-language"]),
    ],
    minimumRequirements: [
      { id: "rug-cs-deadline", title: "1 May 2027, or Early Bird", description: "Apply by 1 May 2027 for a start on 1 September 2027. Apply between 1 October and 28 February with all documents and you get a decision within 15 working days. No numerus fixus.", sourceIds: ["rug-cs-programme"] },
      { id: "rug-cs-maths", title: "VWO level and enough mathematics", description: "Secondary education equivalent to the Dutch VWO; the Admissions Board decides whether your mathematics background is sufficient.", sourceIds: ["rug-cs-programme"] },
      { id: "rug-cs-tuition", title: "Tuition 2027-2028", description: "€19,800 a year for non-EU/EEA students, €2,771 for EU/EEA.", sourceIds: ["rug-cs-programme"] },
    ],
    sources: rugCsSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: englishSchoolCountries,
        proof: "IELTS Academic 6.5 (6.5 per section), TOEFL iBT 90 or Cambridge C1/C2. Exempt: secondary school or a bachelor's in the USA, UK, Ireland, New Zealand, Australia or English-speaking Canada, three A-levels at A*–C, an IB with English as medium, or an EB with English.",
        sourceIds: ["rug-fse-language"],
      },
      recognition: dutchRecognition(["rug-cs-programme"], "The Admissions Board checks that your diploma equals the Dutch VWO and that your mathematics is sufficient."),
      entrance: {
        label: "No selection: diploma and mathematics check",
        dueLabel: "Decision after a complete file (15 working days with Early Bird)",
        text: "Not a numerus fixus programme: the Admissions Board assesses your diploma and mathematics background.",
        sourceIds: ["rug-cs-programme"],
      },
    },
  },
  [{ id: "rug-cs-bsc-2027", programName: "Computing Science", localProgramName: "Computing Science" }],
);

const rugLawSources = [
  source("rug-iel-programme", "LLB International and European Law: admission (2027-2028)", "University of Groningen", "https://www.rug.nl/bachelors/international-and-european-law/?lang=en"),
  source("rug-iel-requirements", "LLB admission requirements (2026/27 page)", "Faculty of Law, University of Groningen", "https://www.rug.nl/rechten/education/international-programmes/llb/application/admission-requirements"),
  ...rugShared,
];

const rugLaw = programs(
  {
    universityId: "9d05dffc0fa9db8f8009",
    universityHost: "rug.nl",
    universityName: "University of Groningen",
    faculty: "Faculty of Law",
    country: "Netherlands",
    countryCode: "NL",
    city: "Groningen",
    category: "Law",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-05-01",
      admissionDate: "2027-05-01",
      feeEur: 100,
      applicationUrl: "https://www.rug.nl/bachelors/international-and-european-law/?lang=en",
      languageProofDueLabel: "Results by 31 August 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in English. The 2026/27 requirements page asks for IELTS Academic 7.0, TOEFL iBT 100 or Cambridge C1/C2 185, with section minimums.",
    },
    documents: [
      rugFeeDoc,
      rugDiplomaDoc,
      doc("rug-iel-english", "English test result", "IELTS Academic 7.0 (listening 6.0, speaking 6.5, reading 6.0, writing 6.5), TOEFL iBT 100 (5 on the new scale) or Cambridge C1/C2 185. You may apply before you have it; results must arrive by 31 August.", "foreign-language-test", "enrolment", ["rug-iel-requirements"], "By 31 August 2027"),
    ],
    minimumRequirements: [
      { id: "rug-iel-deadline", title: "Studielink and documents before 1 May 2027", description: "Apply in Studielink and upload your documents before 1 May 2027 for a start on 1 September 2027. The matching activity is compulsory; its advice is not binding.", sourceIds: ["rug-iel-programme"] },
      { id: "rug-iel-gpa", title: "Non-EU/EEA: average of at least 7.0 on the Dutch scale", description: "The 2026/27 page asks non-EU/EEA applicants for a minimum average of 7.0/10 on the Dutch scale; the university converts your grades, DocRoute does not.", sourceIds: ["rug-iel-requirements"] },
      { id: "rug-iel-tuition", title: "Tuition 2027-2028", description: "€14,400 a year for non-EU/EEA students, €2,771 for EU/EEA.", sourceIds: ["rug-iel-programme"] },
    ],
    sources: rugLawSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "C1",
        exemptCitizenships: [],
        exemptSchools: [],
        proof: "IELTS Academic 7.0, TOEFL iBT 100 or Cambridge C1/C2 185 with the section minimums. The Admissions Board decides exemptions (for example native speakers, IB English, three A-levels).",
        sourceIds: ["rug-iel-requirements"],
      },
      recognition: dutchRecognition(["rug-iel-requirements"], "An IB, EB or a diploma equivalent to the Dutch VWO; no subject requirements. Not yet graduated: apply with an expected-graduation statement for a conditional admission."),
      entrance: {
        label: "Compulsory matching activity (non-binding)",
        dueLabel: "Before the start; dates in the invitation",
        text: "No intake cap is mentioned. Take part in the compulsory matching activity; its advice is not binding.",
        sourceIds: ["rug-iel-programme"],
      },
    },
  },
  [{ id: "rug-iel-llb-2027", programName: "International and European Law (LLB)", localProgramName: "International and European Law" }],
);

// ------------------------------------------------------- University of Twente

const twenteSources = [
  source("utwente-tcs-enrolment", "BSc Technical Computer Science: enrolment (2027-2028)", "University of Twente", "https://www.utwente.nl/en/education/bachelor/programmes/technical-computer-science/enrolment/"),
  source("utwente-bsc-deadlines", "Bachelor's application deadlines", "University of Twente", "https://www.utwente.nl/en/education/bachelor/application-enrolment/deadlines/"),
  source("utwente-bsc-fee", "Application fee for bachelor's programmes", "University of Twente", "https://www.utwente.nl/en/education/bachelor/how-to-apply/application-fee"),
  source("utwente-bsc-language", "Language requirements for bachelor's programmes", "University of Twente", "https://www.utwente.nl/en/education/bachelor/how-to-apply/language-requirements"),
  source("utwente-bsc-documents", "Required application documents", "University of Twente", "https://www.utwente.nl/en/education/bachelor/application-enrolment/Required%20application%20documents/"),
];

const twente = programs(
  {
    universityId: "a7d79de5b8c5343469ef",
    universityHost: "utwente.nl",
    universityName: "University of Twente",
    faculty: "Electrical Engineering, Mathematics and Computer Science",
    country: "Netherlands",
    countryCode: "NL",
    city: "Enschede",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-04-30",
      admissionDate: "2027-06-15",
      feeEur: 100,
      applicationUrl: "https://www.utwente.nl/en/education/bachelor/programmes/technical-computer-science/enrolment/",
      languageProofDueLabel: "Before the deficiency deadline (15 June)",
    },
    languagePolicy: {
      generalStatement: "Taught in English. IELTS Academic 6.0 (5.5 per section), TOEFL iBT 90 (4.5 on the new scale) or Cambridge C1 Advanced 169.",
    },
    documents: [
      doc("utwente-application", "Studielink and Osiris by 30 April 2027", "Register in Studielink and complete the Osiris application with all uploads by 30 April 2027, 23:59 CET. Pay the non-refundable €100 fee through aanmelder.nl and upload the final invoice.", "always", "application", ["utwente-tcs-enrolment", "utwente-bsc-fee", "utwente-bsc-documents"]),
      doc("utwente-diploma", "Diploma and transcript, passport, CV", "Your diploma and transcript (or your latest transcript with final-year subjects), passport personal-details page and a CV in English.", "always", "application", ["utwente-bsc-documents"]),
      doc("utwente-translation", "Sworn translation", "Upload originals in the national language with an official sworn translation into English or Dutch; none is needed for English, Dutch or German.", "foreign-education", "application", ["utwente-bsc-documents"]),
      doc("utwente-english", "English test result", "IELTS Academic 6.0 (5.5 per section), TOEFL iBT 90 (21 per section; 4.5 on the new scale) or Cambridge C1 Advanced 169 (162 per section), valid at least one month after you submit in Osiris.", "foreign-language-test", "application", ["utwente-bsc-language"], "Before the deficiency deadline (15 June)"),
      doc("utwente-graduation", "Proof of graduation and certified copies", "Non-EEA applicants: proof of graduation by 1 July unless your conditional admission letter says otherwise; final certified photocopies by 1 September.", "graduating-this-year", "enrolment", ["utwente-bsc-deadlines"], "Proof by 1 July; certified copies by 1 September"),
    ],
    minimumRequirements: [
      { id: "utwente-matching", title: "Matching is mandatory", description: "An online questionnaire and a matching event on 12 March 2027 (register by 5 March) or 4 June 2027 (register by 28 May), on campus or online. Matching is not a selection.", sourceIds: ["utwente-tcs-enrolment"] },
      { id: "utwente-deficiencies", title: "Deficiencies by 15 June", description: "Non-EEA applicants must clear deficiency requirements, such as an extra maths exam, by 15 June.", sourceIds: ["utwente-bsc-deadlines"] },
      { id: "utwente-tuition", title: "Tuition 2027-2028", description: "€16,869 a year for non-EU/EEA students (institutional fee), €2,771 statutory fee.", sourceIds: ["utwente-tcs-enrolment"] },
    ],
    sources: twenteSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: englishSchoolCountries,
        proof: "IELTS Academic 6.0 (5.5 per section), TOEFL iBT 90 or Cambridge C1 Advanced 169. Exempt: English as an exam subject until your final year and the last three school years in Australia, English-speaking Canada, Ireland, New Zealand, the UK or the USA.",
        sourceIds: ["utwente-bsc-language"],
      },
      recognition: dutchRecognition(["utwente-tcs-enrolment", "utwente-bsc-documents"], "Your diploma must be equivalent to the Dutch VWO with mathematics at the required level (Mathematics B for Dutch applicants); an IDW statement is optional."),
      entrance: {
        label: "Compulsory matching (no selection)",
        dueLabel: "12 March 2027 (register by 5 March) or 4 June 2027 (by 28 May)",
        text: "Fill in the online questionnaire and attend one matching event on 12 March or 4 June 2027.",
        sourceIds: ["utwente-tcs-enrolment"],
      },
    },
  },
  [{ id: "utwente-tcs-bsc-2027", programName: "Technical Computer Science", localProgramName: "Technical Computer Science" }],
);

// ---------------------------------------------- Vrije Universiteit Amsterdam

const vuSources = [
  source("vu-cs-admissions", "Bachelor's Computer Science: admissions (2027-2028 requirements)", "Vrije Universiteit Amsterdam", "https://vu.nl/en/education/bachelor/computer-science/Admissions"),
  source("vu-language", "Meeting the language proficiency requirements (bachelor's)", "Vrije Universiteit Amsterdam", "https://vu.nl/en/education/more-about/meeting-language-proficiency-requirements"),
  source("vu-tuition", "Tuition fee rates for bachelor's programmes", "Vrije Universiteit Amsterdam", "https://vu.nl/en/education/more-about/tuition-fee-rates-bachelor-s-programmes"),
];

const vu = programs(
  {
    universityId: "71e0f69f3ee17cac6196",
    universityHost: "vu.nl",
    universityName: "Vrije Universiteit Amsterdam",
    faculty: "Faculty of Science",
    country: "Netherlands",
    countryCode: "NL",
    city: "Amsterdam",
    category: "Computer Science",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-04-01",
      admissionDate: "2027-04-08",
      feeEur: 100,
      applicationUrl: "https://vu.nl/en/education/bachelor/computer-science/Admissions",
      languageProofDueLabel: "By 1 June 2027 if you need a study visa",
    },
    languagePolicy: {
      generalStatement: "Taught in English. IELTS Academic 6.5, TOEFL iBT 92 (4.5 on the new scale) or Cambridge C1/C2 180.",
    },
    documents: [
      doc("vu-application", "Studielink by 1 April 2027, VU dashboard within a week", "Non-EU/EEA final deadline 1 April. Complete the VU dashboard within six weeks and no later than one week after the deadline. A €100 application fee applies to diplomas from outside the Netherlands.", "always", "application", ["vu-cs-admissions"], "1 April 2027; dashboard by 8 April"),
      doc("vu-form-passport", "VU Application Form and passport", "The VU Application Form – Bachelor in the required format and a passport scan valid on your start date.", "always", "application", ["vu-cs-admissions"]),
      doc("vu-english", "English test result", "IELTS Academic 6.5, TOEFL iBT 92 (4.5 on the new scale) or Cambridge C1/C2 180, taken no more than two years before 1 September. You may be admitted conditionally first; results by 1 June if you need a study visa (otherwise 31 August).", "foreign-language-test", "enrolment", ["vu-language", "vu-cs-admissions"], "By 1 June 2027 with a study visa"),
      doc("vu-maths-exam", "Mathematics B exam or OMPT-D, if needed", "If your maths falls short: a pass in a Mathematics B exam (5.5/10) or the OMPT-D (60%), at most two attempts. Apply by 1 April if you need this route.", "entrance-exam", "enrolment", ["vu-cs-admissions"], "Before enrolment"),
    ],
    minimumRequirements: [
      { id: "vu-maths", title: "Sufficient mathematics", description: "The International Office judges your maths, for example IB Mathematics (AA) HL, A-level Maths at A–C or AP Calculus AB/BC at 3 or higher.", sourceIds: ["vu-cs-admissions"] },
      { id: "vu-tuition", title: "Tuition 2027-2028", description: "Statutory fee €2,771. The institutional (non-EU) fee is in the 2027-2028 PDF linked from this page; it lists Computer Science at €20,330 in the non-EEA column, so check it with VU.", sourceIds: ["vu-tuition"] },
    ],
    sources: vuSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: englishSchoolCountries,
        proof: "IELTS Academic 6.5, TOEFL iBT 92 or Cambridge C1/C2 180. Exempt: English-taught education in Australia, Canada, Ireland, New Zealand, the UK or the USA, or an IB with English.",
        sourceIds: ["vu-language"],
      },
      recognition: dutchRecognition(["vu-cs-admissions"], "The International Office checks whether your diploma equals the Dutch VWO; the country list is only an indication."),
      entrance: {
        label: "No selection: diploma and mathematics check",
        dueLabel: "Maths exam or OMPT-D before enrolment, if needed",
        text: "No matching step. If your maths is not sufficient, pass a Mathematics B exam (5.5) or the OMPT-D (60%).",
        sourceIds: ["vu-cs-admissions"],
      },
    },
  },
  [{ id: "vu-cs-bsc-2027", programName: "Computer Science", localProgramName: "Computer Science" }],
);

// ------------------------------------------------ Erasmus University Rotterdam

const eurSources = [
  source("eur-ibeb-application", "IBEB: application 2027-2028", "Erasmus School of Economics, Erasmus University Rotterdam", "https://www.eur.nl/en/bachelor/international-bachelor-economics-and-business-economics/application"),
  source("eur-ibeb-admission", "IBEB: admission requirements (international diplomas)", "Erasmus School of Economics, Erasmus University Rotterdam", "https://www.eur.nl/en/bachelor/international-bachelor-economics-and-business-economics/admission"),
  source("eur-ibeb-facts", "IBEB: facts and figures (tuition 2027-2028)", "Erasmus University Rotterdam", "https://www.eur.nl/en/bachelor/international-bachelor-economics-and-business-economics/facts-figures"),
];

const eur = programs(
  {
    universityId: "bcc48f0aa2d1570274b2",
    universityHost: "eur.nl",
    universityName: "Erasmus University Rotterdam",
    faculty: "Erasmus School of Economics",
    country: "Netherlands",
    countryCode: "NL",
    city: "Rotterdam",
    category: "Economics & Business",
    degreeLevel: "bachelor",
    durationYears: 3,
    instructionLanguages: englishTaught,
    application: {
      deadline: "2027-01-15",
      admissionDate: "2027-04-15",
      feeEur: 100,
      applicationUrl: "https://www.eur.nl/en/bachelor/international-bachelor-economics-and-business-economics/application",
      languageProofDueLabel: "With the application by 15 January 2027",
    },
    languagePolicy: {
      generalStatement: "Taught in English. IELTS Academic 6.0, TOEFL iBT 4.5 (new scale) or Cambridge B2 First/C1 Advanced 170, C2 180, under two years old.",
    },
    documents: [
      doc("eur-application", "Studielink and EUR Admission Portal by 15 January 2027", "Register in Studielink, then pay the €100 handling fee (non-refundable, card or PayPal), answer the questions, upload your documents and click Submit in the EUR Admission Portal by 15 January 2027, 23:59 CET. Late applications and documents are not accepted.", "always", "application", ["eur-ibeb-application"]),
      doc("eur-diploma", "Diploma, English and maths evidence", "Your diploma or latest results, your English certificate and maths certificate if required, and (I)GCSE results if you take A-levels.", "always", "application", ["eur-ibeb-admission"]),
      doc("eur-english", "English test result", "IELTS Academic 6.0, TOEFL iBT 4.5 (new scale), Cambridge B2 First or C1 Advanced 170, or C2 Proficiency 180, under two years old.", "foreign-language-test", "application", ["eur-ibeb-admission"]),
      doc("eur-certified", "Certified diploma and final grades by 1 August", "Upload the certified diploma and final grade list, with sworn translations if needed, by 1 August (21 August for (I)GCE A-level and Irish Leaving Certificate).", "graduating-this-year", "enrolment", ["eur-ibeb-application"], "By 1 August 2027"),
      doc("eur-visa-tuition", "Immigration procedure and tuition payment by 10 July", "Non-EEA students must complete the immigration procedure and pay the annual tuition by bank transfer by 10 July, or the application is cancelled.", "always", "enrolment", ["eur-ibeb-application"], "By 10 July 2027"),
    ],
    minimumRequirements: [
      { id: "eur-places", title: "500 places, ranking on 15 April 2027", description: "Applicants with the best grades who pass the online curriculum-based activity get the first 250 ranks; the rest are drawn in a weighted lottery. Accept within two weeks; offers pass on until 1 August 2027.", sourceIds: ["eur-ibeb-application"] },
      { id: "eur-maths", title: "Academic subjects and maths to the final year", description: "General academic subjects only, mathematics studied through the final year (for example IB Maths AA HL 4 or SL 5).", sourceIds: ["eur-ibeb-admission"] },
      { id: "eur-tuition", title: "Tuition 2027-2028", description: "€14,700 a year for non-EEA students, €2,771 statutory fee.", sourceIds: ["eur-ibeb-facts"] },
    ],
    sources: eurSources,
    genericRules: {
      language: {
        code: "en",
        name: "English",
        minimumLevel: "B2",
        exemptCitizenships: [],
        exemptSchools: ["US"],
        proof: "IELTS Academic 6.0, TOEFL iBT 4.5 (new scale), Cambridge B2 First or C1 Advanced 170 or C2 Proficiency 180. Exempt: a US diploma whose last two years were taught in English.",
        sourceIds: ["eur-ibeb-admission"],
      },
      recognition: dutchRecognition(["eur-ibeb-admission"], "Your diploma must cover general academic subjects with mathematics until the final year; some diplomas need an extra mathematics test."),
      entrance: {
        label: "Online curriculum-based activity, grades and a weighted lottery",
        dueLabel: "Activity after the invitation; ranking 15 April 2027",
        text: "Everyone who meets the requirements is invited to the mandatory online activity (Canvas link in the invitation). Feedback if you miss a requirement by 13 February 2027.",
        sourceIds: ["eur-ibeb-application"],
      },
    },
  },
  [{ id: "eur-ibeb-bsc-2027", programName: "International Bachelor Economics and Business Economics", localProgramName: "International Bachelor Economics and Business Economics" }],
);

export const verifiedNetherlandsPrograms: readonly AdmissionProgram[] = [
  ...delft,
  ...rugCs,
  ...rugLaw,
  ...twente,
  ...vu,
  ...eur,
];
