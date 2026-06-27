# Xpensly — Session Context

## What we are building
Agricultural expense tracker PWA for small farms in Pakistan.
Full spec: `prototype/Xpensly-Project/` — read `01-business-requirements.md`, `03-technical-stack.md`, `04-engineering-standards.md` for full context. Skip `02-design-system.md` (Stitch only).
Stitch design project: https://stitch.withgoogle.com/projects/10061025893161117248
App code: `xpensly/`  |  Remote: https://github.com/Kernel-Butter/xpensly.git

## Key decisions locked in
- Stack: Next.js 16 App Router + Supabase + Zustand + TanStack Query + shadcn/ui
- Package manager: pnpm (`/Users/hamzabhutta/Library/pnpm/bin/pnpm`)
- Deployment: Vercel + Supabase free tier
- Tailwind 4: CSS-based config in `globals.css` (no tailwind.config.ts)
- Icons: Lucide React only (NOT Material Symbols)
- Currency: PKR (₨), lakh notation — `fmtCurrency` in `src/lib/utils/format.ts`
- TypeScript strict: no `any`, no `@ts-ignore`
- Packages installed: recharts, dexie, jspdf, xlsx (not yet wired up)

---

## Master Build Plan
> Each step = one focused task. Check off `[x]` when done. Start every new session by reading this file and finding the first unchecked step.

---

### PHASE 1 — Supabase & Auth ✅ DONE

- [x] **1.1** Supabase project created. Keys in `xpensly/.env.local`.
- [x] **1.2** DB migrations applied to cloud Supabase. All tables, RLS policies, and profile trigger live.
- [x] **1.3** Auth server actions: `signInWithEmail`, `signUpWithEmail`, `signOut` in `src/lib/supabase/auth.ts`
- [x] **1.4** Auth middleware: protects `(app)` routes, redirects unauthenticated → `/login`, no-business → `/onboarding`
- [x] **1.5** Login page: email/password sign in + sign up. UI fully built.
- [x] **1.6** Onboarding page: 2-step business type selector + name/currency → `useCreateBusiness` → redirect `/`
- [x] **1.7** `AppBootstrap` component in `(app)/layout.tsx` — auto-loads user's business and active period into Zustand on startup

---

### PHASE 2 — Core Data Hooks ✅ DONE

- [x] **2.1** `useBusinesses` — fetches user's businesses
- [x] **2.2** `useCreateBusiness` — creates business + member record
- [x] **2.3** `useExpenses(periodId)` — real Supabase query
- [x] **2.4** `useAddExpense(periodId)` — with optimistic update
- [x] **2.5** `useDeleteExpense(periodId)` — with optimistic update
- [x] **2.6** `useUpdateExpense(periodId)` — mutation for editing
- [x] **2.7** `usePeriodSummary(periodId)` — totals, budget %, cost/unit
- [x] **2.8** `usePeriods(businessId)` — fetches periods/seasons
- [x] **2.9** `useCreatePeriod` — creates new season
- [x] **2.10** `useContexts(businessId)` — fetches fields/contexts
- [x] **2.11** `useCreateContext` — creates new field
- [x] **2.12** `useWorkers(businessId)` — fetches workers
- [x] **2.13** `useCreateWorker` — adds worker

---

### PHASE 3 — All Screens Built + Wired ✅ DONE

- [x] Dashboard `(app)/page.tsx` — real data, budget bar, 2×2 stat grid
- [x] Expenses list `(app)/expenses/page.tsx` — real data, date-grouped
- [x] Reports `(app)/reports/page.tsx` — real data, category breakdown bars
- [x] Seasons `(app)/seasons/page.tsx` — wired to real DB (`usePeriods` + `useCreatePeriod`)
- [x] Settings `(app)/settings/page.tsx`
- [x] Categories `(app)/settings/categories/page.tsx`
- [x] Fields `(app)/settings/fields/page.tsx` — wired to real DB (`useContexts` + `useCreateContext`)
- [x] Workers `(app)/settings/workers/page.tsx` — wired to real DB (`useWorkers` + `useCreateWorker`)
- [x] Profile `(app)/profile/page.tsx`
- [x] Login `(auth)/login/page.tsx`
- [x] Onboarding `(auth)/onboarding/page.tsx`

---

### PHASE 4 — Expense UX ✅ DONE

- [x] **4.1** Swipe-to-delete on expense rows — `SwipeableExpenseRow` with touch events, red delete button revealed on left swipe.
- [x] **4.2** Tap expense row → opens edit sheet pre-filled. `AddExpenseSheet` reads `editingExpense` from Zustand, calls `useUpdateExpense`.
- [x] **4.3** Receipt photo — camera/file input in `AddExpenseSheet`, uploads to Supabase Storage `receipts` bucket.
       **⚠️ STILL NEEDED**: Create `receipts` bucket in Supabase dashboard → Storage → New bucket → name `receipts` → toggle Public ON.
- [x] **4.4** Worker picker — wage-type categories show worker dropdown, selecting worker auto-fills daily rate.

---

### PHASE 5 — Dashboard Polish ✅ DONE

- [x] **5.1** Recharts bar chart on dashboard — top 5 categories, lazy-loaded with `next/dynamic`. Component: `CategoryBarChart`.
- [x] **5.2** Period/context banner below TopAppBar — tap period → `/seasons`, tap field → `/settings/fields`.
- [x] **5.3** Recent expenses section — last 5, tap row opens edit sheet via `openEditExpense`.

---

### PHASE 6 — Export

- [x] **6.1** Create `src/lib/export/toExcel.ts` using `xlsx` — Pakistan farm ledger format (DATE | DETAILS | T=BILLS | W | WL | FERTILIZER | PESTICIDE columns). Wire to "Export Excel" button on `/reports`.
- [x] **6.2** Create `src/lib/export/toPDF.ts` using `jspdf` — one-page season summary. Wire to "Export PDF" button on `/reports`.

---

### PHASE 7 — Offline Support

- [x] **7.1** Create `src/lib/offline/db.ts` using `dexie` — `XpenslyDB` with `pendingExpenses` table.
- [x] **7.2** Modify `useAddExpense`: if `navigator.onLine === false` → save to IndexedDB, return temp expense, show offline toast.
- [x] **7.3** Sync on reconnect: `OfflineSync` component wires `window.addEventListener('online', flushQueue)` — pushes pending to Supabase, invalidates queries.
- [x] **7.4** `SyncIndicator` fixed-positioned in app layout: shows synced / pending count / error / syncing states.

---

### PHASE 8 — PWA

- [x] **8.1** `public/manifest.json` — all sizes, theme `#006b2c`, standalone. Fixed `themeColor` in root layout.
- [x] **8.2** Icons at 72/96/128/192/512px (SVG, green bg + 🌿 emoji) in `public/icons/`.
- [x] **8.3** Serwist 9.5.11 installed. `src/app/sw.ts` — NetworkFirst for Supabase API, CacheFirst for images + fonts. `next build --webpack` required (Turbopack not yet supported by Serwist). `public/sw.js` 41KB generated.

---

### PHASE 9 — Quality & Deploy

- [x] **9.1** 40 Vitest unit tests across 3 files: `fmtCurrency`, `groupByDate`, `calculateTotal`, `costPerUnit`, `sumByKey`, all 3 Zod schemas. All pass.
- [x] **9.2** `.github/workflows/ci.yml` — type-check → test → build on push/PR to main + dev. Supabase env vars read from GitHub secrets.
- [ ] **9.3** Push to GitHub (fix auth: local git user `hamzaahmad-twb` → needs access to `Kernel-Butter/xpensly`). **USER ACTION REQUIRED.**
- [ ] **9.4** Deploy to Vercel — connect repo, add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **USER ACTION REQUIRED.**

---

## Current Status
**Last completed:** Phase 9.1–9.2 done. 40 Vitest tests passing, CI workflow created. TypeScript: 0 errors. Build: ✅

**Remaining:** 9.3 (push to GitHub) and 9.4 (Vercel deploy) require user action — see steps below.

---

## Rules for every session
1. Read this file first. Find the first unchecked `[ ]` step.
2. Complete that step fully before moving to the next.
3. Run `tsc --noEmit` after every code change. Zero errors before committing.
4. Commit after every completed phase (not every step).
5. **Update this file** when a step is done: check off `[x]`, update "Current Status". Do this before ending the session.
6. If a step needs user action (Supabase dashboard, env vars), stop and tell the user exactly what to do.
