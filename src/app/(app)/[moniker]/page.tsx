import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UKPlate } from '@/components/ui/UKPlate'
import { Avatar } from '@/components/ui/Avatar'
import { PostCard } from '@/components/feed/PostCard'
import { FollowButton } from '@/components/feed/FollowButton'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import type { PostWithAuthor, Profile, Vehicle } from '@/types/database'
import { pluralise } from '@/utils/format'

interface Props {
  params: Promise<{ moniker: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moniker } = await params
  return {
    title: `@${moniker}`,
    description: `View ${moniker}'s garage and posts on Logbook`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { moniker } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('moniker', moniker.toLowerCase())
    .single()

  if (!profileRaw) notFound()
  const profile = profileRaw as Profile

  const profileId = profile.id

  const [vehicleRes, postsRes, followRes] = await Promise.all([
    supabase.from('vehicles').select('*').eq('owner_id', profileId).order('is_primary', { ascending: false }),
    supabase
      .from('posts')
      .select('*, profiles(id, moniker, display_name, avatar_url, is_verified), vehicles(id, registration, make, model, year)')
      .eq('author_id', profileId)
      .eq('is_deleted', false)
      .is('reply_to_id', null)
      .order('created_at', { ascending: false })
      .limit(20),
    user
      ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profileId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const vehicles = (vehicleRes.data ?? []) as Vehicle[]
  const posts = postsRes.data
  const followRow = followRes.data

  const isOwn = user?.id === profile.id
  const isFollowing = !!followRow

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">{profile.display_name ?? profile.moniker}</h1>
        <p className="text-sm text-neutral-500">{pluralise(profile.post_count, 'post')}</p>
      </div>

      {/* Profile header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name ?? profile.moniker}
            size="xl"
          />
          {isOwn ? (
            <Link
              href="/settings/profile"
              className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium hover:bg-neutral-50"
            >
              Edit profile
            </Link>
          ) : user ? (
            <FollowButton
              userId={user.id}
              targetId={profile.id}
              initialFollowing={isFollowing}
            />
          ) : null}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-bold">{profile.display_name ?? profile.moniker}</h2>
            {profile.is_verified && (
              <ShieldCheck className="h-5 w-5 fill-black text-white" />
            )}
          </div>
          <p className="text-neutral-500">@{profile.moniker}</p>
          {profile.bio && <p className="mt-2 text-[15px]">{profile.bio}</p>}
          {profile.location && (
            <p className="mt-1 text-sm text-neutral-500">📍 {profile.location}</p>
          )}
        </div>

        <div className="mt-3 flex gap-4 text-sm">
          <Link href={`/${moniker}/following`} className="hover:underline">
            <span className="font-bold">{profile.following_count}</span>{' '}
            <span className="text-neutral-500">Following</span>
          </Link>
          <Link href={`/${moniker}/followers`} className="hover:underline">
            <span className="font-bold">{profile.follower_count}</span>{' '}
            <span className="text-neutral-500">Followers</span>
          </Link>
        </div>
      </div>

      {/* Garage grid */}
      {vehicles && vehicles.length > 0 && (
        <div className="border-t border-neutral-100 px-4 py-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Garage
          </h3>
          <div className="flex flex-wrap gap-2">
            {vehicles.map((v) => (
              <Link key={v.id} href={`/plate/${v.registration}`}>
                <UKPlate registration={v.registration} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="border-t border-neutral-100">
        {(posts as PostWithAuthor[] ?? []).map((post) => (
          <PostCard key={post.id} post={post} currentUserId={user?.id} />
        ))}
      </div>
    </div>
  )
}
