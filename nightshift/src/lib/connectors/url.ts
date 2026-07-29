import type { ProjectSource } from '../types'
import type { SourceReading } from './index'

/**
 * Checks that something you've shipped is still up, and notices when the
 * page content changes.
 *
 * Deliberately shallow — this is a liveness signal, not a scraper. It
 * records a hash of the body so a later run can say "this changed" without
 * storing anyone's page content.
 */

const TIMEOUT_MS = 12_000
const MAX_BYTES = 400_000

async function hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function pollUrl(source: ProjectSource): Promise<SourceReading> {
  const url = String(source.config.url ?? '').trim()
  if (!/^https?:\/\//.test(url)) {
    throw new Error(`config.url must be an http(s) URL (got "${url}")`)
  }

  const label = source.label ?? url
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const startedAt = Date.now()

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'User-Agent': 'nightshift (uptime check)' },
    })
    const elapsed = Date.now() - startedAt
    const findings: string[] = [`HTTP ${res.status} in ${elapsed}ms.`]

    if (!res.ok) {
      findings.push(`The page is not returning a success status. This is worth someone looking at.`)
      return {
        source: label,
        findings,
        evidence: [{ label: 'URL', value: `HTTP ${res.status}`, url }],
        lastActivityAt: null,
        error: null,
      }
    }

    const body = (await res.text()).slice(0, MAX_BYTES)
    const fingerprint = await hash(body)
    const previous = source.config.fingerprint ? String(source.config.fingerprint) : null

    if (previous && previous !== fingerprint) {
      findings.push('The page content has changed since the last check.')
    } else if (previous) {
      findings.push('The page content is unchanged since the last check.')
    }

    const title = body.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim()
    if (title) findings.push(`Page title: ${title}`)

    return {
      source: label,
      findings,
      evidence: [{ label: 'URL', value: `HTTP ${res.status}`, url }],
      lastActivityAt: null,
      error: null,
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`No response within ${TIMEOUT_MS / 1000}s.`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
