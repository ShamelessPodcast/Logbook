'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en-GB">
      <body className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔧</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">
            We&apos;ve been notified and are looking into it.
          </p>
          <button
            onClick={reset}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
