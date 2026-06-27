'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Pencil, Trash2, Check, Loader2 } from 'lucide-react'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { DeleteDialog } from '@/components/shared/DeleteDialog'
import { useAppStore } from '@/store/app.store'
import { useUpdateBusinessConfig } from '@/hooks/mutations/useUpdateBusinessConfig'
import { agricultureConfig } from '@/lib/config/business-configs'
import type { Category } from '@/types'

const PALETTE = ['#006b2c', '#f59e0b', '#3b82f6', '#a855f7', '#dc2626', '#b15f00', '#22c55e', '#f97316']
const ICONS   = ['Leaf', 'Tractor', 'Droplets', 'FlaskConical', 'Users', 'Wrench', 'Fuel', 'Package']

export default function CategoriesPage() {
  const router = useRouter()
  const activeBusiness = useAppStore((s) => s.activeBusiness)
  const config = activeBusiness?.config ?? agricultureConfig

  const [categories, setCategories] = useState<Category[]>(config.categories)
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [editing, setEditing]       = useState<Category | null>(null)
  const [newName, setNewName]       = useState('')
  const [newColor, setNewColor]     = useState(PALETTE[0])
  const [newIcon, setNewIcon]       = useState('Leaf')
  const [isWage, setIsWage]         = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [nameError, setNameError]   = useState('')

  const { mutate: updateConfig, isPending: isSaving } = useUpdateBusinessConfig()

  function openAdd() {
    setEditing(null)
    setNewName('')
    setNewColor(PALETTE[0])
    setNewIcon('Leaf')
    setIsWage(false)
    setNameError('')
    setSheetOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setNewName(cat.name)
    setNewColor(cat.color)
    setNewIcon(cat.icon)
    setIsWage(cat.isWageType)
    setNameError('')
    setSheetOpen(true)
  }

  function handleSave() {
    if (!newName.trim()) {
      setNameError('Category name is required')
      return
    }
    setNameError('')

    let updated: Category[]
    if (editing) {
      updated = categories.map((c) =>
        c.id === editing.id
          ? { ...c, name: newName.trim(), color: newColor, icon: newIcon, isWageType: isWage }
          : c,
      )
    } else {
      const newCat: Category = {
        id:         crypto.randomUUID() as Category['id'],
        name:       newName.trim(),
        color:      newColor,
        icon:       newIcon,
        isWageType: isWage,
      }
      updated = [...categories, newCat]
    }

    setCategories(updated)
    updateConfig({ ...config, categories: updated })
    setSheetOpen(false)
  }

  function handleDelete(catId: string) {
    const updated = categories.filter((c) => c.id !== catId)
    setCategories(updated)
    updateConfig({ ...config, categories: updated })
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-surface px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-headline-sm text-primary absolute left-1/2 -translate-x-1/2">Categories</h1>
        <div className="w-10" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pt-4 flex flex-col gap-3 pb-24">
        <p className="text-body-sm text-on-surface-variant">
          Expense categories for{' '}
          <span className="font-medium text-on-surface">{activeBusiness?.name ?? 'your business'}</span>
        </p>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative overflow-hidden rounded-lg border border-gray-200 bg-surface flex items-center justify-between p-3"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: cat.color }} />
            <div className="flex items-center gap-3 pl-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                <CategoryIcon iconName={cat.icon} size={20} />
              </div>
              <div>
                <p className="text-title-md text-on-surface">{cat.name}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {cat.isWageType ? 'Wage type' : 'Standard'}
                  {cat.subItems?.length ? ` · ${cat.subItems.join(', ')}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(cat)}
                className="rounded-full p-2 text-on-surface-variant hover:bg-gray-100 transition-colors"
              >
                <Pencil size={17} />
              </button>
              <button
                onClick={() => setDeleteId(cat.id)}
                className="rounded-full p-2 text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <p className="text-body-sm text-on-surface-variant">No categories yet. Tap + to add one.</p>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-on-primary shadow-fab active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Delete confirmation */}
      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete category?"
        description="Existing expenses using this category won't be affected."
        confirmLabel="Delete Category"
      />

      {/* Add / Edit sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="text-body-sm text-on-surface-variant">Category Name</label>
          <input
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNameError('') }}
            placeholder="e.g. Equipment Repair"
            autoFocus
            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:outline-none focus:ring-1 transition-colors ${
              nameError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-primary focus:ring-primary'
            }`}
          />
          {nameError && <p className="text-label-xs text-red-500">{nameError}</p>}
        </div>

        {/* Icon grid */}
        <div className="flex flex-col gap-2">
          <label className="text-body-sm text-on-surface-variant">Icon</label>
          <div className="grid grid-cols-5 gap-2">
            {ICONS.map((name) => (
              <button
                key={name}
                onClick={() => setNewIcon(name)}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-colors ${
                  newIcon === name
                    ? 'border-primary bg-surface-container text-primary'
                    : 'border-gray-200 bg-gray-50 text-on-surface-variant hover:bg-gray-100'
                }`}
              >
                <CategoryIcon iconName={name} size={22} />
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <label className="text-body-sm text-on-surface-variant">Color</label>
          <div className="flex gap-3 flex-wrap">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="h-10 w-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              >
                {newColor === c && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Wage toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-title-md text-on-surface">Wage Type</p>
            <p className="text-body-sm text-on-surface-variant">Shows worker picker on expense entry</p>
          </div>
          <button
            onClick={() => setIsWage(!isWage)}
            className={`relative inline-block h-6 w-11 rounded-full transition-colors ${isWage ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${isWage ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-xl bg-primary py-3.5 text-title-md text-on-primary hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {editing ? 'Save Changes' : 'Add Category'}
        </button>
      </BottomSheet>
    </div>
  )
}
