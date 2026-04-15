import { AuthForm } from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in — Logbook',
}

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-xl font-semibold">Log in</h2>
      <AuthForm mode="login" />
    </>
  )
}
