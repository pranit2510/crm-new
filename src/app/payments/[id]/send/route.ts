import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest, { params }: any) {
  const supabase = createServerComponentClient({ cookies });
  const id = Number(params.id);

  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      description,
      payment_url,
      clients:client_id ( name, email )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

  const client = Array.isArray(payment.clients)
    ? payment.clients[0]
    : payment.clients;

  if (!client?.email) return NextResponse.json({ error: 'Client email missing' }, { status: 400 });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? `"VoltFlow" <${process.env.SMTP_USER}>`,
      to: client.email,
      subject: `Payment Request #${payment.id} from VoltFlow`,
      html: `
        <p>Hi ${client.name ?? 'there'},</p>
        <p>You have a pending payment request:</p>
        <p><strong>Amount:</strong> $${Number(payment.amount).toFixed(2)}</p>
        <p><strong>Description:</strong> ${payment.description}</p>
        <p><a href="${payment.payment_url}" target="_blank">Pay Now</a></p>
        <p>Thank you for your business.<br/>VoltFlow Team</p>
      `,
    });

    await supabase.from('payments').update({ status: 'sent' }).eq('id', id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Email error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
