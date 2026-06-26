'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './server'

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { error: error.message }
  return { success: 'Check your email to confirm your account.' }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
