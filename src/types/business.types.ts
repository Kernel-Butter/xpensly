export type CategoryId = string & { readonly __brand: 'CategoryId' }
export type BusinessId = string & { readonly __brand: 'BusinessId' }
export type ContextId  = string & { readonly __brand: 'ContextId' }
export type PeriodId   = string & { readonly __brand: 'PeriodId' }
export type ExpenseId  = string & { readonly __brand: 'ExpenseId' }
export type WorkerId   = string & { readonly __brand: 'WorkerId' }
export type UserId     = string & { readonly __brand: 'UserId' }

export const toBusinessId = (id: string): BusinessId => id as BusinessId
export const toContextId  = (id: string): ContextId  => id as ContextId
export const toPeriodId   = (id: string): PeriodId   => id as PeriodId
export const toExpenseId  = (id: string): ExpenseId  => id as ExpenseId
export const toWorkerId   = (id: string): WorkerId   => id as WorkerId
export const toUserId     = (id: string): UserId     => id as UserId

export type MemberRole = 'owner' | 'manager' | 'worker' | 'accountant'

export type Category = {
  id: CategoryId
  name: string
  icon: string
  color: string
  subItems?: string[]
  unitLabel?: string
  isWageType: boolean
}

export type BusinessConfig = {
  type: 'agriculture' | 'transport' | 'construction' | 'shop' | 'restaurant' | 'custom'
  labels: {
    context: string
    period: string
    quantity: string
  }
  currency: string
  categories: Category[]
  /** Master list of measurement units used anywhere in this business (fields + categories). */
  units: string[]
}

export type Business = {
  id: BusinessId
  name: string
  type: string
  currency: string
  timezone: string
  config: BusinessConfig
  created_by: UserId | null
  created_at: string
  updated_at: string
}

export type BusinessMember = {
  id: string
  business_id: BusinessId
  user_id: UserId
  role: MemberRole
  invited_at: string
  joined_at: string | null
}

export type Context = {
  id: ContextId
  business_id: BusinessId
  name: string
  unit_size: number | null
  unit_label: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export type Period = {
  id: PeriodId
  context_id: ContextId
  business_id: BusinessId
  name: string
  start_date: string | null
  end_date: string | null
  budget_total: number | null
  budget_by_cat: Record<string, number>
  is_active: boolean
  is_archived: boolean
  created_at: string
}
