import type { Expense, Business, BusinessConfig, Period } from '@/types'

type ExcelExportInput = {
  expenses: Expense[]
  business: Business
  period: Period
  config: BusinessConfig
}

type CellValue = string | number

export async function exportToExcel({
  expenses,
  business,
  period,
  config,
}: ExcelExportInput): Promise<void> {
  const XLSX = await import('xlsx')

  const isAgri = config.type === 'agriculture'

  const metaRows: CellValue[][] = [
    [business.name],
    [`Period: ${period.name}`],
    [`Exported: ${new Date().toLocaleDateString('en-PK')}`],
    [],
  ]

  const agriHeaders: CellValue[] = [
    'DATE', 'DETAILS', 'T=BILLS', 'W', 'WL', 'FERTILIZER', 'PESTICIDE', 'WAGES', 'TOTAL (₨)',
  ]
  const genericHeaders: CellValue[] = [
    'DATE', 'CATEGORY', 'DETAILS', 'QTY', 'RATE (₨)', 'TOTAL (₨)',
  ]

  const colTotals = {
    tractor: 0,
    w: 0,
    wl: 0,
    fertilizer: 0,
    pesticide: 0,
    wages: 0,
  }

  const dataRows: CellValue[][] = expenses.map((exp) => {
    const details =
      [exp.sub_item, exp.description].filter(Boolean).join(' – ') || ''

    if (isAgri) {
      let tBills: CellValue = ''
      let w: CellValue = ''
      let wl: CellValue = ''
      let fertilizer: CellValue = ''
      let pesticide: CellValue = ''
      let wages: CellValue = ''

      switch (exp.category_id) {
        case 'tractor':
          tBills = exp.total
          colTotals.tractor += exp.total
          break
        case 'water':
          if (exp.sub_item?.toUpperCase().includes('WL')) {
            wl = exp.total
            colTotals.wl += exp.total
          } else {
            w = exp.total
            colTotals.w += exp.total
          }
          break
        case 'fertilizer':
          fertilizer = exp.total
          colTotals.fertilizer += exp.total
          break
        case 'pesticide':
          pesticide = exp.total
          colTotals.pesticide += exp.total
          break
        case 'wages':
          wages = exp.total
          colTotals.wages += exp.total
          break
        default:
          // Non-standard categories land in DETAILS with full total
          break
      }

      return [exp.date, details, tBills, w, wl, fertilizer, pesticide, wages, exp.total]
    } else {
      const catName =
        config.categories.find((c) => c.id === exp.category_id)?.name ??
        exp.category_id
      return [
        exp.date,
        catName,
        details,
        exp.quantity ?? '',
        exp.unit_cost ?? '',
        exp.total,
      ]
    }
  })

  const grandTotal = expenses.reduce((s, e) => s + e.total, 0)

  const totalsRow: CellValue[] = isAgri
    ? [
        '',
        'TOTAL',
        colTotals.tractor || '',
        colTotals.w || '',
        colTotals.wl || '',
        colTotals.fertilizer || '',
        colTotals.pesticide || '',
        colTotals.wages || '',
        grandTotal,
      ]
    : ['', '', '', '', 'TOTAL', grandTotal]

  const aoa: CellValue[][] = [
    ...metaRows,
    isAgri ? agriHeaders : genericHeaders,
    ...dataRows,
    [],
    totalsRow,
  ]

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  ws['!cols'] = isAgri
    ? [
        { wch: 12 },
        { wch: 32 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 13 },
        { wch: 13 },
        { wch: 10 },
        { wch: 14 },
      ]
    : [{ wch: 12 }, { wch: 16 }, { wch: 32 }, { wch: 8 }, { wch: 12 }, { wch: 14 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses')

  const fileName = `${business.name}-${period.name}.xlsx`
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')

  XLSX.writeFile(wb, fileName)
}
