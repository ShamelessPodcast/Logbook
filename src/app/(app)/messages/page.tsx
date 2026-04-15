import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'
import { shortDate } from '@/utils/format'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Messages' }

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [user!.id])
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(50)

  // Get profile info for each conversation's other participant
  const convs = await Promise.all(
    (conversations ?? []).map(async (c) => {
      const otherId = c.participant_ids.find((id: string) => id !== user!.id)
      if (!otherId) return { ...c, otherProfile: null }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, moniker, display_name, avatar_url')
        .eq('id', otherId)
        .single()
      return { ...c, otherProfile: profile }
    })
  )

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Messages</h1>
      </div>

      {convs.length === 0 && (
        <p className="py-16 text-center text-neutral-500">No conversations yet</p>
      )}

      {convs.map((c) => {
        const p = c.otherProfile as { id: string; moniker: string; display_name: string | null; avatar_url: string | null } | null
        if (!p) return null
        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="feed-item flex gap-3 px-4 py-3"
          >
            <Avatar src={p.avatar_url} alt={p.display_name ?? p.moniker} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{p.display_name ?? p.moniker}</p>
                {c.last_message_at && (
                  <p className="text-xs text-neutral-400">{shortDate(c.last_message_at)}</p>
                )}
              </div>
              {c.last_message_preview && (
                <p className="truncate text-sm text-neutral-500">{c.last_message_preview}</p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
