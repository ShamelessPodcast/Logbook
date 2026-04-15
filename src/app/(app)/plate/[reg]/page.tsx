import { createClient } from '@/lib/supabase/server'
import { UKPlate } from '@/components/ui/UKPlate'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { PostCard } from '@/components/feed/PostCard'
import { PlateLockButton } from '@/components/plate/PlateLockButton'
import { PlateFollowButton } from '@/components/plate/PlateFollowButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { PostWithAuthor } from '@/types/database'
import { fullDate } from '@/utils/format'
import { differenceInDays, parseISO } from 'date-fns'
import { ShieldCheck } from 'lucide-react'
import { normaliseReg, isValidUKPlate } from '@/utils/plate'

interface Props {
  params: Promise<{ reg: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reg } = await params
  return { title: `Plate ${decodeURIComponent(reg).toUpperCase()}` }
}

export default async function PlatePage({ params }: Props) {
  const { reg: rawReg } = await params
  const reg = normaliseReg(decodeURIComponent(rawReg))

  if (!isValidUKPlate(reg)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get vehicle for this plate
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, profiles(*)')
    .eq('registration', reg)
    .maybeSingle()

  // Active plate lock
  const { data: plateLock } = await supabase
    .from('plate_locks')
    .select('*, profiles(*)')
    .eq('registration', reg)
    .eq('status', 'active')
    .maybeSingle()

  // Posts tagged with this vehicle
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(id, moniker, display_name, avatar_url, is_verified), vehicles(id, registration, make, model, year)')
    .eq('is_deleted', false)
    .not('vehicle_id', 'is', null)

  const vehiclePosts = posts?.filter((p) => {
    const v = p.vehicles as { registration: string } | null
    return v?.registration === reg
  }) ?? []

  // Is current user following this plate
  const { data: plateFollowRow } = user
    ? await supabase
        .from('plate_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('registration', reg)
        .maybeSingle()
    : { data: null }

  const owner = vehicle?.profiles as { id: string; moniker: string; display_name: string | null; avatar_url: string | null; is_verified: boolean } | null
  const isOwner = user?.id === vehicle?.owner_id
  const isLocked = !!plateLock

  const motDays = vehicle?.mot_expiry ? differenceInDays(parseISO(vehicle.mot_expiry), new Date()) : null
  const taxDays = vehicle?.tax_due ? differenceInDays(parseISO(vehicle.tax_due), new Date()) : null

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Plate</h1>
      </div>

      <div className="px-4 pt-5 pb-4">
        {/* Plate display */}
        <div className="flex items-start justify-between">
          <div>
            <UKPlate registration={reg} size="lg" />
            {vehicle && (
              <p className="mt-2 text-lg font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model ?? ''}
              </p>
            )}
            {vehicle?.colour && (
              <p className="text-sm capitalize text-neutral-500">{vehicle.colour.toLowerCase()}</p>
            )}
          </div>

          {isLocked && (
            <Badge variant="verified">
              <ShieldCheck className="h-3 w-3" /> Verified owner
            </Badge>
          )}
        </div>

        {/* MOT / Tax */}
        {vehicle && (
          <div className="mt-3 flex flex-wrap gap-2">
            {vehicle.mot_expiry && (
              <Badge variant={motDays !== null && motDays < 0 ? 'danger' : motDays !== null && motDays <= 30 ? 'warning' : 'success'}>
                MOT: {fullDate(vehicle.mot_expiry)}
              </Badge>
            )}
            {vehicle.tax_due && (
              <Badge variant={taxDays !== null && taxDays < 0 ? 'danger' : taxDays !== null && taxDays <= 30 ? 'warning' : 'success'}>
                Tax due: {fullDate(vehicle.tax_due)}
              </Badge>
            )}
          </div>
        )}

        {/* Owner */}
        {owner && (
          <Link href={`/${owner.moniker}`} className="mt-4 flex items-center gap-3">
            <Avatar src={owner.avatar_url} alt={owner.display_name ?? owner.moniker} size="sm" />
            <div>
              <p className="flex items-center gap-1 text-sm font-medium">
                {owner.display_name ?? owner.moniker}
                {owner.is_verified && <ShieldCheck className="h-3.5 w-3.5 fill-black text-white" />}
              </p>
              <p className="text-xs text-neutral-500">@{owner.moniker}</p>
            </div>
          </Link>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {user && (
            <PlateFollowButton
              userId={user.id}
              registration={reg}
              initialFollowing={!!plateFollowRow}
            />
          )}

          {isOwner && !isLocked && vehicle && (
            <PlateLockButton vehicleId={vehicle.id} registration={reg} />
          )}

          {!isOwner && vehicle && user && (
            <Link
              href={`/messages?plate=${reg}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium hover:bg-neutral-50"
            >
              Contact owner
            </Link>
          )}

          {!vehicle && !isLocked && user && (
            <Link
              href={`/onboarding?reg=${reg}`}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              This is my car →
            </Link>
          )}
        </div>
      </div>

      {/* Posts */}
      {vehiclePosts.length > 0 && (
        <div className="border-t border-neutral-100">
          <h3 className="px-4 py-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Posts about this plate
          </h3>
          {(vehiclePosts as PostWithAuthor[]).map((p) => (
            <PostCard key={p.id} post={p} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </div>
  )
}
