import { describe, it, expect } from 'vitest'
import { fmtCurrency, groupByDate } from '@/lib/utils/format'

describe('fmtCurrency', () => {
  it('formats amounts under 1,000 with symbol', () => {
    expect(fmtCurrency(500)).toBe('₨ 500')
  })

  it('formats thousands with locale comma', () => {
    expect(fmtCurrency(5100)).toBe('₨ 5,100')
  })

  it('formats lakhs with L notation', () => {
    expect(fmtCurrency(100000)).toBe('₨ 1.00L')
    expect(fmtCurrency(250000)).toBe('₨ 2.50L')
  })

  it('formats 0 correctly', () => {
    expect(fmtCurrency(0)).toBe('₨ 0')
  })

  it('uses currency code as symbol for non-PKR', () => {
    expect(fmtCurrency(500, 'USD')).toBe('USD 500')
  })
})

describe('groupByDate', () => {
  it('groups items by date key', () => {
    const items = [
      { date: '2026-06-01', name: 'a' },
      { date: '2026-06-01', name: 'b' },
      { date: '2026-06-02', name: 'c' },
    ]
    const result = groupByDate(items)
    expect(Object.keys(result)).toHaveLength(2)
    expect(result['2026-06-01']).toHaveLength(2)
    expect(result['2026-06-02']).toHaveLength(1)
  })

  it('returns empty object for empty array', () => {
    expect(groupByDate([])).toEqual({})
  })

  it('preserves item order within a date group', () => {
    const items = [
      { date: '2026-06-01' },
      { date: '2026-06-01' },
    ]
    const result = groupByDate(items)
    expect(result['2026-06-01'][0]).toBe(items[0])
    expect(result['2026-06-01'][1]).toBe(items[1])
  })
})
