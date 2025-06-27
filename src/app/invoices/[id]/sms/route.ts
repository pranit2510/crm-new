/* ──────────────────────────────────────────────────────────────────── */
/*  /invoices/:id/sms  –  send invoice via SMS using Twilio API        */
/* ──────────────────────────────────────────────────────────────────── */
import { NextRequest, NextResponse }    from 'next/server';
import { cookies }                      from 'next/headers';
import { createServerComponentClient }  from '@supabase/auth-helpers-nextjs';

export async function POST(
  request: NextRequest,
  { params }: any
) {
  const supabase = createServerComponentClient({ cookies });
  const id = Number(params.id);

  type ClientRow = { name: string | null; phone: string | null };

  /* ── 1. fetch invoice + client ──────────────────────────────────── */
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      id,
      amount,
      due_date,
      payment_terms,
      notes,
      clients:client_id ( name, phone )
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

  if (!client?.phone)
    return NextResponse.json({ error: 'Client phone number missing' }, { status: 400 });

  /* ── 2. validate Twilio configuration ─────────────────────────────── */
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json({ 
      error: 'Twilio configuration missing. Please check environment variables.' 
    }, { status: 500 });
  }

  /* ── 3. send the SMS ───────────────────────────────────────────── */
  try {
    // Import Twilio dynamically to avoid bundling issues
    const twilio = require('twilio');
    const client_twilio = twilio(accountSid, authToken);

    // Format the message
    const message = `
Hi ${client.name || 'there'}! 

📄 Invoice from VoltFlow
💰 Amount: $${Number(invoice.amount).toFixed(2)}
📅 Invoice Date: ${new Date(invoice.due_date).toLocaleDateString()}
💳 ${invoice.payment_terms || 'Payment terms apply'}

${invoice.notes ? `📝 Note: ${invoice.notes}` : ''}

Thank you for your business!
- VoltFlow Team
    `.trim();

    // Send SMS
    const smsResponse = await client_twilio.messages.create({
      body: message,
      from: fromNumber,
      to: client.phone
    });

    console.log(`SMS sent successfully. SID: ${smsResponse.sid}`);

    /* ── 4. mark invoice status (optional - you may want to keep as draft/sent) ─── */
    // Note: We don't automatically change status for SMS like we do for email
    // since SMS is more of a notification than a formal delivery

    return NextResponse.json({ 
      ok: true, 
      messageSid: smsResponse.sid,
      to: client.phone 
    });

  } catch (err: any) {
    console.error('Twilio SMS error:', err);
    
    // Handle specific Twilio errors
    let errorMsg = 'Failed to send SMS';
    if (err.code === 21211) {
      errorMsg = 'Invalid phone number format';
    } else if (err.code === 21614) {
      errorMsg = 'Phone number is not a valid mobile number';
    } else if (err.message) {
      errorMsg = err.message;
    }

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 