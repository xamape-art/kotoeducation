'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, ChevronRight, Package, Truck, FileText, Hammer, CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatEuro } from '@/lib/invoice'
import { itemDetails, orderStatusColor, orderStatusLabel } from '@/lib/shop'
import type { Order, OrderStatus } from '@/types'

const filters: { value: 'active' | 'all' | OrderStatus; label: string }[] = [
  { value: 'active', label: 'Por hacer' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'all', label: 'Todos' },
]

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function PedidosPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<(typeof filters)[number]['value']>('active')
  const [selected, setSelected] = useState<Order | null>(null)
  const [tracking, setTracking] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'pending_payment')
        .order('created_at', { ascending: false })
      if (error) console.error('Error fetching orders:', error)
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const visible = orders.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'active') return o.status === 'paid' || o.status === 'in_production'
    return o.status === filter
  })
  const pendingCount = orders.filter((o) => o.status === 'paid' || o.status === 'in_production').length

  const replaceOrder = (order: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)))
    setSelected(order)
  }

  const setStatus = async (status: OrderStatus) => {
    if (!selected) return
    if (status === 'cancelled' && !confirm('¿Cancelar el pedido? Si ya está cobrado, haz el reembolso desde Stripe.')) return
    setBusy(true)
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', selected.id).select().single()
    setBusy(false)
    if (error) {
      console.error('Error updating order:', error)
      alert('Error al actualizar el pedido.')
      return
    }
    replaceOrder(data)
  }

  const markShipped = async () => {
    if (!selected) return
    setBusy(true)
    try {
      const res = await fetch(`/api/tienda/pedidos/${selected.id}/enviado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: tracking }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      replaceOrder(data.order)
    } catch (err) {
      console.error('Error marking order as shipped:', err)
      alert('Error al marcar el pedido como enviado.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground text-sm">
          {pendingCount === 0 ? 'No tienes pedidos pendientes.' : `${pendingCount} pedidos por preparar o enviar.`}
        </p>
      </div>

      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              f.value === filter ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            {filters.find((f) => f.value === filter)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {visible.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSelected(o)
                  setTracking(o.tracking_number || '')
                }}
                className="w-full flex items-center gap-3 p-3.5 text-sm text-left hover:bg-muted/20 transition-colors"
              >
                <span className="font-mono font-medium w-14 shrink-0">#{o.number}</span>
                <span className="text-muted-foreground text-xs w-32 shrink-0 hidden sm:block">{formatDateTime(o.created_at)}</span>
                <span className="flex-1 min-w-0 truncate">
                  {o.customer_name}
                  <span className="text-muted-foreground"> · {o.items.map((i) => i.name).join(', ')}</span>
                </span>
                <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-normal shrink-0 ${orderStatusColor[o.status]}`}>
                  {orderStatusLabel[o.status]}
                </Badge>
                <span className="font-semibold w-20 text-right shrink-0">{formatEuro(o.total)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
            {visible.length === 0 && <p className="text-muted-foreground text-xs py-8 text-center">No hay pedidos aquí.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Order detail */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:!max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Pedido #{selected.number}
                  <Badge variant="outline" className={`text-[10px] font-normal ${orderStatusColor[selected.status]}`}>
                    {orderStatusLabel[selected.status]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 text-sm">
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="rounded-lg bg-muted/40 p-3">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">
                          {item.quantity} × {item.name}
                        </span>
                        <span>{formatEuro(item.unit_price * item.quantity)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{itemDetails(item)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between text-muted-foreground px-3">
                    <span>Envío</span>
                    <span>{selected.shipping > 0 ? formatEuro(selected.shipping) : 'Gratis'}</span>
                  </div>
                  <div className="flex justify-between font-semibold px-3">
                    <span>Total</span>
                    <span>{formatEuro(selected.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Enviar a</p>
                    <p className="font-medium">{selected.customer_name}</p>
                    <p>{selected.address}</p>
                    <p>
                      {selected.postal_code} {selected.city} ({selected.province})
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Contacto</p>
                    <p className="break-all">{selected.customer_email}</p>
                    {selected.customer_phone && <p>{selected.customer_phone}</p>}
                    {selected.paid_at && <p className="text-xs text-muted-foreground mt-1">Pagado el {formatDateTime(selected.paid_at)}</p>}
                  </div>
                </div>

                {selected.notes && (
                  <div className="rounded-lg border-l-4 border-primary/40 bg-muted/30 p-3 italic">{selected.notes}</div>
                )}

                {selected.invoice_id && (
                  <Button asChild variant="link" className="px-0 h-auto">
                    <Link href={`/admin/facturas/${selected.invoice_id}`}>
                      <FileText className="h-4 w-4 mr-1" />
                      Ver factura
                    </Link>
                  </Button>
                )}

                {/* Actions per status */}
                <div className="space-y-3 pt-3 border-t">
                  {selected.status === 'paid' && (
                    <Button className="w-full" disabled={busy} onClick={() => setStatus('in_production')}>
                      <Hammer className="h-4 w-4 mr-1" />
                      Empezar a prepararlo
                    </Button>
                  )}
                  {(selected.status === 'paid' || selected.status === 'in_production') && (
                    <div className="space-y-1.5">
                      <Label>Número de seguimiento (opcional)</Label>
                      <div className="flex gap-2">
                        <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Ej. PK123456789ES" />
                        <Button
                          className="bg-purple-700 hover:bg-purple-800 text-white shrink-0"
                          disabled={busy}
                          onClick={markShipped}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Enviado
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Se enviará un email al cliente avisando del envío.</p>
                    </div>
                  )}
                  {selected.status === 'shipped' && (
                    <>
                      {selected.tracking_number && (
                        <p>
                          Seguimiento: <span className="font-mono">{selected.tracking_number}</span>
                        </p>
                      )}
                      <Button
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                        disabled={busy}
                        onClick={() => setStatus('delivered')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Marcar como entregado
                      </Button>
                    </>
                  )}
                  {selected.status !== 'cancelled' && selected.status !== 'delivered' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={busy}
                      onClick={() => setStatus('cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar pedido
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
