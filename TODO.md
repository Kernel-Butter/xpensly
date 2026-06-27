# Xpensly — TODO

## ✅ Done
- [x] Smooth bottom sheet animations (antd Drawer across all sheets)
- [x] FAB hides on `/settings/*` and `/seasons` routes
- [x] Global FAB is route-aware (no longer opens AddExpense on wrong pages)
- [x] Create business fixed (RLS bootstrapping bug + upsert)
- [x] Create seasons fixed (passes `context_id` per BRD §5.3)
- [x] Create fields fixed (403 RLS error resolved via migration)
- [x] Expense validation — clear error messages on submit
- [x] Delete confirmation dialogs improved (antd Drawer)
- [x] Units system — `UnitPicker` synced across fields, categories, and expense entry
- [x] Google OAuth — "Continue with Google" on login + signup, `/auth/callback` route

---

## 🔧 In Progress
- [ ] **SMTP setup** — configure custom SMTP in Supabase (recommended: Resend)
- [ ] **Email templates** — branded HTML templates for:
  - Confirm account
  - Password reset
  - Magic link / invite

---

## 📋 Backlog

### Core Features
- [ ] **Budget tracking** — set budget per category per season, progress bars, over-budget warnings
- [ ] **Reports improvements** — spending trends over time, % labels on bar chart
- [ ] **PDF / Excel export** — download season expenses as spreadsheet or printable report

### Integrations
- [ ] **Google Drive import** — pick CSV/Sheets file from Drive, map columns → import as expenses

### UX / Polish
- [ ] **Push notifications** — remind user to log expenses, alert when near budget limit
- [ ] **Forgot password flow** — wire up the "Forgot Password?" button on login page
- [ ] **Offline sync indicator** — show when data is being synced after reconnect
