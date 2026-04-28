'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn, signUp } from '@/app/auth/actions'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const action = mode === 'login' ? signIn : signUp
    const result = await action(formData)
    if (result?.error) setError(result.error)
    setLoading(false)
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
