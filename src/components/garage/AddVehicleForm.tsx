'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { isValidUKPlate, normaliseReg } from '@/utils/plate'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function AddVehicleForm() {
  const [reg, setReg] = useState('')
  const [regError, setRegError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAdd() {
    setRegError('')
    const normalised = normaliseReg(reg)
    if (!isValidUKPlate(normalised)) {
      setRegError('Enter a valid UK registration')
      return
    }

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Check for duplicate
    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('owner_id', user.id)
      .eq('registration', normalised)
      .maybeSingle()

    if (existing) {
      setRegError('This plate is already in your garage')
      setLoading(false)
      return
    }

    // DVLA lookup
    const res = await fetch(`/api/dvla?reg=${encodeURIComponent(normalised)}`)
    const json = await res.json() as { data?: Record<string, unknown>; error?: string }
    const dvlaData = json.data ?? null

    const { error } = await supabase.from('vehicles').insert({
      owner_id: user.id,
      registration: normalised,
      make: (dvlaData?.make as string | undefined) ?? null,
      year: (dvlaData?.yearOfManufacture as number | undefined) ?? null,
      colour: (dvlaData?.colour as string | undefined) ?? null,
      fuel_type: (dvlaData?.fuelType as string | undefined) ?? null,
      mot_expiry: (dvlaData?.motExpiryDate as string | undefined) ?? null,
      tax_due: (dvlaData?.taxDueDate as string | undefined) ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dvla_data: dvlaData as any,
      is_primary: false,
    })

    if (error) {
      toast.error('Could not add vehicle')
    } else {
      toast.success('Vehicle added to your garage!')
      setReg('')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Input
          value={reg}
          onChange={(e) => setReg(e.target.value.toUpperCase())}
          placeholder="e.g. AB12 CDE"
          error={regError}
          className="font-mono uppercase tracking-widest"
        />
      </div>
      <Button onClick={handleAdd} loading={loading}>
        Add
      </Button>
    </div>
  )
}
