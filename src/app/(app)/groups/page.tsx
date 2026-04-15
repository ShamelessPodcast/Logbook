import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { pluralise } from '@/utils/format'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Groups' }

export default async function GroupsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('is_private', false)
    .order('member_count', { ascending: false })
    .limit(50)

  // My groups
  const { data: myGroups } = await supabase
    .from('group_members')
    .select('groups(*)')
    .eq('user_id', user!.id)
    .limit(20)

  const myGroupIds = new Set(
    myGroups
      ?.map((m) => (m.groups as { id: string } | null)?.id)
      .filter(Boolean) ?? []
  )

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Groups</h1>
        <Link href="/groups/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New group
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {(groups ?? []).map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.slug}`}
            className="overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-shadow hover:shadow-sm"
          >
            {group.cover_image_url ? (
              <div className="relative h-24 bg-neutral-100">
                <Image
                  src={group.cover_image_url}
                  alt={group.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center bg-neutral-50 text-3xl">
                🚘
              </div>
            )}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{group.name}</h3>
                {myGroupIds.has(group.id) && (
                  <span className="text-xs text-neutral-400">Joined</span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-neutral-500">
                {pluralise(group.member_count, 'member')}
              </p>
              {group.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{group.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
