import { createClient } from '@/lib/supabase/server'
import { PostComposer } from '@/components/feed/PostComposer'
import { FeedList } from '@/components/feed/FeedList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Home' }

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('owner_id', user!.id)
    .order('is_primary', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Home</h1>
      </div>

      {/* Composer */}
      {profile && (
        <PostComposer profile={profile} vehicles={vehicles ?? []} />
      )}

      {/* Feed */}
      <FeedList userId={user!.id} />
    </div>
  )
}
