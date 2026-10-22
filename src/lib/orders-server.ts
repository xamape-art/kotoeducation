import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, emailLayout, escapeHtml, OWNER_EMAIL } from '@/lib/email'
import { itemDetails } from '@/lib/shop'
import { calcTotalsFromGross, formatEuro, formatInvoiceNumber, DEFAULT_VAT_RATE } from '@/lib/invoice'
import type { Order } from '@/types'

const round6 = (n: number) => Math.round(n * 1e6) / 1e6

function todayInSpain() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date())
}

function itemsTableHtml(order: Order) {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <strong>${escapeHtml(i.name)}</strong> × ${i.quantity}<br>
          <span style="color: #777; font-size: 13px;">${escapeHtml(itemDetails(i))}</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatEuro(i.unit_price * i.quantity)}</td>
      </tr>`
    )
    .join('')
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${rows}
      <tr><td style="padding: 8px;">Envío</td><td style="padding: 8px; text-align: right;">${order.shipping > 0 ? formatEuro(order.shipping) : 'Gratis'}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Total (IVA incluido)</td><td style="padding: 8px; text-align: right; font-weight: bold;">${formatEuro(order.total)}</td></tr>
    </table>`
}

function addressHtml(order: Order) {
  return `${escapeHtml(order.customer_name)}<br>${escapeHtml(order.address)}<br>${escapeHtml(order.postal_code)} ${escapeHtml(order.city)} (${escapeHtml(order.province)})`
}

// Called from the Stripe webhook once the payment is confirmed. Safe to call more than once.
export async function fulfillOrder(orderId: string) {
  const supabase = createAdminClient()
  const paidAt = new Date().toISOString()

  // Claim the order atomically so a repeated webhook does nothing
  const { data: claimed, error: claimErr } = await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: paidAt })
    .eq('id', orderId)
    .eq('status', 'pending_payment')
    .select()
  if (claimErr) throw claimErr
  const order = claimed?.[0] as Order | undefined
  if (!order) return

  const date = todayInSpain()

  const { data: income, error: incErr } = await supabase
    .from('income')
    .insert([
      {
        date,
        description: `Pedido tienda #${order.number} · ${order.customer_name}`,
        amount: order.total,
        payment_method: 'card',
      },
    ])
    .select()
  if (incErr) throw incErr

  const items = order.items.map((i) => ({
    description: [i.name, itemDetails(i)].filter(Boolean).join(' · '),
    quantity: i.quantity,
    unit_price: round6(i.unit_price / (1 + DEFAULT_VAT_RATE / 100)),
  }))
  if (order.shipping > 0) {
    items.push({ description: 'Gastos de envío', quantity: 1, unit_price: round6(order.shipping / (1 + DEFAULT_VAT_RATE / 100)) })
  }
  const totals = calcTotalsFromGross(order.total, DEFAULT_VAT_RATE)
  const year = Number(date.slice(0, 4))

  // Retry if a manual invoice takes the same number at the same moment
  let invoiceId: string | null = null
  for (let attempt = 0; attempt < 3 && !invoiceId; attempt++) {
    const { data: last } = await supabase
      .from('invoices')
      .select('seq')
      .eq('year', year)
      .order('seq', { ascending: false })
      .limit(1)
    const seq = (last?.[0]?.seq || 0) + 1
    const { data: inv, error: invErr } = await supabase
      .from('invoices')
      .insert([
        {
          year,
          seq,
          number: formatInvoiceNumber(year, seq),
          date,
          client_name: order.customer_name,
          client_address: `${order.address}\n${order.postal_code} ${order.city} (${order.province})`,
          items,
          vat_rate: DEFAULT_VAT_RATE,
          subtotal: totals.subtotal,
          vat_amount: totals.vatAmount,
          total: totals.total,
          status: 'paid',
          paid_at: date,
          payment_method: 'card',
          income_id: income[0].id,
          notes: `Pedido tienda online #${order.number}`,
        },
      ])
      .select('id')
    if (!invErr) invoiceId = inv[0].id
    else if (invErr.code !== '23505') throw invErr
  }

  await supabase.from('orders').update({ income_id: income[0].id, invoice_id: invoiceId }).eq('id', order.id)

  const { data: products } = await supabase
    .from('products')
    .select('production_days')
    .in('id', order.items.map((i) => i.product_id))
  const productionDays = products?.length ? Math.max(...products.map((p) => p.production_days)) : 7

  await Promise.all([
    sendEmail({
      to: OWNER_EMAIL,
      subject: `Nuevo pedido #${order.number}: ${order.customer_name} (${formatEuro(order.total)})`,
      html: emailLayout(
        `¡Nuevo pedido #${order.number}! 🐾`,
        `${itemsTableHtml(order)}
        <p><strong>Enviar a:</strong><br>${addressHtml(order)}</p>
        <p><strong>Contacto:</strong> ${escapeHtml(order.customer_email)} · ${escapeHtml(order.customer_phone || 'sin teléfono')}</p>
        ${order.notes ? `<p><strong>Notas:</strong> ${escapeHtml(order.notes)}</p>` : ''}`
      ),
    }),
    sendEmail({
      to: order.customer_email,
      subject: `Pedido #${order.number} confirmado · Koto Education`,
      html: emailLayout(
        `¡Gracias por tu pedido, ${escapeHtml(order.customer_name.split(' ')[0])}!`,
        `<p>Hemos recibido el pago de tu pedido <strong>#${order.number}</strong>. Lo haré a mano a la medida de tu peludo y te avisaré cuando salga hacia tu casa (normalmente en unos ${productionDays} días).</p>
        ${itemsTableHtml(order)}
        <p><strong>Dirección de envío:</strong><br>${addressHtml(order)}</p>
        <p>Si algo no está bien, responde a este email o escríbeme por WhatsApp.</p>`
      ),
    }),
  ])
}

export async function sendShippedEmail(order: Order) {
  await sendEmail({
    to: order.customer_email,
    subject: `Tu pedido #${order.number} va de camino · Koto Education`,
    html: emailLayout(
      '¡Tu pedido va de camino! 📦',
      `<p>Tu pedido <strong>#${order.number}</strong> ya está enviado.</p>
      ${order.tracking_number ? `<p><strong>Número de seguimiento:</strong> ${escapeHtml(order.tracking_number)}</p>` : ''}
      ${itemsTableHtml(order)}
      <p>¡Espero que le encante!</p>`
    ),
  })
}
