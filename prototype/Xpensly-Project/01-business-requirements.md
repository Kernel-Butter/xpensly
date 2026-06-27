# Business Requirements Document
## Xpensly — Field Expense Tracker

**Version:** 1.0  
**Primary Domain:** Agriculture (extensible to any field-based business)  
**Target Users:** Small business owners, farm managers, field supervisors — 1 to 10 users per business  
**Status:** Pre-development

---

## 1. Problem Statement

Small-scale agricultural businesses in Pakistan (and similar markets) currently track expenses in Excel spreadsheets or paper ledgers. This creates five critical problems:

1. **No mobile entry** — the person managing the field cannot log expenses on-site; they write on paper and enter later, leading to errors and lost data.
2. **No real-time totals** — budget status is unknown until the sheet is manually tallied, often at end of season.
3. **No multi-season comparison** — each season is a new file; comparing year-over-year cost per acre is a manual exercise.
4. **Formula fragility** — one bad cell or accidental delete breaks the entire sheet.
5. **Single-user only** — owner and farm manager cannot both update simultaneously.

Xpensly solves all five while remaining simple enough for a non-technical user to operate fully from a mobile phone.

---

## 2. Vision

Build a mobile-first expense tracking platform where the **agriculture use case is the primary, fully-featured implementation**, and the underlying data model and UI system are generic enough that any field-based business (transport, construction, retail, restaurant) can be onboarded by adding a business configuration — with zero new code.

The app must feel like a native tool built specifically for the user's industry, not a generic expense tracker with a dropdown for "category."

---

## 3. Business Types Supported

### 3.1 Primary: Agriculture (full feature set)
Track crop season expenses across multiple fields: tractor work, irrigation, fertilizer, pesticide, and daily labour. Key metric: **cost per acre per season**.

### 3.2 Secondary (config-driven, no new code required):
| Business Type | Context Unit | Period Unit | Key Quantity | Key Metric |
|---|---|---|---|---|
| Transport / logistics | Vehicle | Weekly run | Trips / km | Cost per trip |
| Construction | Site | Project | Sq ft / days | Cost per sq ft |
| Retail shop | Branch | Month | Units | Gross margin |
| Restaurant / dhaba | Branch | Month | Portions / kg | Food cost % |
| Custom | User-defined | User-defined | User-defined | User-defined |

All business types share the same screens, components, and database. Only their **BusinessConfig** record differs.

---

## 4. Users and Roles

### 4.1 User Types
| Role | Description | Permissions |
|---|---|---|
| **Owner** | Business owner; sets up the business | Full access: create, read, update, delete everything |
| **Manager** | Field/branch manager | Add and edit expenses, view all data, cannot delete, cannot access settings |
| **Worker** | Daily labourer, driver, etc. | View only their own wage records; cannot add expenses |
| **Accountant** | External or internal bookkeeper | Read-only access to all data; can export reports |

### 4.2 Multi-business Support
A single user account can own or be a member of multiple businesses. Switching businesses is a top-level action in the app, not a settings-page action.

---

## 5. Core Features

### 5.1 Business Setup (Onboarding)
- Create a business with name, type, currency, and timezone.
- System applies the appropriate default config (categories, labels) based on business type.
- Owner can customise all config values: rename categories, add sub-items, change unit labels.
- Onboarding completes in under 3 minutes with defaults.

### 5.2 Context Management (Fields / Sites / Vehicles)
- Create one or more contexts (e.g. "Dera Site", "Farm 2", "Truck #1").
- Each context has a name, total unit size (e.g. 6 acres), and optional notes.
- Expenses are always scoped to a context.

### 5.3 Period Management (Seasons / Months / Projects)
- Create a period within a context (e.g. "Crop 2026", "May 2026").
- Set an optional budget per period (total or per category).
- System tracks budget consumed vs remaining in real time.
- Periods can be archived; archived periods are read-only but fully reportable.

### 5.4 Expense Entry — Primary Action
This is the most-used feature. It must be reachable in one tap and completable in under 30 seconds.

**Required fields:**
- Date (defaults to today)
- Category (from business config)
- Sub-item (optional, from category config — e.g. "Disc" under "Tractor")
- Description (free text, optional)
- Quantity / area (e.g. 6 acres)
- Unit cost (e.g. 5100 per acre)
- **Total auto-calculates:** quantity × unit cost
- Worker (optional — for wage-type categories)

**Behaviour:**
- If the user enters only total (not quantity/rate), that is valid.
- If quantity and unit cost are both entered, total is locked and computed.
- Receipt photo can be optionally attached (stored in Supabase Storage).
- Saving an expense updates all dashboard totals instantly (optimistic UI).

### 5.5 Expense Log (List View)
- Chronological list of all expenses in the current period, newest first.
- Filter by category, date range, or worker.
- Search by description keyword.
- Swipe left on a row to delete (with confirmation); tap to edit.
- Infinite scroll; no pagination UI.

### 5.6 Worker Management
- Maintain a list of workers per business (not per context).
- Each worker has: name, daily/hourly rate, type (daily / fixed / contract).
- When logging a wage expense, selecting a worker auto-fills the rate.
- Worker expenses are aggregated to show total paid per worker per period.

### 5.7 Dashboard
- Total spent in current period.
- Budget remaining (if budget set); colour-coded: green → yellow → red as usage climbs.
- Spending breakdown by category (bar chart, tappable).
- Cost per unit (e.g. cost per acre) — auto-calculated.
- 5 most recent expenses with quick-edit access.
- Period switcher and context switcher accessible from the dashboard header.

### 5.8 Reports
- **Period summary:** total by category, total by sub-item, total by worker.
- **Trend chart:** spending over time within a period (daily/weekly).
- **Season comparison:** side-by-side totals for up to 3 periods.
- **Cost per unit:** drill into which category drives cost per acre most.
- All charts are exportable as images.

### 5.9 Export
- **Excel export:** generates a file matching the user's existing spreadsheet structure — same columns, same layout, ready to share with accountants.
- **PDF report:** summary report with business name, period, category totals, and cost per unit. Printable.
- Export triggered from the Reports screen; no server required — runs client-side.

### 5.10 Budget Alerts
- Set a total budget and/or per-category budgets for any period.
- Push notification (PWA) when budget reaches 75% and 90%.
- In-app banner shows budget status at all times on the dashboard.

### 5.11 Offline Support
- All expense entry works without internet.
- Expenses queue locally (IndexedDB) and sync to Supabase when connection returns.
- Sync status indicator in the app header (synced / pending / error).

---

## 6. Agriculture-Specific Features

These features exist in the agriculture config and are not generic to all business types.

### 6.1 Tractor Work Tracking
- Sub-items for tractor category: Disc, Z/L (Zero-Level), Hall, K/D (Kad/Dabba), and any user-defined types.
- Each sub-item can have its own unit (acres vs hours).
- Tractor bills tracked separately from wages.

### 6.2 Irrigation (Water) Tracking
- Two sub-categories: Water (W) — pump/canal charges, and Water Labour (WL) — person operating.
- Hours tracked separately from cost.
- WL recorded as hours × daily rate.

### 6.3 Fertilizer Tracking
- Sub-items: DAP, Urea, and any user-defined.
- Quantity in bags; cost per bag; total auto-calculated.
- Labour for fertilizer application (F-lbr) tracked as a separate line item.

### 6.4 Pesticide Tracking
- Sub-items stored as item name + quantity (litres/ml) + cost.
- User can add any pesticide product by name.

### 6.5 Seasonal Cost Report
- At end of season: total cost, total acres, cost per acre.
- Breakdown: what percentage of cost was tractor vs water vs fertilizer vs pesticide vs labour.
- Exportable as a one-page farm season report (PDF).

---

## 7. Non-Functional Requirements

### 7.1 Performance
- App shell loads in under 2 seconds on a 4G connection.
- Expense save (with optimistic update) feels instant — under 100ms to UI update.
- Reports and charts render in under 1 second for up to 1,000 expenses per period.

### 7.2 Reliability
- Zero data loss: all local-first writes, synced to server.
- If sync fails, user sees clear error and can retry.
- No data should ever be silently lost.

### 7.3 Usability
- A first-time user with no training should be able to log their first expense within 2 minutes of opening the app.
- All primary actions reachable within 2 taps from the dashboard.
- No feature should require reading a manual.

### 7.4 Scalability
- Current: 6 concurrent users, ~500 expenses/month.
- Architecture must support: 1,000 users, 50,000 expenses/month with zero code changes (only infrastructure scaling).

### 7.5 Security
- Row-level security: users can only access data for businesses they are members of.
- Owners cannot access other owners' data.
- All data encrypted in transit (TLS) and at rest (Supabase default).

---

## 8. Out of Scope (v1)

- Inventory management (what was purchased, what remains)
- Income / sales tracking (expenses only in v1)
- Payroll (wages tracked but not full payroll with deductions)
- Multi-currency within one business
- AI-powered insights or predictions
- Third-party accounting integrations (QuickBooks, etc.)

These are planned for v2 after validating the core expense tracking loop.

---

## 9. Success Metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Time to log one expense | < 30 seconds |
| Daily active usage by primary user | ≥ 5 days/week |
| Data accuracy vs previous Excel | Zero discrepancies on export |
| Onboarding completion rate | > 90% complete setup in one session |
| User-reported errors / data loss | Zero |

---

## 10. Glossary

| Term | Definition |
|---|---|
| **Business** | Top-level entity owned by a user. Has a type and config. |
| **Config** | JSON object defining categories, labels, and units for a business type. |
| **Context** | A field, vehicle, branch, or site within a business. |
| **Period** | A time window within a context: crop season, month, project. |
| **Expense** | A single spend record: date, category, quantity, rate, total. |
| **Sub-item** | A specific type within a category (e.g. "Disc" within "Tractor"). |
| **Worker** | A person whose wages are tracked by the system. |
| **Cost per unit** | Total period cost divided by context size (e.g. total ÷ acres). |
