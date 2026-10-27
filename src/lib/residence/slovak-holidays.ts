// Slovak days off ("dni pracovného pokoja") under Act No. 241/1993 Coll.,
// version in force from 1 November 2025 (last amended by Act No. 261/2025),
// checked on Slov-Lex on 2026-10-27.
//
// - § 1 state holidays 1 Sep, 28 Oct and 17 Nov are NOT days off (§ 2 (3)).
// - § 4b: in 2026, 8 May and 15 September are not days off.
// Later amendments are not known; recheck the act each year.

export const slovakHolidaySource = {
  id: "slovlex-241-1993",
  title:
    "Act No. 241/1993 Coll. on state holidays, days off and memorial days (version from 1 November 2025)",
  publisher: "Slov-Lex, Ministry of Justice of the Slovak Republic",
  url: "https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/1993/241/",
  checkedAt: "2026-10-27",
};

const FIXED_DAYS_OFF = [
  "01-01", // Day of the Establishment of the Slovak Republic
  "01-06", // Epiphany
  "05-01", // Labour Day
  "05-08", // Victory over Fascism (not in 2026)
  "07-05", // St Cyril and Methodius
  "08-29", // Slovak National Uprising
  "09-15", // Our Lady of Seven Sorrows (not in 2026)
  "11-01", // All Saints' Day
  "12-24", // Christmas Eve
  "12-25", // Christmas Day
  "12-26", // St Stephen's Day
];

// § 4b: one-year exceptions.
const SKIPPED_BY_YEAR: Record<number, string[]> = {
  2026: ["05-08", "09-15"],
};

// Gregorian Easter Sunday (Meeus/Jones/Butcher), as "MM-DD".
export function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function shift(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const cache = new Map<number, Set<string>>();

export function slovakDaysOff(year: number): Set<string> {
  const cached = cache.get(year);
  if (cached) return cached;
  const skipped = SKIPPED_BY_YEAR[year] ?? [];
  const easter = easterSunday(year);
  const days = new Set<string>([
    ...FIXED_DAYS_OFF.filter((day) => !skipped.includes(day)).map(
      (day) => `${year}-${day}`,
    ),
    shift(easter, -2), // Good Friday
    shift(easter, 1), // Easter Monday
  ]);
  cache.set(year, days);
  return days;
}

export function isSlovakDayOff(iso: string) {
  return slovakDaysOff(Number(iso.slice(0, 4))).has(iso);
}
