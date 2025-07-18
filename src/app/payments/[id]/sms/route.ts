import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Payment } from '@/lib/supabase-types'
  // if you generated types

export const dynamic = 'force-dynamic'     // fully dynamic route

export async function POST(
  req: NextRequest,
  { params }: any      // ✅ correct signature
) {
  /* 1 ▸ Supabase client (pass the cookies fn, no await) */

  /* 2 ▸ row lookup -------------------------------------------------- */
  const id = Number(params.id)
  const supabase = createServerComponentClient({ cookies })
  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      id, amount, description, payment_url,
      clients:client_id ( name, phone )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  if (!payment)
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  const client =
    Array.isArray(payment.clients) ? payment.clients[0] : payment.clients

  if (!client?.phone)
    return NextResponse.json({ error: 'Client phone missing' }, { status: 400 })

  /* 3 ▸ Twilio ------------------------------------------------------ */
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
    process.env
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER)
    return NextResponse.json(
      { error: 'Twilio env vars missing' },
      { status: 500 }
    )

  try {
    const twilio = require('twilio')
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    const sms = await twilioClient.messages.create({
      body: `
🔔 Payment request from VoltFlow
Client: ${client.name ?? '—'}
Amount: $${Number(payment.amount).toFixed(2)}
${payment.description ? `Note: ${payment.description}` : ''}
Pay now → ${payment.payment_url}
      `.trim(),
      from: TWILIO_PHONE_NUMBER,
      to: client.phone,
    })

    return NextResponse.json({ ok: true, messageSid: sms.sid })
  } catch (err: any) {
    console.error('[Twilio]', err)
    return NextResponse.json(
      { error: err.message ?? 'SMS failed' },
      { status: 500 }
    )
  }
}
