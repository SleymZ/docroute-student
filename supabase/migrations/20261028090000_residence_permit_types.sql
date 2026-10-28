-- Splits "Slovak residence" into study, other-purpose and permanent
-- residence. Existing rows keep 'destination-residence' (now labelled
-- "temporary residence for another purpose"); people can re-pick in the form.
alter table public.applicant_profiles
  drop constraint if exists applicant_profiles_current_residence_status_check;

alter table public.applicant_profiles
  add constraint applicant_profiles_current_residence_status_check
  check (
    current_residence_status in (
      'eu-eea-swiss-passport',
      'non-eu-passport-no-residence',
      'destination-study-residence',
      'destination-residence',
      'destination-permanent-residence',
      'other-eu-residence',
      'destination-national-visa',
      'visa-free-entry',
      'temporary-protection',
      'other'
    )
  );
