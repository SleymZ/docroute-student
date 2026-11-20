/**
 * The catalog (universities.json) names Czechia "Czech Republic"; the rest
 * of the site, the deadlines and the country pages say "Czechia". Use this
 * for names people read, never for lookups or image queries.
 */
const DISPLAY_NAMES: Record<string, string> = {
  "Czech Republic": "Czechia",
};

export function displayCountryName(name: string) {
  return DISPLAY_NAMES[name] ?? name;
}
