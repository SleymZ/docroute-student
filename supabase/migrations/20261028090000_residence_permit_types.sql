-- Splits "Slovak residence" into study, other-purpose and permanent
-- residence. Existing rows keep 'destination-residence' (now labelled
-- "temporary residence for another purpose"); people can re-pick in the form.

alter table public.applicant_profiles
  drop constraint if exists applicant_profiles_current_residence_status_check;

-- Older saved profiles may still use the first status names (the database
-- may still have the first constraint, so it is dropped before updating).
update public.applicant_profiles
set current_residence_status = case current_residence_status
  when 'outside-slovakia' then 'non-eu-passport-no-residence'
  when 'slovak-residence' then 'destination-residence'
  when 'eu-residence' then 'other-eu-residence'
  when 'slovak-national-visa' then 'destination-national-visa'
  when 'visa-free' then 'visa-free-entry'
  else current_residence_status
end;

-- NOT VALID: new and edited rows are checked; any unexpected older value is
-- left untouched instead of blocking the migration (the app normalises it).
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
  ) not valid;
