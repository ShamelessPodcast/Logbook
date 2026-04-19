'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  moniker: z
    .string()
    .min(2, 'Moniker must be at least 2 characters')
    .max(30, 'Moniker must be 30 characters or fewer')
    .regex(/^[a-zA-Z0-9_]+$/, 'Moniker can only contain letters, numbers, and underscores'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function signUp(formData: FormData): Promise<{ error?: string }> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    moniker: formData.get('moniker'),
  }

  const parsed = signUpSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { email, password, moniker } = parsed.data
  const supabase = await createClient()

  // Check moniker uniqueness
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('moniker', moniker.toLowerCase())
    .maybeSingle()

  if (existing) {
    return { error: 'That moniker is already taken' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { moniker: moniker.toLowerCase() },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  redirect('/onboarding')
}

export async function signIn(formData: FormData): Promise<{ error?: string }> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = signInSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email')
  if (!email || typeof email !== 'string') return { error: 'Email is required' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const password = formData.get('password')
  if (!password || typeof password !== 'string' || password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signInWithGoogle(): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) return { error: error.message }
  if (data.url) return { url: data.url }
  return { error: 'Failed to initiate Google sign in' }
}
