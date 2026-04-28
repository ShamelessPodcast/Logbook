'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { useState } from 'react'
import { signIn, signUp } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { Mail } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null) // email address awaiting confirmation
  const [resent, setResent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (mode === 'login') {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
      setLoading(false)
      return
    }

    // Signup flow
    const result = await signUp(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    if (result?.success && result.email) {
      setConfirming(result.email)
    }
  }

  async function handleResend() {
    if (!confirming) return
    setResent(false)
    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email: confirming })
    setResent(true)
  }

  // Check-email screen
  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <Mail className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Check your email</h3>
          <p className="mt-1 text-sm text-neutral-500">
            We&apos;ve sent a confirmation link to{' '}
            <span className="font-medium text-neutral-800">{confirming}</span>
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Click the link in that email to activate your account.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          {resent ? (
            <p className="text-sm text-green-600">Email resent ✓</p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Resend confirmation email
            </button>
          )}
          <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-700">
            Back to log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === 'signup' && (
        <Input
          name="moniker"
          label="Moniker"
          placeholder="yourhandle"
          hint="Your unique identity on Logbook — letters, numbers, underscores only"
          required
          autoComplete="username"
        />
      )}
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        autoComplete={mode === 'login' ? 'email' : 'new-email'}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        placeholder={mode === 'login' ? 'Enter password' : 'At least 8 characters'}
        required
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" loading={loading} className="mt-1 w-full">
        {mode === 'login' ? 'Log in' : 'Create account'}
      </Button>

      {mode === 'login' ? (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <Link href="/forgot-password" className="hover:text-black">
            Forgot password?
          </Link>
          <Link href="/signup" className="font-medium text-black hover:underline">
            Create account
          </Link>
        </div>
      ) : (
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-black hover:underline">
            Log in
          </Link>
        </p>
      )}

      {mode === 'signup' && (
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          By signing up you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
        </p>
      )}
    </form>
  )
}
