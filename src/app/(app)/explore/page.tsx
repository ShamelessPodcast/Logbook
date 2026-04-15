import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/feed/PostCard'
import type { Metadata } from 'next'
import type { PostWithAuthor } from '@/types/database'

export const metadata: Metadata = { title: 'Explore' }

export default async function ExplorePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select(
      '*, profiles(id, moniker, display_name, avatar_url, is_verified), vehicles(id, registration, make, model, year)'
    )
    .eq('is_deleted', false)
    .is('reply_to_id', null)
    .order('like_count', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Explore</h1>
      </div>

      {(posts as PostWithAuthor[] ?? []).map((post) => (
        <PostCard key={post.id} post={post} currentUserId={user?.id} />
      ))}
    </div>
  )
}
