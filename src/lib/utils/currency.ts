export function formatCurrency(amount: number, currency = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function abbreviateCurrency(amount: number, currency = 'PKR'): string {
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(2)}L`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return formatCurrency(amount, currency)
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0
}
