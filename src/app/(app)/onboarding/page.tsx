'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { isValidUKPlate, normaliseReg } from '@/utils/plate'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [reg, setReg] = useState('')
  const [regError, setRegError] = useState('')
  const [dvlaData, setDvlaData] = useState<Record<string, unknown> | null>(null)
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
    const res = await fetch(`/api/dvla?reg=${encodeURIComponent(normalised)}`)
    const json = await res.json() as { data?: Record<string, unknown>; error?: string }
    setLookupLoading(false)

    if (json.error) {
      setRegError(json.error as string)
      return
    }

    setDvlaData(json.data ?? null)
    setStep(2)
  }

  async function addVehicle() {
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const normalised = normaliseReg(reg)

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        owner_id: user.id,
        registration: normalised,
        make: (dvlaData?.make as string | undefined) ?? null,
        model: null,
        year: (dvlaData?.yearOfManufacture as number | undefined) ?? null,
        colour: (dvlaData?.colour as string | undefined) ?? null,
        fuel_type: (dvlaData?.fuelType as string | undefined) ?? null,
        mot_expiry: (dvlaData?.motExpiryDate as string | undefined) ?? null,
        tax_due: (dvlaData?.taxDueDate as string | undefined) ?? null,
        dvla_data: dvlaData,
        is_primary: true,
      })
      .select()
      .single()

    if (error) {
      toast.error('Could not add vehicle. It may already be in your garage.')
      setSaving(false)
      return
    }

    // Set as primary vehicle
    await supabase
      .from('profiles')
      .update({ primary_vehicle_id: vehicle.id })
      .eq('id', user.id)

    toast.success('Vehicle added!')
    router.push('/feed')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Welcome to Logbook</h1>
          <p className="mt-1 text-neutral-500">Let&apos;s add your first vehicle</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Input
                label="Your number plate"
                value={reg}
                onChange={(e) => setReg(e.target.value.toUpperCase())}
                placeholder="e.g. AB12 CDE"
                error={regError}
                hint="We'll look it up on the DVLA database"
                className="font-mono text-lg uppercase tracking-widest"
              />
              <Button onClick={lookupPlate} loading={lookupLoading} className="w-full">
                Look up plate
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/feed')}
                className="w-full text-neutral-500"
              >
                Skip for now
              </Button>
            </div>
          )}

          {step === 2 && dvlaData && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-neutral-50 p-4">
                <h3 className="mb-3 font-semibold">Vehicle found</h3>
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-neutral-500">Make</dt>
                  <dd className="font-medium">{(dvlaData.make as string | undefined) ?? '—'}</dd>
                  <dt className="text-neutral-500">Year</dt>
                  <dd className="font-medium">{(dvlaData.yearOfManufacture as number | undefined) ?? '—'}</dd>
                  <dt className="text-neutral-500">Colour</dt>
                  <dd className="font-medium capitalize">{((dvlaData.colour as string | undefined) ?? '—').toLowerCase()}</dd>
                  <dt className="text-neutral-500">Fuel</dt>
                  <dd className="font-medium capitalize">{((dvlaData.fuelType as string | undefined) ?? '—').toLowerCase()}</dd>
                  <dt className="text-neutral-500">MOT</dt>
                  <dd className="font-medium">{(dvlaData.motExpiryDate as string | undefined) ?? '—'}</dd>
                  <dt className="text-neutral-500">Tax due</dt>
                  <dd className="font-medium">{(dvlaData.taxDueDate as string | undefined) ?? '—'}</dd>
                </dl>
              </div>

              <Button onClick={addVehicle} loading={saving} className="w-full">
                Add this vehicle
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
