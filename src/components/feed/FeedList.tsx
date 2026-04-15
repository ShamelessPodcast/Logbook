'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from './PostCard'
import { Spinner } from '@/components/ui/Spinner'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { PostWithAuthor } from '@/types/database'

const PAGE_SIZE = 20

interface FeedListProps {
  userId: string
}

export function FeedList({ userId }: FeedListProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const supabase = createClient()

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      const from = pageNum * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('posts')
        .select(
          `*, profiles(id, moniker, display_name, avatar_url, is_verified),
           vehicles(id, registration, make, model, year)`
        )
        .eq('is_deleted', false)
        .is('reply_to_id', null)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error(error)
        return
      }

      // Fetch like/repost status for current user
      const postIds = data.map((p) => p.id)
      const [{ data: likes }, { data: reposts }] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', postIds),
        supabase.from('reposts').select('post_id').eq('user_id', userId).in('post_id', postIds),
      ])

      const likedSet = new Set(likes?.map((l) => l.post_id) ?? [])
      const repostedSet = new Set(reposts?.map((r) => r.post_id) ?? [])

      const enriched = (data as PostWithAuthor[]).map((p) => ({
        ...p,
        liked_by_user: likedSet.has(p.id),
        reposted_by_user: repostedSet.has(p.id),
      }))

      if (pageNum === 0) {
        setPosts(enriched)
      } else {
        setPosts((prev) => [...prev, ...enriched])
      }

      setHasMore(data.length === PAGE_SIZE)
      setLoading(false)
    },
    [supabase, userId]
  )

  useEffect(() => {
    void fetchPosts(0)
  }, [fetchPosts])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    const next = page + 1
    setPage(next)
    void fetchPosts(next)
  }, [hasMore, loading, page, fetchPosts])

  const sentinelRef = useInfiniteScroll(loadMore, hasMore)

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">No posts yet. Follow some drivers to see their posts!</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={userId} onDelete={handleDelete} />
      ))}
      <div ref={sentinelRef} className="py-4 text-center">
        {hasMore ? <Spinner className="mx-auto" /> : null}
      </div>
    </div>
  )
}
