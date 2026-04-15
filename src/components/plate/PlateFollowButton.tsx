'use client'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface PlateFollowButtonProps {
  userId: string
  registration: string
  initialFollowing: boolean
}

export function PlateFollowButton({ userId, registration, initialFollowing }: PlateFollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function toggle() {
    setLoading(true)
    if (following) {
      const { error } = await supabase
        .from('plate_follows')
        .delete()
        .eq('user_id', userId)
        .eq('registration', registration)
      if (error) toast.error('Could not unfollow plate')
      else setFollowing(false)
    } else {
      const { error } = await supabase
        .from('plate_follows')
        .insert({ user_id: userId, registration })
      if (error) toast.error('Could not follow plate')
      else setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <Button
      variant={following ? 'secondary' : 'outline'}
      size="sm"
      onClick={toggle}
      loading={loading}
    >
      {following ? 'Following plate' : 'Follow plate'}
    </Button>
  )
}
