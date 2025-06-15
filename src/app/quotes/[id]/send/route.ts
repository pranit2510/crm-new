/* -------------------------------------------------------------------- */
/*  src/app/quotes/[id]/send/route.ts                                   */
/*  – POST /quotes/:id/send  → sends the quote by e-mail via SMTP       */
/* -------------------------------------------------------------------- */
import { NextRequest, NextResponse }          from 'next/server'
import { cookies }                            from 'next/headers'
import { createServerComponentClient }        from '@supabase/auth-helpers-nextjs'
import nodemailer                             from 'nodemailer'
// import type { Database } from '@/lib/supabase'   // keep if you generated types

export async function POST (
  _req   : NextRequest,
  { params }: { params: { id: string } }
) {
  /* ── Supabase --------------------------------------------------------- */
  const supabase = createServerComponentClient/*<Database>*/({ cookies })
  const id       = Number(params.id)

  /* ── 1. load quote & its client -------------------------------------- */
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      id,
      amount,
      notes,
      client_id,
      clients:client_id ( id, name, email )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error)   return NextResponse.json({ error: error.message }, { status: 500 })
  if (!quote)  return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  const client = Array.isArray(quote.clients) ? quote.clients[0] : quote.clients
  if (!client?.email)
    return NextResponse.json({ error: 'Client e-mail missing' }, { status: 400 })

  /* ── 2. configure Nodemailer transport -------------------------------- */
  const transporter = nodemailer.createTransport({
    host  : process.env.SMTP_HOST!,
    port  : Number(process.env.SMTP_PORT!) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,   // true for 465 (SSL)
    auth  : {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  })

  /* ── 3. compose and send the mail ------------------------------------ */
  try {
    const info = await transporter.sendMail({
      from   : process.env.MAIL_FROM ?? process.env.SMTP_USER!,        // e.g. "VoltFlow <alex@gmail.com>"
      to     : client.email,                                          // recipient
      subject: `Quote #${quote.id} – VoltFlow`,
      html   : `
        <p>Hi ${client.name},</p>
        <p>Please find your quote below:</p>
        <p><strong>Amount:</strong> $${quote.amount.toFixed(2)}</p>
        ${quote.notes ? `<p><em>${quote.notes}</em></p>` : ''}
        <p>Best regards,<br/>VoltFlow Team</p>
      `,
    })

    console.log('✔️  SMTP message id:', info.messageId)

    /* ── 4. mark quote as “sent” --------------------------------------- */
    await supabase.from('quotes').update({ status: 'sent' }).eq('id', id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('❌ SMTP send error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
