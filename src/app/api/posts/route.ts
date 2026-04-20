import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Extract plate hashtags from post content, e.g. #GU22YNH → ["GU22YNH"]
function extractPlateTags(content: string): string[] {
  // Match #PLATE where plate is 2-8 alphanumeric chars (UK plate range)
  const matches = content.match(/#([A-Z0-9]{2,8})\b/gi) ?? []
  return Array.from(new Set(matches.map(m => m.slice(1).toUpperCase())))
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const {
    content,
    vehicle_id = null,
    reply_to_id = null,
    image_urls = null,
  } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  if (content.length > 500) {
    return NextResponse.json({ error: 'Post too long (max 500 chars)' }, { status: 400 })
  }

  // ── 1. Insert the post ──────────────────────────────────────────────────────
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: content.trim(),
      vehicle_id,
      reply_to_id,
      image_urls: image_urls && image_urls.length > 0 ? image_urls : null,
    })
    .select('id, content, author_id')
    .single()

  if (postError || !post) {
    console.error('[posts] insert error:', postError)
    return NextResponse.json({ error: postError?.message ?? 'Failed to create post' }, { status: 500 })
  }

  // ── 2. Plate-mention notifications ─────────────────────────────────────────
  const plateTags = extractPlateTags(post.content)

  if (plateTags.length > 0) {
    try {
      await dispatchPlateMentionNotifications({
        supabase,
        authorId: user.id,
        postId: post.id,
        plates: plateTags,
      })
    } catch (err) {
      // Non-fatal — post already created
      console.error('[posts] notification dispatch error:', err)
    }
  }

  return NextResponse.json({ post })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface DispatchArgs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  authorId: string
  postId: string
  plates: string[]
}

async function dispatchPlateMentionNotifications({ supabase, authorId, postId, plates }: DispatchArgs) {
  // Collect user IDs to notify (de-duped, excluding the post author)
  const notifySet = new Set<string>()

  for (const reg of plates) {
    // 1. Owner who has locked this plate
    const { data: locks } = await supabase
      .from('plate_locks')
      .select('user_id')
      .eq('registration', reg)
      .eq('status', 'active')

    for (const lock of locks ?? []) {
      if (lock.user_id !== authorId) notifySet.add(lock.user_id)
    }

    // 2. Anyone following this plate
    const { data: follows } = await supabase
      .from('plate_follows')
      .select('user_id')
      .eq('registration', reg)

    for (const follow of follows ?? []) {
      if (follow.user_id !== authorId) notifySet.add(follow.user_id)
    }
  }

  if (notifySet.size === 0) return

  const notifications = Array.from(notifySet).map(userId => ({
    user_id: userId,
    actor_id: authorId,
    type: 'plate_mention' as const,
    post_id: postId,
    message: `Your plate was mentioned in a post`,
  }))

  await supabase.from('notifications').insert(notifications)
}
