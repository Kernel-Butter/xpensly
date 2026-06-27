import { offlineDB } from './db'
import { supabase } from '@/lib/supabase/client'

export async function flushOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const pending = await offlineDB.pendingExpenses.toArray()
  if (pending.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const item of pending) {
    const { id, ...row } = item
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('expenses') as any).insert(row)
      if (error) throw error
      if (id !== undefined) await offlineDB.pendingExpenses.delete(id)
      synced++
    } catch {
      failed++
    }
  }

  return { synced, failed }
}

export async function getPendingCount(): Promise<number> {
  return offlineDB.pendingExpenses.count()
}
