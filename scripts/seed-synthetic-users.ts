/**
 * Seed synthetic UK car enthusiast users into Logbook.
 *
 * Run once:
 *   npx tsx scripts/seed-synthetic-users.ts
 *
 * Creates 20 realistic UK car enthusiast profiles, each with a vehicle.
 * Users are tagged with metadata so they can be identified as synthetic.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — bypasses RLS for seeding
)

// ─── Synthetic user profiles ─────────────────────────────────────────────────

const SYNTHETIC_USERS = [
  {
    moniker: 'boostedmk4',
    display_name: 'Jamie Boosted',
    bio: 'Golf R34 owner. Brap brap. North Wales weekends.',
    location: 'Manchester',
    reg: 'LK09ABC',
    make: 'VOLKSWAGEN', model: 'Golf R', year: 2009,
  },
  {
    moniker: 'trackdayteri',
    display_name: 'Teri Hargreaves',
    bio: 'Clio 197 Cup. Podium hunter. 🏁',
    location: 'Leeds',
    reg: 'HG58XYZ',
    make: 'RENAULT', model: 'Clio 197', year: 2008,
  },
  {
    moniker: 'classicbobuk',
    display_name: 'Bob Whitfield',
    bio: 'E30 resto project. Takes longer every year.',
    location: 'Sheffield',
    reg: 'D123EFG',
    make: 'BMW', model: '3 Series E30', year: 1987,
  },
  {
    moniker: 'electriceve99',
    display_name: 'Eve Chandra',
    bio: 'Model 3 Performance. Sorry not sorry.',
    location: 'London',
    reg: 'YK22EVE',
    make: 'TESLA', model: 'Model 3', year: 2022,
  },
  {
    moniker: 'soupedupsteve',
    display_name: 'Steve Malone',
    bio: 'Type R FK8. Stock looks, not stock power 🤫',
    location: 'Birmingham',
    reg: 'BX19CTR',
    make: 'HONDA', model: 'Civic Type R', year: 2019,
  },
  {
    moniker: 'liftbacklou',
    display_name: 'Louise Barton',
    bio: 'Octavia vRS. Family car by day, M-road annihilator by night.',
    location: 'Bristol',
    reg: 'GN20OVR',
    make: 'SKODA', model: 'Octavia vRS', year: 2020,
  },
  {
    moniker: 'scottishgreg',
    display_name: 'Greg McAllister',
    bio: 'Impreza WRX STI blobeye. Rain? Never heard of it.',
    location: 'Glasgow',
    reg: 'SG53WRX',
    make: 'SUBARU', model: 'Impreza WRX STI', year: 2003,
  },
  {
    moniker: 'newforestnik',
    display_name: 'Nik Pearson',
    bio: 'Defender 90 TDi. Mud is not a problem.',
    location: 'Southampton',
    reg: 'K456DEF',
    make: 'LAND ROVER', model: 'Defender 90', year: 1993,
  },
  {
    moniker: 'mk5golfgirl',
    display_name: 'Priya Sandhu',
    bio: 'GTI Edition 30. Sun roof, no problems.',
    location: 'Leicester',
    reg: 'WX07GTI',
    make: 'VOLKSWAGEN', model: 'Golf GTI', year: 2007,
  },
  {
    moniker: 'dieseldave77',
    display_name: 'Dave Whitmore',
    bio: '530d Touring. 700 miles to a tank 💪 Fight me.',
    location: 'York',
    reg: 'KP14BMW',
    make: 'BMW', model: '530d Touring', year: 2014,
  },
  {
    moniker: 'trackprep_tom',
    display_name: 'Tom Fieldhouse',
    bio: 'Elise S1 track prep. Roll cages and disappointment.',
    location: 'Coventry',
    reg: 'R789GHJ',
    make: 'LOTUS', model: 'Elise S1', year: 1998,
  },
  {
    moniker: 'vxr_vicky',
    display_name: 'Vicky Drummond',
    bio: 'Corsa VXR Nürburgring edition. Loud and proud.',
    location: 'Newcastle',
    reg: 'NP09VXR',
    make: 'VAUXHALL', model: 'Corsa VXR', year: 2009,
  },
  {
    moniker: 'hatchbackharry',
    display_name: 'Harry Baines',
    bio: 'Polo GTI. Proof good things come in small packages.',
    location: 'Nottingham',
    reg: 'LT17POL',
    make: 'VOLKSWAGEN', model: 'Polo GTI', year: 2017,
  },
  {
    moniker: 'classicamel',
    display_name: 'Amelia Ford',
    bio: 'MGB Roadster 1972 original paint. Weekends only.',
    location: 'Oxford',
    reg: 'LJB 972',
    make: 'MG', model: 'MGB Roadster', year: 1972,
  },
  {
    moniker: 'turbodan_sw',
    display_name: 'Dan Okafor',
    bio: 'FK2 Civic Type R mapped to the moon and back.',
    location: 'Swansea',
    reg: 'CN65CTR',
    make: 'HONDA', model: 'Civic Type R FK2', year: 2015,
  },
  {
    moniker: 'rossmotorsport',
    display_name: 'Ross Gallagher',
    bio: 'Ex-BTCC mechanic. Now just shout at my own car.',
    location: 'Edinburgh',
    reg: 'SF21RST',
    make: 'BMW', model: 'M3 Competition', year: 2021,
  },
  {
    moniker: 'puristpenny',
    display_name: 'Penny Halvorsen',
    bio: 'Boxster 986 manual. No mods. No regrets.',
    location: 'Cambridge',
    reg: 'X456POR',
    make: 'PORSCHE', model: 'Boxster 986', year: 2001,
  },
  {
    moniker: 'mod_list_mike',
    display_name: 'Mike Connell',
    bio: 'Fiesta ST150. Mod list longer than my CV.',
    location: 'Liverpool',
    reg: 'YD07FIE',
    make: 'FORD', model: 'Fiesta ST150', year: 2007,
  },
  {
    moniker: 'n54nadia',
    display_name: 'Nadia Kowalski',
    bio: '135i coupe. N54 engine. Wallet: crying.',
    location: 'Cardiff',
    reg: 'KX09BMW',
    make: 'BMW', model: '135i Coupe', year: 2009,
  },
  {
    moniker: 'rangey_rob',
    display_name: 'Rob Saunders',
    bio: 'Range Rover Sport SDV6. School run weapon.',
    location: 'Surrey',
    reg: 'SK16RRS',
    make: 'LAND ROVER', model: 'Range Rover Sport', year: 2016,
  },
]

// ─── Post content templates ───────────────────────────────────────────────────
// Each function gets the user's vehicle details injected

export const POST_TEMPLATES = [
  (make: string, model: string) => `Just got back from a Sunday run. The ${model} absolutely loved it today — no issues, just pure driving. Reminded me why I bought it. 🚗`,
  (_: string, model: string) => `MOT booked for next week. Fingers crossed for the ${model}. There's a slight knock from the front right I haven't investigated yet...`,
  (make: string, _: string) => `Insurance renewal came through. ${make} tax up again despite zero claims. Absolute joke. Anyone else getting hammered this year?`,
  (_: string, model: string) => `Finally found the rattle in the ${model}. Loose heat shield under the car. 20 min fix, 3 weeks of frustration. 😅`,
  (make: string, model: string) => `Bit of a detailing session on the ${make} ${model} this morning. Ceramic coat holding up well after 6 months.`,
  (_: string, model: string) => `Anyone running dashcams on a ${model}? Thinking of fitting a front+rear setup. Open to recommendations.`,
  (make: string, _: string) => `Picked up the ${make} from the garage. New rear tyres, brake fluid flush. Feels like a different car honestly.`,
  (_: string, model: string) => `The ${model} hit another milestone today. These things just don't want to die and I'm here for it.`,
  (make: string, model: string) => `Took the ${make} ${model} to a car meet last night. Some seriously tidy cars about — the community round here is class.`,
  (_: string, model: string) => `Warning light on the ${model} this morning. Scanned it: throttle body sensor. Not an emergency but not cheap either. The joys. 🔧`,
  (make: string, _: string) => `Question for ${make} owners: stock or aftermarket air filter? Debating whether it's actually worth it on a daily.`,
  (_: string, model: string) => `Track day prep on the ${model}: stripped the boot, checked pads, taped up the lights. Can't wait for Saturday.`,
  (make: string, model: string) => `Someone actually stopped me to ask about the ${make} ${model} today. Proper chuffed. It's the subtleties people notice.`,
  (_: string, model: string) => `The ${model} failed its MOT. Two advisories became actual failures — front ARB link and a weeping brake caliper. Time to get shopping.`,
  (make: string, _: string) => `Genuinely cannot believe how good modern ${make} interiors are now compared to 10 years ago. The quality is there.`,
  (_: string, model: string) => `6am, empty roads, ${model} on a B-road. This is the only therapy I need. 🌅`,
  (make: string, model: string) => `Monthly spend on the ${make} ${model}: fuel £180, insurance £65, wash £12. Still cheaper than a new car by miles.`,
  (_: string, model: string) => `The ${model} has been properly reliable this year. Touch wood and all that but no unexpected bills in 8 months. Rare for an old one.`,
  (make: string, _: string) => `${make} parts are getting stupid money on eBay now. What's going on? Anything decent gets snapped up in minutes.`,
  (_: string, model: string) => `Had the ${model} professionally mapped last week. Night and day difference — not just power, the throttle response is so much more linear now.`,
]

// ─── Main seeder ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding synthetic users...\n')

  for (const user of SYNTHETIC_USERS) {
    // 1. Create auth user with a deterministic password
    const email = `${user.moniker}@synthetic.logbook.app`
    const password = `Logbook2024!${user.moniker}`

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { moniker: user.moniker, synthetic: true },
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`  ↩ ${user.moniker} already exists — skipping`)
        continue
      }
      console.error(`  ✗ ${user.moniker}: ${authError.message}`)
      continue
    }

    const userId = authData.user.id

    // 2. Update the auto-created profile (handle_new_user trigger creates it)
    await new Promise(r => setTimeout(r, 300)) // brief wait for trigger

    await supabase
      .from('profiles')
      .update({
        display_name: user.display_name,
        bio: user.bio,
        location: user.location,
      })
      .eq('id', userId)

    // 3. Add their vehicle
    const { data: vehicle } = await supabase
      .from('vehicles')
      .insert({
        owner_id: userId,
        registration: user.reg.replace(/\s/g, '').toUpperCase(),
        make: user.make,
        model: user.model,
        year: user.year,
        is_primary: true,
      })
      .select()
      .single()

    if (vehicle) {
      await supabase.from('profiles').update({ primary_vehicle_id: vehicle.id }).eq('id', userId)
    }

    console.log(`  ✓ ${user.moniker} (${user.make} ${user.model})`)
  }

  console.log('\n✅ Synthetic users seeded. Run the cron to start generating posts.')
}

seed().catch(console.error)
