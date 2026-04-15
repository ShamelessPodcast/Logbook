import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { formatPricePounds } from '@/utils/format'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Marketplace' }

export default async function MarketplacePage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(moniker, display_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Marketplace</h1>
        <Link href="/marketplace/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Sell
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
        {(listings ?? []).map((listing) => {
          const firstImage = listing.image_urls?.[0]
          const seller = listing.profiles as { moniker: string; display_name: string | null } | null
          return (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.id}`}
              className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-shadow hover:shadow-sm"
            >
              <div className="relative aspect-video bg-neutral-100">
                {firstImage ? (
                  <Image
                    src={firstImage}
                    alt={listing.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-neutral-300">
                    🔧
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-semibold">{listing.title}</p>
                <p className="mt-0.5 text-lg font-bold">{formatPricePounds(listing.price / 100)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{seller?.display_name ?? seller?.moniker}</span>
                  {listing.location && (
                    <span className="text-xs text-neutral-400">📍 {listing.location}</span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {(listings ?? []).length === 0 && (
        <p className="py-16 text-center text-neutral-500">No listings yet — be the first to sell!</p>
      )}
    </div>
  )
}
