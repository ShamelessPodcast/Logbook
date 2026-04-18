/**
 * Post content as synthetic users.
 *
 * Called by the Vercel cron job at /api/cron/synthetic-posts.
 * Can also be run manually:
 *   npx tsx scripts/post-as-synthetic.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'
import { POST_TEMPLATES } from './seed-synthetic-users'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function postAsSynthetic(postsPerRun = 5) {
  // Get all synthetic users with their primary vehicles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, moniker, primary_vehicle_id, vehicles!inner(id, registration, make, model, year)')
    .not('primary_vehicle_id', 'is', null)

  if (!profiles?.length) {
    console.log('No synthetic users found — run seed-synthetic-users.ts first')
    return
  }

  // Shuffle and pick N users for this run
  const shuffled = [...profiles].sort(() => Math.random() - 0.5)
  const chosen = shuffled.slice(0, postsPerRun)
  const results: string[] = []

  for (const profile of chosen) {
    const vehicles = (profile as Record<string, unknown>).vehicles as Array<{
      id: string; registration: string; make: string; model: string; year: number
    }>
    const vehicle = vehicles?.[0]
    if (!vehicle) continue

    // Pick a random template
    const template = POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)]
    const content = template(vehicle.make ?? 'the car', vehicle.model ?? 'it')

    const { error } = await supabase.from('posts').insert({
      author_id: profile.id,
      content,
      vehicle_id: vehicle.id,
    })

    if (!error) {
      results.push(`@${profile.moniker}: "${content.slice(0, 60)}..."`)
    }
  }

  return results
}

// Run directly
postAsSynthetic(5)
  .then((results) => {
    console.log(`\n✓ Posted ${results?.length ?? 0} times:\n`)
    results?.forEach(r => console.log(' ', r))
  })
  .catch(console.error)
