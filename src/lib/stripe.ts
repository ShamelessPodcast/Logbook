import Stripe from 'stripe'

export const PLATE_LOCK_PRICE_GBP = 999 // £9.99 in pence

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  })
}

export { getStripe }
export { getStripe as stripe }

/**
 * Create a Stripe Checkout session for plate locking.
 */
export async function createPlateLockCheckout({
  userId,
  vehicleId,
  registration,
  returnUrl,
}: {
  userId: string
  vehicleId: string
  registration: string
  returnUrl: string
}) {
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Plate Lock — ${registration.toUpperCase()}`,
            description: 'One-year verified ownership lock for your number plate on Logbook',
          },
          unit_amount: PLATE_LOCK_PRICE_GBP,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      vehicleId,
      registration: registration.toUpperCase(),
    },
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
  })

  return session
}
