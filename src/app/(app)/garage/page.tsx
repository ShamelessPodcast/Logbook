import { createClient } from '@/lib/supabase/server'
import { VehicleCard } from '@/components/garage/VehicleCard'
import { AddVehicleForm } from '@/components/garage/AddVehicleForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Garage' }

export default async function GaragePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('owner_id', user!.id)
    .order('is_primary', { ascending: false })

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">My Garage</h1>
      </div>

      <div className="p-4">
        {/* Vehicles grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {(vehicles ?? []).map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>

        {/* Add vehicle */}
        <div className="mt-6">
          <h2 className="mb-4 text-base font-semibold">Add a vehicle</h2>
          <AddVehicleForm />
        </div>
      </div>
    </div>
  )
}
