import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const {
    vehicle_id,
    category = 'mod',
    title,
    description,
    parts = [],
    parts_cost_pence = 0,
    labour_cost_pence = 0,
    hours_spent,
    mileage,
    difficulty,
    would_recommend,
    before_image_urls,
    after_image_urls,
  } = body

  if (!vehicle_id || !title) {
    return NextResponse.json({ error: 'vehicle_id and title are required' }, { status: 400 })
  }

  // Verify the vehicle belongs to this user
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, registration, make, model')
    .eq('id', vehicle_id)
    .eq('owner_id', user.id)
    .single()

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found or not owned by you' }, { status: 403 })
  }

  const { data: buildLog, error: logError } = await supabase
    .from('build_logs')
    .insert({
      author_id: user.id,
      vehicle_id,
      category,
      title,
      description: description || null,
      parts: parts.length > 0 ? parts : [],
      parts_cost_pence,
      labour_cost_pence,
      hours_spent: hours_spent ?? null,
      mileage: mileage ?? null,
      difficulty: difficulty ?? null,
      would_recommend: would_recommend ?? null,
      before_image_urls: before_image_urls || null,
      after_image_urls: after_image_urls || null,
    })
    .select()
    .single()

  if (logError) {
    console.error('[build-log] insert error:', logError)
    return NextResponse.json({ error: logError.message }, { status: 500 })
  }

  // Also create a feed post so the build log appears in the timeline
  const totalCost = parts_cost_pence + labour_cost_pence
  const costStr = totalCost > 0 ? ` Cost: £${(totalCost / 100).toFixed(2)}.` : ''
  const hoursStr = hours_spent ? ` Time: ${hours_spent}h.` : ''
  const postContent = `🔧 ${title}${description ? `\n\n${description}` : ''}${costStr}${hoursStr}`

  await supabase.from('posts').insert({
    author_id: user.id,
    content: postContent.slice(0, 2000),
    vehicle_id,
    post_type: 'build_log',
    build_log_data: { build_log_id: buildLog.id },
  })

  return NextResponse.json({ buildLog })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const vehicleId = searchParams.get('vehicle_id')

  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicle_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('build_logs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ buildLogs: data })
}
