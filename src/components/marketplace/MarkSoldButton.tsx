'use client'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface MarkSoldButtonProps {
  listingId: string
  status: string
}

export function MarkSoldButton({ listingId, status }: MarkSoldButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function markSold() {
    setLoading(true)
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId)

    if (error) toast.error('Could not mark as sold')
    else {
      toast.success('Marked as sold!')
      router.refresh()
    }
    setLoading(false)
  }

  if (status !== 'active') return null

  return (
    <Button variant="secondary" onClick={markSold} loading={loading}>
      Mark as sold
    </Button>
  )
}
