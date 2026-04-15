'use client'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface GroupJoinButtonProps {
  groupId: string
  userId: string
  initialMember: boolean
}

export function GroupJoinButton({ groupId, userId, initialMember }: GroupJoinButtonProps) {
  const [member, setMember] = useState(initialMember)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    if (member) {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)
      if (error) toast.error('Could not leave group')
      else {
        setMember(false)
        router.refresh()
      }
    } else {
      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: userId, role: 'member' })
      if (error) toast.error('Could not join group')
      else {
        setMember(true)
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <Button
      variant={member ? 'secondary' : 'primary'}
      size="sm"
      onClick={toggle}
      loading={loading}
    >
      {member ? 'Leave group' : 'Join group'}
    </Button>
  )
}
