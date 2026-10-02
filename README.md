# DocRoute Student

DocRoute Student is a source-linked university application and student
residence route builder for Europe.

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
npm run build
```

## Deployment

The project is designed for Vercel. Connect the GitHub repository, configure
the three environment variables for Preview and Production, run the Supabase
migrations, and verify signup, login, profile saving, matching, and route
preview on the deployed domain.

DocRoute is a preparation tool, not an admission decision or legal advice.
Every open requirement must be rechecked before submission.
