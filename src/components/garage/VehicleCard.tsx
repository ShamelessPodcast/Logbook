'use client'

import type { Vehicle } from '@/types/database'
import { UKPlate } from '@/components/ui/UKPlate'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { fullDate } from '@/utils/format'
import { differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'

interface VehicleCardProps {
  vehicle: Vehicle
}

function motStatus(expiryDate: string | null): { label: string; variant: 'success' | 'warning' | 'danger' | 'default' } {
  if (!expiryDate) return { label: 'MOT unknown', variant: 'default' }
  const days = differenceInDays(parseISO(expiryDate), new Date())
  if (days < 0) return { label: 'MOT expired', variant: 'danger' }
  if (days <= 30) return { label: `MOT due ${fullDate(expiryDate)}`, variant: 'warning' }
  return { label: `MOT valid to ${fullDate(expiryDate)}`, variant: 'success' }
}

function taxStatus(dueDate: string | null): { label: string; variant: 'success' | 'warning' | 'danger' | 'default' } {
  if (!dueDate) return { label: 'Tax unknown', variant: 'default' }
  const days = differenceInDays(parseISO(dueDate), new Date())
  if (days < 0) return { label: 'Tax expired', variant: 'danger' }
  if (days <= 30) return { label: `Tax due ${fullDate(dueDate)}`, variant: 'warning' }
  return { label: `Taxed to ${fullDate(dueDate)}`, variant: 'success' }
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const mot = motStatus(vehicle.mot_expiry)
  const tax = taxStatus(vehicle.tax_due)

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
      {/* Cover image */}
      {vehicle.cover_image_url ? (
        <div className="relative aspect-video bg-neutral-100">
          <Image
            src={vehicle.cover_image_url}
            alt={vehicle.registration}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-neutral-50">
          <span className="text-5xl text-neutral-300">🚗</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/plate/${vehicle.registration}`}>
              <UKPlate registration={vehicle.registration} />
            </Link>
            <p className="mt-1 text-sm font-medium">
              {vehicle.year} {vehicle.make} {vehicle.model ?? ''}
            </p>
            {vehicle.nickname && (
              <p className="text-sm text-neutral-500">&quot;{vehicle.nickname}&quot;</p>
            )}
          </div>
          {vehicle.is_primary && (
            <Badge variant="verified">Primary</Badge>
          )}
        </div>

        {/* MOT / Tax status */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={mot.variant}>{mot.label}</Badge>
          <Badge variant={tax.variant}>{tax.label}</Badge>
        </div>

        <div className="mt-3 flex gap-2">
          <Link href={`/garage/${vehicle.id}/edit`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">Edit</Button>
          </Link>
          <Link href={`/plate/${vehicle.registration}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full">View plate</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
