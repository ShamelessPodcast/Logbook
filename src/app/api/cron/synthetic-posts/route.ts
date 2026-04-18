/**
 * POST /api/cron/synthetic-posts
 *
 * Vercel Cron Job — runs daily at 08:00, 13:00, and 19:00 UTC.
 * Picks 3-6 random synthetic users and posts on their behalf.
 * Protected by CRON_SECRET header.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Post content templates — injected with {make} and {model}
const TEMPLATES = [
  (make: string, model: string) => `Just back from a decent run in the ${model}. Roads were empty — exactly what you want. 🚗`,
  (_: string, model: string) => `MOT coming up for the ${model} next month. Hoping it's a clean pass — it's been reliable lately.`,
  (make: string, _: string) => `Insurance renewal from ${make} — another year, another rise. Anyone else feel like they're being punished for being a careful driver?`,
  (_: string, model: string) => `Finally tracked down that mystery rattle on the ${model}. Heat shield under the car. Classic.`,
  (make: string, model: string) => `Gave the ${make} ${model} a proper detail this morning. Ceramic coat still looking fresh.`,
  (_: string, model: string) => `Question for ${model} owners — stock or aftermarket filter? Worth it on a daily or just noise?`,
  (make: string, _: string) => `${make} back from the garage. New pads all round and a fluid flush. Feels like a completely different car.`,
  (_: string, model: string) => `The ${model} just clocked another milestone. Honestly these things are built to last.`,
  (make: string, model: string) => `Car meet last night — took the ${make} ${model}. Some seriously clean builds in the crowd.`,
  (_: string, model: string) => `Warning light on the ${model} this morning. Scanned it: O2 sensor. Not urgent but it's going in next week.`,
  (make: string, _: string) => `Shout out to everyone running a ${make} — you lot genuinely know your stuff. Best community on here.`,
  (_: string, model: string) => `Track day Saturday. ${model} prepped: fluids checked, pads checked, tape on the lights. Ready. 🏁`,
  (make: string, model: string) => `Someone recognised my ${make} ${model} at the petrol station today and we ended up talking cars for 20 mins. This hobby is unreal.`,
  (_: string, model: string) => `The ${model} failed today. Two advisories became proper failures. ARB link and a leaky caliper. Joy.`,
  (make: string, _: string) => `${make} interiors have come on a mile in the last decade. Sat in a new one yesterday — it's a proper quality car now.`,
  (_: string, model: string) => `6am, empty B-road, ${model} on full song. There's no better therapy. 🌅`,
  (make: string, model: string) => `Monthly ${make} ${model} expenses: fuel £190, insurance £58, wash £12. Still cheaper than PCP on something worse.`,
  (_: string, model: string) => `The ${model} has been rock solid this year. Zero unexpected bills. Genuinely remarkable for its age.`,
  (make: string, _: string) => `${make} parts on eBay are getting ridiculous. Anything decent gets snapped up in minutes.`,
  (_: string, model: string) => `Had the ${model} mapped last week. Not just more power — the whole throttle delivery is smoother. Proper improvement.`,
  (make: string, model: string) => `Spotted another ${make} ${model} on the motorway today — waved, they waved back. We just get it. 🤝`,
  (_: string, model: string) => `Bit of a scare with the ${model} — turned out to be a loose battery terminal. 10 second fix after 3 days of anxiety.`,
  (make: string, _: string) => `Shoutout to the ${make} owners club for sorting me out with a spare part. Didn't even have to ask twice.`,
  (_: string, model: string) => `The ${model} on a wet Welsh B-road is a religious experience. That's all.`,
  (make: string, model: string) => `Just ordered a new set of mats for the ${make} ${model}. Yes this is what weekend excitement looks like. No regrets.`,
]

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Get synthetic users that have vehicles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, moniker, primary_vehicle_id')
    .not('primary_vehicle_id', 'is', null)

  if (!profiles?.length) {
    return NextResponse.json({ posted: 0, message: 'No synthetic users found' })
  }

  // Pick 3–6 random users for this run
  const count = Math.floor(Math.random() * 4) + 3
  const chosen = [...profiles].sort(() => Math.random() - 0.5).slice(0, count)

  const posted: string[] = []

  for (const profile of chosen) {
    // Get their primary vehicle
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id, make, model, registration')
      .eq('id', profile.primary_vehicle_id!)
      .single()

    if (!vehicle) continue

    const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
    const content = template(vehicle.make ?? 'the car', vehicle.model ?? 'it')

    const { error } = await supabase.from('posts').insert({
      author_id: profile.id,
      content,
      vehicle_id: vehicle.id,
    })

    if (!error) {
      posted.push(`@${profile.moniker}`)
    }
  }

  console.log(`[synthetic-posts] Posted ${posted.length} times: ${posted.join(', ')}`)

  return NextResponse.json({
    posted: posted.length,
    users: posted,
    timestamp: new Date().toISOString(),
  })
}
