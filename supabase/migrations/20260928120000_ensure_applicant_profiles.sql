create table if not exists public.applicant_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  destination_country_code text not null,
  study_category text not null,
  degree_level text not null default 'bachelor',
  intake text not null default '2027/28',
  citizenship_country_code text not null,
  education_country_code text not null,
  current_residence_status text not null,
  education_status text not null,
  grade_scale text not null,
  penultimate_year_average numeric(6, 2),
  languages jsonb not null default '[]'::jsonb,
  waiver_evidence jsonb not null default '[]'::jsonb,
  profile_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint applicant_profiles_country_codes_check check (
    destination_country_code ~ '^[A-Z]{2}$'
    and citizenship_country_code ~ '^[A-Z]{2}$'
    and education_country_code ~ '^[A-Z]{2}$'
  ),
  constraint applicant_profiles_study_category_check check (
    length(trim(study_category)) between 2 and 100
  ),
  constraint applicant_profiles_degree_level_check check (
    degree_level = 'bachelor'
  ),
  constraint applicant_profiles_intake_check check (
    intake = '2027/28'
  ),
  constraint applicant_profiles_current_residence_status_check check (
    current_residence_status in (
      'outside-slovakia',
      'slovak-residence',
      'eu-residence',
      'slovak-national-visa',
      'visa-free',
      'temporary-protection',
      'other'
    )
  ),
  constraint applicant_profiles_education_status_check check (
    education_status in ('completed', 'final-year', 'earlier-year')
  ),
  constraint applicant_profiles_grade_scale_check check (
    grade_scale in ('slovak-1-5', 'other')
  ),
  constraint applicant_profiles_average_check check (
    penultimate_year_average is null
    or penultimate_year_average > 0
  ),
  constraint applicant_profiles_languages_array_check check (
    jsonb_typeof(languages) = 'array'
    and jsonb_array_length(languages) > 0
  ),
  constraint applicant_profiles_waiver_array_check check (
    jsonb_typeof(waiver_evidence) = 'array'
  ),
  constraint applicant_profiles_version_check check (
    profile_version >= 1
  )
);

create or replace function public.set_applicant_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_applicant_profile_updated_at
  on public.applicant_profiles;

create trigger set_applicant_profile_updated_at
before update on public.applicant_profiles
for each row
execute function public.set_applicant_profile_updated_at();

alter table public.applicant_profiles enable row level security;

revoke all on table public.applicant_profiles from anon;
grant select, insert, update, delete
  on table public.applicant_profiles
  to authenticated;

drop policy if exists "Applicants can read their own profile"
  on public.applicant_profiles;
create policy "Applicants can read their own profile"
  on public.applicant_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Applicants can create their own profile"
  on public.applicant_profiles;
create policy "Applicants can create their own profile"
  on public.applicant_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Applicants can update their own profile"
  on public.applicant_profiles;
create policy "Applicants can update their own profile"
  on public.applicant_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Applicants can delete their own profile"
  on public.applicant_profiles;
create policy "Applicants can delete their own profile"
  on public.applicant_profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
