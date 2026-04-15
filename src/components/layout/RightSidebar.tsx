import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UKPlate } from '@/components/ui/UKPlate'

export async function RightSidebar() {
  const supabase = await createClient()

  // Top trending plates (most active vehicles)
  const { data: trending } = await supabase
    .from('vehicles')
    .select('registration, make, model, year, profiles(moniker)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Suggested users to follow
  const { data: suggested } = await supabase
    .from('profiles')
    .select('id, moniker, display_name, avatar_url, follower_count')
    .order('follower_count', { ascending: false })
    .limit(5)

  return (
    <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-6 overflow-y-auto py-4 pl-6 xl:flex">
      {/* Search */}
      <div>
        <Link
          href="/search"
          className="flex h-10 w-full items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-400 transition-colors hover:border-neutral-300 hover:bg-white"
        >
          Search Logbook…
        </Link>
      </div>

      {/* Trending plates */}
      {trending && trending.length > 0 && (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <h3 className="mb-3 text-sm font-bold">Trending plates</h3>
          <div className="flex flex-col gap-3">
            {trending.map((v) => (
              <Link
                key={v.registration}
                href={`/plate/${v.registration}`}
                className="flex items-center gap-3 rounded-lg transition-colors hover:bg-white"
              >
                <UKPlate registration={v.registration} size="sm" />
                <span className="text-sm text-neutral-600">
                  {v.make} {v.model}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Who to follow */}
      {suggested && suggested.length > 0 && (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <h3 className="mb-3 text-sm font-bold">Who to follow</h3>
          <div className="flex flex-col gap-3">
            {suggested.map((p) => (
              <Link
                key={p.id}
                href={`/${p.moniker}`}
                className="flex items-center gap-3 rounded-lg transition-colors hover:bg-white"
              >
                <div className="h-8 w-8 rounded-full bg-neutral-200" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.display_name ?? p.moniker}</p>
                  <p className="truncate text-xs text-neutral-500">@{p.moniker}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} Logbook · UK&apos;s social network for car owners
      </p>
    </aside>
  )
}
