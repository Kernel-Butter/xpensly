export function fmtCurrency(amount: number, currency = 'PKR'): string {
  const symbol = currency === 'PKR' ? '₨' : currency
  if (amount >= 100000) {
    return `${symbol} ${(amount / 100000).toFixed(2)}L`
  }
  if (amount >= 1000) {
    return `${symbol} ${amount.toLocaleString('en-PK')}`
  }
  return `${symbol} ${amount}`
}

export function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}

export function fmtTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function groupByDate(items: { date: string }[]): Record<string, typeof items> {
  return items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.date
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

export function friendlyDate(dateStr: string): string {
  const today = new Date()
  const d = new Date(dateStr)
  const todayStr = today.toISOString().slice(0, 10)
  const yesterdayStr = new Date(today.setDate(today.getDate() - 1)).toISOString().slice(0, 10)
  if (dateStr === todayStr) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}
