# DocRoute

DocRoute helps people move to Europe with one source-linked route: find a
university (for students), see which documents are needed and get a deadline
for each one, from application to residence permit.

Study and work are supported for Slovakia. The work route covers non-EU
citizens: single permit, EU Blue Card and Slovak graduates, from the job offer
to duties after arrival. Family and business are planned and appear in the home
form as "coming soon" until their official rules are verified.

The public Explore area is a university directory. Personalised matching is
kept separate in the **Build my route** flow and only labels a program as
verified when its requirements have been checked against an official source.

## Current verified coverage

- Destination: Slovakia
- Category: Computer Science
- Degree: Bachelor
- Intake: 2027/28
- Institution: University of Žilina, Faculty of Management Science and
  Informatics
- Verified programs: 4

Coming soon (listed, not verified): Comenius University Bratislava, Faculty
of Mathematics, Physics and Informatics — four computing programs whose
2027/28 rules are awaiting approval. They never produce a personalised route.

Other institutions remain available in the public directory, with their
verification status shown explicitly.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required public environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

## Supabase

Run the SQL migrations in filename order:

1. `supabase/migrations/20260928120000_ensure_applicant_profiles.sql`
2. `supabase/migrations/20260929070000_expand_applicant_profile_options.sql`
3. `supabase/migrations/20261002121500_create_user_memory.sql`

The earlier `20260927190000` migration is a historical placeholder and does
not need to be pasted into the SQL editor.

The profile, saved-university, and route-progress tables use row-level
security. Authenticated users can only access rows whose `user_id` matches
their Supabase identity. Guests can still save bookmarks and route progress
in their browser; those choices are merged into their account after login.

For authentication, add both local and deployed callback URLs to the Supabase
redirect allow list:

```text
http://localhost:3000/auth/callback
https://your-domain.example/auth/callback
```

## Quality checks

```bash
npm run lint
npm test
npm run build
npm run test:ssr
```

## Deployment

The project is designed for Vercel. Connect the GitHub repository, configure
the three environment variables for Preview and Production, run the Supabase
migrations, and verify signup, login, profile saving, matching, and route
preview on the deployed domain.

DocRoute is a preparation tool, not an admission decision or legal advice.
Every open requirement must be rechecked before submission.

## Admission matching policy

The first implemented policy is FRI UNIZA bachelor-level Computer Science
for 2027/28 (four programmes at one faculty, not complete Slovak coverage).
Rules and the electronic-application instructions were rechecked on 2026-10-19.
The policy source is linked beside requirements and documents in the UI.

- Destination, subject, degree and intake must all match exactly. A rule from
  another year or degree cannot generate a personalised checklist.
- A server-supplied date in the Europe/Bratislava timezone is used for deadline
  checks, so SSR and client hydration use the same snapshot.
- Known languages, willingness to study in them and accepted language proof
  are separate checks. An unrelated certificate does not satisfy the specific
  UNIZA test rule.
- Old `math-matura` / `olympiad` profile entries remain readable but require
  clarification. New evidence options state the actual percentile/round.
- A self-reported waiver is a possible admission route, not a faculty decision.
  A foreign grade scale is not automatically converted into a Slovak average.
- A final-year applicant still needs a final graduation certificate even when
  an entrance-exam waiver is claimed. Conditional documents are labelled.
- Preview rejects incompatible or expired routes and stores progress separately
  when the profile changes.

This update uses the existing JSON profile fields; no additional SQL migration
is needed. Immigration guidance is a separate data set and is not re-verified
by this admissions update.
