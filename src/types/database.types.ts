// Auto-generated from Supabase schema. Run `pnpm db:types` to regenerate.
// Placeholder until local Supabase is running.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          type: string
          currency: string
          timezone: string
          config: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string
          currency?: string
          timezone?: string
          config?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          currency?: string
          timezone?: string
          config?: Json
          created_by?: string | null
          updated_at?: string
        }
      }
      business_members: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: 'owner' | 'manager' | 'worker' | 'accountant'
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role: 'owner' | 'manager' | 'worker' | 'accountant'
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          role?: 'owner' | 'manager' | 'worker' | 'accountant'
          joined_at?: string | null
        }
      }
      contexts: {
        Row: {
          id: string
          business_id: string
          name: string
          unit_size: number | null
          unit_label: string | null
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          unit_size?: number | null
          unit_label?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          unit_size?: number | null
          unit_label?: string | null
          notes?: string | null
          is_active?: boolean
        }
      }
      periods: {
        Row: {
          id: string
          context_id: string
          business_id: string
          name: string
          start_date: string | null
          end_date: string | null
          budget_total: number | null
          budget_by_cat: Json
          is_active: boolean
          is_archived: boolean
          created_at: string
        }
        Insert: {
          id?: string
          context_id: string
          business_id: string
          name: string
          start_date?: string | null
          end_date?: string | null
          budget_total?: number | null
          budget_by_cat?: Json
          is_active?: boolean
          is_archived?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          start_date?: string | null
          end_date?: string | null
          budget_total?: number | null
          budget_by_cat?: Json
          is_active?: boolean
          is_archived?: boolean
        }
      }
      workers: {
        Row: {
          id: string
          business_id: string
          name: string
          daily_rate: number | null
          rate_type: 'daily' | 'hourly' | 'fixed'
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          daily_rate?: number | null
          rate_type?: 'daily' | 'hourly' | 'fixed'
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          daily_rate?: number | null
          rate_type?: 'daily' | 'hourly' | 'fixed'
          notes?: string | null
          is_active?: boolean
        }
      }
      expenses: {
        Row: {
          id: string
          period_id: string
          business_id: string
          date: string
          category_id: string
          sub_item: string | null
          description: string | null
          quantity: number | null
          unit_cost: number | null
          total: number
          worker_id: string | null
          receipt_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_id: string
          business_id: string
          date?: string
          category_id: string
          sub_item?: string | null
          description?: string | null
          quantity?: number | null
          unit_cost?: number | null
          total: number
          worker_id?: string | null
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          date?: string
          category_id?: string
          sub_item?: string | null
          description?: string | null
          quantity?: number | null
          unit_cost?: number | null
          total?: number
          worker_id?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
      }
    }
  }
}
