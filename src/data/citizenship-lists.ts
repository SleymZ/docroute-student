// Official lists behind the passport notes (citizenship-notes.ts), as ISO
// 3166 alpha-2 codes ("XK" = Kosovo, "PS" = Palestinian Authority). Each
// list cites where it was read and when. Update the lists and the check
// date together.

export const CITIZENSHIP_LISTS_CHECKED = "2026-11-03";

/** Regulation (EU) 2018/1806, Annex I (consolidated 30 Dec 2025): nationals
 *  need a visa to cross the external borders. */
export const schengenVisaRequired: readonly string[] = [
  "AF", "AM", "AO", "AZ", "BD", "BF", "BH", "BI", "BJ", "BO", "BT", "BW", "BY", "BZ", "CD", "CF",
  "CG", "CI", "CM", "CN", "CU", "CV", "DJ", "DO", "DZ", "EC", "EG", "ER", "ET", "FJ", "GA", "GH",
  "GM", "GN", "GQ", "GW", "GY", "HT", "ID", "IN", "IQ", "IR", "JM", "JO", "KE", "KG", "KH", "KM",
  "KP", "KW", "KZ", "LA", "LB", "LK", "LR", "LS", "LY", "MA", "MG", "ML", "MM", "MN", "MR", "MV",
  "MW", "MZ", "NA", "NE", "NG", "NP", "OM", "PG", "PH", "PK", "PS", "QA", "RU", "RW", "SA", "SD",
  "SL", "SN", "SO", "SR", "SS", "ST", "SY", "SZ", "TD", "TG", "TH", "TJ", "TM", "TN", "TR", "TZ",
  "UG", "UZ", "VN", "VU", "YE", "ZA", "ZM", "ZW",
];

/** Regulation (EU) 2018/1806, Annex II (consolidated 30 Dec 2025): no visa
 *  for short stays. */
export const schengenVisaFree: readonly string[] = [
  "AD", "AE", "AG", "AL", "AR", "AU", "BA", "BB", "BN", "BR", "BS", "CA", "CL", "CO", "CR", "DM",
  "FM", "GB", "GD", "GE", "GT", "HK", "HN", "IL", "JP", "KI", "KN", "KR", "LC", "MC", "MD", "ME",
  "MH", "MK", "MO", "MU", "MX", "MY", "NI", "NR", "NZ", "PA", "PE", "PW", "PY", "RS", "SB", "SC",
  "SG", "SM", "SV", "TL", "TO", "TT", "TV", "TW", "UA", "US", "UY", "VA", "VC", "VE", "WS", "XK",
];

/** Annex II footnotes: the exemption applies only to holders of biometric
 *  passports (Albania, Bosnia and Herzegovina, Georgia, Moldova, Montenegro,
 *  North Macedonia, Serbia, Ukraine). */
export const biometricPassportOnly: readonly string[] = ["AL", "BA", "GE", "MD", "ME", "MK", "RS", "UA"];

/** Regulation (EC) No 810/2009 (Visa Code), Annex IV (consolidated 28 Jun
 *  2024): airport transit visa required in Schengen airports. */
export const airportTransitVisaRequired: readonly string[] = [
  "AF", "BD", "CD", "ER", "ET", "GH", "IQ", "IR", "LK", "NG", "PK", "SO",
];

/** HCCH Apostille Convention status table (last update 30 Jun 2026):
 *  Contracting Parties. */
export const apostilleParties: readonly string[] = [
  "AD", "AG", "AL", "AM", "AR", "AT", "AU", "AZ", "BA", "BB", "BD", "BE", "BG", "BH", "BI", "BN",
  "BO", "BR", "BS", "BW", "BY", "BZ", "CA", "CH", "CK", "CL", "CN", "CO", "CR", "CV", "CY", "CZ",
  "DE", "DK", "DM", "DO", "DZ", "EC", "EE", "ES", "FI", "FJ", "FR", "GB", "GD", "GE", "GR", "GT",
  "GY", "HN", "HR", "HU", "ID", "IE", "IL", "IN", "IS", "IT", "JM", "JP", "KG", "KN", "KR", "KZ",
  "LC", "LI", "LR", "LS", "LT", "LU", "LV", "MA", "MC", "MD", "ME", "MH", "MK", "MN", "MT", "MU",
  "MW", "MX", "NA", "NI", "NL", "NO", "NU", "NZ", "OM", "PA", "PE", "PH", "PK", "PL", "PT", "PW",
  "PY", "RO", "RS", "RU", "RW", "SA", "SC", "SE", "SG", "SI", "SK", "SM", "SN", "SR", "ST", "SV",
  "SZ", "TH", "TJ", "TN", "TO", "TR", "TT", "UA", "US", "UY", "UZ", "VC", "VE", "VN", "VU", "WS",
  "XK", "ZA",
];

/** Entry into force for parties that joined recently (HCCH status table,
 *  column EIF). Before this date the apostille is not yet available. */
export const apostilleEntryIntoForce: Readonly<Record<string, string>> = {
  DZ: "2026-07-09",
  TH: "2027-02-28",
  VN: "2026-09-11",
};

/** Objections still in force under Article 12(2), from the HCCH
 *  notifications page of each acceding state, limited to EU countries and
 *  Switzerland (withdrawn and late objections left out). Between these
 *  pairs the apostille does not apply. */
export const apostilleObjections: Readonly<Record<string, readonly string[]>> = {
  BD: ["AT", "BE", "CZ", "DE", "DK", "EE", "FI", "FR", "GR", "LT", "NL"],
  BI: ["AT", "CZ", "DE", "PL"],
  DO: ["DE"],
  DZ: ["AT", "DE", "GR"],
  IN: ["DE"],
  KG: ["AT", "GR"],
  LR: ["BE", "DE"],
  MA: ["DE"],
  MN: ["AT", "BE", "DE", "FI", "GR"],
  PH: ["DE"],
  PK: ["AT", "CZ", "DE", "DK", "FI", "GR", "NL", "PL"],
  RW: ["DE"],
  SN: ["AT", "DE"],
  TJ: ["AT", "BE", "DE"],
  TN: ["AT", "DE", "GR"],
  UZ: ["AT", "DE", "GR"],
  VN: ["AT", "CZ", "DE"],
  XK: ["AT", "CY", "DE", "ES", "GR", "PL", "RO", "SK"],
};

/** Germany, § 41 (1) AufenthV (as amended 22 Oct 2026): may enter visa-free
 *  for a long stay and get the residence permit in Germany. */
export const germanyVisaFreeLongStay: readonly string[] = ["AU", "CA", "GB", "IL", "JP", "KR", "NZ", "US"];

/** Germany, § 41 (2) AufenthV: the same, but only without employment
 *  (except the activities in § 17 (2)). */
export const germanyVisaFreeLongStayNoWork: readonly string[] = ["AD", "BR", "HN", "MC", "SM", "SV"];

/** Germany, § 26 (1) BeschV: approval for any employment, wherever the
 *  employer is based. */
export const germanyAnyEmployment: readonly string[] = ["AD", "AU", "CA", "GB", "IL", "JP", "KR", "MC", "NZ", "SM", "US"];

/** Germany, § 26 (2) BeschV (Western Balkans regulation): approval for any
 *  employment, capped per year; the first application at the German mission
 *  in the home country. */
export const germanyWesternBalkans: readonly string[] = ["AL", "BA", "ME", "MK", "RS", "XK"];

/** Netherlands, IND "MVV exemptions" (last update 6 May 2026): nationals who
 *  need no provisional residence permit (MVV). */
export const netherlandsMvvExempt: readonly string[] = ["AU", "CA", "GB", "JP", "KR", "MC", "NZ", "US", "VA"];
