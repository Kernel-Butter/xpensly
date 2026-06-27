'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { fmtCurrency } from '@/lib/utils/format'

type Bar = { name: string; amount: number; color: string }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Bar }[] }) {
  if (!active || !payload?.length) return null
  const bar = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs text-gray-500">{bar.name}</p>
      <p className="text-sm font-medium text-gray-900">{fmtCurrency(bar.amount)}</p>
    </div>
  )
}

export function CategoryBarChart({ data, currency: _currency }: { data: Bar[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -18, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 100000 ? `${(v / 100000).toFixed(1)}L`
            : v >= 1000 ? `${(v / 1000).toFixed(0)}k`
            : String(v)
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
