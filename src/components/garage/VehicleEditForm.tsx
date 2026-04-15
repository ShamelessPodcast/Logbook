'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createClient } from '@/lib/supabase/client'
import type { Vehicle } from '@/types/database'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface VehicleEditFormProps {
  vehicle: Vehicle
}

export function VehicleEditForm({ vehicle }: VehicleEditFormProps) {
  const [nickname, setNickname] = useState(vehicle.nickname ?? '')
  const [description, setDescription] = useState(vehicle.description ?? '')
  const [isPrimary, setIsPrimary] = useState(vehicle.is_primary)
  const [forSale, setForSale] = useState(vehicle.for_sale)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('vehicles')
      .update({ nickname, description, is_primary: isPrimary, for_sale: forSale })
      .eq('id', vehicle.id)

    if (error) {
      toast.error('Could not save changes')
    } else {
      if (isPrimary) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ primary_vehicle_id: vehicle.id })
            .eq('id', user.id)
        }
      }
      toast.success('Vehicle updated!')
      router.push('/garage')
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-neutral-50 p-4">
        <p className="text-sm font-medium text-neutral-500">Registration</p>
        <p className="font-mono text-xl font-bold tracking-widest">{vehicle.registration}</p>
        <p className="mt-1 text-sm text-neutral-600">
          {vehicle.year} {vehicle.make} {vehicle.model ?? ''}
        </p>
      </div>

      <Input
        label="Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="e.g. The Beast, Track Weapon"
        hint="Optional — shows on your garage grid"
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Tell us about this vehicle…"
        rows={4}
      />

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <span className="text-sm font-medium">Set as primary vehicle</span>
      </label>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={forSale}
          onChange={(e) => setForSale(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <span className="text-sm font-medium">Mark as for sale</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} loading={saving} className="flex-1">
          Save changes
        </Button>
        <Button variant="secondary" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}
