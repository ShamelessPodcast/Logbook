'use client'

import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldCheck } from 'lucide-react'

interface PlateLockButtonProps {
  vehicleId: string
  registration: string
}

export function PlateLockButton({ vehicleId, registration }: PlateLockButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleLock() {
    setLoading(true)
    const res = await fetch('/api/stripe/plate-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, registration }),
    })
    const json = await res.json() as { url?: string; error?: string }

    if (json.error) {
      toast.error(json.error)
      setLoading(false)
      return
    }

    if (json.url) {
      window.location.href = json.url
    }
  }

  return (
    <Button onClick={handleLock} loading={loading} size="sm">
      <ShieldCheck className="h-4 w-4" />
      Lock this plate — £9.99/yr
    </Button>
  )
}
