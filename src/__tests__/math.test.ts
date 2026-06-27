import { describe, it, expect } from 'vitest'
import { calculateTotal, costPerUnit, sumByKey } from '@/lib/utils/math'

describe('calculateTotal', () => {
  it('multiplies quantity × unit cost', () => {
    expect(calculateTotal(6, 5100)).toBe(30600)
  })

  it('returns null when quantity is null', () => {
    expect(calculateTotal(null, 5100)).toBeNull()
  })

  it('returns null when unit cost is null', () => {
    expect(calculateTotal(6, null)).toBeNull()
  })

  it('returns null when both are null', () => {
    expect(calculateTotal(null, null)).toBeNull()
  })

  it('returns null when quantity is undefined', () => {
    expect(calculateTotal(undefined, 5100)).toBeNull()
  })

  it('handles fractional quantities', () => {
    expect(calculateTotal(2.5, 1000)).toBe(2500)
  })

  it('handles zero quantity', () => {
    expect(calculateTotal(0, 5000)).toBe(0)
  })
})

describe('costPerUnit', () => {
  it('divides total cost by unit size', () => {
    expect(costPerUnit(30000, 6)).toBe(5000)
  })

  it('returns 0 when unit size is 0 (avoids division by zero)', () => {
    expect(costPerUnit(30000, 0)).toBe(0)
  })

  it('handles fractional unit size', () => {
    expect(costPerUnit(10000, 2.5)).toBe(4000)
  })
})

describe('sumByKey', () => {
  it('sums numeric values for a given key', () => {
    const items = [{ total: 100 }, { total: 200 }, { total: 300 }]
    expect(sumByKey(items, 'total')).toBe(600)
  })

  it('returns 0 for empty array', () => {
    expect(sumByKey([], 'total')).toBe(0)
  })

  it('treats null/undefined values as 0', () => {
    const items = [{ total: 100 }, { total: null as unknown as number }]
    expect(sumByKey(items, 'total')).toBe(100)
  })
})
