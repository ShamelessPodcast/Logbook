'use client'

import { Avatar } from '@/components/ui/Avatar'
import { UKPlate } from '@/components/ui/UKPlate'
import { timeAgo } from '@/utils/format'
import type { PostWithAuthor } from '@/types/database'
import { Heart, MessageCircle, MoreHorizontal, Repeat2, ShieldCheck, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

interface PostCardProps {
  post: PostWithAuthor
  currentUserId?: string
  onDelete?: (id: string) => void
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked_by_user ?? false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [reposted, setReposted] = useState(post.reposted_by_user ?? false)
  const [repostCount, setRepostCount] = useState(post.repost_count)
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createClient()

  const isOwn = currentUserId === post.author_id

  async function toggleLike() {
    if (!currentUserId) return
    const prev = liked
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)

    if (prev) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
      if (error) {
        setLiked(prev)
        setLikeCount(prev ? likeCount : likeCount - 1)
      }
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: currentUserId })
      if (error) {
        setLiked(prev)
        setLikeCount(prev ? likeCount : likeCount - 1)
      }
    }
  }

  async function toggleRepost() {
    if (!currentUserId) return
    const prev = reposted
    setReposted(!reposted)
    setRepostCount(reposted ? repostCount - 1 : repostCount + 1)

    if (prev) {
      await supabase
        .from('reposts')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
    } else {
      await supabase.from('reposts').insert({ post_id: post.id, user_id: currentUserId })
    }
  }

  async function handleDelete() {
    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', post.id)
    if (error) {
      toast.error('Could not delete post')
    } else {
      onDelete?.(post.id)
    }
    setShowMenu(false)
  }

  return (
    <article className="feed-item px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/${post.profiles.moniker}`} className="shrink-0">
          <Avatar
            src={post.profiles.avatar_url}
            alt={post.profiles.display_name ?? post.profiles.moniker}
            size="md"
          />
        </Link>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              <Link
                href={`/${post.profiles.moniker}`}
                className="truncate font-semibold hover:underline"
              >
                {post.profiles.display_name ?? post.profiles.moniker}
              </Link>
              {post.profiles.is_verified && (
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 fill-black text-white" />
              )}
              <span className="text-sm text-neutral-500">@{post.profiles.moniker}</span>
              <span className="text-neutral-300">·</span>
              <Link
                href={`/post/${post.id}`}
                className="text-sm text-neutral-500 hover:underline"
              >
                {timeAgo(post.created_at)}
              </Link>
            </div>

            {isOwn && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-7 z-10 w-40 rounded-xl border border-neutral-100 bg-white shadow-lg">
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vehicle tag */}
          {post.vehicles && (
            <Link href={`/plate/${post.vehicles.registration}`} className="mt-1 inline-block">
              <UKPlate registration={post.vehicles.registration} size="sm" />
            </Link>
          )}

          {/* Content */}
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>

          {/* Images */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div
              className={cn(
                'mt-3 grid gap-1 overflow-hidden rounded-xl',
                post.image_urls.length === 1 && 'grid-cols-1',
                post.image_urls.length === 2 && 'grid-cols-2',
                post.image_urls.length >= 3 && 'grid-cols-2'
              )}
            >
              {post.image_urls.slice(0, 4).map((url, i) => (
                <div key={i} className="relative aspect-video bg-neutral-100">
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-6">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
            >
              <MessageCircle className="h-4 w-4" />
              {post.reply_count > 0 && <span>{post.reply_count}</span>}
            </Link>

            <button
              onClick={toggleRepost}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors',
                reposted ? 'text-green-600' : 'text-neutral-500 hover:text-green-600'
              )}
            >
              <Repeat2 className="h-4 w-4" />
              {repostCount > 0 && <span>{repostCount}</span>}
            </button>

            <button
              onClick={toggleLike}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors',
                liked ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
