'use client'

import type { Vehicle } from '@/types/database'
import { UKPlate } from '@/components/ui/UKPlate'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { fullDate } from '@/utils/format'
import { differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

interface VehicleCardProps {
  vehicle: Vehicle
}

function motStatus(expiryDate: string | null) {
  if (!expiryDate) return { label: 'MOT unknown', variant: 'default' as const }
  const days = differenceInDays(parseISO(expiryDate), new Date())
  if (days < 0)   return { label: 'MOT expired', variant: 'danger' as const }
  if (days <= 30) return { label: `MOT due ${fullDate(expiryDate)}`, variant: 'warning' as const }
  return { label: `MOT valid to ${fullDate(expiryDate)}`, variant: 'success' as const }
}

function taxStatus(dueDate: string | null) {
  if (!dueDate) return { label: 'Tax unknown', variant: 'default' as const }
  const days = differenceInDays(parseISO(dueDate), new Date())
  if (days < 0)   return { label: 'Tax expired', variant: 'danger' as const }
  if (days <= 30) return { label: `Tax due ${fullDate(dueDate)}`, variant: 'warning' as const }
  return { label: `Taxed to ${fullDate(dueDate)}`, variant: 'success' as const }
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const mot = motStatus(vehicle.mot_expiry)
  const tax = taxStatus(vehicle.tax_due)

  return (
    <div className="overflow-hidden rounded-2xl border border-[--border] bg-white shadow-card">
      {/* Cover image */}
      <Link href={`/garage/${vehicle.id}`} className="block">
        {vehicle.cover_image_url ? (
          <div className="relative aspect-video bg-[--surface-raised]">
            <Image
              src={vehicle.cover_image_url}
              alt={vehicle.registration}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-gradient-to-b from-[--surface-raised] to-white">
            <span className="text-5xl opacity-20">🚗</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        {/* Plate + name row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/plate/${vehicle.registration}`}>
              <UKPlate registration={vehicle.registration} />
            </Link>
            <p className="mt-1 text-sm font-bold text-[--ink]">
              {vehicle.year} {vehicle.make} {vehicle.model ?? ''}
            </p>
            {vehicle.nickname && (
              <p className="text-xs text-[--ink-subtle]">&ldquo;{vehicle.nickname}&rdquo;</p>
            )}
          </div>
          {vehicle.is_primary && <Badge variant="verified">Primary</Badge>}
        </div>

        {/* MOT / Tax status */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant={mot.variant}>{mot.label}</Badge>
          <Badge variant={tax.variant}>{tax.label}</Badge>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Link href={`/garage/${vehicle.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full gap-1">
              Full history <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href={`/garage/${vehicle.id}/edit`}>
            <Button variant="ghost" size="sm">Edit</Button>
          </Link>
          <Link href={`/plate/${vehicle.registration}`}>
            <Button variant="ghost" size="sm">Plate</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
