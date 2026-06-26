import { BottomNav } from '@/components/shared/BottomNav'
import { FAB } from '@/components/shared/FAB'
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
      <FAB />
      <AddExpenseSheet />
    </div>
  )
}
