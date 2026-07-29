import type { Evidence, ProjectSource } from '../types'
import { pollGithubRepo } from './github'
import { pollUrl } from './url'

/**
 * A connector turns "somewhere a project lives" into "what happened there
 * recently". Connectors report facts only — no judgement. Deciding whether
 * eleven commits is good news is the Analyst's job, not a connector's.
 */

export interface SourceReading {
  source: string
  /** One-line summaries of what the connector found. */
  findings: string[]
  evidence: Evidence[]
  /** Most recent activity timestamp the connector could see, if any. */
  lastActivityAt: string | null
  error: string | null
}

export async function pollSource(source: ProjectSource): Promise<SourceReading> {
  const label = source.label ?? source.kind

  try {
    switch (source.kind) {
      case 'github_repo':
        return await pollGithubRepo(source)
      case 'url':
        return await pollUrl(source)
      case 'note':
      case 'manual':
        // Static context you've written down. It doesn't change on its own,
        // but the crew should see it every night.
        return {
          source: label,
          findings: [String(source.config.text ?? '(no text recorded)')],
          evidence: [],
          lastActivityAt: null,
          error: null,
        }
      default:
        return {
          source: label,
          findings: [],
          evidence: [],
          lastActivityAt: null,
          error: `Unknown source kind "${source.kind}"`,
        }
    }
  } catch (err) {
    return {
      source: label,
      findings: [],
      evidence: [],
      lastActivityAt: null,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/** Renders a set of readings into the block of text an agent actually reads. */
export function readingsToPrompt(readings: SourceReading[]): string {
  if (readings.length === 0) return 'No sources are configured for this project.'

  return readings
    .map((r) => {
      const lines: string[] = [`Source: ${r.source}`]
      if (r.error) lines.push(`  Could not be read: ${r.error}`)
      if (r.lastActivityAt) lines.push(`  Last activity: ${r.lastActivityAt}`)
      if (r.findings.length === 0 && !r.error) lines.push('  Nothing new.')
      for (const f of r.findings) lines.push(`  - ${f}`)
      return lines.join('\n')
    })
    .join('\n\n')
}
