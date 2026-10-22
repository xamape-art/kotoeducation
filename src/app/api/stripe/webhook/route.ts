import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { fulfillOrder } from '@/lib/orders-server'

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!stripe || !secret || !signature) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
  } catch (err) {
    console.error('Invalid Stripe webhook signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object
    const orderId = session.metadata?.order_id
    if (orderId && session.payment_status === 'paid') {
      try {
        await fulfillOrder(orderId)
      } catch (err) {
        console.error('Error fulfilling order:', orderId, err)
        // Non-2xx makes Stripe retry later
        return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
