'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { UKPlate } from '@/components/ui/UKPlate'
import { createClient } from '@/lib/supabase/client'
import { isValidUKPlate, normaliseReg } from '@/utils/plate'
import type { DVLAVehicle } from '@/lib/dvla'
import type { MOTVehicle } from '@/lib/mot'
import { mileageTrend } from '@/lib/mot'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface VehiclePayload {
  dvla: DVLAVehicle | null
  mot: MOTVehicle | null
}

function motStatusBadge(expiryDate?: string) {
  if (!expiryDate) return <Badge variant="default">MOT unknown</Badge>
  const days = differenceInDays(parseISO(expiryDate), new Date())
  if (days < 0)   return <Badge variant="danger">MOT expired</Badge>
  if (days <= 30) return <Badge variant="warning">MOT due soon</Badge>
  return <Badge variant="success">MOT valid</Badge>
}

function taxStatusBadge(dueDate?: string) {
  if (!dueDate) return <Badge variant="default">Tax unknown</Badge>
  const days = differenceInDays(parseISO(dueDate), new Date())
  if (days < 0)   return <Badge variant="danger">Untaxed</Badge>
  if (days <= 30) return <Badge variant="warning">Tax due soon</Badge>
  return <Badge variant="success">Taxed</Badge>
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [reg, setReg] = useState('')
  const [regError, setRegError] = useState('')
  const [payload, setPayload] = useState<VehiclePayload | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function lookupPlate() {
    setRegError('')
    const normalised = normaliseReg(reg)
    if (!isValidUKPlate(normalised)) {
      setRegError('Enter a valid UK registration')
      return
    }

    setLookupLoading(true)
    const res = await fetch(`/api/vehicle?reg=${encodeURIComponent(normalised)}`)
    const json = await res.json() as { dvla?: DVLAVehicle; mot?: MOTVehicle; error?: string }
    setLookupLoading(false)

    if (json.error) {
      setRegError(json.error)
      return
    }

    setPayload({ dvla: json.dvla ?? null, mot: json.mot ?? null })
    setStep(2)
  }

  async function addVehicle() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const normalised = normaliseReg(reg)
    const dvla = payload?.dvla
    const mot  = payload?.mot

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        owner_id:   user.id,
        registration: normalised,
        make:       dvla?.make ?? mot?.make ?? null,
        model:      mot?.model ?? null,
        year:       dvla?.yearOfManufacture ?? null,
        colour:     dvla?.colour ?? mot?.primaryColour ?? null,
        fuel_type:  dvla?.fuelType ?? mot?.fuelType ?? null,
        engine_size: dvla?.engineCapacity ? String(dvla.engineCapacity) : mot?.engineSize ?? null,
        mot_expiry: dvla?.motExpiryDate ?? null,
        tax_due:    dvla?.taxDueDate ?? null,
        dvla_data:  (dvla ?? null) as unknown as never,
        is_primary: true,
      })
      .select()
      .single()

    if (error) {
      toast.error('Could not add vehicle. It may already be in your garage.')
      setSaving(false)
      return
    }

    // Store MOT history separately if we have it
    if (mot && vehicle) {
      await supabase
        .from('vehicles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ mot_history: mot as any })
        .eq('id', vehicle.id)
    }

    await supabase.from('profiles').update({ primary_vehicle_id: vehicle.id }).eq('id', user.id)

    toast.success('Vehicle added to your garage!')
    router.push('/garage')
  }

  const dvla = payload?.dvla
  const mot  = payload?.mot
  const trend = mot ? mileageTrend(mot.motTests) : []
  const lastMileage = trend.length ? trend[trend.length - 1].mileage : null
  const passes = mot ? mot.motTests.filter(t => t.testResult === 'PASSED').length : 0
  const fails  = mot ? mot.motTests.filter(t => t.testResult === 'FAILED').length : 0

  const latestAdvisories = mot?.motTests
    .sort((a, b) => b.completedDate.localeCompare(a.completedDate))[0]
    ?.rfrAndComments.filter(d => d.type === 'ADVISORY') ?? []

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[--surface-raised] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white font-black text-2xl">
            L
          </div>
          <h1 className="text-2xl font-black text-[--ink]">
            {step === 1 ? 'Add your first car' : 'Is this your car?'}
          </h1>
          <p className="mt-1 text-[--ink-subtle] text-sm">
            {step === 1
              ? 'Enter your plate — we\'ll pull everything from official UK records'
              : 'Confirm the details before adding to your garage'
            }
          </p>
        </div>

        <div className="rounded-2xl border border-[--border] bg-white p-6 shadow-card">

          {/* ── Step 1: Plate input ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Input
                label="Number plate"
                value={reg}
                onChange={(e) => setReg(e.target.value.toUpperCase())}
                placeholder="e.g. AB12 CDE"
                error={regError}
                hint="We check DVLA + DVSA MOT records"
                className="font-mono text-lg uppercase tracking-widest text-center"
              />
              <Button onClick={lookupPlate} loading={lookupLoading} className="w-full">
                Look up plate
              </Button>
              <Button variant="ghost" onClick={() => router.push('/feed')} className="w-full text-[--ink-subtle]">
                Skip for now
              </Button>
            </div>
          )}

          {/* ── Step 2: Confirm ── */}
          {step === 2 && payload && (
            <div className="flex flex-col gap-5">

              {/* Plate + name */}
              <div className="flex flex-col items-center gap-2 py-2">
                <UKPlate registration={reg} size="lg" />
                {(dvla?.make || mot?.make) && (
                  <p className="text-lg font-bold text-[--ink]">
                    {dvla?.yearOfManufacture} {dvla?.make ?? mot?.make} {mot?.model ?? ''}
                  </p>
                )}
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap justify-center gap-2">
                {motStatusBadge(dvla?.motExpiryDate)}
                {taxStatusBadge(dvla?.taxDueDate)}
              </div>

              {/* Key stats from DVLA */}
              {dvla && (
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-[--surface-raised] p-3">
                  {[
                    ['Colour',  dvla.colour?.toLowerCase()],
                    ['Fuel',    dvla.fuelType?.toLowerCase()],
                    ['Engine',  dvla.engineCapacity ? `${dvla.engineCapacity} cc` : null],
                    ['CO₂',     dvla.co2Emissions ? `${dvla.co2Emissions} g/km` : null],
                    ['Euro',    dvla.euroStatus],
                    ['V5C',     dvla.dateOfLastV5CIssued
                      ? new Date(dvla.dateOfLastV5CIssued).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                      : null],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-xs text-[--ink-subtle]">{label}</p>
                      <p className="text-sm font-semibold text-[--ink] capitalize">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* MOT history snapshot */}
              {mot && mot.motTests.length > 0 && (
                <div className="rounded-xl border border-[--border] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[--ink-subtle]">
                    MOT history — {mot.motTests.length} tests
                  </p>
                  <div className="flex gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold">{passes}</span>
                      <span className="text-[--ink-subtle]">passes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{fails}</span>
                      <span className="text-[--ink-subtle]">fails</span>
                    </div>
                    {lastMileage && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-semibold">{lastMileage.toLocaleString('en-GB')}</span>
                        <span className="text-[--ink-subtle]">mi recorded</span>
                      </div>
                    )}
                  </div>

                  {/* Latest advisories */}
                  {latestAdvisories.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-[--ink-subtle] mb-1">Latest advisories</p>
                      {latestAdvisories.slice(0, 3).map((a, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                          <span className="text-[--ink]">{a.text}</span>
                        </div>
                      ))}
                      {latestAdvisories.length > 3 && (
                        <p className="text-xs text-[--ink-subtle]">+{latestAdvisories.length - 3} more advisories</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* No API keys yet — graceful message */}
              {!dvla && !mot && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
                  Could not pull official data right now — you can still add the plate and update details later.
                </div>
              )}

              <Button onClick={addVehicle} loading={saving} className="w-full">
                Add to my garage
              </Button>
              <Button variant="secondary" onClick={() => setStep(1)} className="w-full">
                Try a different plate
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
