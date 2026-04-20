import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'
import { timeAgo } from '@/utils/format'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Bell, Heart, MessageCircle, Repeat2, UserPlus } from 'lucide-react'

export const metadata: Metadata = { title: 'Notifications' }

const notifIcon: Record<string, React.ElementType> = {
  like: Heart,
  reply: MessageCircle,
  repost: Repeat2,
  follow: UserPlus,
  mention: MessageCircle,
  plate_message: MessageCircle,
  mot_reminder: Bell,
  tax_reminder: Bell,
}

const notifText: Record<string, (actor: string) => string> = {
  like: (a) => `${a} liked your post`,
  reply: (a) => `${a} replied to your post`,
  repost: (a) => `${a} reposted your post`,
  follow: (a) => `${a} followed you`,
  mention: (a) => `${a} mentioned you`,
  plate_message: (a) => `${a} messaged you about a plate`,
  mot_reminder: () => 'Your MOT is due soon',
  tax_reminder: () => 'Your vehicle tax is due soon',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, profiles!actor_id(id, moniker, display_name, avatar_url)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user!.id)
    .eq('is_read', false)

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Notifications</h1>
      </div>

      {(notifications ?? []).length === 0 && (
        <p className="py-16 text-center text-neutral-500">No notifications yet</p>
      )}

      {(notifications ?? []).map((n) => {
        const actor = n.profiles as { id: string; moniker: string; display_name: string | null; avatar_url: string | null } | null
        const Icon = notifIcon[n.type] ?? Bell
        const text = notifText[n.type]?.(actor?.display_name ?? actor?.moniker ?? 'Someone') ?? n.message ?? 'Notification'
        const href = n.post_id ? `/post/${n.post_id}` : actor ? `/${actor.moniker}` : '#'

        return (
          <Link
            key={n.id}
            href={href}
            className={cn(
              'feed-item flex gap-3 px-4 py-3',
              !n.is_read && 'bg-blue-50/50'
            )}
          >
            <div className="relative shrink-0">
              <Avatar
                src={actor?.avatar_url}
                alt={actor?.display_name ?? actor?.moniker ?? 'Logbook'}
                size="md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                <Icon className="h-3 w-3" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{text}</span>
              </p>
              <p className="text-xs text-neutral-500">{timeAgo(n.created_at)}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
