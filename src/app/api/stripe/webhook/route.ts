import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export const runtime = 'edge'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  const stripe = getStripe()

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid') {
      const { userId, registration } = session.metadata as {
        userId: string
        vehicleId: string
        registration: string
      }

      // Activate plate lock
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      await supabase
        .from('plate_locks')
        .update({
          status: 'active',
          stripe_payment_intent_id: session.payment_intent as string,
          locked_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('stripe_session_id', session.id)

      // Mark profile as verified
      await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId)

      console.warn(`Plate lock activated: ${registration} for user ${userId}`)
    }
  }

  return NextResponse.json({ received: true })
}
