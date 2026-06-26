'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Business, Context, Period, Expense } from '@/types'

type AppState = {
  activeBusiness:   Business | null
  activeContext:    Context | null
  activePeriod:     Period | null
  isAddExpenseOpen: boolean
  editingExpense:   Expense | null
}

type AppActions = {
  setActiveBusiness: (business: Business) => void
  setActiveContext:  (context: Context) => void
  setActivePeriod:   (period: Period) => void
  openAddExpense:    () => void
  closeAddExpense:   () => void
  openEditExpense:   (expense: Expense) => void
  closeEditExpense:  () => void
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set) => ({
      activeBusiness:   null,
      activeContext:    null,
      activePeriod:     null,
      isAddExpenseOpen: false,
      editingExpense:   null,

      setActiveBusiness: (b) => set((s) => { s.activeBusiness = b }),
      setActiveContext:  (c) => set((s) => { s.activeContext = c }),
      setActivePeriod:   (p) => set((s) => { s.activePeriod = p }),
      openAddExpense:    ()  => set((s) => { s.isAddExpenseOpen = true }),
      closeAddExpense:   ()  => set((s) => { s.isAddExpenseOpen = false }),
      openEditExpense:   (e) => set((s) => { s.editingExpense = e; s.isAddExpenseOpen = true }),
      closeEditExpense:  ()  => set((s) => { s.editingExpense = null; s.isAddExpenseOpen = false }),
    })),
    {
      name: 'xpensly-app',
      partialize: (state) => ({
        activeBusiness: state.activeBusiness,
        activeContext:  state.activeContext,
        activePeriod:   state.activePeriod,
      }),
    },
  ),
)
