-- Lets a signed-in person delete their own account and every row tied to it
-- (GDPR Art. 17). Runs with the owner's rights because auth.users is not
-- writable by the authenticated role; it only ever deletes auth.uid().

drop function if exists public.delete_my_account();

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  -- The foreign keys cascade, but deleting explicitly keeps this correct
  -- even if a table is added later without "on delete cascade".
  delete from public.route_task_progress where user_id = current_user_id;
  delete from public.saved_universities where user_id = current_user_id;
  delete from public.applicant_profiles where user_id = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;
