# Technical Stack & Infrastructure Requirements
## Xpensly — Field Expense Tracker

**Version:** 1.0  
**Scale target:** 6 users now → 1,000 users without code changes  
**Cost target:** $0/month at current scale (free tier only)  
**Philosophy:** Choose boring, proven technology with generous free tiers and clear upgrade paths.

---

## 1. Stack Overview

```
Frontend:   Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:    Supabase (Postgres + Auth + Storage + Realtime + Edge Functions)
State:      Zustand + TanStack Query (React Query)
Charts:     Recharts
Export:     SheetJS (xlsx) + jsPDF
Offline:    PWA (next-pwa) + IndexedDB (Dexie.js)
Deployment: Vercel (frontend) + Supabase (backend)
CI/CD:      GitHub Actions
Monitoring: Vercel Analytics (free) + Supabase Dashboard
```

**Total monthly cost at 6 users: $0**  
**Total monthly cost at 500 users: $0 (still within free tiers)**  
**Total monthly cost at 1,000+ users: ~$25/month (Supabase Pro)**

---

## 2. Frontend

### 2.1 Next.js 14 — App Router

**Why:** You already know it. App Router gives server components, layouts, loading states, and error boundaries out of the box. The app can be deployed as a static PWA on Vercel for free.

**Key Next.js features used:**
- `app/` directory with route groups for auth vs app layouts
- Server components for initial data fetch (reduces client JS)
- Client components only where interactivity is needed
- `loading.tsx` at route level for skeleton states
- `error.tsx` at route level for graceful error boundaries
- `middleware.ts` for auth protection across all app routes
- Next.js Image for receipt photos
- Route handlers (`app/api/`) only when Edge Functions aren't enough

**Next.js version:** 14.x with `--turbo` flag in development for faster HMR.

### 2.2 TypeScript

**Strictness level:** `strict: true` in `tsconfig.json`. No `any`. No implicit `any`. No `@ts-ignore` without a comment explaining why.

**Key TS patterns used in this project:**
- Discriminated unions for business config types
- Branded types for IDs (prevents passing a `UserId` where `BusinessId` is expected)
- `satisfies` operator for config objects (you already know this from White Boutique)
- `zod` for runtime validation of all API responses and form inputs
- Generated types from Supabase schema (`supabase gen types typescript`)

### 2.3 Tailwind CSS

**Version:** 3.x  
**Configuration:** Custom design tokens in `tailwind.config.ts` matching the design system.

```ts
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          600: '#16a34a',
          700: '#15803d',
        },
        // ... full scale
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Custom scale matching design system
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),      // Styled form elements
    require('tailwind-scrollbar-hide'), // Hide scrollbars on category pills
  ],
}
```

### 2.4 UI Components — shadcn/ui

**Why shadcn:** Copy-paste components, not a package dependency. Full control over markup and styles. Radix UI primitives underneath (accessible). Works perfectly with Tailwind.

**Components used from shadcn:**
- `Sheet` — bottom sheet / side panel for Add Expense
- `Dialog` — confirmation dialogs (delete, logout)
- `DropdownMenu` — context menus, business switcher
- `Select` — category and worker dropdowns
- `Sonner` — toast notifications
- `ScrollArea` — horizontal scrolling category pills
- `Skeleton` — loading placeholders

**Components built custom (not shadcn):**
- Bottom navigation bar
- FAB
- Expense list row with swipe-to-delete
- Category pill selector
- Budget progress bar
- Stat card
- Sync status indicator

---

## 3. Backend — Supabase

**Why Supabase:**
- Free tier: 500MB database, 1GB storage, 50,000 MAU, unlimited API calls
- Postgres (not a NoSQL hack — proper relational database)
- Built-in Auth (email, phone OTP, Google OAuth)
- Row Level Security (RLS) enforced at database level — data isolation is server-enforced, not just frontend-enforced
- Auto-generated TypeScript types from schema
- Realtime subscriptions for live sync across devices
- Edge Functions for server-side logic (Deno runtime)
- You already understand it; zero new infrastructure to learn

### 3.1 Database Schema

**Full Postgres schema:**

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS (managed by Supabase Auth) ─────────────────────────────
-- auth.users table is auto-managed; we create a public profile mirror

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
  config      jsonb not null default '{}',  -- BusinessConfig object
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

-- ─── CONTEXTS (fields, vehicles, branches) ─────────────────────────
create table public.contexts (
  id          uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  name        text not null,
  unit_size   numeric,           -- e.g. 6 (acres)
  unit_label  text,              -- e.g. "acres"
  notes       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ─── PERIODS (seasons, months, projects) ───────────────────────────
create table public.periods (
  id              uuid default uuid_generate_v4() primary key,
  context_id      uuid references public.contexts(id) on delete cascade,
  business_id     uuid references public.businesses(id) on delete cascade,
  name            text not null,
  start_date      date,
  end_date        date,
  budget_total    numeric,
  budget_by_cat   jsonb default '{}',  -- { "category_id": amount }
  is_active       boolean default true,
  is_archived     boolean default false,
  created_at      timestamptz default now()
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
  id            uuid default uuid_generate_v4() primary key,
  period_id     uuid references public.periods(id) on delete cascade,
  business_id   uuid references public.businesses(id) on delete cascade,
  date          date not null default current_date,
  category_id   text not null,        -- matches config category id
  sub_item      text,                 -- matches config sub-item
  description   text,
  quantity      numeric,              -- e.g. 6 (acres)
  unit_cost     numeric,              -- e.g. 5100 (per acre)
  total         numeric not null,     -- quantity * unit_cost OR manual entry
  worker_id     uuid references public.workers(id),
  receipt_url   text,                 -- Supabase Storage path
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  
  constraint total_positive check (total >= 0)
);

-- ─── INDEXES ───────────────────────────────────────────────────────
create index idx_expenses_period    on public.expenses(period_id);
create index idx_expenses_date      on public.expenses(date desc);
create index idx_expenses_business  on public.expenses(business_id);
create index idx_contexts_business  on public.contexts(business_id);
create index idx_periods_context    on public.periods(context_id);
```

### 3.2 Row Level Security (RLS)

**All tables have RLS enabled.** Users can only access data for businesses they are members of.

```sql
-- Enable RLS on all tables
alter table public.businesses      enable row level security;
alter table public.contexts        enable row level security;
alter table public.periods         enable row level security;
alter table public.expenses        enable row level security;
alter table public.workers         enable row level security;

-- Helper function: is the current user a member of a business?
create or replace function is_member(bid uuid)
returns boolean as $$
  select exists (
    select 1 from public.business_members
    where business_id = bid and user_id = auth.uid()
  );
$$ language sql security definer;

-- Helper function: get current user's role in a business
create or replace function member_role(bid uuid)
returns text as $$
  select role from public.business_members
  where business_id = bid and user_id = auth.uid()
  limit 1;
$$ language sql security definer;

-- Expenses: members can read; managers/owners can insert/update; owners can delete
create policy "members can read expenses"
  on public.expenses for select
  using (is_member(business_id));

create policy "managers can add expenses"
  on public.expenses for insert
  with check (
    is_member(business_id) and
    member_role(business_id) in ('owner', 'manager')
  );

create policy "owners can delete expenses"
  on public.expenses for delete
  using (member_role(business_id) = 'owner');
```

### 3.3 Authentication

**Provider:** Supabase Auth (built-in)  
**Methods used:**
- Phone OTP (primary — Pakistan mobile numbers, WhatsApp OTP via Twilio if needed)
- Email/password (fallback)
- Google OAuth (optional, for urban users)

**Session management:** Supabase handles JWT refresh automatically. Use `@supabase/ssr` package for Next.js App Router — this gives you server-side session access without client flicker.

### 3.4 File Storage (Receipts)

**Provider:** Supabase Storage (free: 1GB)  
**Bucket:** `receipts` (private, RLS-protected)  
**Upload flow:** Client uploads directly to Supabase Storage (not through Next.js server). Get signed URL on the client, upload, store the path in the `expenses.receipt_url` column.  
**Max file size:** 5MB per receipt  
**Accepted formats:** `image/jpeg`, `image/png`, `image/heic` (iPhone default)

### 3.5 Realtime

Used for:
- Live sync when multiple users (owner + manager) add expenses simultaneously
- Sync status indicator (subscribe to any pending change)

**Implementation:** Subscribe to `expenses` table changes filtered by `business_id`. When a change arrives, invalidate the React Query cache for that query.

---

## 4. State Management

### 4.1 Server State — TanStack Query (React Query)

All server data (expenses, periods, businesses) is managed by React Query. **Never put server data in Zustand.**

```
useExpenses(periodId)      → GET /expenses filtered by period
useBusinessConfig()        → GET /businesses/:id with config
usePeriodSummary(periodId) → GET computed totals (Supabase View or RPC)
useWorkers(businessId)     → GET /workers
```

**Cache strategy:**
- `staleTime: 1000 * 60 * 2` (2 minutes) — data is fresh for 2 min, then revalidates in background
- Optimistic updates on expense add/edit/delete — UI updates instantly, reverts if server fails
- `invalidateQueries` on mutation success to keep related queries fresh

### 4.2 Client State — Zustand

Only **UI state and session context** lives in Zustand.

```ts
// Global app state — what Zustand manages
interface AppStore {
  // Active selections (persisted to localStorage)
  activeBusiness: Business | null
  activeContext: Context | null
  activePeriod: Period | null
  
  // UI state (not persisted)
  isAddExpenseOpen: boolean
  editingExpense: Expense | null
  
  // Actions
  setActiveBusiness: (b: Business) => void
  setActivePeriod: (p: Period) => void
  openAddExpense: () => void
  closeAddExpense: () => void
  setEditingExpense: (e: Expense | null) => void
}
```

### 4.3 Form State — React Hook Form + Zod

All forms use React Hook Form with Zod resolver. No controlled inputs — uncontrolled with `register()`.

```ts
const expenseSchema = z.object({
  date:        z.date(),
  category_id: z.string().min(1, 'Select a category'),
  sub_item:    z.string().optional(),
  description: z.string().optional(),
  quantity:    z.number().positive().optional(),
  unit_cost:   z.number().positive().optional(),
  total:       z.number().positive('Enter an amount'),
  worker_id:   z.string().uuid().optional(),
})
```

---

## 5. Offline Support

### 5.1 PWA Setup

**Package:** `next-pwa` (Serwist fork — maintained)  
**Manifest:** `/public/manifest.json` with full icon set (72, 96, 128, 144, 152, 192, 384, 512px)  
**Installable:** Yes — add to home screen prompt on Android; manual on iOS

**Service worker caching strategy:**
```
App shell (HTML, JS, CSS):  CacheFirst — serve instantly from cache
API calls:                  NetworkFirst — try network, fall back to cache
Images (receipts):          CacheFirst with expiry
Static assets:              CacheFirst (versioned by build hash)
```

### 5.2 Offline Expense Queue

**Library:** Dexie.js (IndexedDB wrapper, typed, much nicer API than raw IndexedDB)

```ts
// Offline queue schema
class XpenslyDB extends Dexie {
  pendingExpenses!: Table<PendingExpense>
  
  constructor() {
    super('xpensly')
    this.version(1).stores({
      pendingExpenses: '++id, created_at, synced'
    })
  }
}

// When online → save to Supabase
// When offline → save to IndexedDB, show "Pending sync" badge
// On reconnect → flush queue to Supabase, clear from IndexedDB
```

**Sync logic:** Background sync via Service Worker `sync` event (Android Chrome). Fallback: check on app focus/online event.

---

## 6. Export

### 6.1 Excel Export — SheetJS (xlsx)

```
Package:     xlsx (SheetJS Community Edition — free)
Runs:        Entirely client-side, no server needed
Output:      .xlsx file downloaded to device
```

**Agriculture export format:** Matches the user's existing spreadsheet structure (DATE | DETAILS | T=BILLS | W | WL | FERTILIZER | PESTICIDES columns). This is critical — the user must recognise the export as their own format.

### 6.2 PDF Export — jsPDF + html2canvas

```
Packages:    jspdf + html2canvas
Runs:        Client-side
Output:      Single-page season summary PDF
```

**PDF content:** Business name, period name, date range, category totals, cost per acre, top 5 expenses. Clean, printable layout.

---

## 7. Performance

### 7.1 Bundle Size Targets

```
Initial JS bundle:    < 150KB gzipped
First Contentful Paint: < 1.5s on 4G
Time to Interactive:  < 3.0s on 4G
Lighthouse score:     > 90 (Performance, Accessibility, Best Practices)
```

**Strategies:**
- `next/dynamic` for charts (Recharts is large — lazy load reports page)
- `next/dynamic` for SheetJS and jsPDF (only needed for export)
- Server components for all read-only data display (no client JS shipped)
- `next/image` for all receipt thumbnails (auto-optimised, WebP conversion)

### 7.2 Database Query Performance

```
All list queries:     < 100ms (enforced by indexes)
Period summary:       Supabase RPC (pre-aggregated in Postgres, not in JS)
Max rows per query:   50 (paginated with cursor)
```

---

## 8. Free Tier Limits and Upgrade Path

### 8.1 Supabase Free Tier

| Resource | Free Limit | At 6 Users | At 500 Users |
|---|---|---|---|
| Database size | 500 MB | ~2 MB | ~100 MB |
| API requests | Unlimited | ~5K/day | ~400K/day |
| Storage | 1 GB | ~50 MB | ~5 GB |
| Auth MAU | 50,000 | 6 | 500 |
| Edge Functions | 500K invocations/month | ~1K | ~80K |
| Realtime connections | 200 concurrent | 6 | 200 |
| **Cost** | **$0** | **$0** | **$0** |

**When to upgrade to Supabase Pro ($25/month):** When storage exceeds 1GB (receipt photos) or MAU exceeds 50,000. Storage is the likely bottleneck first.

### 8.2 Vercel Free Tier

| Resource | Free Limit | At 6 Users | At 1,000 Users |
|---|---|---|---|
| Bandwidth | 100 GB/month | < 1 GB | < 20 GB |
| Serverless Functions | 100GB-hours | Minimal | < 10GB-hours |
| Build minutes | 6,000/month | < 100 | < 100 |
| **Cost** | **$0** | **$0** | **$0** |

### 8.3 Other Services (All Free)

| Service | Purpose | Free Tier |
|---|---|---|
| GitHub | Source control | Unlimited private repos |
| GitHub Actions | CI/CD | 2,000 min/month |
| Vercel Analytics | Frontend monitoring | 2,500 events/month |
| Google Fonts | Inter font | Unlimited |
| Sentry (optional) | Error tracking | 5,000 errors/month |

---

## 9. Security Requirements

### 9.1 Authentication Security
- JWT expiry: 1 hour (Supabase default), refresh token: 30 days
- Phone OTP: 6-digit, 10-minute expiry, max 3 attempts
- HTTPS enforced everywhere (Vercel handles this)

### 9.2 Data Security
- RLS on all tables — server-enforced, not just frontend
- No sensitive data in URL params (use body/cookies)
- Environment variables: only `NEXT_PUBLIC_` prefix for client-safe values
- Supabase service role key: never in frontend code, never in git

### 9.3 Input Security
- All user inputs validated with Zod before hitting Supabase
- Supabase parameterises all queries (no SQL injection risk)
- Receipt uploads: file type and size validated before upload

### 9.4 Environment Variables

```bash
# .env.local (never committed)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...      # safe to expose (RLS protects data)
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # NEVER in frontend, server only

# Optional
NEXT_PUBLIC_SENTRY_DSN=https://xxx        # error tracking
```

---

## 10. Testing Strategy

### 10.1 What to Test

```
Unit tests:      Business logic utilities (formatCurrency, calculateTotal, buildConfig)
                 Zod schemas (valid and invalid inputs)
                 Zustand store actions

Integration:     React Query hooks with mocked Supabase
                 Form submission → optimistic update → server sync

E2E (optional):  Add expense full flow (Playwright)
                 Auth flow: sign up → create business → add expense
```

### 10.2 Tools

```
Unit + Integration:  Vitest + React Testing Library
E2E (Phase 2):       Playwright
Mocking:             MSW (Mock Service Worker) for Supabase API calls
```

**Coverage target:** 80% of utility functions and hooks. UI components: key interaction paths only (add expense, delete expense).

---

## 11. CI/CD Pipeline

**GitHub Actions workflow on push to `main`:**

```yaml
1. Install dependencies (pnpm install --frozen-lockfile)
2. Type check (tsc --noEmit)
3. Lint (eslint + prettier --check)
4. Run unit tests (vitest run)
5. Build (next build)
6. Deploy to Vercel (automatic via Vercel GitHub integration)
```

**On pull request:** Run steps 1–5 only. No deployment.  
**Vercel preview deployments:** Every PR gets a unique preview URL automatically.

---

## 12. Development Environment

**Prerequisites:**
- Node.js 20 LTS
- pnpm 8.x (`npm i -g pnpm`)
- Supabase CLI (`brew install supabase/tap/supabase` or scoop on Windows)

**Setup:**
```bash
git clone <repo>
cd xpensly
pnpm install
cp .env.example .env.local   # fill in Supabase keys
pnpm supabase start          # local Supabase (Docker)
pnpm supabase db push        # apply migrations
pnpm dev                     # Next.js dev server
```

**Local Supabase:** Full Supabase stack runs locally via Docker. No shared dev database — each dev has their own isolated instance. Migrations are version-controlled in `supabase/migrations/`.
