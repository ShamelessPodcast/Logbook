import { env } from '../env'
import type { Evidence, ProjectSource } from '../types'
import type { SourceReading } from './index'

/**
 * Reads a GitHub repository the way a project manager would glance at it:
 * what landed, what's waiting for review, what's been sitting open.
 *
 * Read-only. This connector never writes to GitHub.
 */

const API = 'https://api.github.com'

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'nightshift',
  }
  if (env.githubToken) h.Authorization = `Bearer ${env.githubToken}`
  return h
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers(), cache: 'no-store' })
  if (res.status === 404) {
    throw new Error('Repository not found, or the token cannot see it.')
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(`GitHub refused the request (${res.status}). Check GITHUB_TOKEN.`)
  }
  if (!res.ok) {
    throw new Error(`GitHub returned ${res.status}`)
  }
  return (await res.json()) as T
}

interface Commit {
  sha: string
  html_url: string
  commit: { message: string; author: { name: string; date: string } }
}

interface PullRequest {
  number: number
  title: string
  html_url: string
  draft: boolean
  created_at: string
  updated_at: string
  user: { login: string } | null
}

interface Issue {
  number: number
  title: string
  html_url: string
  created_at: string
  pull_request?: unknown
}

const LOOKBACK_DAYS = 7

export async function pollGithubRepo(source: ProjectSource): Promise<SourceReading> {
  const repo = String(source.config.repo ?? '').trim()
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error(`config.repo must look like "owner/name" (got "${repo}")`)
  }

  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString()
  const findings: string[] = []
  const evidence: Evidence[] = []
  let lastActivityAt: string | null = null

  const commits = await gh<Commit[]>(
    `/repos/${repo}/commits?since=${encodeURIComponent(since)}&per_page=30`,
  )

  if (commits.length === 0) {
    findings.push(`No commits in the last ${LOOKBACK_DAYS} days.`)
  } else {
    const authors = new Set(commits.map((c) => c.commit.author?.name).filter(Boolean))
    lastActivityAt = commits[0].commit.author?.date ?? null
    findings.push(
      `${commits.length} commit${commits.length === 1 ? '' : 's'} in the last ${LOOKBACK_DAYS} days` +
        (authors.size > 1 ? ` from ${authors.size} people.` : '.'),
    )
    for (const c of commits.slice(0, 5)) {
      const subject = c.commit.message.split('\n')[0]
      findings.push(`Commit: ${subject}`)
      evidence.push({ label: c.sha.slice(0, 7), value: subject, url: c.html_url })
    }
  }

  const pulls = await gh<PullRequest[]>(
    `/repos/${repo}/pulls?state=open&sort=updated&direction=desc&per_page=20`,
  )

  if (pulls.length > 0) {
    findings.push(`${pulls.length} open pull request${pulls.length === 1 ? '' : 's'}.`)
    for (const pr of pulls.slice(0, 8)) {
      const ageDays = Math.floor((Date.now() - Date.parse(pr.created_at)) / 86_400_000)
      findings.push(
        `PR #${pr.number} "${pr.title}"${pr.draft ? ' (draft)' : ''} — open ${ageDays} day${ageDays === 1 ? '' : 's'}.`,
      )
      evidence.push({ label: `PR #${pr.number}`, value: pr.title, url: pr.html_url })
      if (!lastActivityAt || pr.updated_at > lastActivityAt) lastActivityAt = pr.updated_at
    }
  }

  const issues = await gh<Issue[]>(
    `/repos/${repo}/issues?state=open&sort=created&direction=desc&per_page=20`,
  )
  // The issues endpoint returns PRs too; drop them so counts aren't doubled.
  const realIssues = issues.filter((i) => !i.pull_request)

  if (realIssues.length > 0) {
    findings.push(`${realIssues.length} open issue${realIssues.length === 1 ? '' : 's'}.`)
    for (const i of realIssues.slice(0, 5)) {
      evidence.push({ label: `Issue #${i.number}`, value: i.title, url: i.html_url })
    }
  }

  return { source: source.label ?? repo, findings, evidence, lastActivityAt, error: null }
}
