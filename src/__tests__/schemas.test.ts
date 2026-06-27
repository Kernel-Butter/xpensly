import { describe, it, expect } from 'vitest'
import { expenseSchema } from '@/schemas/expense.schema'
import { workerSchema } from '@/schemas/worker.schema'
import { businessSchema } from '@/schemas/business.schema'

// ── expenseSchema ─────────────────────────────────────────────────────────────

describe('expenseSchema', () => {
  const validExpense = {
    date: '2026-06-01',
    category_id: 'tractor',
    total: 5100,
  }

  it('accepts a minimal valid expense', () => {
    const result = expenseSchema.safeParse(validExpense)
    expect(result.success).toBe(true)
  })

  it('accepts a fully-filled expense', () => {
    const result = expenseSchema.safeParse({
      ...validExpense,
      sub_item: 'Disc',
      description: 'Field 2 tractor work',
      quantity: 6,
      unit_cost: 850,
      worker_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing date', () => {
    const result = expenseSchema.safeParse({ category_id: 'tractor', total: 100 })
    expect(result.success).toBe(false)
  })

  it('rejects missing category_id', () => {
    const result = expenseSchema.safeParse({ date: '2026-06-01', total: 100 })
    expect(result.success).toBe(false)
  })

  it('rejects zero total', () => {
    const result = expenseSchema.safeParse({ ...validExpense, total: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative total', () => {
    const result = expenseSchema.safeParse({ ...validExpense, total: -100 })
    expect(result.success).toBe(false)
  })

  it('rejects negative quantity', () => {
    const result = expenseSchema.safeParse({ ...validExpense, quantity: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid UUID for worker_id', () => {
    const result = expenseSchema.safeParse({ ...validExpense, worker_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

// ── workerSchema ──────────────────────────────────────────────────────────────

describe('workerSchema', () => {
  it('accepts a valid worker', () => {
    const result = workerSchema.safeParse({ name: 'Ali Khan', daily_rate: 800, rate_type: 'daily' })
    expect(result.success).toBe(true)
  })

  it('defaults rate_type to "daily"', () => {
    const result = workerSchema.safeParse({ name: 'Ali Khan' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.rate_type).toBe('daily')
  })

  it('rejects empty name', () => {
    const result = workerSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid rate_type', () => {
    const result = workerSchema.safeParse({ name: 'Ali', rate_type: 'monthly' })
    expect(result.success).toBe(false)
  })

  it('rejects negative daily_rate', () => {
    const result = workerSchema.safeParse({ name: 'Ali', daily_rate: -100 })
    expect(result.success).toBe(false)
  })
})

// ── businessSchema ────────────────────────────────────────────────────────────

describe('businessSchema', () => {
  it('accepts a valid agriculture business', () => {
    const result = businessSchema.safeParse({ name: 'Bhutta Farm', type: 'agriculture' })
    expect(result.success).toBe(true)
  })

  it('defaults currency to PKR', () => {
    const result = businessSchema.safeParse({ name: 'Test', type: 'agriculture' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.currency).toBe('PKR')
  })

  it('defaults timezone to Asia/Karachi', () => {
    const result = businessSchema.safeParse({ name: 'Test', type: 'agriculture' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.timezone).toBe('Asia/Karachi')
  })

  it('rejects empty name', () => {
    const result = businessSchema.safeParse({ name: '', type: 'agriculture' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid business type', () => {
    const result = businessSchema.safeParse({ name: 'Test', type: 'hospital' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid business types', () => {
    const types = ['agriculture', 'transport', 'construction', 'shop', 'restaurant', 'custom'] as const
    for (const type of types) {
      const result = businessSchema.safeParse({ name: 'Test', type })
      expect(result.success, `type "${type}" should be valid`).toBe(true)
    }
  })
})
