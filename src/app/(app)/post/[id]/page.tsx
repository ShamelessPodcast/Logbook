import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposer } from '@/components/feed/PostComposer'
import { notFound } from 'next/navigation'
import type { PostWithAuthor } from '@/types/database'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('content, profiles(moniker)')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Post not found' }
  const profiles = data.profiles as { moniker: string } | null
  return {
    title: `@${profiles?.moniker ?? 'unknown'}: "${(data.content as string).slice(0, 60)}"`,
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select(
      '*, profiles(id, moniker, display_name, avatar_url, is_verified), vehicles(id, registration, make, model, year)'
    )
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (!post) notFound()

  const { data: replies } = await supabase
    .from('posts')
    .select(
      '*, profiles(id, moniker, display_name, avatar_url, is_verified), vehicles(id, registration, make, model, year)'
    )
    .eq('reply_to_id', id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: vehicles } = user
    ? await supabase.from('vehicles').select('*').eq('owner_id', user.id)
    : { data: [] }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Post</h1>
      </div>

      <PostCard post={post as PostWithAuthor} currentUserId={user?.id} />

      {profile && (
        <PostComposer
          profile={profile}
          vehicles={vehicles ?? []}
          replyToId={id}
          placeholder="Post your reply…"
        />
      )}

      {(replies as PostWithAuthor[] ?? []).map((r) => (
        <PostCard key={r.id} post={r} currentUserId={user?.id} />
      ))}
    </div>
  )
}
