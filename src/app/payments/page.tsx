import { createClient } from '@/lib/supabase-server'
import PaymentsPageContent from './PaymentsPageContent'
import { createSquarePaymentLink, listSquarePayments } from '@/lib/square-client'

export const revalidate = 0

// src/app/payments/page.tsx
export default async function PaymentsPage() {
  const supabase = await createClient()

  // 1 ▸ fetch rows
  const { data, error } = await supabase
    .from('payments')
    .select(`*, clients:client_id(id,name,email,phone)`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Payments] Supabase error', error)
    return <div>Error loading payments</div>
  }

  const payments: any[] = data ?? []

  const enriched = await Promise.all(
    payments.map(async p => {
      if (!p.payment_url && p.status === 'draft') {
        try {
          const link = await createSquarePaymentLink({
            description : p.description || `Payment #${p.id}`,
            amount      : p.amount,
            clientName  : p.clients?.name || 'Payment',
            locationId  : process.env.SQUARE_LOCATION_ID!,
          })

          if (link?.url) {
            await supabase
              .from('payments')
              .update({ 
                payment_url: link.url, 
                square_id: link.id,
                order_id: link.order_id // <- make sure `order_id` is returned from Square client
              })
              .eq('id', p.id)

            p.payment_url = link.url
            p.square_id = link.id
            p.order_id = link.order_id
          }
        } catch (err) {
          console.error('Square link creation failed', err)
        }
      }
      return p
    })
  )

  let squarePayments: any[] = []
  try {
    squarePayments = await listSquarePayments()
  } catch (e) {
    console.error('[Square] listPayments failed', e)
  }

  await Promise.all(
    squarePayments.map(async sp => {
      if (sp.status === 'COMPLETED') {
        await supabase
          .from('payments')
          .update({ status: 'paid' })
          .eq('order_id', sp.order_id) // <- key change here
      }
    })
  )

  return <PaymentsPageContent initialPayments={enriched} squarePayments={squarePayments} />
}
