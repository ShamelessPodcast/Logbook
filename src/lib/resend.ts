import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)
export const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@logbook.app'

export async function sendMotReminderEmail({
  to,
  name,
  registration,
  expiryDate,
}: {
  to: string
  name: string
  registration: string
  expiryDate: string
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ MOT due soon — ${registration}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="font-size:18px;font-weight:600">Your MOT is due soon</h2>
        <p>Hi ${name},</p>
        <p>Your vehicle <strong>${registration}</strong> has its MOT expiring on <strong>${expiryDate}</strong>.</p>
        <p>Don't forget to book your MOT to keep driving legally.</p>
        <p style="margin-top:24px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/garage"
             style="background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
            View my garage
          </a>
        </p>
        <p style="font-size:12px;color:#666;margin-top:24px">Logbook · UK's social network for car owners</p>
      </div>
    `,
  })
}

export async function sendTaxReminderEmail({
  to,
  name,
  registration,
  dueDate,
}: {
  to: string
  name: string
  registration: string
  dueDate: string
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Vehicle tax due soon — ${registration}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="font-size:18px;font-weight:600">Your vehicle tax is due soon</h2>
        <p>Hi ${name},</p>
        <p>Your vehicle <strong>${registration}</strong> has its tax due on <strong>${dueDate}</strong>.</p>
        <p>Renew your vehicle tax at GOV.UK to stay legal on the road.</p>
        <p style="margin-top:24px">
          <a href="https://www.gov.uk/vehicle-tax"
             style="background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
            Renew vehicle tax
          </a>
        </p>
        <p style="font-size:12px;color:#666;margin-top:24px">Logbook · UK's social network for car owners</p>
      </div>
    `,
  })
}
