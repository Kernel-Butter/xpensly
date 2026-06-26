-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ──────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text not null,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ─── BUSINESSES ────────────────────────────────────────────────────
create table public.businesses (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  type        text not null default 'agriculture',
  currency    text not null default 'PKR',
  timezone    text not null default 'Asia/Karachi',
  config      jsonb not null default '{}',
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── BUSINESS MEMBERS ──────────────────────────────────────────────
create table public.business_members (
  id          uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  role        text not null check (role in ('owner','manager','worker','accountant')),
  invited_at  timestamptz default now(),
  joined_at   timestamptz,
  unique(business_id, user_id)
);

-- ─── CONTEXTS ──────────────────────────────────────────────────────
create table public.contexts (
  id          uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  name        text not null,
  unit_size   numeric,
  unit_label  text,
  notes       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ─── PERIODS ───────────────────────────────────────────────────────
create table public.periods (
  id            uuid default uuid_generate_v4() primary key,
  context_id    uuid references public.contexts(id) on delete cascade,
  business_id   uuid references public.businesses(id) on delete cascade,
  name          text not null,
  start_date    date,
  end_date      date,
  budget_total  numeric,
  budget_by_cat jsonb default '{}',
  is_active     boolean default true,
  is_archived   boolean default false,
  created_at    timestamptz default now()
);

-- ─── WORKERS ───────────────────────────────────────────────────────
create table public.workers (
  id          uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  name        text not null,
  daily_rate  numeric,
  rate_type   text default 'daily' check (rate_type in ('daily','hourly','fixed')),
  notes       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ─── EXPENSES ──────────────────────────────────────────────────────
create table public.expenses (
  id          uuid default uuid_generate_v4() primary key,
  period_id   uuid references public.periods(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  date        date not null default current_date,
  category_id text not null,
  sub_item    text,
  description text,
  quantity    numeric,
  unit_cost   numeric,
  total       numeric not null,
  worker_id   uuid references public.workers(id),
  receipt_url text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  constraint total_positive check (total >= 0)
);

-- ─── INDEXES ───────────────────────────────────────────────────────
create index idx_expenses_period   on public.expenses(period_id);
create index idx_expenses_date     on public.expenses(date desc);
create index idx_expenses_business on public.expenses(business_id);
create index idx_contexts_business on public.contexts(business_id);
create index idx_periods_context   on public.periods(context_id);
create index idx_members_user      on public.business_members(user_id);
