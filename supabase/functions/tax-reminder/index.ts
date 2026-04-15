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

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*, profiles(id, moniker, display_name)')
    .gte('tax_due', today.toISOString().split('T')[0])
    .lte('tax_due', in30Days.toISOString().split('T')[0])

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let sent = 0

  for (const vehicle of vehicles ?? []) {
    const profile = vehicle.profiles as { id: string; moniker: string; display_name: string | null } | null
    if (!profile) continue

    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
    const email = authUser?.user?.email
    if (!email) continue

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', profile.id)
      .eq('vehicle_id', vehicle.id)
      .eq('type', 'tax_reminder')
      .gte('created_at', monthStart)
      .maybeSingle()

    if (existing) continue

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `⚠️ Vehicle tax due soon — ${vehicle.registration}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
            <h2>Your vehicle tax is due soon</h2>
            <p>Hi ${profile.display_name ?? profile.moniker},</p>
            <p>Vehicle <strong>${vehicle.registration}</strong> has tax due <strong>${vehicle.tax_due}</strong>.</p>
            <a href="https://www.gov.uk/vehicle-tax"
               style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:16px">
              Renew at GOV.UK
            </a>
          </div>
        `,
      })

      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'tax_reminder',
        vehicle_id: vehicle.id,
        message: `Vehicle tax due ${vehicle.tax_due}`,
      })

      sent++
    } catch (e) {
      console.error(`Failed to send tax reminder for ${vehicle.registration}:`, e)
    }
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
