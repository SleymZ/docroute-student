# DocRoute Student — project status

Last updated: 2026-10-23. Keep this file factual: describe what exists and
what was actually checked, not plans presented as done.

## What the product is

DocRoute helps a person move to a European country with one personal,
source-linked route. Today the only purpose with a route is **study**; the
home form shows Work, Family and Business as "coming soon" without routes.

- **Explore** is a public university directory (no account needed).
- **Build my route** collects an applicant profile, matches it against
  verified programs and builds a Preview Route (application → admission →
  enrolment → residence) with progress tracking.
- The university always makes the admission decision. DocRoute never shows
  admission percentages or reuses rules from another field, degree or year.

## Production

- Site: https://docroute-student.vercel.app (Vercel, built from `main`).
- Every PR gets a Vercel Preview; Previews require a Vercel login.
- Backend: Supabase project `klhvbgewmmadizvsdtcg` (Auth, Postgres, RLS).
  Tables: `applicant_profiles`, `saved_universities`, `route_task_progress`.

## Verified coverage

| Area | Coverage | Checked |
| --- | --- | --- |
| Admission | Slovakia · Computer Science · Bachelor · 2027/28 · UNIZA FRI, 4 programs (`src/data/verified-programs.ts`) | 2026-10-19 |
| Study residence | Slovakia, third-country citizens (`src/data/slovakia-residence.ts`) | 2026-10-23 |
| EU/EEA/Swiss residence | Not verified; route says so and shows no checklist | — |
| Other countries, fields, degrees, intakes | Not verified; shown as "Verification pending" | — |

The catalog (`src/data/universities.json`, 2,598 institutions in 46
countries, imported 2026-09-16 from Hipo) lists institutions only. It is not
evidence that a program exists or of its requirements.

On the home map only Slovakia is highlighted, because it is the only
verified destination.

## Residence sources (rechecked 2026-10-23)

- Requirements cite the IOM Migration Information Centre pages updated in
  July 2026, after the Foreigners Residence Act amendment in force from
  15 July 2026.
- The legal basis is cited as Act No. 404/2011 Coll. on Slov-Lex (version
  from 15 July 2026). Its paragraphs were not cross-checked one by one; the
  tool could not load the full text.
- The previous minv.sk deep link redirects to the ministry homepage and was
  removed.

## Recently shipped (October 2026)

- Evidence-based matching for the UNIZA FRI scenario (PR #2), including
  date handling in Europe/Bratislava, exam-waiver evidence and language
  proof rules.
- Fixes: open redirect after login; residence route based on citizenship
  (EEA/Swiss, contradictory statuses); progress/bookmark sync no longer
  re-adds items removed on another device; personalised URLs are noindex;
  Preview links respect `canBuildRoute`; Explore no longer scrolls sideways
  on phones; Arial Black rendering of 800-weight text replaced with 700.
- Account page redesign (PR #4); unverified university pages point to the
  verified route (PR #3).

## How changes are verified

- Unit tests: `npm test` (83 tests on 2026-10-23).
- SSR smoke test after a build: `npm run test:ssr`.
- Vercel build on every push (type check included).
- Manual browser walkthrough of the Slovakia → Computer Science scenario
  on the Preview before merging.

Note: in the Claude cloud environment npm packages could not be installed,
so tests were run with Node's built-in TypeScript support and a small local
module loader; ESLint and `test:ssr` were not run there.

## Open questions and known limits

1. **UNIZA Slovak test exemption.** The code exempts Slovak and Czech
   *citizens*. The rules speak of applicants "from the Czech Republic",
   which might mean Czech education rather than citizenship. Needs a reread
   of the official PDF before changing.
2. **Duplicate UNIZA test tasks.** Preview shows both the language check and
   the "UNIZA Slovak language test result" document. Consider merging.
3. **"Profile aligned" is unreachable.** The entrance-route check is always
   an action, so the best status is "Steps remaining". Decide whether that
   is intended.
4. **EU/EEA/Swiss registration route** is not verified.
5. **Signed-in flows on Previews**: email links may redirect to production
   because Preview URLs are not in the Supabase redirect allow list.
6. Accessibility: the university image container uses `role="img"` while
   containing credit links on the university page.

## Next steps

1. Resolve open questions 1–3 against the official UNIZA rules.
2. Verify the EU/EEA/Swiss registration route for Slovakia.
3. Add the next verified faculty or program only with its own official
   sources.
4. Define the first non-study purpose (e.g. work) for Slovakia with
   official sources before enabling it in the form.
