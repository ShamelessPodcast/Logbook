'use client'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface FollowButtonProps {
  userId: string
  targetId: string
  initialFollowing: boolean
}

export function FollowButton({ userId, targetId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function toggle() {
    setLoading(true)
    if (following) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetId)
      if (error) toast.error('Could not unfollow')
      else setFollowing(false)
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: userId, following_id: targetId })
      if (error) toast.error('Could not follow')
      else setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <Button
      variant={following ? 'secondary' : 'primary'}
      size="sm"
      onClick={toggle}
      loading={loading}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
