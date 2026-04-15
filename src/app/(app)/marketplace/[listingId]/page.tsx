import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { UKPlate } from '@/components/ui/UKPlate'
import { formatPricePounds, fullDate } from '@/utils/format'
import type { Metadata } from 'next'
import { MarkSoldButton } from '@/components/marketplace/MarkSoldButton'

interface Props {
  params: Promise<{ listingId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listingId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('listings').select('title').eq('id', listingId).single()
  return { title: data?.title ?? 'Listing' }
}

export default async function ListingPage({ params }: Props) {
  const { listingId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(id, moniker, display_name, avatar_url), vehicles(registration)')
    .eq('id', listingId)
    .single()

  if (!listing) notFound()

  // Increment view count
  await supabase
    .from('listings')
    .update({ view_count: listing.view_count + 1 })
    .eq('id', listingId)

  const seller = listing.profiles as { id: string; moniker: string; display_name: string | null; avatar_url: string | null } | null
  const vehicle = listing.vehicles as { registration: string } | null
  const isSeller = user?.id === seller?.id

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Listing</h1>
      </div>

      {/* Images */}
      {listing.image_urls && listing.image_urls.length > 0 && (
        <div className="relative aspect-video bg-neutral-100">
          <Image
            src={listing.image_urls[0]!}
            alt={listing.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{listing.title}</h2>
            <p className="mt-1 text-2xl font-black">{formatPricePounds(listing.price / 100)}</p>
          </div>
          <Badge variant={listing.status === 'sold' ? 'danger' : listing.status === 'active' ? 'success' : 'default'}>
            {listing.status}
          </Badge>
        </div>

        {vehicle && (
          <div className="mt-2">
            <UKPlate registration={vehicle.registration} size="sm" />
          </div>
        )}

        {listing.location && (
          <p className="mt-2 text-sm text-neutral-500">📍 {listing.location}</p>
        )}

        <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap">{listing.description}</p>

        <p className="mt-4 text-xs text-neutral-400">
          Listed {fullDate(listing.created_at)} · {listing.view_count} views
        </p>

        {/* Seller */}
        {seller && (
          <Link href={`/${seller.moniker}`} className="mt-4 flex items-center gap-3">
            <Avatar src={seller.avatar_url} alt={seller.display_name ?? seller.moniker} />
            <div>
              <p className="font-medium">{seller.display_name ?? seller.moniker}</p>
              <p className="text-sm text-neutral-500">@{seller.moniker}</p>
            </div>
          </Link>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          {isSeller ? (
            <MarkSoldButton listingId={listing.id} status={listing.status} />
          ) : user && seller && listing.status === 'active' ? (
            <Link href={`/messages?listing=${listing.id}`} className="flex-1">
              <Button className="w-full">Message seller</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
