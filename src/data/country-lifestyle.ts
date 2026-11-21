// Official statistics for the 27 EU countries, used by the country match
// (src/lib/country-match.ts) to compare countries on what a person said
// matters to them. Every number is copied from the Eurostat dissemination
// API (ec.europa.eu/eurostat/api/dissemination) on 2026-11-21, latest year
// published for all countries unless stated. Nothing here says what people
// in a country are like: only measured facts about the country.
//
// To update: fetch the same datasets with the filters in `lifestyleSources`,
// copy the values, change LIFESTYLE_CHECKED and the years.

import type { RouteSource } from "@/types/route-preview";

export const LIFESTYLE_CHECKED = "2026-11-21";

export const euCountryCodes = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;
export type EuCountryCode = (typeof euCountryCodes)[number];

export type LifestyleIndicator =
  | "prices"
  | "cold"
  | "heat"
  | "cities"
  | "hours"
  | "vacancies"
  | "unemployment"
  | "lifeSatisfaction"
  | "crime"
  | "foreignLanguages"
  | "nonEuResidents";

export type CountryLifestyle = Record<LifestyleIndicator, number | null>;

// prices: price level index of household final consumption, EU27 = 100 (2024)
// cold: heating degree days, average of 2016–2025
// heat: cooling degree days, average of 2016–2025
// cities: % of people living in cities (degree of urbanisation, 2025)
// hours: usual weekly hours, full-time employed aged 20–64 (2025)
// vacancies: job vacancy rate, industry, construction and services, % (2025)
// unemployment: unemployment rate, 15–74, % of the labour force (2025)
// lifeSatisfaction: overall life satisfaction, mean 0–10, aged 16+ (2025)
// crime: % of people reporting crime, violence or vandalism in their area (2023)
// foreignLanguages: % of adults aged 25–64 who know at least one foreign language (2022)
// nonEuResidents: % of residents with a non-EU citizenship (1 January 2025)
// Greece is "EL" in Eurostat and "GR" on the site.
export const countryLifestyle: Readonly<Record<EuCountryCode, CountryLifestyle>> = {
  AT: { prices: 112.8, cold: 3361, heat: 30, cities: 33.5, hours: 41.7, vacancies: 3.2, unemployment: 5.7, lifeSatisfaction: 7.7, crime: 7, foreignLanguages: 88.4, nonEuResidents: 9.9 },
  BE: { prices: 116.5, cold: 2527, heat: 24, cities: 29.7, hours: 40.3, vacancies: 3.8, unemployment: 6.2, lifeSatisfaction: 7.6, crime: 12.4, foreignLanguages: 78, nonEuResidents: 5.6 },
  BG: { prices: 59.7, cold: 2362, heat: 202, cities: 41.8, hours: 40.1, vacancies: 0.9, unemployment: 3.5, lifeSatisfaction: 6.3, crime: 15.6, foreignLanguages: 48.2, nonEuResidents: 1.8 },
  HR: { prices: 76.3, cold: 2171, heat: 183, cities: 32.2, hours: 40.1, vacancies: 1.5, unemployment: 4.9, lifeSatisfaction: 7.4, crime: 1.4, foreignLanguages: 79.3, nonEuResidents: 3.3 },
  CY: { prices: 92.8, cold: 651, heat: 762, cities: 59.5, hours: 41.4, vacancies: 3, unemployment: 4.4, lifeSatisfaction: 7.4, crime: 9.6, foreignLanguages: 91.9, nonEuResidents: 14.7 },
  CZ: { prices: 88.4, cold: 3139, heat: 24, cities: 30.9, hours: 40.7, vacancies: 1.9, unemployment: 2.8, lifeSatisfaction: 7.4, crime: 6.6, foreignLanguages: 77.9, nonEuResidents: 7.2 },
  DK: { prices: 143.1, cold: 3042, heat: 2, cities: 36.4, hours: 38.6, vacancies: null, unemployment: 6.4, lifeSatisfaction: 7.7, crime: 6.3, foreignLanguages: 90.2, nonEuResidents: 6.6 },
  EE: { prices: 100, cold: 3977, heat: 9, cities: 45.2, hours: 40, vacancies: 1.6, unemployment: 7.5, lifeSatisfaction: 7.3, crime: 4.3, foreignLanguages: 95.5, nonEuResidents: 16.3 },
  FI: { prices: 123.5, cold: 5317, heat: 3, cities: 40.9, hours: 39.1, vacancies: 1.3, unemployment: 9.7, lifeSatisfaction: 7.8, crime: 11.5, foreignLanguages: 92.2, nonEuResidents: 5.3 },
  FR: { prices: 111.2, cold: 2215, heat: 74, cities: 37, hours: 39.9, vacancies: 2.4, unemployment: 7.7, lifeSatisfaction: 7.1, crime: 14.7, foreignLanguages: 77.4, nonEuResidents: 7 },
  DE: { prices: 108.6, cold: 2834, heat: 25, cities: 38.6, hours: 40.3, vacancies: 2.6, unemployment: 3.8, lifeSatisfaction: 7, crime: 10.7, foreignLanguages: 87.7, nonEuResidents: 9.6 },
  GR: { prices: 86, cold: 1527, heat: 369, cities: 44.2, hours: 42, vacancies: 1.7, unemployment: 8.9, lifeSatisfaction: 6.9, crime: 20.9, foreignLanguages: 71.2, nonEuResidents: 6 },
  HU: { prices: 73.5, cold: 2543, heat: 139, cities: 31.3, hours: 40.3, vacancies: 2.1, unemployment: 4.4, lifeSatisfaction: 7.1, crime: 6.1, foreignLanguages: 48.7, nonEuResidents: 1.8 },
  IE: { prices: 138.1, cold: 2644, heat: 0, cities: 30.4, hours: 39.7, vacancies: 1.3, unemployment: 4.7, lifeSatisfaction: 7.6, crime: 9.6, foreignLanguages: 62.5, nonEuResidents: 9.3 },
  IT: { prices: 97.5, cold: 1853, heat: 276, cities: 32.1, hours: 39.8, vacancies: 1.8, unemployment: 6.1, lifeSatisfaction: 7.1, crime: 6.4, foreignLanguages: 67.9, nonEuResidents: 6.8 },
  LV: { prices: 81.8, cold: 3794, heat: 10, cities: 36.7, hours: 40, vacancies: 2.2, unemployment: 6.9, lifeSatisfaction: 6.9, crime: 5.4, foreignLanguages: 95, nonEuResidents: 12.1 },
  LT: { prices: 81.6, cold: 3596, heat: 14, cities: 43.6, hours: 40, vacancies: 2.2, unemployment: 6.9, lifeSatisfaction: 7.3, crime: 2.7, foreignLanguages: 95.4, nonEuResidents: 5 },
  LU: { prices: 132.8, cold: 2891, heat: 18, cities: 18.7, hours: 40.8, vacancies: 1.3, unemployment: 6.5, lifeSatisfaction: 7.4, crime: 7.4, foreignLanguages: 94.5, nonEuResidents: 11.2 },
  MT: { prices: 91.6, cold: 433, heat: 713, cities: 59.9, hours: 41.1, vacancies: 3.2, unemployment: 3.1, lifeSatisfaction: 7.6, crime: 7.4, foreignLanguages: 79.6, nonEuResidents: 21.4 },
  NL: { prices: 116, cold: 2482, heat: 19, cities: 54, hours: 39.1, vacancies: 4.1, unemployment: 3.9, lifeSatisfaction: 7.6, crime: 16.7, foreignLanguages: 93, nonEuResidents: 4.6 },
  PL: { prices: 72.2, cold: 3119, heat: 27, cities: 34.3, hours: 41.1, vacancies: 0.8, unemployment: 3.1, lifeSatisfaction: 7.7, crime: 2.8, foreignLanguages: 72.9, nonEuResidents: 1.1 },
  PT: { prices: 87, cold: 1130, heat: 236, cities: 46.7, hours: 41.1, vacancies: 1.4, unemployment: 6, lifeSatisfaction: 7.3, crime: 6.9, foreignLanguages: 69.9, nonEuResidents: 12.1 },
  RO: { prices: 63.7, cold: 2757, heat: 136, cities: 31.9, hours: 40.2, vacancies: 0.6, unemployment: 6.1, lifeSatisfaction: 7.8, crime: 5.9, foreignLanguages: 48.8, nonEuResidents: 1.6 },
  SK: { prices: 84.7, cold: 3069, heat: 53, cities: 22.4, hours: 40.3, vacancies: 1, unemployment: 5.4, lifeSatisfaction: 7.4, crime: 3.4, foreignLanguages: 85.6, nonEuResidents: 0.5 },
  SI: { prices: 90.2, cold: 2660, heat: 75, cities: 18.6, hours: 40.9, vacancies: 2.2, unemployment: 3.9, lifeSatisfaction: 7.6, crime: 6.8, foreignLanguages: 96, nonEuResidents: 9.1 },
  ES: { prices: 90.9, cold: 1657, heat: 301, cities: 53.5, hours: 40.1, vacancies: 0.9, unemployment: 10.5, lifeSatisfaction: 7.2, crime: 13.6, foreignLanguages: 56.3, nonEuResidents: 10.5 },
  SE: { prices: 115.1, cold: 5004, heat: 1, cities: 41.4, hours: 41.3, vacancies: 1.9, unemployment: 8.8, lifeSatisfaction: 7.4, crime: 9.4, foreignLanguages: 95.9, nonEuResidents: 4.8 },
};

function eurostat(id: string, title: string, year: string): RouteSource & { year: string } {
  return {
    id: `eurostat-${id}`,
    title,
    publisher: "Eurostat, European Commission",
    url: `https://ec.europa.eu/eurostat/databrowser/view/${id}/default/table?lang=en`,
    checkedAt: LIFESTYLE_CHECKED,
    authority: "official",
    year,
  };
}

export const lifestyleSources: Readonly<Record<LifestyleIndicator, RouteSource & { year: string }>> = {
  prices: eurostat("prc_ppp_ind", "Price level indices, household final consumption expenditure (EU27_2020 = 100)", "2024"),
  cold: eurostat("nrg_chdd_a", "Heating degree days by country (average 2016–2025)", "2016–2025"),
  heat: eurostat("nrg_chdd_a", "Cooling degree days by country (average 2016–2025)", "2016–2025"),
  cities: eurostat("ilc_lvho01", "Distribution of population by degree of urbanisation: cities", "2025"),
  hours: eurostat("lfsa_ewhun2", "Average usual weekly hours worked in the main job, full-time employed, 20–64", "2025"),
  vacancies: eurostat("jvs_a_rate_r2", "Job vacancy rate, industry, construction and services", "2025"),
  unemployment: eurostat("une_rt_a", "Unemployment rate, 15–74 years, % of the labour force", "2025"),
  lifeSatisfaction: eurostat("ilc_pw01", "Overall life satisfaction, mean rating 0–10, 16 years or over", "2025"),
  crime: eurostat("ilc_mddw03", "Crime, violence or vandalism in the area, % of population", "2023"),
  foreignLanguages: eurostat("edat_aes_l21", "Persons knowing foreign languages, 25–64 years (Adult Education Survey)", "2022"),
  nonEuResidents: eurostat("migr_pop1ctz", "Population on 1 January by citizenship: non-EU citizens and total", "2025"),
};

// Official EU languages of each country, as ISO 639-1 codes, from each
// country's profile on european-union.europa.eu (read 2026-11-21).
export const officialLanguages: Readonly<Record<EuCountryCode, readonly string[]>> = {
  AT: ["de"], BE: ["nl", "fr", "de"], BG: ["bg"], HR: ["hr"], CY: ["el"], CZ: ["cs"], DK: ["da"], EE: ["et"],
  FI: ["fi", "sv"], FR: ["fr"], DE: ["de"], GR: ["el"], HU: ["hu"], IE: ["ga", "en"], IT: ["it"], LV: ["lv"],
  LT: ["lt"], LU: ["fr", "de"], MT: ["mt", "en"], NL: ["nl"], PL: ["pl"], PT: ["pt"], RO: ["ro"], SK: ["sk"],
  SI: ["sl"], ES: ["es"], SE: ["sv"],
};

export const officialLanguagesSource: RouteSource = {
  id: "eu-country-profiles",
  title: "EU countries: country profiles (official EU languages)",
  publisher: "European Union, european-union.europa.eu",
  url: "https://european-union.europa.eu/principles-countries-history/eu-countries_en",
  checkedAt: LIFESTYLE_CHECKED,
  authority: "official",
};
