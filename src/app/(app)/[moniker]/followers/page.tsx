import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ moniker: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moniker } = await params
  return { title: `@${moniker} Followers` }
}

export default async function FollowersPage({ params }: Props) {
  const { moniker } = await params
  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, moniker, display_name')
    .eq('moniker', moniker)
    .single()

  const profile = profileData as { id: string; moniker: string; display_name: string | null } | null

  if (!profile) notFound()

  const { data: followersRaw } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', profile.id)
    .limit(100)

  const followerIds = (followersRaw ?? []).map((r) => (r as unknown as { follower_id: string }).follower_id)

  type FollowerProfile = { id: string; moniker: string; display_name: string | null; avatar_url: string | null; bio: string | null }
  const { data: followersData } =
    followerIds.length > 0
      ? await supabase
          .from('profiles')
          .select('id, moniker, display_name, avatar_url, bio')
          .in('id', followerIds)
      : { data: [] as FollowerProfile[] }
  const followers = (followersData ?? []) as FollowerProfile[]

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Followers</h1>
        <p className="text-sm text-neutral-500">@{moniker}</p>
      </div>

      {(followers ?? []).map((p) => (
        <Link key={p.id} href={`/${p.moniker}`} className="feed-item flex gap-3 px-4 py-3">
          <Avatar src={p.avatar_url} alt={p.display_name ?? p.moniker} size="md" />
          <div>
            <p className="font-medium">{p.display_name ?? p.moniker}</p>
            <p className="text-sm text-neutral-500">@{p.moniker}</p>
            {p.bio && <p className="mt-0.5 text-sm text-neutral-600 line-clamp-1">{p.bio}</p>}
          </div>
        </Link>
      ))}

      {(followers ?? []).length === 0 && (
        <p className="py-16 text-center text-neutral-500">No followers yet</p>
      )}
    </div>
  )
}
