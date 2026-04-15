import { createClient } from '@/lib/supabase/server'
import { VehicleEditForm } from '@/components/garage/VehicleEditForm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ vehicleId: string }>
}

export const metadata: Metadata = { title: 'Edit Vehicle' }

export default async function EditVehiclePage({ params }: Props) {
  const { vehicleId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .eq('owner_id', user!.id)
    .single()

  if (!vehicle) notFound()

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Edit Vehicle</h1>
      </div>
      <div className="p-4">
        <VehicleEditForm vehicle={vehicle} />
      </div>
    </div>
  )
}
