# DocRoute

**One personal, source-linked route for moving to Europe to study or work.**
DocRoute turns scattered university pages and immigration guidance into a
single checklist: which documents you need, where you file them, and the
date by which each step has to happen. Every rule links to the official
page it came from and the date it was checked.

Live beta: https://docroute-student.vercel.app (free, non-commercial).

> DocRoute is a preparation tool, not legal advice. Universities and
> authorities make every decision; recheck each requirement on its official
> source before you file anything.

---

## The problem

A student from outside the EU who wants a bachelor's degree in Slovakia or
Czechia has to combine three systems that never talk to each other:

1. **Admission rules** of one faculty, for one intake year, often only in
   the local language, with waivers that depend on where you finished school.
2. **Residence permit rules** of the country, which changed in Slovakia on
   15 July 2026 and differ for every citizenship and current status.
3. **Deadlines that chain together**: documents must be recent when you
   file, the decision can take 60–90 days, and you must report your arrival
   within a few working days.

Mistakes are expensive: a document that expires a week early or a permit
filed at the wrong office can cost a whole academic year. Official sources
are accurate but fragmented; generic advice sites mix up years, degrees and
countries.

## What DocRoute does

| For whom | What they get |
| --- | --- |
| Students choosing a university | A profile (citizenship, school country, grades, languages, waiver evidence) matched against **verified** admission rules, with a status per requirement: met, missing, needs clarification. |
| People moving from abroad | A route from application to residence card, with a **deadline planner**: enter the date you need to be there and get the latest filing date, the window for each document and the duties after arrival. |
| People already in Europe | Routes for current residents and EU citizens: change of purpose, renewal, registration, and filing in Czechia with a Slovak study permit. |

Current routes:

- **Study in Slovakia**: University of Žilina (FRI), four Computer Science
  bachelor programmes for 2027/28, plus the Slovak study residence permit.
- **Study in Czechia**: Charles University (MFF) *Informatika* for 2027/28,
  plus the Czech long-term residence permit for study.
- **Work in Slovakia**: single permit, EU Blue Card, Slovak graduates.
- **Czechia residence**: study and work permits, EU registration, and the
  in-country filing exception for holders of another EU state's study permit.
- **Explore**: a directory of 2,598 institutions in 46 countries and a
  Top 100 list (CWTS Leiden Ranking, open data) with admission facts for
  non-EU applicants.

Each route can be saved as a PDF, ticked off step by step, and shared as a
link without an account.

## How facts are sourced

The most important design decision is what DocRoute refuses to do.

- **Only official sources, with a check date.** Faculty regulations, the
  Slovak and Czech interior ministries' guidance, the IOM Migration
  Information Centre, consolidated legislation. The source and date are
  shown next to every requirement.
- **No borrowed rules.** A rule from another year, degree, field or purpose
  never produces a personalised checklist. Programmes whose next-year rules
  are only drafts are listed as "Rules awaiting approval" and never matched.
- **No admission predictions.** No percentages, no "your chances". When a
  rule is ambiguous (for example, whether a faculty's exemption for Czech
  applicants covers a Czech citizen who finished school in Ukraine), the
  route says "ask the faculty" instead of guessing.
- **Contradictions are documented.** When an official page contradicts
  itself (two different deadlines on one page), the route uses the earlier
  date and the inconsistency is recorded in `docs/STATUS.md`.

## Architecture

- **Next.js 16 (App Router), React 19, TypeScript**, deployed on **Vercel**
  with a Preview deployment for every pull request.
- **Supabase** (Postgres, Auth with email and Google) for accounts, saved
  profiles, bookmarks and progress. Every table uses **row-level security**:
  a signed-in person can read only their own rows.
- **Rules as data.** Admission policies and residence rules are typed data
  files (`src/data/*`) with their sources; route builders in
  `src/lib/residence/*` and `src/lib/match-programs.ts` are pure functions,
  so they are unit-tested without a browser or database.
- **Date logic** runs in UTC with Slovak public holidays computed from the
  law (including Easter), so the server and the browser always show the
  same dates.
- **Guests first.** Route answers live in the URL (those pages are
  `noindex`) and progress in local storage; signing in merges them into the
  account.

## Privacy by design (GDPR)

DocRoute is run by a private individual in Slovakia, so the legal side had
to be simple and correct rather than copied from a template:

- Terms of Use, Privacy Policy and Cookie Policy read from one data file
  (`src/data/legal.ts`), so a change shows everywhere.
- **Self-service rights**: "Download my data" (JSON) and "Delete my account"
  (a `security definer` database function limited to `auth.uid()`).
- **Consent where it is needed**: an unticked checkbox for the waitlist, a
  one-step way to leave it, and visit statistics that load only after
  "Accept all" and never send the route answers in the URL.
- **Insert-only tables** for the waitlist and feedback: the public can add a
  row, but nobody can read the table through the API.
- Tests guard the promises: no tracker packages, the cookie list matches the
  keys the code actually stores, the operator stays unnamed while the beta
  is free, and nothing is sold until a trade licence exists.

## Quality

- **181 unit tests** (Node's built-in test runner) covering admission
  matching, residence routes, deadline planning, holidays, legal pages,
  database migrations and print/accessibility rules.
- Database migrations are re-runnable and were tested against a local
  PostgreSQL with Supabase-like roles before being applied.
- Every pull request is checked on its Vercel Preview in the browser, at
  375 px phone width and in both light and dark themes, before it is merged.
- A status file (`docs/STATUS.md`) records what was checked, when, against
  which source, and every known gap.

## Status and what's next

Public beta since 28 October 2026. Next:

- Update the Top 100 list with the Leiden Ranking 2026 (published 4 Nov 2026).
- Beta interviews with 10–20 students and a waitlist for a fuller route, to
  decide whether a paid version is worth building.
- Add the next faculties only when their 2027/28 rules are officially
  approved (Comenius University FMFI, STU FIIT, TUKE FEI).

**Beta results** *(to be filled in after the interviews)*: number of
interviews, the main problems people described, waitlist sign-ups, and what
changed because of the feedback.

## Run it locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Public environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

### Supabase

Run the SQL migrations in `supabase/migrations/` in filename order in the
Supabase SQL editor (the first one, `20260927190000`, is a historical
placeholder). Every later migration is safe to run more than once. Add the
local and deployed callback URLs to the Supabase redirect allow list:

```text
http://localhost:3000/auth/callback
https://your-domain.example/auth/callback
```

### Checks

```bash
npm run lint
npm test
npm run build
npm run test:ssr
```

### Deployment

Connect the repository to Vercel, set the three environment variables for
Preview and Production, run the migrations, and enable Web Analytics in the
Vercel project if visit statistics are wanted (they still load only after
consent).

## About

Built and maintained by one student living in Slovakia, for people in the
same situation. Development used an AI coding assistant (Claude by
Anthropic); every change went through a pull request and was checked on a
preview deployment before merging.
