import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendShippedEmail } from '@/lib/orders-server'
import { isAdmin } from '@/lib/admin'

// Admin only: mark an order as shipped and email the customer
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!isAdmin(auth.user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { data: order, error } = await supabase
    .from('orders')
    .update({ status: 'shipped', tracking_number: body.tracking_number?.trim() || null })
    .eq('id', id)
    .select()
    .single()
  if (error || !order) {
    return NextResponse.json({ error: 'No se ha podido actualizar el pedido.' }, { status: 500 })
  }

  await sendShippedEmail(order)
  return NextResponse.json({ order })
}
