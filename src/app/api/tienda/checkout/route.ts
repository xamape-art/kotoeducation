import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getShopAccess } from '@/lib/shop-server'
import { getStripe } from '@/lib/stripe'
import { calcShipping, itemDetails } from '@/lib/shop'
import type { OrderItem, Product } from '@/types'

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        color: z.string().max(40).nullable(),
        measurement: z.string().max(40).nullable(),
        engraving: z.string().max(80).nullable(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1)
    .max(20),
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(30).optional().default(''),
    address: z.string().trim().min(3).max(200),
    postal_code: z.string().trim().regex(/^\d{5}$/),
    city: z.string().trim().min(2).max(80),
    province: z.string().trim().min(2).max(80),
    notes: z.string().trim().max(500).optional().default(''),
  }),
})

export async function POST(request: Request) {
  const { settings, canView } = await getShopAccess()
  if (!canView) {
    return NextResponse.json({ error: 'La tienda no está disponible.' }, { status: 404 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Los pagos todavía no están configurados.' }, { status: 503 })
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 })
  }
  const { items: requested, customer } = parsed.data

  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', [...new Set(requested.map((i) => i.product_id))])
    .eq('active', true)

  // Prices always come from the database, never from the browser
  const items: OrderItem[] = []
  for (const r of requested) {
    const product = (products as Product[] | null)?.find((p) => p.id === r.product_id)
    if (!product) {
      return NextResponse.json({ error: 'Algún producto ya no está disponible.' }, { status: 400 })
    }
    const color = r.color?.trim() || null
    const measurement = r.measurement?.trim() || null
    const engraving = r.engraving?.trim() || null
    if (
      (product.colors.length > 0 && (!color || !product.colors.includes(color))) ||
      (product.measurement_label && !measurement) ||
      (product.engraving_label && !engraving)
    ) {
      return NextResponse.json({ error: `Faltan datos de personalización en "${product.name}".` }, { status: 400 })
    }
    items.push({
      product_id: product.id,
      name: product.name,
      color,
      measurement,
      engraving,
      quantity: r.quantity,
      unit_price: Number(product.price),
    })
  }

  const subtotal = Math.round(items.reduce((s, i) => s + i.unit_price * i.quantity, 0) * 100) / 100
  const shipping = calcShipping(subtotal, settings)
  const total = Math.round((subtotal + shipping) * 100) / 100

  const { data: order, error } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || null,
        address: customer.address,
        postal_code: customer.postal_code,
        city: customer.city,
        province: customer.province,
        notes: customer.notes || null,
        items,
        subtotal,
        shipping,
        total,
      },
    ])
    .select()
    .single()
  if (error || !order) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'No se ha podido crear el pedido.' }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      customer_email: customer.email,
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      line_items: [
        ...items.map((i) => ({
          quantity: i.quantity,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(i.unit_price * 100),
            product_data: { name: i.name, ...(itemDetails(i) && { description: itemDetails(i) }) },
          },
        })),
        ...(shipping > 0
          ? [{ quantity: 1, price_data: { currency: 'eur', unit_amount: Math.round(shipping * 100), product_data: { name: 'Envío' } } }]
          : []),
      ],
      success_url: `${origin}/tienda/gracias?pedido=${order.number}`,
      cancel_url: `${origin}/tienda/carrito`,
    })

    await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    return NextResponse.json({ error: 'No se ha podido iniciar el pago.' }, { status: 502 })
  }
}
