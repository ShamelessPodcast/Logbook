import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposer } from '@/components/feed/PostComposer'
import { GroupJoinButton } from '@/components/groups/GroupJoinButton'
import Image from 'next/image'
import { pluralise } from '@/utils/format'
import type { Metadata } from 'next'
import type { PostWithAuthor } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: slug }
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!group) notFound()

  const [{ data: member }, { data: groupPosts }] = await Promise.all([
    user
      ? supabase
          .from('group_members')
          .select('role')
          .eq('group_id', group.id)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('group_posts')
      .select('posts(*, profiles(id, moniker, display_name, avatar_url, is_verified), vehicles(id, registration, make, model, year))')
      .eq('group_id', group.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const isMember = !!member
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }
  const { data: vehicles } = user
    ? await supabase.from('vehicles').select('*').eq('owner_id', user.id)
    : { data: [] }

  const posts = (groupPosts ?? []).map((gp) => gp.posts).filter(Boolean) as PostWithAuthor[]

  return (
    <div>
      {/* Cover */}
      {group.cover_image_url ? (
        <div className="relative h-36 bg-neutral-100">
          <Image src={group.cover_image_url} alt={group.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center bg-neutral-50 text-5xl">🚘</div>
      )}

      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{group.name}</h1>
            <p className="text-sm text-neutral-500">{pluralise(group.member_count, 'member')}</p>
          </div>
          {user && (
            <GroupJoinButton
              groupId={group.id}
              userId={user.id}
              initialMember={isMember}
            />
          )}
        </div>
      </div>

      {group.description && (
        <div className="border-b border-neutral-100 px-4 py-3">
          <p className="text-sm text-neutral-600">{group.description}</p>
        </div>
      )}

      {isMember && profile && (
        <PostComposer
          profile={profile}
          vehicles={vehicles ?? []}
          placeholder="Post to this group…"
        />
      )}

      {posts.map((p) => (
        <PostCard key={p.id} post={p} currentUserId={user?.id} />
      ))}
    </div>
  )
}
