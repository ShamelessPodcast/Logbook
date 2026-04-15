import { AuthForm } from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account — Logbook',
}

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold">Join Logbook</h2>
      <AuthForm mode="signup" />
    </>
  )
}
