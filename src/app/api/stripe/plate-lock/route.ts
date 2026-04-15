import { createClient } from '@/lib/supabase/server'
import { createPlateLockCheckout } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json() as { vehicleId?: string; registration?: string }
  const { vehicleId, registration } = body

  if (!vehicleId || !registration) {
    return NextResponse.json({ error: 'vehicleId and registration required' }, { status: 400 })
  }

  // Verify user owns this vehicle
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, owner_id, registration')
    .eq('id', vehicleId)
    .eq('owner_id', user.id)
    .single()

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  }

  // Check if already locked
  const { data: existing } = await supabase
    .from('plate_locks')
    .select('id')
    .eq('registration', registration)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'This plate is already locked' }, { status: 409 })
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings/plates`

  const session = await createPlateLockCheckout({
    userId: user.id,
    vehicleId,
    registration,
    returnUrl,
  })

  // Create pending plate lock record
  await supabase.from('plate_locks').insert({
    user_id: user.id,
    vehicle_id: vehicleId,
    registration: registration.toUpperCase(),
    stripe_session_id: session.id,
    status: 'pending',
  })

  return NextResponse.json({ url: session.url })
}
