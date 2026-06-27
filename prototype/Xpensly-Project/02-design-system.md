# Design System & UI/UX Specification
## Xpensly — Field Expense Tracker

**Version:** 1.0  
**Approach:** Mobile-first, progressive enhancement  
**Philosophy:** Functional clarity over visual decoration. Every pixel earns its place.

---

## 1. Design Principles

1. **One-thumb usability** — The primary user is holding a phone in one hand while standing in a field. Every core action must be reachable with the right thumb without shifting grip.
2. **Speed over completeness** — Show only what the current screen needs. No mega-menus, no information overload.
3. **Error prevention over error messages** — Guide users to valid input before they submit. Numeric keyboards auto-open. Dropdowns replace free text wherever possible.
4. **Calm confidence** — The UI should feel stable and trustworthy. No animations that serve decoration. Motion is information (e.g. a save confirming, a sync completing).
5. **Urdu-friendly layout** — Even though the primary UI language is English, number formatting and any future RTL support must be planned from day one. Numbers always use `en-PK` locale for display.

---

## 2. Breakpoints

The app is designed **mobile-first**. All base styles are for mobile. Larger screens get enhancements, not redesigns.

```
xs:  0px    — 374px   (small phones: iPhone SE, older Android)
sm:  375px  — 767px   (standard phones: iPhone 14, Galaxy S-series) ← primary target
md:  768px  — 1023px  (tablets, large phones in landscape)
lg:  1024px — 1279px  (small laptops, iPad Pro)
xl:  1280px+          (desktops, wide monitors)
```

**Tailwind config:**
```js
screens: {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
}
```

**Layout behaviour per breakpoint:**

| Breakpoint | Navigation | Layout | Sidebar |
|---|---|---|---|
| xs / sm | Bottom tab bar (4 items) | Single column, full width | None |
| md | Bottom tab bar | Single column, max-w-2xl centered | None |
| lg | Left sidebar, collapsible | 2-column (nav + content) | 240px fixed |
| xl | Left sidebar, expanded | 3-column where applicable | 260px fixed |

---

## 3. Color System

### 3.1 Brand Colors

```
Primary Green:     #16a34a  (green-600)   — agriculture, growth, money saved
Primary Green Dark:#15803d  (green-700)   — hover states
Surface Green:     #f0fdf4  (green-50)    — success backgrounds, tints

Accent Amber:      #d97706  (amber-600)   — warnings, budget alerts at 75%
Danger Red:        #dc2626  (red-600)     — over-budget, delete, errors
```

**Rationale:** Green is chosen as primary because it maps naturally to agriculture (growth, fields) and financial positivity (money, profit). It's also universally readable and doesn't clash with the warning/danger system.

### 3.2 Neutral Palette (Gray Scale)

```
gray-950:  #0a0a0a   — not used directly
gray-900:  #111827   — primary text
gray-700:  #374151   — secondary text
gray-500:  #6b7280   — placeholder, muted text
gray-400:  #9ca3af   — disabled, hint text
gray-200:  #e5e7eb   — borders, dividers
gray-100:  #f3f4f6   — card backgrounds, zebra rows
gray-50:   #f9fafb   — page background
white:     #ffffff   — surface cards, modals
```

### 3.3 Semantic Colors

```
Success:    #16a34a / bg: #f0fdf4 / text: #15803d
Warning:    #d97706 / bg: #fffbeb / text: #b45309
Danger:     #dc2626 / bg: #fef2f2 / text: #b91c1c
Info:       #2563eb / bg: #eff6ff / text: #1d4ed8
```

### 3.4 Dark Mode

Dark mode is **optional for v1 but the token system must support it from day one.** Use CSS custom properties (tokens) so dark mode is a one-time theme switch, not a per-component change.

```css
:root {
  --color-bg:         #f9fafb;
  --color-surface:    #ffffff;
  --color-text:       #111827;
  --color-text-muted: #6b7280;
  --color-border:     #e5e7eb;
  --color-primary:    #16a34a;
}

[data-theme="dark"] {
  --color-bg:         #0f172a;
  --color-surface:    #1e293b;
  --color-text:       #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-border:     #334155;
  --color-primary:    #22c55e;
}
```

### 3.5 Category Colors (for charts and badges)

Each expense category gets a fixed color so users learn to recognise categories by color across all screens.

```
Tractor:    #f59e0b  (amber-400)
Water:      #3b82f6  (blue-500)
Fertilizer: #22c55e  (green-500)
Pesticides: #a855f7  (purple-500)
Wages:      #f97316  (orange-500)
Misc:       #6b7280  (gray-500)
```

---

## 4. Typography

### 4.1 Font Family

```
Primary:   Inter (Google Fonts) — numbers, UI labels, body
Fallback:  -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Mono:      'JetBrains Mono', monospace — amounts only (₨ 30,600)
```

**Why Inter:** Excellent legibility at small sizes on low-DPI Android screens. Numbers are tabular (all same width), which keeps currency columns aligned. Free, loads from Google Fonts.

**Why monospace for amounts:** Aligns decimal points and thousands separators in lists. Makes scanning a column of numbers significantly faster.

### 4.2 Font Size Scale (Tailwind base)

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-xs` | 11px | 400 | 1.4 | Timestamps, helper text, badge labels |
| `text-sm` | 13px | 400 | 1.5 | Secondary body, list meta, form labels |
| `text-base` | 15px | 400 | 1.6 | Primary body text, input values |
| `text-lg` | 17px | 500 | 1.4 | Section headers, card titles |
| `text-xl` | 20px | 600 | 1.3 | Screen titles, period names |
| `text-2xl` | 24px | 700 | 1.2 | Stat numbers on dashboard |
| `text-3xl` | 30px | 700 | 1.1 | Hero totals, main budget number |

### 4.3 Responsive Font Sizes

```
Screen title (h1):     text-xl  → md:text-2xl
Section header (h2):   text-lg  → md:text-xl
Body text:             text-sm  → md:text-base
Stat numbers:          text-2xl → md:text-3xl → lg:text-4xl
Amount in list row:    font-mono text-sm → md:text-base
```

### 4.4 Number Formatting

All currency values must be formatted using `Intl.NumberFormat`:

```ts
const formatPKR = (amount: number) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount)
// Output: ₨ 30,600
```

For large numbers on dashboard (abbreviated):

```ts
// 405,723 → ₨ 4.06L
// 30,600  → ₨ 30.6K
```

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

Base unit: `4px`. All spacing is multiples of 4.

```
space-1:   4px    — icon-to-text gaps
space-2:   8px    — tight component internals
space-3:   12px   — card padding (mobile)
space-4:   16px   — standard gap, section padding
space-5:   20px   — between cards
space-6:   24px   — section separation
space-8:   32px   — major section gaps
space-12:  48px   — between major page sections
```

### 5.2 Container Widths

```
Mobile:  100% width, 16px horizontal padding
md+:     max-w-2xl (672px) centered
lg+:     max-w-4xl (896px) centered
xl+:     max-w-6xl (1152px) centered — for dashboard with sidebar
```

### 5.3 Border Radius

```
rounded-sm:   4px   — badges, small pills
rounded:      6px   — buttons, inputs
rounded-lg:   10px  — cards, modals
rounded-xl:   14px  — bottom sheets, large surfaces
rounded-2xl:  20px  — FAB, avatar containers
rounded-full: 50%   — avatar photos, category icons
```

---

## 6. Component Specifications

### 6.1 Bottom Navigation Bar (Mobile)

```
Height:           56px + safe-area-inset-bottom
Background:       white, 1px top border gray-200
Items:            4 max — Home, Expenses, Reports, Settings
Active item:      text-green-600, icon filled
Inactive item:    text-gray-400, icon outline
Label:            text-xs, visible always
Active indicator: 2px green line above icon
```

**Icon mapping:**
- Home → `home` (dashboard)
- Expenses → `list` (expense log)
- Reports → `chart-bar` (analytics)
- Settings → `cog` (business config, profile)

### 6.2 Floating Action Button (FAB)

The single most important control in the app. Always visible on all screens except Settings.

```
Size:             56px × 56px
Position:         fixed, bottom: 80px (above nav bar), right: 16px
Background:       green-600
Icon:             white plus, 24px
Border radius:    rounded-2xl (not circle — more thumb-friendly)
Shadow:           0 4px 12px rgba(22, 163, 74, 0.4)
Tap area:         minimum 56px × 56px
Active state:     scale(0.96), shadow reduces
```

On md+ screens (no bottom nav), FAB moves to bottom-right of content area.

### 6.3 Expense List Row

```
Height:           min 64px (content drives height)
Left:             Category color dot (8px) + category icon (20px)
Center-top:       Description text, text-base font-medium text-gray-900
Center-bottom:    Sub-item + date, text-sm text-gray-500
Right-top:        Amount, font-mono text-base font-semibold text-red-600
Right-bottom:     Worker name (if wage), text-xs text-gray-400
Separator:        1px gray-100 between rows (no full border on row)
Swipe-left:       Delete action, red background, trash icon
Tap:              Opens edit sheet from bottom
```

### 6.4 Stat Card (Dashboard)

```
Background:       white, border 1px gray-200, rounded-lg
Padding:          12px 16px
Label:            text-xs text-gray-500 uppercase tracking-wide
Value:            text-2xl font-bold text-gray-900 font-mono
Sub-label:        text-xs text-gray-400 (e.g. "of ₨5L budget")
Grid:             2 columns mobile, 4 columns lg+
```

### 6.5 Budget Progress Bar

```
Track:            4px height, gray-200, rounded-full
Fill:             green-500 (0–74%), amber-500 (75–89%), red-500 (90%+)
Label above:      "Tractor — ₨ 2.4L of ₨ 3L" text-sm
Percentage right: "80%" text-sm font-medium, color matches fill
Transition:       300ms ease-out on width change
```

### 6.6 Add / Edit Expense Bottom Sheet

The most critical UI flow. Opens from FAB or row tap. Slides up from bottom.

```
Container:        white, rounded-t-2xl, safe area bottom padding
Drag handle:      32px × 4px, gray-300, centered at top, 8px from top
Header:           "Add expense" / "Edit expense", text-lg font-semibold
Close:            X button, top-right, 44px tap target

Field order (mobile, single column):
  1. Category — horizontal scroll pills (shows all categories, tappable)
  2. Sub-item — appears below category only if category has sub-items; pills
  3. Date — tappable, defaults to today, opens native date picker
  4. Quantity / Area — number input, inputmode="decimal", placeholder "e.g. 6"
  5. Unit cost — number input, inputmode="decimal", placeholder "e.g. 5100"
  6. Total — auto-computed, shown as read-only green text: "₨ 30,600"
              If user taps total field, quantity/rate clear and total becomes editable
  7. Description — text input, optional, placeholder "e.g. Disc 6 acer by Akram"
  8. Worker — searchable dropdown, optional, only shown for wage-type categories
  
Save button:      full-width, green-600, 48px height, text-base font-semibold
                  Disabled until category + at least one of (total or qty+rate) filled
```

### 6.7 Category Selector Pills

```
Container:        horizontal scroll row, no scroll indicator
Pill:             rounded-full, 36px height, px-4, flex items-center gap-2
Active:           bg-green-600 text-white border-transparent
Inactive:         bg-white text-gray-700 border border-gray-200
Icon:             20px, category color when inactive, white when active
Animation:        200ms ease transition on background and border
```

### 6.8 Charts (Reports Screen)

**Bar Chart — Category Breakdown:**
```
Library:          Recharts (BarChart component)
Bar width:        Adaptive, 40px min, 80px max
Bar color:        Category color (see Section 3.5)
Axis:             y-axis left, formatted abbreviated (4L, 57K)
Grid:             Horizontal lines only, gray-100
Tooltip:          White card, category name + formatted amount
Height:           220px mobile, 280px md+
```

**Line Chart — Spending Over Time:**
```
Library:          Recharts (AreaChart component)
Fill:             green-500 at 20% opacity
Line:             green-600, 2px stroke
Dot:              Visible on hover only
X-axis:           Date ticks, format "Jun 21"
Height:           180px mobile, 240px md+
```

**Donut Chart — Proportional Breakdown:**
```
Library:          Recharts (PieChart with innerRadius)
Inner radius:     60% of outer (donut shape)
Center label:     Total amount, large font
Legend:           Below chart, 2-column grid mobile
Height:           200px mobile (chart) + legend below
```

**All charts must be:**
- Responsive (width: 100%)
- Touch-friendly (larger touch targets for tooltips)
- Exportable as PNG via `html2canvas`
- Accessible (aria-label on the chart container, data table fallback)

---

## 7. Screen Specifications

### 7.1 Dashboard (Home)

**Mobile layout (top to bottom):**
```
1. App header bar (56px)
   - Left: Business name + context selector chevron
   - Right: Sync status icon + notification bell

2. Period banner (48px)
   - Current period name + date range
   - Tap to switch period

3. Hero stat (72px)
   - "Total spent this season" label
   - Large formatted amount (₨ 4.06L), font-mono

4. Budget progress (if budget set) (36px)
   - Thin bar + percentage used

5. Stat cards grid — 2 × 2 (auto-height)
   - Budget remaining
   - Cost per acre
   - This week's spending
   - Category count

6. Category breakdown chart (220px)
   - Horizontal bar chart
   - Tappable bars navigate to filtered expense log

7. Recent expenses (3–5 rows)
   - "Recent" header + "See all" link
   - Standard expense rows

8. Bottom padding for FAB clearance (80px)
```

**Tablet / desktop additions:**
- Sidebar with navigation replaces bottom tabs
- Hero stats in 4-column grid
- Chart and recent expenses side-by-side in 2 columns

### 7.2 Expense Log

**Mobile layout:**
```
1. Header: "Expenses" + filter icon button
2. Filter bar (if active): horizontal pill row showing active filters + clear
3. Search input (expandable, not always visible — tap search icon)
4. Grouped by date sections:
   - Date header: "Today — Jun 25" in sticky position while scrolling
   - Expense rows under each date
5. Load more / infinite scroll
6. Empty state: illustration + "No expenses yet. Tap + to add your first."
```

### 7.3 Add Expense (Bottom Sheet)

See Section 6.6 for full spec.

**Additional behaviour:**
- Sheet opens at 75% of screen height
- User can drag up to 95% height if keyboard pushes content
- Keyboard-aware: form scrolls to keep focused field visible above keyboard
- On save: sheet closes, success toast appears at top of screen for 2 seconds
- Error: field with error gets red border + error message below field

### 7.4 Reports

**Mobile layout:**
```
1. Period selector (horizontal scroll pills — select which period to view)
2. Compare toggle: "Single" / "Compare" — compare shows 2 period pickers
3. Summary cards: Total, Cost per acre, Top category
4. Tabs: Summary | Trend | Compare
   - Summary: category totals, worker totals
   - Trend: line chart over time within period
   - Compare: side-by-side bar chart for 2 periods
5. Export row: [Export Excel] [Export PDF] buttons
```

### 7.5 Settings

```
Sections:
  — Business
    · Business name, type, currency
    · Manage contexts (fields/sites)
    · Manage categories and sub-items (add, rename, reorder, delete)
    · Workers list
    
  — Account
    · Profile (name, phone)
    · Team members (invite by phone/email, assign role)
    · Notifications (budget alerts on/off, percentage thresholds)
    
  — Data
    · Import from Excel (Phase 2)
    · Export all data
    · Delete period data
    
  — App
    · Language (English / اردو — Phase 2)
    · Theme (Light / Dark / System)
```

---

## 8. Motion and Animation

Animations must be:
- Under 300ms for transitions
- `ease-out` curve (fast start, gentle end — feels responsive)
- Disabled if `prefers-reduced-motion` is set
- Never decorative — every animation communicates state change

| Interaction | Animation | Duration | Curve |
|---|---|---|---|
| Bottom sheet open | Slide up from bottom | 250ms | ease-out |
| Bottom sheet close | Slide down | 200ms | ease-in |
| FAB tap | Scale 0.96 → 1.0 | 150ms | ease-out |
| Row swipe to delete | Slide left, red bg reveal | 200ms | ease-out |
| Page navigation | Slide left (forward) / right (back) | 220ms | ease-in-out |
| Toast notification | Slide in from top | 200ms | ease-out |
| Chart bars | Count up from 0 on first render | 400ms | ease-out |
| Sync pulse icon | Rotate 360° while syncing | 1s loop | linear |
| Success checkmark | Draw stroke, scale | 300ms | ease-out |

---

## 9. Iconography

**Library:** Lucide React (MIT license, tree-shakable, consistent outline style)

**Usage rules:**
- All icons in the bottom nav: 22px
- Icons in list rows: 18px
- Icons in buttons: 16px
- Icons in headers: 20px
- Category icons: 20px with colored container (40px × 40px, rounded-lg)

**Key icon mapping:**
```
dashboard:    LayoutDashboard
expenses:     Receipt
reports:      BarChart3
settings:     Settings
add:          Plus
edit:         Pencil
delete:       Trash2
filter:       Filter
search:       Search
calendar:     Calendar
worker:       User
export:       Download
sync:         RefreshCw
warning:      AlertTriangle
success:      CheckCircle2
tractor:      Tractor
water:        Droplets
fertilizer:   Leaf
pesticide:    FlaskConical
wages:        Users
```

---

## 10. Accessibility

- All interactive elements minimum 44 × 44px touch target
- Color never the only indicator (always pair color with icon or text)
- All images and icons have `aria-label` or `aria-hidden`
- Form inputs always have visible `<label>` (not just placeholder)
- Focus rings visible in keyboard/accessibility mode
- Screen reader tested for the Add Expense flow (most critical path)
- Contrast ratio: minimum 4.5:1 for all text on backgrounds

---

## 11. Empty States

Every list and data screen needs a designed empty state — never show a blank white screen.

| Screen | Empty state message | CTA |
|---|---|---|
| Expense log | "No expenses yet this season" | "Add your first expense" → opens FAB |
| Workers | "No workers added" | "Add a worker" |
| Reports | "Not enough data yet" + "Add at least 3 expenses to see trends" | — |
| Contexts | "Add your first field or site" | "Add field" |

Empty states use a simple SVG illustration (single color, matches primary green) + 1-line heading + 1-line sub-text + CTA button.

---

## 12. Error States

```
Form validation:   Red border on field, red error text below (text-xs text-red-600)
Network error:     Toast at top "Couldn't save. Check connection." with Retry button
Sync error:        Persistent banner below header (dismissible) with retry
Empty required:    Inline red text below field on submit attempt
```

---

## 13. Loading States

```
Initial app load:     Splash screen with logo + green spinner (max 2s)
Screen transitions:   Skeleton loaders matching content shape (not spinners)
List loading more:    3-row skeleton at bottom of list
Chart loading:        Gray placeholder rect matching chart dimensions
Save in progress:     FAB spins, button shows "Saving…" and is disabled
```

**Skeleton loader style:** gray-200 background, animated shimmer left-to-right (CSS animation, no library needed).

---

## 14. Design Deliverables for Designers

When sharing this document with a designer, they need to produce:

1. **Mobile screens (375px):** Dashboard, Expense Log, Add Expense (sheet open), Reports, Settings
2. **Tablet screens (768px):** Dashboard only (shows 2-column layout difference)
3. **Desktop screens (1280px):** Dashboard + Expense Log (shows sidebar navigation)
4. **Component library:** Buttons, inputs, cards, badges, pills, bottom sheet, nav bar, FAB — all states (default, hover, active, disabled, error)
5. **Color palette file** (Figma styles or Tailwind config)
6. **Icon set** (Lucide, already listed above)

**Figma organisation:**
```
Pages:
  0. Cover + design system overview
  1. Mobile screens
  2. Tablet screens
  3. Desktop screens
  4. Component library
  5. Icons reference
```
