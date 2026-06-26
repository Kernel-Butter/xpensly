function formatRelative(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}

export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'relative' = 'short',
): string {
  const d = new Date(date)
  if (format === 'relative') return formatRelative(d)
  if (format === 'long')
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}

export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = item.date
    return { ...acc, [key]: [...(acc[key] ?? []), item] }
  }, {})
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}
