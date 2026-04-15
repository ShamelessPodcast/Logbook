'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetPassword } from '@/app/auth/actions'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await resetPassword(new FormData(e.currentTarget))
    if (result.error) setError(result.error)
    else setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-sm text-neutral-600">
          Check your email — we&apos;ve sent a reset link.
        </p>
        <Link href="/login" className="mt-4 block text-sm font-medium text-black hover:underline">
          Back to log in
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="mb-2 text-xl font-semibold">Reset password</h2>
      <p className="mb-6 text-sm text-neutral-500">
        Enter your email and we&apos;ll send a reset link.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          Send reset link
        </Button>
        <Link
          href="/login"
          className="text-center text-sm text-neutral-500 hover:text-black"
        >
          Back to log in
        </Link>
      </form>
    </>
  )
}
