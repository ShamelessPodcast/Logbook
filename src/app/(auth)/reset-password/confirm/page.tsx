'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updatePassword } from '@/app/auth/actions'
import { useState } from 'react'

export default function ConfirmResetPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await updatePassword(new FormData(e.currentTarget))
    if (result?.error) setError(result.error)
    setLoading(false)
  }

  return (
    <>
      <h2 className="mb-6 text-xl font-semibold">Set new password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="password"
          type="password"
          label="New password"
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          Update password
        </Button>
      </form>
    </>
  )
}
