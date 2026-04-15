'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function NewGroupPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const slug = slugify(name)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        owner_id: user.id,
        name: name.trim(),
        slug,
        description: description || null,
        is_private: isPrivate,
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message.includes('slug') ? 'That group name is taken' : 'Could not create group')
      setLoading(false)
      return
    }

    // Auto-join as owner
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'owner',
    })

    toast.success('Group created!')
    router.push(`/groups/${group.slug}`)
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">New Group</h1>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <Input
          label="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. MX-5 Owners UK"
          hint={slug ? `Slug: /groups/${slug}` : undefined}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this group about?"
          rows={3}
        />

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <div>
            <p className="text-sm font-medium">Private group</p>
            <p className="text-xs text-neutral-500">Only members can see posts</p>
          </div>
        </label>

        <Button onClick={handleCreate} loading={loading} disabled={!name.trim()} className="w-full">
          Create group
        </Button>
      </div>
    </div>
  )
}
