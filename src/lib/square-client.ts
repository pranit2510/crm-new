import { SquareClient, SquareEnvironment, Square } from 'square'

export const square = new SquareClient({
  environment: process.env.NODE_ENV === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
  token: process.env.SQUARE_ACCESS_TOKEN!,
})

interface CreateLinkOptions {
  idempotencyKey?: string
  description: string
  amount: number           // cents
  clientName: string
  locationId: string
  currency?: Square.Currency
}

export async function createSquarePaymentLink(opts: CreateLinkOptions) {
  const { paymentLink } = await square.checkout.paymentLinks.create({
    idempotencyKey: opts.idempotencyKey ?? crypto.randomUUID(),
    description   : opts.description,
    quickPay: {
      locationId : opts.locationId,
      name       : opts.clientName,
      priceMoney : { amount: BigInt(opts.amount), currency: opts.currency ?? 'USD' },
    },
  })

  if (!paymentLink) {
    throw new Error('Failed to create Square payment link: paymentLink is undefined')
  }

  return {
    id: paymentLink.id,
    url: paymentLink.url,
    longUrl: paymentLink.longUrl,
    order_id: paymentLink.orderId, // <- return this for syncing
  }
}

export async function listSquarePayments() {
  const page = await square.payments.list({})

  const raw: any[] = Array.isArray((page as any).data)
    ? (page as any).data
    : (typeof (page as any).getItems === 'function'
        ? (page as any).getItems()
        : [])

  return raw.map(p => ({
    id          : p.id,
    status      : p.status,
    order_id    : p.orderId ?? p.order_id, // <- add order_id for matching
    amount_money: p.amountMoney ?? p.amount_money,
    created_at  : p.createdAt   ?? p.created_at,
    receipt_url : p.receiptUrl  ?? p.receipt_url,
  }))
}
