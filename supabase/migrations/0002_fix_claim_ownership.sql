-- Fix: the first-owner claim failed because 'owner' was inferred as text, not staff_role.
create or replace function public.claim_ownership() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from staff) then return false; end if;
  insert into staff (user_id, email, role)
  select id, coalesce(email, ''), 'owner'::staff_role from auth.users where id = auth.uid();
  return true;
end $$;
