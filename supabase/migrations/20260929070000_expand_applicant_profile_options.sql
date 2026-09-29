alter table public.applicant_profiles
  drop constraint if exists applicant_profiles_degree_level_check;

alter table public.applicant_profiles
  drop constraint if exists applicant_profiles_intake_check;

alter table public.applicant_profiles
  drop constraint if exists applicant_profiles_current_residence_status_check;

update public.applicant_profiles
set current_residence_status = case current_residence_status
  when 'outside-slovakia' then 'non-eu-passport-no-residence'
  when 'slovak-residence' then 'destination-residence'
  when 'eu-residence' then 'other-eu-residence'
  when 'slovak-national-visa' then 'destination-national-visa'
  when 'visa-free' then 'visa-free-entry'
  else current_residence_status
end,
profile_version = greatest(profile_version, 2);

alter table public.applicant_profiles
  add constraint applicant_profiles_degree_level_check
  check (degree_level in ('bachelor', 'master'));

alter table public.applicant_profiles
  add constraint applicant_profiles_intake_check
  check (intake in ('2027/28', '2028/29', '2029/30'));

alter table public.applicant_profiles
  add constraint applicant_profiles_current_residence_status_check
  check (
    current_residence_status in (
      'eu-eea-swiss-passport',
      'non-eu-passport-no-residence',
      'destination-residence',
      'other-eu-residence',
      'destination-national-visa',
      'visa-free-entry',
      'temporary-protection',
      'other'
    )
  );
