import type { Expense, Business, BusinessConfig, Period } from '@/types'
import type { PeriodSummary } from '@/types'

type PDFExportInput = {
  expenses: Expense[]
  business: Business
  period: Period
  config: BusinessConfig
  summary: PeriodSummary
}

export async function exportToPDF({
  expenses,
  business,
  period,
  config,
  summary,
}: PDFExportInput): Promise<void> {
  const { default: jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const margin = 15
  const pageW = 210
  const contentW = pageW - margin * 2
  let y = 20

  // ── Header ──────────────────────────────────────────────────────────
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 107, 44) // #006b2c brand green
  doc.text(business.name, margin, y)
  y += 9

  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text(`Season Report — ${period.name}`, margin, y)
  y += 6

  doc.setFontSize(9)
  doc.setTextColor(110, 110, 110)
  const dateRange = [period.start_date, period.end_date].filter(Boolean).join(' → ')
  if (dateRange) {
    doc.text(dateRange, margin, y)
    y += 4
  }
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PK')}`, margin, y)
  y += 10

  // ── Divider ──────────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.4)
  doc.line(margin, y, margin + contentW, y)
  y += 8

  // ── Summary stats ────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', margin, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const statRows: [string, string][] = [
    ['Total Expenses', `PKR ${summary.total.toLocaleString('en-PK')}`],
    ['Total Entries', String(expenses.length)],
  ]
  if (summary.costPerUnit !== null) {
    statRows.push([
      `Cost per ${config.labels.quantity}`,
      `PKR ${summary.costPerUnit.toLocaleString('en-PK')}`,
    ])
  }
  if (summary.budgetTotal !== null) {
    statRows.push([
      'Budget',
      `PKR ${summary.budgetTotal.toLocaleString('en-PK')} (${summary.budgetUsedPercent?.toFixed(0) ?? 0}% used)`,
    ])
  }

  statRows.forEach(([label, value]) => {
    doc.setTextColor(80, 80, 80)
    doc.text(label, margin + 2, y)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.text(value, margin + contentW / 2, y)
    doc.setFont('helvetica', 'normal')
    y += 6
  })

  y += 4

  // ── Category Breakdown ───────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 30, 30)
  doc.text('Category Breakdown', margin, y)
  y += 6

  const catTotals: Record<string, number> = {}
  expenses.forEach((e) => {
    catTotals[e.category_id] = (catTotals[e.category_id] ?? 0) + e.total
  })

  const breakdown = config.categories
    .filter((c) => catTotals[c.id])
    .map((c) => ({ name: c.name, total: catTotals[c.id] ?? 0 }))
    .sort((a, b) => b.total - a.total)

  // Table header row
  doc.setFillColor(240, 247, 240)
  doc.rect(margin, y - 4, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text('Category', margin + 2, y)
  doc.text('Amount (PKR)', margin + contentW - 55, y)
  doc.text('Share', margin + contentW - 12, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  breakdown.forEach(({ name, total }, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(margin, y - 4, contentW, 7, 'F')
    }
    const pct =
      summary.total > 0 ? `${((total / summary.total) * 100).toFixed(1)}%` : '—'
    doc.setTextColor(40, 40, 40)
    doc.text(name, margin + 2, y)
    doc.text(total.toLocaleString('en-PK'), margin + contentW - 55, y)
    doc.text(pct, margin + contentW - 12, y)
    y += 7
  })

  // Total footer
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.line(margin, y - 2, margin + contentW, y - 2)
  y += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL', margin + 2, y)
  doc.text(summary.total.toLocaleString('en-PK'), margin + contentW - 55, y)
  y += 10

  // ── Top 5 Expenses ───────────────────────────────────────────────────
  if (y < 225 && expenses.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Top 5 Expenses', margin, y)
    y += 6

    const top5 = [...expenses].sort((a, b) => b.total - a.total).slice(0, 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    top5.forEach((exp) => {
      if (y > 270) return
      const catName =
        config.categories.find((c) => c.id === exp.category_id)?.name ?? exp.category_id
      const label = [catName, exp.sub_item, exp.description]
        .filter(Boolean)
        .join(' · ')
        .slice(0, 60)
      doc.setTextColor(100, 100, 100)
      doc.text(exp.date, margin + 2, y)
      doc.setTextColor(40, 40, 40)
      doc.text(label, margin + 24, y)
      doc.setFont('helvetica', 'bold')
      doc.text(`PKR ${exp.total.toLocaleString('en-PK')}`, margin + contentW - 35, y)
      doc.setFont('helvetica', 'normal')
      y += 6
    })
  }

  // ── Footer ───────────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 160)
  doc.text('Generated by Xpensly', margin, 287)
  doc.text(new Date().toLocaleString('en-PK'), margin + contentW - 42, 287)

  const fileName = `${business.name}-${period.name}-report.pdf`
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')

  doc.save(fileName)
}
