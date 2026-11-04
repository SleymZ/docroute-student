/*
 * Countries highlighted on the maps (home route builder and entry page),
 * as ISO 3166-1 numeric codes used by world-atlas. Slovakia (study and
 * work) and Czechia (residence for study and work) have verified routes;
 * Germany, Austria and (PR #29) the Netherlands, Poland, Hungary, Croatia,
 * Italy, Finland, Lithuania and Ireland (and, from 2026-10-30,
 * Switzerland) are highlighted for their "coming soon" listings (no
 * residence route yet). Owner decision: do not change this list without
 * the owner. Other countries return here once their official rules are
 * collected.
 */
export const highlightedCountryIds = new Set([
  "703", // Slovakia
  "203", // Czechia (residence routes for study and work)
  "276", // Germany (TUM and KIT listed as coming soon; owner decision)
  "040", // Austria (TU Wien, Uni Wien, JKU, MedAT listed as coming soon; owner decision)
  // Coming-soon listings only (PR #29); no residence routes for these.
  "528", // Netherlands
  "616", // Poland
  "348", // Hungary
  "191", // Croatia
  "380", // Italy
  "246", // Finland
  "440", // Lithuania
  "372", // Ireland
  "756", // Switzerland (ETH Zurich, EPFL, UZH listed as coming soon; owner request 2026-10-30)
]);
