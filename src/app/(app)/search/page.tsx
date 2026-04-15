import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { UKPlate } from '@/components/ui/UKPlate'
import { PostCard } from '@/components/feed/PostCard'
import { isValidUKPlate, normaliseReg } from '@/utils/plate'
import type { Metadata } from 'next'
import type { PostWithAuthor } from '@/types/database'

export const metadata: Metadata = { title: 'Search' }

interface Props {
  searchParams: Promise<{ q?: string; tab?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', tab = 'all' } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const trimmed = q.trim()

  let profiles: { id: string; moniker: string; display_name: string | null; avatar_url: string | null }[] = []
  let posts: PostWithAuthor[] = []
  let plateReg: string | null = null

  if (trimmed) {
    // Check if query looks like a plate
    const normReg = normaliseReg(trimmed)
    if (isValidUKPlate(normReg)) plateReg = normReg

    if (tab === 'all' || tab === 'people') {
      const { data } = await supabase
        .from('profiles')
        .select('id, moniker, display_name, avatar_url')
        .or(`moniker.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
        .limit(20)
      profiles = data ?? []
    }

    if (tab === 'all' || tab === 'posts') {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(id, moniker, display_name, avatar_url, is_verified), vehicles(id, registration, make, model, year)')
        .ilike('content', `%${trimmed}%`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(20)
      posts = (data as PostWithAuthor[]) ?? []
    }
  }

  const tabs = ['all', 'people', 'posts', 'plates']

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="mb-3 text-lg font-bold">Search</h1>
        <form method="GET">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search people, posts, plates…"
            className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            autoComplete="off"
          />
        </form>
        {trimmed && (
          <div className="mt-3 flex gap-2">
            {tabs.map((t) => (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(trimmed)}&tab=${t}`}
                className={`rounded-full px-3 py-1 text-sm capitalize ${tab === t ? 'bg-black text-white font-medium' : 'text-neutral-500 hover:bg-neutral-100'}`}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {!trimmed && (
        <p className="py-16 text-center text-neutral-400">Search for people, posts or plates</p>
      )}

      {/* Plate result */}
      {plateReg && (tab === 'all' || tab === 'plates') && (
        <div className="border-b border-neutral-100 px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Plate</p>
          <Link href={`/plate/${plateReg}`} className="inline-flex items-center gap-3 hover:opacity-80">
            <UKPlate registration={plateReg} />
            <span className="text-sm text-neutral-500">View plate profile →</span>
          </Link>
        </div>
      )}

      {/* People */}
      {profiles.length > 0 && (tab === 'all' || tab === 'people') && (
        <div className="border-b border-neutral-100">
          {tab === 'all' && (
            <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              People
            </p>
          )}
          {profiles.map((p) => (
            <Link key={p.id} href={`/${p.moniker}`} className="feed-item flex gap-3 px-4 py-3">
              <Avatar src={p.avatar_url} alt={p.display_name ?? p.moniker} size="md" />
              <div>
                <p className="font-medium">{p.display_name ?? p.moniker}</p>
                <p className="text-sm text-neutral-500">@{p.moniker}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (tab === 'all' || tab === 'posts') && (
        <div>
          {tab === 'all' && (
            <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Posts
            </p>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </div>
  )
}
