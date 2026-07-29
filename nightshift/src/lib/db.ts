import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

let cached: SupabaseClient | null = null

/**
 * Service-role client. Server-side only — this key bypasses RLS, so it must
 * never reach the browser. Every caller in this codebase is a server
 * component, a route handler or a script.
 */
export function db(): SupabaseClient {
  if (cached) return cached
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new Error(
      'Nightshift is not connected to a database. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }
  cached = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

/** Append-only record of anything consequential. Never throws. */
export async function audit(
  actor: string,
  action: string,
  target?: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db().from('audit_log').insert({ actor, action, target: target ?? null, detail })
  } catch (err) {
    // An audit failure must not take down the run it is auditing.
    console.error('[audit] failed to write', action, err)
  }
}
