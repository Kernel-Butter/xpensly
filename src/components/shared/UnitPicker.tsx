'use client'

interface UnitPickerProps {
  value: string
  onChange: (unit: string) => void
  suggestions: string[]
  placeholder?: string
}

export function UnitPicker({ value, onChange, suggestions, placeholder = 'e.g. bags, acres, kg' }: UnitPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onChange(u)}
              className={`px-3 py-1 rounded-full text-label-sm border transition-colors ${
                value === u
                  ? 'bg-surface-green border-primary text-primary font-medium'
                  : 'bg-gray-100 border-gray-200 text-on-surface-variant hover:bg-gray-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
