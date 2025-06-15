/* ──────────────────────────────────────────────────────────────────── */
/*  /invoices/:id/send  –  e-mail an invoice via Nodemailer (SMTP)     */
/* ──────────────────────────────────────────────────────────────────── */
import { NextRequest, NextResponse }    from 'next/server';
import { cookies }                      from 'next/headers';
import { createServerComponentClient }  from '@supabase/auth-helpers-nextjs';
import nodemailer                       from 'nodemailer';
// import type { Database } from '@/lib/supabase';   // keep if you generated types

export async function POST(
  request: NextRequest,
  { params }: /* <- let TS infer; don't annotate */ any
) {
  const supabase = createServerComponentClient/*<Database>*/({ cookies });
  const id = Number(params.id);

  type ClientRow = { name: string | null; email: string | null };

  /* ── 1. fetch invoice + client ──────────────────────────────────── */
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      id,
      amount,
      due_date,
      payment_terms,
      notes,
      clients:client_id ( name, email )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (!invoice)
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const client: ClientRow | null =
    Array.isArray(invoice.clients)
      ? (invoice.clients[0] as ClientRow | undefined) ?? null
      : (invoice.clients as ClientRow | null);

  if (!client?.email)
    return NextResponse.json({ error: 'Client e-mail missing' }, { status: 400 });

  /* ── 2. send the e-mail ─────────────────────────────────────────── */
  try {
    const transporter = nodemailer.createTransport({
      host  : process.env.SMTP_HOST,
      port  : Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth  : { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from   : process.env.MAIL_FROM ?? `"VoltFlow" <${process.env.SMTP_USER}>`,
      to     : client.email,
      subject: `Invoice #${invoice.id} from VoltFlow`,
      html   : `
        <p>Hi ${client.name ?? 'there'},</p>
        <p>Please find your invoice below.</p>
        <p><strong>Amount:</strong> $${Number(invoice.amount).toFixed(2)}</p>
        <p><strong>Due:</strong> ${invoice.due_date}</p>
        <p><strong>Terms:</strong> ${invoice.payment_terms}</p>
        ${invoice.notes ? `<p><em>${invoice.notes}</em></p>` : ''}
        <p>Best regards,<br/>VoltFlow Team</p>
      `,
    });

    /* ── 3. mark invoice as “sent” ─────────────────────────────────── */
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('SMTP error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
