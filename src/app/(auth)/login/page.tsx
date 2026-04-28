import { AuthForm } from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in — Logbook',
}

const messages: Record<string, string> = {
  link_expired:  'That confirmation link has expired. Sign in or request a new one.',
  access_denied: 'Access was denied. Please try again.',
  auth_error:    'Something went wrong. Please try again.',
}

interface Props {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { message } = await searchParams
  const notice = message ? messages[message] : null

  return (
    <>
      <h2 className="mb-6 text-xl font-semibold">Log in</h2>
      {notice && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {notice}
        </p>
      )}
      <AuthForm mode="login" />
    </>
  )
}
