import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@3'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)
const FROM = Deno.env.get('RESEND_FROM_EMAIL') ?? 'noreply@logbook.app'

Deno.serve(async () => {
  const today = new Date()
  const in30Days = new Date(today)
  in30Days.setDate(today.getDate() + 30)

  // Vehicles with MOT expiring in 25-30 days
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*, profiles(id, moniker, display_name, is_verified)')
    .gte('mot_expiry', today.toISOString().split('T')[0])
    .lte('mot_expiry', in30Days.toISOString().split('T')[0])

  if (error) {
    console.error('Failed to fetch vehicles:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let sent = 0
  let failed = 0

  for (const vehicle of vehicles ?? []) {
    const profile = vehicle.profiles as { id: string; moniker: string; display_name: string | null } | null
    if (!profile) continue

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
    const email = authUser?.user?.email
    if (!email) continue

    // Check if notification already sent this month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', profile.id)
      .eq('vehicle_id', vehicle.id)
      .eq('type', 'mot_reminder')
      .gte('created_at', monthStart)
      .maybeSingle()

    if (existing) continue

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `⚠️ MOT due soon — ${vehicle.registration}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
            <h2>Your MOT is due soon</h2>
            <p>Hi ${profile.display_name ?? profile.moniker},</p>
            <p>Your vehicle <strong>${vehicle.registration}</strong> (${vehicle.year ?? ''} ${vehicle.make ?? ''}) has its MOT expiring on <strong>${vehicle.mot_expiry}</strong>.</p>
            <p>Book your MOT now to stay legal on the road.</p>
            <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://logbook.app'}/garage"
               style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px">
              View my garage
            </a>
          </div>
        `,
      })

      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'mot_reminder',
        vehicle_id: vehicle.id,
        message: `MOT due ${vehicle.mot_expiry}`,
      })

      sent++
    } catch (e) {
      console.error(`Failed to send MOT reminder for ${vehicle.registration}:`, e)
      failed++
    }
  }

  return new Response(
    JSON.stringify({ sent, failed, total: (vehicles ?? []).length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
