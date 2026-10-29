-- Family and business routes for Slovakia (PR #28): allow their route ids
-- in the waitlist and feedback. Safe to re-run.

alter table public.waitlist_signups drop constraint if exists waitlist_signups_route_check;
alter table public.waitlist_signups
  add constraint waitlist_signups_route_check check (
    route in ('study-sk', 'study-cz', 'work-sk', 'work-cz', 'family-sk', 'business-sk')
  ) not valid;

alter table public.feedback drop constraint if exists feedback_route_check;
alter table public.feedback
  add constraint feedback_route_check check (
    route is null or route in ('study-sk', 'study-cz', 'work-sk', 'work-cz', 'family-sk', 'business-sk')
  ) not valid;

notify pgrst, 'reload schema';
