-- ─── ENABLE RLS ────────────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.businesses       enable row level security;
alter table public.business_members enable row level security;
alter table public.contexts         enable row level security;
alter table public.periods          enable row level security;
alter table public.workers          enable row level security;
alter table public.expenses         enable row level security;

-- ─── HELPER FUNCTIONS ──────────────────────────────────────────────
create or replace function is_member(bid uuid)
returns boolean as $$
  select exists (
    select 1 from public.business_members
    where business_id = bid and user_id = auth.uid()
  );
$$ language sql security definer;

create or replace function member_role(bid uuid)
returns text as $$
  select role from public.business_members
  where business_id = bid and user_id = auth.uid()
  limit 1;
$$ language sql security definer;

-- ─── PROFILES ──────────────────────────────────────────────────────
create policy "users can view own profile"
  on public.profiles for select using (id = auth.uid());

create policy "users can update own profile"
  on public.profiles for update using (id = auth.uid());

-- ─── BUSINESSES ────────────────────────────────────────────────────
create policy "members can view business"
  on public.businesses for select using (is_member(id));

create policy "owners can update business"
  on public.businesses for update using (member_role(id) = 'owner');

create policy "authenticated users can create business"
  on public.businesses for insert with check (auth.uid() is not null);

-- ─── BUSINESS MEMBERS ──────────────────────────────────────────────
create policy "members can view members"
  on public.business_members for select using (is_member(business_id));

create policy "owners can manage members"
  on public.business_members for all using (member_role(business_id) = 'owner');

-- ─── CONTEXTS ──────────────────────────────────────────────────────
create policy "members can view contexts"
  on public.contexts for select using (is_member(business_id));

create policy "managers can manage contexts"
  on public.contexts for all using (member_role(business_id) in ('owner','manager'));

-- ─── PERIODS ───────────────────────────────────────────────────────
create policy "members can view periods"
  on public.periods for select using (is_member(business_id));

create policy "managers can manage periods"
  on public.periods for all using (member_role(business_id) in ('owner','manager'));

-- ─── WORKERS ───────────────────────────────────────────────────────
create policy "members can view workers"
  on public.workers for select using (is_member(business_id));

create policy "managers can manage workers"
  on public.workers for all using (member_role(business_id) in ('owner','manager'));

-- ─── EXPENSES ──────────────────────────────────────────────────────
create policy "members can read expenses"
  on public.expenses for select using (is_member(business_id));

create policy "managers can add expenses"
  on public.expenses for insert
  with check (
    is_member(business_id) and
    member_role(business_id) in ('owner', 'manager')
  );

create policy "managers can update expenses"
  on public.expenses for update
  using (member_role(business_id) in ('owner', 'manager'));

create policy "owners can delete expenses"
  on public.expenses for delete using (member_role(business_id) = 'owner');

-- ─── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New User'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
