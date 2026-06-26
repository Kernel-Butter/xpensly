export function calculateTotal(
  quantity: number | null | undefined,
  unitCost: number | null | undefined,
): number | null {
  if (quantity == null || unitCost == null) return null
  return quantity * unitCost
}

export function costPerUnit(totalCost: number, unitSize: number): number {
  if (unitSize === 0) return 0
  return totalCost / unitSize
}

export function sumByKey<T>(items: T[], key: keyof T): number {
  return items.reduce((acc, item) => acc + Number(item[key] ?? 0), 0)
}
