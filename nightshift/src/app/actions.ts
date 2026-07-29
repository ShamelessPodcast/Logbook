'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE } from '@/lib/auth'
import { audit, db } from '@/lib/db'
import { env } from '@/lib/env'
import { findResumableRun, resumeRun, startRun } from '@/lib/orchestrator'
import type { SourceKind } from '@/lib/types'

/**
 * Everything the dashboard can change. All of it server-side, all of it
 * audited — a human approving an action leaves the same trail an agent
 * taking one does.
 */

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || `project-${Date.now().toString(36)}`
  )
}

export async function logIn(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  if (!env.dashboardPassword || password !== env.dashboardPassword) {
    redirect('/login?error=1')
  }
  cookies().set(SESSION_COOKIE, password, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  redirect('/')
}

export async function logOut() {
  cookies().delete(SESSION_COOKIE)
  redirect('/login')
}

export async function createProject(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return

  const goal = String(formData.get('goal') ?? '').trim()
  const summary = String(formData.get('summary') ?? '').trim()
  const priority = Number(formData.get('priority') ?? 3)

  const { data, error } = await db()
    .from('projects')
    .insert({
      slug: slugify(name),
      name,
      goal: goal || null,
      summary: summary || null,
      priority: Number.isInteger(priority) && priority >= 1 && priority <= 5 ? priority : 3,
    })
    .select('id, slug')
    .single()

  if (error) throw new Error(error.message)
  await audit('human', 'project.created', data.id, { name })

  revalidatePath('/projects')
  redirect(`/projects/${data.slug}`)
}

export async function addSource(formData: FormData) {
  const projectId = String(formData.get('project_id') ?? '')
  const slug = String(formData.get('slug') ?? '')
  const kind = String(formData.get('kind') ?? 'note') as SourceKind
  const value = String(formData.get('value') ?? '').trim()
  if (!projectId || !value) return

  const config =
    kind === 'github_repo'
      ? { repo: value }
      : kind === 'url'
        ? { url: value }
        : { text: value }

  await db().from('project_sources').insert({
    project_id: projectId,
    kind,
    label: value.slice(0, 120),
    config,
  })

  await audit('human', 'source.added', projectId, { kind, value })
  revalidatePath(`/projects/${slug}`)
}

export async function removeSource(formData: FormData) {
  const id = String(formData.get('source_id') ?? '')
  const slug = String(formData.get('slug') ?? '')
  if (!id) return
  await db().from('project_sources').delete().eq('id', id)
  await audit('human', 'source.removed', id)
  revalidatePath(`/projects/${slug}`)
}

export async function setProjectStatus(formData: FormData) {
  const id = String(formData.get('project_id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !['active', 'paused', 'archived'].includes(status)) return
  await db().from('projects').update({ status }).eq('id', id)
  await audit('human', 'project.status_changed', id, { status })
  revalidatePath('/projects')
  revalidatePath('/')
}

export async function answerDecision(formData: FormData) {
  const id = String(formData.get('decision_id') ?? '')
  const answer = String(formData.get('answer') ?? '').trim()
  if (!id || !answer) return

  await db()
    .from('decisions')
    .update({ status: 'answered', answer, answered_at: new Date().toISOString() })
    .eq('id', id)

  await audit('human', 'decision.answered', id, { answer })
  revalidatePath('/decisions')
  revalidatePath('/')
}

export async function dismissDecision(formData: FormData) {
  const id = String(formData.get('decision_id') ?? '')
  if (!id) return
  await db()
    .from('decisions')
    .update({ status: 'dismissed', answered_at: new Date().toISOString() })
    .eq('id', id)
  await audit('human', 'decision.dismissed', id)
  revalidatePath('/decisions')
  revalidatePath('/')
}

/**
 * Approving an action doesn't perform it here — it marks it approved so the
 * next run's Operator carries it out. Keeping execution in one place means
 * there is exactly one code path that changes a project, and it is audited.
 */
export async function approveAction(formData: FormData) {
  const id = String(formData.get('action_id') ?? '')
  if (!id) return
  await db().from('actions').update({ status: 'approved' }).eq('id', id)
  await audit('human', 'action.approved', id)
  revalidatePath('/')
  revalidatePath('/decisions')
}

export async function rejectAction(formData: FormData) {
  const id = String(formData.get('action_id') ?? '')
  if (!id) return
  await db().from('actions').update({ status: 'rejected' }).eq('id', id)
  await audit('human', 'action.rejected', id)
  revalidatePath('/')
  revalidatePath('/decisions')
}

/** Kick off a run by hand, or push an unfinished one along. */
export async function triggerRun() {
  const inFlight = await findResumableRun()
  const outcome = inFlight ? await resumeRun(inFlight) : await startRun('manual')
  revalidatePath('/')
  revalidatePath('/runs')
  redirect(`/runs/${outcome.runId}`)
}
