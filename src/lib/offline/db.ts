import Dexie, { type Table } from 'dexie'

export type PendingExpense = {
  id?: number // auto-increment primary key
  period_id: string
  business_id: string
  date: string
  category_id: string
  sub_item: string | null
  description: string | null
  quantity: number | null
  unit_cost: number | null
  total: number
  worker_id: string | null
  receipt_url: string | null
  created_at: string
}

class XpenslyDB extends Dexie {
  pendingExpenses!: Table<PendingExpense>

  constructor() {
    super('xpensly')
    this.version(1).stores({
      pendingExpenses: '++id, created_at',
    })
  }
}

export const offlineDB = new XpenslyDB()
