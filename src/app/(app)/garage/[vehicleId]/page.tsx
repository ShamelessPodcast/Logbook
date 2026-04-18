import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import type { Vehicle } from '@/types/database'
import type { DVLAVehicle } from '@/lib/dvla'
import type { MOTVehicle } from '@/lib/mot'
import { mileageTrend, latestMileage } from '@/lib/mot'
import { UKPlate } from '@/components/ui/UKPlate'
import { Badge } from '@/components/ui/Badge'
import { MOTHistoryTimeline } from '@/components/garage/MOTHistoryTimeline'
import { differenceInDays, parseISO } from 'date-fns'
import { fullDate } from '@/utils/format'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, PenLine, ExternalLink } from 'lucide-react'

interface Props {
  params: Promise<{ vehicleId: string }>
}

function statusBadge(expiryDate: string | null, label: string) {
  if (!expiryDate) return <Badge variant="default">{label} unknown</Badge>
  const days = differenceInDays(parseISO(expiryDate), new Date())
  if (days < 0)   return <Badge variant="danger">{label} expired {fullDate(expiryDate)}</Badge>
  if (days <= 30) return <Badge variant="warning">{label} due {fullDate(expiryDate)}</Badge>
  return <Badge variant="success">{label} valid to {fullDate(expiryDate)}</Badge>
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <>
      <dt className="text-[--ink-subtle] text-sm">{label}</dt>
      <dd className="text-sm font-medium text-[--ink] capitalize">{value}</dd>
    </>
  )
}

export default async function VehicleDetailPage({ params }: Props) {
  const { vehicleId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vehicleRaw } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .eq('owner_id', user.id)
    .single()

  if (!vehicleRaw) notFound()
  const vehicle = vehicleRaw as Vehicle

  // Pull DVLA data from stored JSONB
  const dvla = vehicle.dvla_data as DVLAVehicle | null
  // Pull MOT history — may be in dvla_data or dedicated column
  const motHistory = (vehicleRaw as Record<string, unknown>).mot_history as MOTVehicle | null

  const trend   = motHistory ? mileageTrend(motHistory.motTests) : []
  const lastMot = motHistory ? latestMileage(motHistory.motTests) : null
  const totalTests = motHistory?.motTests.length ?? 0
  const passes = motHistory?.motTests.filter(t => t.testResult === 'PASSED').length ?? 0

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[--border] bg-white/90 px-4 py-3 backdrop-blur-sm">
        <Link href="/garage" className="rounded-full p-1.5 hover:bg-[--surface-raised] transition-colors">
          <ArrowLeft className="h-5 w-5 text-[--ink]" />
        </Link>
        <UKPlate registration={vehicle.registration} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-[--ink]">
            {vehicle.year} {vehicle.make} {vehicle.model ?? ''}
          </p>
        </div>
        <Link
          href={`/garage/${vehicleId}/edit`}
          className="flex items-center gap-1.5 rounded-full border border-[--border-strong] px-3 py-1.5 text-sm font-medium hover:bg-[--surface-raised] transition-colors"
        >
          <PenLine className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      {/* Cover image */}
      {vehicle.cover_image_url ? (
        <div className="relative aspect-video bg-[--surface-raised]">
          <Image src={vehicle.cover_image_url} alt={vehicle.registration} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex aspect-[3/1] items-center justify-center bg-gradient-to-b from-[--surface-raised] to-white">
          <span className="text-6xl opacity-30">🚗</span>
        </div>
      )}

      <div className="px-4 py-4 space-y-6">

        {/* Identity */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-[--ink]">
              {vehicle.year} {vehicle.make} {vehicle.model ?? ''}
            </h1>
            {vehicle.is_primary && <Badge variant="verified">Primary</Badge>}
          </div>
          {vehicle.nickname && (
            <p className="text-[--ink-subtle] text-sm mt-0.5">&ldquo;{vehicle.nickname}&rdquo;</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {statusBadge(vehicle.mot_expiry, 'MOT')}
            {statusBadge(vehicle.tax_due, 'Tax')}
          </div>
        </div>

        {/* Mileage stats (from MOT history) */}
        {lastMot && (
          <div className="rounded-xl border border-[--border] p-4 bg-[--surface-raised]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[--ink-subtle] mb-3">Recorded mileage</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-[--ink]">{lastMot.toLocaleString('en-GB')}</p>
                <p className="text-xs text-[--ink-subtle]">Last recorded</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[--ink]">{totalTests}</p>
                <p className="text-xs text-[--ink-subtle]">MOT tests</p>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{passes}/{totalTests}</p>
                <p className="text-xs text-[--ink-subtle]">Passes</p>
              </div>
            </div>
            {trend.length >= 2 && (
              <div className="mt-3 border-t border-[--border] pt-3">
                <p className="text-xs text-[--ink-subtle] mb-1">Mileage history</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {trend.slice(-5).map(pt => (
                    <div key={pt.date} className="text-xs">
                      <span className="text-[--ink-muted]">{new Date(pt.date).getFullYear()}</span>
                      <span className="ml-1 font-medium text-[--ink]">{pt.mileage.toLocaleString('en-GB')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vehicle spec */}
        {dvla && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[--ink-subtle] mb-3">Vehicle details</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl border border-[--border] p-4">
              <SpecRow label="Make"         value={dvla.make?.toLowerCase()} />
              <SpecRow label="Colour"       value={dvla.colour?.toLowerCase()} />
              <SpecRow label="Fuel type"    value={dvla.fuelType?.toLowerCase()} />
              <SpecRow label="Engine"       value={dvla.engineCapacity ? `${dvla.engineCapacity} cc` : null} />
              <SpecRow label="CO₂"          value={dvla.co2Emissions ? `${dvla.co2Emissions} g/km` : null} />
              <SpecRow label="Euro standard" value={dvla.euroStatus} />
              <SpecRow label="Wheelplan"    value={dvla.wheelplan?.toLowerCase()} />
              <SpecRow label="First reg."   value={dvla.monthOfFirstRegistration
                ? new Date(dvla.monthOfFirstRegistration).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                : null}
              />
              <SpecRow label="V5C issued"   value={dvla.dateOfLastV5CIssued
                ? new Date(dvla.dateOfLastV5CIssued).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                : null}
              />
              {dvla.markedForExport && (
                <>
                  <dt className="text-[--ink-subtle] text-sm">Export marker</dt>
                  <dd><Badge variant="warning">Marked for export</Badge></dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* MOT History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[--ink-subtle]">MOT history</p>
            <a
              href={`https://www.check-mot.service.gov.uk/?registration=${vehicle.registration}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              View on GOV.UK
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {motHistory ? (
            <MOTHistoryTimeline tests={motHistory.motTests} />
          ) : (
            <div className="rounded-xl border border-[--border] bg-[--surface-raised] p-4 text-sm text-[--ink-subtle]">
              <p className="font-medium text-[--ink] mb-1">MOT history not yet loaded</p>
              <p>DVSA MOT History API key required. Apply at{' '}
                <a
                  href="https://documentation.history.mot.api.gov.uk/mot-history-api/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 underline"
                >
                  documentation.history.mot.api.gov.uk
                </a>
              </p>
            </div>
          )}
        </div>

        {/* External links */}
        <div className="flex flex-wrap gap-2 pb-6">
          <a
            href={`https://www.check-mot.service.gov.uk/?registration=${vehicle.registration}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-[--border-strong] px-3 py-1.5 text-sm text-[--ink] hover:bg-[--surface-raised] transition-colors"
          >
            Check MOT (GOV.UK) <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={`https://vehicleenquiry.service.gov.uk/?RegistrationNumber=${vehicle.registration}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-[--border-strong] px-3 py-1.5 text-sm text-[--ink] hover:bg-[--surface-raised] transition-colors"
          >
            Check tax (GOV.UK) <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
