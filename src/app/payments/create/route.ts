/* src/app/api/payments/create/route.ts */
import { NextRequest, NextResponse } from 'next/server'
import { createSquarePaymentLink }   from '@/lib/square-client'
import { createClient }              from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    /* 1 ▸ read payload ------------------------------------------------ */
    const { clientId, amountCents, description } = await req.json()
    if (!clientId || !amountCents) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    /* 2 ▸ lookup client ---------------------------------------------- */
    const supabase = await createClient()
    const { data: client, error: cErr } = await supabase
      .from('clients')
      .select('name')
      .eq('id', clientId)
      .maybeSingle()
    if (cErr) throw cErr
    if (!client)
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    /* 3 ▸ create Square link (cents) --------------------------------- */
    const link = await createSquarePaymentLink({
      clientName : client.name ?? 'Customer',
      amount     : amountCents,                                 // cents!
      description: description || `Payment for ${client.name}`,
      locationId : process.env.SQUARE_LOCATION_ID!,
    })

    /* 4 ▸ store draft payment (save dollars for reports) ------------- */
    const dollars = amountCents / 100
    const { data: payment, error: pErr } = await supabase
      .from('payments')
      .insert({
        client_id  : clientId,
        amount     : dollars,        // store dollars for easier reading
        description,
        status     : 'draft',
        payment_url: link.url,
        square_id  : link.id,
        order_id   : link.order_id ?? null,
      })
      .select()
      .single()
    if (pErr) throw pErr

    return NextResponse.json({ ok: true, payment })
  } catch (err: any) {
    console.error('[CreatePayment]', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
