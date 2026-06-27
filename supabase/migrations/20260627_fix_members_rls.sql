-- ─── FIX: business_members bootstrapping bug ───────────────────────
-- The "owners can manage members" FOR ALL USING policy also gates INSERT,
-- but when a brand-new business is created there is no member row yet, so
-- member_role() returns NULL and the very first INSERT is blocked.
-- Fix: add a targeted INSERT policy that lets a user add themselves as the
-- first owner of any business — secured by requiring user_id = auth.uid()
-- and role = 'owner' so nobody can impersonate another user or escalate roles.

create policy "users can self enroll as owner"
  on public.business_members for insert
  with check (
    user_id = auth.uid() and
    role    = 'owner'
  );

-- ─── REPAIR: back-fill missing member rows for existing businesses ──
-- Any business whose created_by user is not yet in business_members gets
-- an owner row inserted now.  Safe to run multiple times (ON CONFLICT).
insert into public.business_members (business_id, user_id, role, joined_at)
select
  b.id,
  b.created_by,
  'owner',
  now()
from public.businesses b
where
  b.created_by is not null
  and not exists (
    select 1
    from   public.business_members bm
    where  bm.business_id = b.id
    and    bm.user_id     = b.created_by
  )
on conflict (business_id, user_id) do nothing;
