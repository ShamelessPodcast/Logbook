/**
 * Seeds a couple of example projects so a fresh install has something to
 * chew on. Safe to run more than once — it skips slugs that already exist.
 *
 *   npm run nightshift:seed
 */

import { db } from '../src/lib/db'
import { isConfigured } from '../src/lib/env'

interface Seed {
  slug: string
  name: string
  goal: string
  summary: string
  priority: number
  sources: Array<{ kind: 'github_repo' | 'url' | 'note'; value: string }>
}

const SEEDS: Seed[] = [
  {
    slug: 'logbook',
    name: 'Logbook',
    goal: 'Get to a live, used product — real signups posting real content, not synthetic filler.',
    summary:
      'UK car social network. Next.js on Vercel, Supabase behind it. Feature-complete; the open question is distribution.',
    priority: 1,
    sources: [
      { kind: 'github_repo', value: 'ShamelessPodcast/Logbook' },
      { kind: 'url', value: 'https://logbook-sable-one.vercel.app' },
    ],
  },
  {
    slug: 'nightshift',
    name: 'Nightshift',
    goal: 'Have the crew reliably produce a morning brief worth reading, every day, unattended.',
    summary:
      'This system. It manages itself as a project, which is a decent test of whether it works.',
    priority: 2,
    sources: [
      {
        kind: 'note',
        value:
          'Success looks like opening the dashboard and learning something you did not already know.',
      },
    ],
  },
]

async function main() {
  if (!isConfigured()) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
    process.exit(1)
  }

  for (const seed of SEEDS) {
    const { data: existing } = await db()
      .from('projects')
      .select('id')
      .eq('slug', seed.slug)
      .maybeSingle()

    if (existing) {
      console.log(`skip  ${seed.name} — already exists`)
      continue
    }

    const { data, error } = await db()
      .from('projects')
      .insert({
        slug: seed.slug,
        name: seed.name,
        goal: seed.goal,
        summary: seed.summary,
        priority: seed.priority,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error(`fail  ${seed.name} — ${error?.message}`)
      continue
    }

    await db()
      .from('project_sources')
      .insert(
        seed.sources.map((s) => ({
          project_id: data.id,
          kind: s.kind,
          label: s.value.slice(0, 120),
          config:
            s.kind === 'github_repo'
              ? { repo: s.value }
              : s.kind === 'url'
                ? { url: s.value }
                : { text: s.value },
        })),
      )

    console.log(`added ${seed.name} with ${seed.sources.length} sources`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
