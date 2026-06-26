import type { ExpenseId, PeriodId, BusinessId, WorkerId, UserId } from './business.types'

export type Expense = {
  id: ExpenseId
  period_id: PeriodId
  business_id: BusinessId
  date: string
  category_id: string
  sub_item: string | null
  description: string | null
  quantity: number | null
  unit_cost: number | null
  total: number
  worker_id: WorkerId | null
  receipt_url: string | null
  created_by: UserId | null
  created_at: string
  updated_at: string
  worker?: { id: WorkerId; name: string } | null
}

export type ExpenseInput = Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'worker'>

export type Worker = {
  id: WorkerId
  business_id: BusinessId
  name: string
  daily_rate: number | null
  rate_type: 'daily' | 'hourly' | 'fixed'
  notes: string | null
  is_active: boolean
  created_at: string
}

export type WorkerInput = Omit<Worker, 'id' | 'created_at'>

export type PeriodSummary = {
  total: number
  budgetTotal: number | null
  budgetUsedPercent: number | null
  costPerUnit: number | null
  byCategory: Record<string, number>
  expenseCount: number
}

export type SyncState =
  | { status: 'idle' }
  | { status: 'syncing'; queueSize: number }
  | { status: 'error'; message: string; retryCount: number }
  | { status: 'synced'; lastSyncedAt: Date }
