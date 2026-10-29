# DocRoute — project status

Last updated: 2026-10-29. Keep this file factual: describe what exists and
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
- **Top 100** (`/explore/top`, linked from the Explore hero): Europe's 100
  universities with the most top-10%-cited papers, with bachelor's
  admission facts for non-EU applicants (reference only, see below).
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
  Tables: `applicant_profiles`, `saved_universities`, `route_task_progress`,
  `waitlist_signups`, `feedback`. Functions: `delete_my_account()` (migration
  `20261028150000`, redefined in `20261028180000`), `leave_waitlist(email)`.

## Verified coverage

| Area | Coverage | Checked |
| --- | --- | --- |
| Admission | Slovakia · Computer Science · Bachelor · 2027/28 · UNIZA FRI, 4 programs (`src/data/verified-programs.ts`) | 2026-10-19 |
| Study residence | Slovakia, third-country citizens (`src/data/slovakia-residence.ts`) | 2026-10-23 |
| Admission | Czechia · Computer Science · Bachelor · 2027/28 · Charles University MFF, Informatika (Czech-taught), policy `cuni-mff-bachelor-2027` | 2026-10-28 |
| Coming soon (not verified) | Comenius University Bratislava, FMFI · Computer Science · Bachelor · 2027/28: Computer Science, Applied Informatics, Data Science, Bioinformatics (`src/data/pending-programs.ts`). Listed with last year's (2026/27) approved rules for orientation; no match, checklist or route | 2026-10-29 |
| Work residence | Slovakia, third-country citizens: single permit, EU Blue Card, Slovak graduates (`src/data/slovakia-work.ts`, `src/lib/residence/slovakia-work.ts`) | 2026-10-23 |
| Czech residence | Study (long-term residence permit for study or its extension), work (employee card, free access for Czech graduates, EU Blue Card), EU registration, permanent residents (`src/data/czechia-residence.ts`, `src/lib/residence/czechia.ts`, page `/route/czechia`) | 2026-10-28 |
| EU/EEA/Swiss residence | Slovakia: notice of stay, registration, optional card, duties, for study and work (`src/data/slovakia-residents.ts`) | 2026-10-28 |
| Current Slovak residents | Study residence (report new studies, gap, renewal), other purpose (change of purpose to study), permanent/long-term (no new application) | 2026-10-28 |
| Other countries, fields, degrees, intakes | Not verified; shown as "Verification pending" | — |

The catalog (`src/data/universities.json`, 2,598 institutions in 46
countries, imported 2026-09-16 from Hipo) lists institutions only. It is not
evidence that a program exists or of its requirements.

On the home map Slovakia and Czechia are highlighted (Czechia for its
residence routes).

## "Coming soon" programs

`src/data/pending-programs.ts` lists programs whose rules for the intake are
announced but not yet approved and published. They appear on results pages
(a "Coming soon" block), on the university page and on How it works, with
the label "Rules awaiting approval". They never go through `matchProgram`
and must not carry thresholds, dates or fees from a draft.

Last year's rules (PR #21, owner decision 2026-10-29): a group may carry
`previousCycle`, the approved rules of the previous intake with their own
sources. They are shown in a "Last year's rules (2026/27), for orientation"
block (collapsed on results pages, open on the university page) with a
warning that they are not the rules for the intake and may change. The
matcher never reads them; tests check the intake is earlier, sources are on
the university's domain and program names exist. Replace the block when the
new rules are verified.

Comenius FMFI status (checked 2026-10-23, rechecked 2026-10-29: the
bachelor admission page, updated 21 Sep 2026, still describes 2026/27; the
2026/27 conditions were approved on 1 Dec 2025, so 2027/28 approval may come
around Nov–Dec 2026): the 2027/28 bachelor conditions
were item 4 of the Academic Senate session of 19 October 2026 as a draft
("návrh uznesenia"). No resolution was published, and the draft has two
different versions of Art. 2 (3)–(5) (which math tests are accepted; the
second also allows English-language tests such as SAT). The fee and
foreign-qualification recognition are not in the draft. The faculty's
applications page still shows 2026/27. When the approved 2027/28 rules
appear on https://fmph.uniba.sk/studium/prijimacie-konanie/bakalarske-studium/
(the old /prihlasky/ link is not reachable by the tools), move the group into
`verified-programs.ts` with its own matching policy (percentile/grade/
competition criteria differ completely from UNIZA's) and delete the
pending entry; a test fails if both exist.

Other Slovak computing faculties checked on 2026-10-23 (STU FIIT, TUKE FEI)
still publish only their 2026/27 rules.

## Top 100 universities (checked 2026-10-27)

- Order: CWTS Leiden Ranking Open Edition 2025, region Europe, indicator
  P(top 10%), 2020–2023, fractional counting, core publications, all
  sciences. Data are CC0 (Zenodo 10.5281/zenodo.17473224). Taken from the
  ranking site's list for Europe. The 2026 edition is due 4 Nov 2026:
  update `src/data/top-universities.ts` then. QS, THE and ARWU positions
  are not shown: their terms do not allow republishing.
- Data: `src/data/top-universities.ts` (generated once from research
  notes, edit by hand now), types in `src/types/top-universities.ts`,
  field resolution in `src/lib/top-universities.ts`, page
  `src/app/explore/top`, list `TopUniversitiesList.tsx`.
- Facts per university: how to apply, deadline, school certificate,
  language, tuition for a non-EU bachelor's applicant. A university's own
  statement wins; otherwise a sourced country rule is shown, labelled
  "Country rule". Fields with neither are listed as "Not checked yet".
  When a source page describes another intake (often 2026/27), the card
  says "Source describes: …". This is reference information: no
  matching, no checklist, not a verified route.
- Computer science bachelor per university (`src/data/top-computer-science.ts`,
  checked 2026-10-28 on the universities' own sites): programme link, the
  teaching language only when the checked page states it (28 marked
  English, UK/IE by default), and notes; 5 have none (Karolinska, Erasmus,
  Lausanne, Medical University of Vienna, Lund in English). Filter
  "Computer science in English" on the page. Not verified routes.
- 97 of 100 link to their DocRoute catalog page; Paris Cité, Sorbonne and
  PSL do not (the catalog has only predecessor institutions).
- Known gaps: Federico II (Naples) and KU Leuven pages could not be read
  by the tools; Spanish universities mostly show the national procedure;
  Italian, Austrian and Portuguese deadlines are from the 2026/27 cycle.
  UK tuition is per course (link only). Oxford, Cambridge and UK
  medicine closed for 2027 entry on 15 October 2026.

## EU citizens and current residents (checked 2026-10-28)

- Sources (IOM MIC): "Residence of Union citizens" (updated 16 July 2026),
  "Change of the purpose or type of residence permit" (4 March 2026),
  "Reporting residence and other important obligations" (14 July 2026),
  "Permanent residence" (14 July 2026), "Temporary residence – study"
  (22 July 2026).
- EU, EEA, Swiss: notice of stay within 10 working days of entry (unless
  the accommodation provider reports it); register within 30 days after
  the first 3 months, free; card optional (10 years, €10/€39); report
  changes within 10 working days; permanent residence after 5 years. The
  route uses the university confirmation (study) or employment contract
  (work). No dated planner for this group yet.
- Residence status now has three Slovak options: `destination-study-residence`,
  `destination-residence` (now "another purpose") and
  `destination-permanent-residence`. Migration
  `20261028090000_residence_permit_types.sql` must be run in Supabase
  before profiles with the new values can be saved.
- Study holders: report the new university (no published deadline, so the
  route says "ask"), gap warning (purpose end must be reported within 3
  working days), renewal by the last day of validity.
- Other purpose: the guidance does not say which purposes allow study, so
  the route asks to confirm first, then gives the change-of-purpose
  checklist (no repeated criminal record or medical report, stay
  authorised in Slovakia while pending); the planner drops those items.
- Permanent: guidance gives citizen-like rights incl. employment; study is
  not mentioned, so the study route asks to confirm with the university.
- Not covered: family members of EU citizens; a study holder switching to
  work is still shown the ordinary in-country work route.

## Charles University MFF Informatika (checked 2026-10-28)

- Sources: MFF page "Přijímací řízení ke studiu bakalářských programů
  (2027/2028)", the 2027/28 programme list, and the Charles University
  information system (Informatika: full-time, Czech, 3 years). No
  approval date is shown on the pages.
- Rules used: deadline 31 Mar 2027; fee CZK 1,000 due 3 days later;
  written exam 7 Jun 2027 (substitute 22 Jun), 40/100 passes, everyone
  who meets the conditions is admitted; waivers (maturita 2025/26–2026/27
  only for the maturita grounds): maths average ≤1.5 (CZ/SK/European
  school), olympiads, MFF seminars, CZ Matematika rozšiřující 68%+, SK
  external maths 75%+, AP 4/5 (by May 2026), České hlavičky (not in the
  form). Czech proof (B2+) only without a CZ/SK maturita; SK/PL/HU/SI
  certificates are automatically equivalent.
- Inconsistencies on the page: waiver deadline 23 vs 24 May 2027;
  maturita copy 31 Jul vs 30 Sep 2027. The route uses the earlier dates.
- The English-taught Computer Science bachelor (EUR 7,500/year non-EU,
  deadline 30 Apr 2027) is not verified: its 2027/28 requirements page
  was not found.
- Matcher: `matchProgram` dispatches per policy; profile form shows waiver
  options per destination country.

## Czechia residence (checked 2026-10-28)

- Sources: Ministry of the Interior portal ipc.gov.cz (study permit and
  study visa 27 Jul 2026, funds 30 Sep 2026, formal requirements 27 Jul,
  obligations 24 Aug, processing periods 25 Jun, employee card 12 Oct,
  Blue Card 14 Sep, free access 27 Jul, EU obligations 24 Aug, EU
  registration certificate 15 Sep 2026) and mzv.gov.cz (study: legal
  processing 60 days, Režim Student). Act 326/1999 is the legal basis,
  not checked section by section.
- Numbers: funds CZK 78,250 per semester / 115,810 per year (portal still
  uses a CZK 3,130 subsistence minimum; recheck yearly); fee CZK 2,500
  (study), CZK 5,000 consular / 2,500 in Czechia (employee card, Blue
  Card); documents ≤180 days, Czech translation unless Czech or Slovak;
  register within 30 days with D/VR visa (3 days visa-free); card within
  60 days of biometrics; extension from 120 days before expiry; employee
  card 60 days (90 complex), Blue Card 90 days; EU: report stay within 30
  days, optional certificate CZK 200.
- Known gaps: the Blue Card page gives both 6 months and 1 year as minimum
  contract and no CZK salary amount (route asks to confirm); employee card
  unemployment rules not described; how a study-permit holder reports
  a change of university is not described.
- Holders of a permit from another EU country (PR #17, checked
  2026-10-28): for study, `/route/czechia` asks what the permit is for,
  who issued it and whether it is an exchange permit. A long-term study
  permit or visa from an EU country other than Ireland and Denmark (e.g.
  Slovakia) → first application in person at a Ministry of the Interior
  office in Czechia (no Czech visa needed; embassy also possible), with
  first-application documents incl. criminal record. The route warns that
  short stays on the current permit are limited to 90 days in 180 and a
  pending application does not extend that (ipc "Travelling within the
  Schengen Area", 28 Jul 2026), and that in Slovakia the end of the
  residence purpose is reported within 3 working days (IOM). Exchange
  permits with a programme note: up to 1 year visa-free in Czechia,
  register with the Foreign Police within 3 days (ipc study-mobility page,
  24 Aug 2026). Other purposes, Ireland, Denmark or non-EU issuers →
  embassy. Older links without these answers stay "confirm where to
  apply". The Charles MFF route (saved profile) cannot ask these questions
  and still says "confirm", pointing to the Czechia route.
- Planner uses calendar days (no Czech holidays needed).

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
  (UTC; working days skip weekends and Slovak days off; dates formatted by
  hand to avoid ICU differences between server and browser).
- `src/lib/residence/slovak-holidays.ts`: Slovak days off under Act No.
  241/1993 (Slov-Lex version in force from 1 Nov 2025, checked 2026-10-27):
  11 fixed days plus Good Friday and Easter Monday (Easter is calculated).
  1 Sep, 28 Oct and 17 Nov are state holidays but not days off; § 4b makes
  8 May and 15 Sep working days in 2026 only. Recheck the act each year;
  a test pins the list.

## Residence sources (rechecked 2026-10-23)

- Requirements cite the IOM Migration Information Centre pages updated in
  July 2026, after the Foreigners Residence Act amendment in force from
  15 July 2026.
- The legal basis is cited as Act No. 404/2011 Coll. on Slov-Lex (version
  from 15 July 2026). Its paragraphs were not cross-checked one by one; the
  tool could not load the full text.
- The previous minv.sk deep link redirects to the ministry homepage and was
  removed.

## Legal status and beta (2026-10-28)

- DocRoute runs as a **free, non-commercial public beta** by a private
  individual living in Slovakia (no IČO, no payments). The operator is not
  named on the site during the beta. `legalInfo` in `src/data/legal.ts`
  holds the contact (email `null` until the dedicated mailbox exists;
  meanwhile GitHub issues), minimum account age (16) and document dates; Terms, Privacy, Cookies and the
  footer read from it. `isCommercial` must stay `false` until a trade
  licence exists and payment terms are written (a test checks it).
- Pages: `/terms` (not legal advice / not a legal service under Act
  586/2003, decisions belong to universities and authorities, no
  guarantee, Slovak law), `/privacy` (GDPR: data table, processors
  Supabase, Vercel, Google sign-in, Wikimedia photos; rights; complaint to
  ÚOOÚ SR), `/cookies` (only strictly necessary items; § 109(8) of Act
  452/2021). A cookie banner asks "Accept all" / "Necessary only" (equal
  buttons, choice in `docroute-cookie-consent`, changeable on `/cookies`);
  both behave the same today. Any future optional tool must check
  `hasOptionalConsent()` in `src/lib/cookie-consent.ts`.
- Site-wide footer with the BETA label and legal links; BETA badge in the
  header; consent line on the sign-in/sign-up screen (Terms, 16+, Privacy).
- Account page: **Download my data** (JSON of account, profile, saved
  universities, progress) and **Delete my account** (RPC
  `delete_my_account`, migration `20261028150000`).
- Visit statistics (PR #19): Vercel Web Analytics loaded by
  `ConsentedAnalytics` only after "Accept all" and only on production
  (`NEXT_PUBLIC_VERCEL_ENV`), via the plain script
  `/_vercel/insights/script.js` (no npm package). Cookieless; `beforeSend`
  strips the query string (route answers live there) and drops events if
  consent was withdrawn. Needs Analytics enabled in the Vercel project
  (owner action). Hobby has no custom events. Cookie Policy, banner and
  Privacy Policy describe it. No other analytics or trackers (a test
  checks package.json).
- Feedback (PR #19): anonymous form (rating 1–5 and/or text) at the end of
  every route page and on `/feedback` (footer link). Table `feedback`
  (migration `20261028200000_feedback.sql`): insert-only like the
  waitlist, page path without query string (checked in the database),
  kept at most 24 months; read in the Supabase dashboard.
- Before taking money: trade licence (živnosť; study-residence holders may
  run a trade per podnikajte.sk, confirm with the trade office), payment
  terms with the 14-day withdrawal waiver for digital content, Vercel Pro
  (Hobby is non-commercial), a lawyer's review of the wording, and the
  seller's name or business name, IČO and address on the site (selling
  cannot be anonymous).

## Waitlist for the full route (PR #16)

- "Want the full route?" block (`WaitlistCta`) at the end of every route
  page: study SK/CZ (`RoutePreviewScreen`), work SK, Czechia. Email +
  unticked consent box (16+, one email about the full route, kept at most
  12 months, withdraw any time, link to `/privacy#waitlist`). Honeypot
  field; a repeat signup shows the same success message. Nothing is stored
  in the browser.
- Table `waitlist_signups` (migration `20261028180000_waitlist.sql`):
  email (lower-case), route (`study-sk`, `study-cz`, `work-sk`, `work-cz`),
  consent version (`WAITLIST_CONSENT_VERSION` in `src/lib/waitlist.ts`;
  change it when the consent wording changes), `consented_at` set by the
  database. RLS: anon and signed-in users may only insert those three
  columns; no one can read, change or delete rows through the API. The
  owner reads the list in the Supabase dashboard (Table Editor).
  `leave_waitlist(email)` removes an email without saying whether it was
  listed (form on `/privacy#waitlist`); `delete_my_account()` also deletes
  rows with the account's email.
- Privacy Policy: waitlist row (consent, Art. 6(1)(a)), Supabase role,
  summary line, deletion and security text, "Leaving the waitlist" form.
- The migration was run twice on a local Postgres 16 with Supabase-like
  roles: inserts work, reads/updates/deletes are denied, bad email or
  route rejected, duplicates give 23505, leave and account deletion work.
- Limits: no rate limit beyond the honeypot (bots could add fake emails);
  "Download my data" does not include waitlist rows (they cannot be read
  through the API). Delete rows after the one announcement email or after
  12 months.

## Recently shipped (October 2026)

- PR #21 (2026-10-29): last year's approved rules for "coming soon"
  programs, starting with Comenius FMFI 2026/27 (deadline, fee, no entrance
  exam, grade/percentile thresholds per program, SCIO for non-EU schools,
  Slovak B1, recognition of foreign certificates).

- PR #20 (2026-10-28): README rewritten as an English case study for the
  portfolio (beta results section to fill after interviews);
  `docs/launch-kit.md` with the beta post (RU/EN), interview questions and
  the demo-video script.
- PR #19 (2026-10-28): feedback form and consent-gated visit statistics
  (see Legal status and beta).
- PR #18 (2026-10-28): "Save as PDF" on every route page (browser print
  dialog; `@media print` in `globals.css` forces the light theme, hides
  the header, breadcrumbs, waitlist, edit links, footer and cookie banner
  via `data-print-hide`, and a print-only note gives the date and says
  the rules may change). No PDF library, nothing leaves the device.
  Accessibility fix for open question 6.
- PR #17 (2026-10-28): Czech study permit for holders of a Slovak (or
  other EU) study permit: where to file (see Czechia residence).
- PR #16 (2026-10-28): waitlist "I want the full route" (see above).

- PR #15 (2026-10-28): public beta legal basis — Terms, Privacy,
  Cookies, footer, BETA badge, sign-up consent line, data download and
  account deletion.
- PR #14 (2026-10-28): computer science bachelor link and language for
  each Top 100 university, English filter.
- PR #13 (2026-10-28): Charles University MFF Informatika verified (see
  above); the study route uses Czech residence stages and planner.
  Checked on the Preview: UA citizen, Slovak school, SK maths 75%+ →
  waiver, no Czech proof, CZK 1,000, planner dates.
- PR #12 (2026-10-28): Czech residence routes for study and work at
  `/route/czechia` (same layout as the Slovak work route), home form and
  map. Checked on the Preview: UA student from abroad (planner, 78,250
  CZK), Blue Card questionnaire, Czechia highlighted.

- PR #11 (2026-10-28): EU/EEA/Swiss registration and current-resident
  routes for Slovakia (see the section above). Checked on the Preview:
  UA citizen with study residence, DE citizen, change of purpose with move
  date 15 Sep 2027 (no criminal-record or medical items), new form options.

- PR #10 (2026-10-27): Top 100 page (see the section above), Explore hero
  link and a "#N in Europe's top 100" button on university pages. Checked
  on the Preview: 100 cards, search and country filter, both themes,
  375px width without sideways scroll.
- PR #9 (2026-10-27): UNIZA rules and planner holidays.
  - Slovak test exemption: rechecked points 2 and 9–13 of the FRI 2027/28
    rules on 2026-10-27. Point 11 exempts foreign applicants "from the
    Czech Republic"; point 2 describes a foreign applicant as one who
    finished school abroad; citizenship is not mentioned. The test is now
    skipped only when citizenship and school country are both SK/CZ,
    required when neither is, and otherwise the route says "ask the
    faculty" (Needs clarification) with the test as fallback
    (`slovakTestRule` in `match-programs.ts`).
  - The route shows the UNIZA test once (language task); the separate
    document task was removed from the route.
  - The "Profile aligned" match status was removed: the faculty always
    keeps a step, so "Steps remaining" is the best status. A met condition
    inside the route is labelled "Condition met".
  - Planner counts Slovak public holidays (see residence code structure).
  - Checked on the Preview: CZ citizen schooled in UA gets "ask the
    faculty"; no duplicate test task; move date 25 Mar 2027 gives the
    arrival report by 1 Apr 2027 (Easter skipped).

- PR #8 (merged 2026-10-24): **light theme** and Explore redesign.
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

- Unit tests: `npm test` (183 tests on 2026-10-29).
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

1. **UNIZA Slovak test exemption** (resolved in PR #9 as "ask the faculty"
   when citizenship and school country differ). A written answer from the
   faculty would let DocRoute decide these cases.
2. (resolved in PR #9) Duplicate UNIZA test tasks.
3. (resolved in PR #9) "Profile aligned" removed as unreachable.
4. (resolved in PR #11) EU/EEA/Swiss registration route for Slovakia.
   Family members of EU citizens are not covered.
5. **Signed-in flows on Previews**: email links may redirect to production
   because Preview URLs are not in the Supabase redirect allow list.
6. (resolved in PR #18) The university image's `role="img"` is now on an
   inner element; the photo credit links sit outside it.
7. **Planner limits**: Slovak public holidays are counted only as listed in
   Act 241/1993 (future one-year exceptions must be added by hand); steps
   that start at card collection (insurance, medical report) are relative, not
   dated. The planner uses the maximum 90-day decision period.
8. The production domain is still `docroute-student.vercel.app`; renaming
   the Vercel project/domain is a separate decision.

## Next steps

1. Watch the FMFI bachelor admission page for the approved Comenius FMFI
   2027/28 rules; then verify and add the four programs with their own
   matching policy.
2. Ask UNIZA FRI in writing how the Czech exemption applies to mixed
   citizenship/school cases (open question 1).
3. Add the next verified faculty or program only with its own official
   sources (STU FIIT and TUKE FEI once their 2027/28 rules are out).
4. Work route: cross-check key paragraphs of Act 404/2011 (and the
   Employment Services Act for the 20-working-day rule) on Slov-Lex;
   consider seasonal work and the Blue Card salary amount.
5. Update the Top 100 list when the Leiden Ranking 2026 is published
   (4 Nov 2026) and recheck deadlines once universities publish 2027/28
   rules.
6. Add more "coming soon" faculties with last year's rules (STU FIIT,
   TUKE FEI, then other fields such as medicine in English) while their
   2027/28 rules are not out.
7. Define family or business purposes for Slovakia with official sources
   before enabling them in the form.
