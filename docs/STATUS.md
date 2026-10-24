# DocRoute — project status

Last updated: 2026-10-24. Keep this file factual: describe what exists and
what was actually checked, not plans presented as done.

## What the product is

DocRoute (renamed from "DocRoute Student" on 2026-10-23) helps a person
move to a European country with one personal, source-linked route. It serves
three groups:

- students who need a university matched to their profile;
- people moving from abroad who need to know which documents they need and
  by when (deadline planner);
- students already in Europe looking for requirements and deadlines
  (Explore).

Purposes with a route today: **study** and **work** (Slovakia). The home
form shows Family and Business as "coming soon" without routes.

- **Work route** (`/route/work`, "Work" on the home form): six questions
  (citizenship, current status, job offer, Slovak diploma, EU Blue Card
  conditions, shortage occupation) pick the procedure — single permit, EU
  Blue Card or Slovak-graduate exemption — and build four stages: job offer
  → work authorisation (employer + Labour Office) → residence application →
  duties after approval. Includes progress ticks and a start-date deadline
  planner. Answers live in the URL (page is noindex); no account needed.
- **Explore** is a public university directory (no account needed).
- **How it works** (`/how-it-works`, the header button) explains the four
  steps, the three labels (verified / rules awaiting approval / review
  pending), the match statuses, the sourcing rules and current coverage.
  Coverage on that page is computed from the data files, so it stays in
  sync.
- **Build my route** collects an applicant profile, matches it against
  verified programs and builds a Preview Route (application → admission →
  enrolment → residence) with progress tracking.
- **Deadline planner** (Preview Route): the person enters a move date and
  gets dates for the residence steps (file ≥ 90 days before, criminal-record
  window, apostille/translation, arrival report within 3 working days).
  The date is kept in the URL as `move=YYYY-MM-DD`.
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
| Coming soon (not verified) | Comenius University Bratislava, FMFI · Computer Science · Bachelor · 2027/28: Computer Science, Applied Informatics, Data Science, Bioinformatics (`src/data/pending-programs.ts`). Listed only; no match, checklist or route | 2026-10-23 |
| Work residence | Slovakia, third-country citizens: single permit, EU Blue Card, Slovak graduates (`src/data/slovakia-work.ts`, `src/lib/residence/slovakia-work.ts`) | 2026-10-23 |
| EU/EEA/Swiss residence | Not verified; route says so and shows no checklist | — |
| Other countries, fields, degrees, intakes | Not verified; shown as "Verification pending" | — |

The catalog (`src/data/universities.json`, 2,598 institutions in 46
countries, imported 2026-09-16 from Hipo) lists institutions only. It is not
evidence that a program exists or of its requirements.

On the home map only Slovakia is highlighted, because it is the only
verified destination.

## "Coming soon" programs

`src/data/pending-programs.ts` lists programs whose rules for the intake are
announced but not yet approved and published. They appear on results pages
(a "Coming soon" block), on the university page and on How it works, with
the label "Rules awaiting approval". They never go through `matchProgram`
and must not carry thresholds, dates or fees from a draft or another year.

Comenius FMFI status (checked 2026-10-23): the 2027/28 bachelor conditions
were item 4 of the Academic Senate session of 19 October 2026 as a draft
("návrh uznesenia"). No resolution was published, and the draft has two
different versions of Art. 2 (3)–(5) (which math tests are accepted; the
second also allows English-language tests such as SAT). The fee and
foreign-qualification recognition are not in the draft. The faculty's
applications page still shows 2026/27. When the approved 2027/28 rules
appear on https://fmph.uniba.sk/prihlasky/, move the group into
`verified-programs.ts` with its own matching policy (percentile/grade/
competition criteria differ completely from UNIZA's) and delete the
pending entry; a test fails if both exist.

Other Slovak computing faculties checked on 2026-10-23 (STU FIIT, TUKE FEI)
still publish only their 2026/27 rules.

## Work route sources and limits (checked 2026-10-23)

- IOM Migration Information Centre: "Temporary residence – employment" and
  "Single permit" (both updated 11 August 2026), "EU Blue Card" (15 July
  2026), "How to document the purpose of residence" (11 August 2026),
  "Reporting a vacancy" (19 July 2024), and the July 2026 amendment news.
  Act No. 404/2011 is the legal basis; its paragraphs were not checked one
  by one.
- Numbers used: fee €250; card €10/€39; decision up to 60 days (single
  permit), 30 days (shortage occupation, Blue Card), 90 days (Slovak
  graduates); vacancy reported ≥20 working days before the confirmation
  request (by the request day for shortage occupations with <45% foreign
  staff, and for the Blue Card); file within 180 days of the confirmation;
  documents ≤90 days old; accommodation ≥6 months; missing documents within
  15 days (+15); entry within 180 days of approval; report arrival within 3
  working days; insurance 3 working days and medical report 30 days after
  the card; unemployment notice 7 working days; protection period 3/6
  months (single permit), 60 days (graduates).
- Not dated on purpose: the Labour Office's processing time is not
  published, so the planner shows the vacancy report as a "no later than"
  limit only.
- Known gaps: the Blue Card salary threshold in euros is not given by the
  guidance (the route asks to confirm it with the employer); Blue Card
  job-loss rules are not described in the checked guidance; work permits
  (e.g. sailors), seasonal work, intra-corporate transfers and job-seeking
  residence are not covered. "Documents issued in" on the home form only
  pre-fills citizenship; the person can change it.
- The amendment dropped the sworn ownership statement as accommodation
  proof while the employment page still lists an owner affidavit, so the
  route names examples and asks to recheck.

## Code structure for residence

- `src/lib/residence/slovakia.ts`: shared Slovak residence steps plus a
  purpose definition (`studyPurpose`), and `residenceGateStage` (Slovak /
  EU-EEA-Swiss / contradictory profiles), shared with work.
- `src/lib/residence/slovakia-work.ts`: the work route builder; answers
  parsing in `src/lib/work-profile.ts`; `planWorkResidenceDeadlines` in
  `deadlines.ts`. `WorkRouteScreen` has its own layout (route strip,
  checklist rows, sticky date panel), separate from the study preview.
- `src/lib/residence/deadlines.ts`: pure date calculations for the planner
  (UTC, weekends skipped, public holidays not included; dates formatted by
  hand to avoid ICU differences between server and browser).

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

- PR #8 (open, 2026-10-24): **light theme** and Explore redesign.
  - Theme follows the system setting until the person presses the
    sun/moon button in the header (also on the sign-in page); the choice is
    stored in `localStorage` (`docroute-theme`) and applied by an inline
    script in `<head>` before paint (`src/lib/theme.ts`,
    `ThemeToggle.tsx`). Every colour is written as
    `light-dark(<light>, <dark>)`; dark values were kept as designed. Write
    new colours the same way; `light-dark()` takes colours only (not
    gradients or whole shadows).
  - By design the sign-in form panel stays light ("paper") in both themes,
    and university illustrations (`UniversityImage`) stay dark.
  - Explore: destination and field lists with search (shown once a list
    has more than 6 items) that scroll inside their panels; "Verified"
    badges are derived from `verified-programs.ts`; the country pop-up was
    removed; sticky selection bar (compact on phones). The background glow
    no longer shows a vertical seam on wide screens.
  - The university page now has the site header; on phones "Log in" is an
    icon button so the header fits one row.
  - Not checked: the account page while signed in (needs a login).

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
- PR #7 (merged 2026-10-23): work route for Slovakia (single permit, EU
  Blue Card, Slovak graduates) with questionnaire, progress and start-date
  planner; "Work" selectable on the home form. The route page was
  redesigned after owner feedback: compact header with a plain summary,
  horizontal route strip (one date per stage, vertical on phones),
  checklist rows instead of cards, one warning block, sticky side panel
  (start date, key dates, progress), minimum text size 12px. Checked in the
  browser on the Preview at desktop and 375px width.
- PR #6 (merged 2026-10-23): Comenius FMFI computing programs listed as
  "coming soon"; separate How it works page behind the header button.
- PR #5: map fades into the page and highlights only Slovakia; move-purpose
  foundation; residence recheck; rename to DocRoute; residence code split
  into shared steps and purposes; deadline planner.

## Working agreement with the owner

- The owner is not a programmer; talk in Russian and explain any action
  they must take step by step.
- Work in a branch with a PR; check tests and the Vercel Preview (open it
  in the built-in browser; Previews need a Vercel login), then send the
  owner the direct Preview link. Merge into `main` only after the owner
  says «мержим».
- Facts in routes come only from official sources with a check date; no
  rules borrowed from another year, field, degree or purpose.

## How changes are verified

- Unit tests: `npm test` (116 tests on 2026-10-24).
- SSR smoke test after a build: `npm run test:ssr`.
- Vercel build on every push (type check included).
- Manual browser walkthrough of the Slovakia → Computer Science scenario
  on the Preview before merging.

Note: in the Claude cloud environment npm packages could not be installed,
so tests were run with Node's built-in TypeScript support and a small local
module loader; ESLint and `test:ssr` were not run there. Light/dark text
contrast was checked with a script in the browser on the Preview for every
public page (no remaining issues except the sign-in form's small grey
text, which is unchanged from before).

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
7. **Planner limits**: Slovak public holidays are not counted; steps that
   start at card collection (insurance, medical report) are relative, not
   dated. The planner uses the maximum 90-day decision period.
8. The production domain is still `docroute-student.vercel.app`; renaming
   the Vercel project/domain is a separate decision.

## Next steps

1. Watch https://fmph.uniba.sk/prihlasky/ for the approved Comenius FMFI
   2027/28 rules; then verify and add the four programs with their own
   matching policy.
2. Resolve open questions 1–3 against the official UNIZA rules.
3. Verify the EU/EEA/Swiss registration route for Slovakia.
4. Add the next verified faculty or program only with its own official
   sources (STU FIIT and TUKE FEI once their 2027/28 rules are out).
5. Work route: cross-check key paragraphs of Act 404/2011 (and the
   Employment Services Act for the 20-working-day rule) on Slov-Lex;
   consider seasonal work and the Blue Card salary amount.
6. Define family or business purposes for Slovakia with official sources
   before enabling them in the form.
