'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Lock, Minus, PawPrint, Plus, Trash2 } from 'lucide-react'
import { formatEuro } from '@/lib/invoice'
import { calcShipping, itemDetails } from '@/lib/shop'
import { useCart } from '@/components/public/CartProvider'

const emptyCustomer = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postal_code: '',
  city: '',
  province: 'Barcelona',
  notes: '',
}

export default function CartCheckout({
  shippingPrice,
  freeShippingFrom,
}: {
  shippingPrice: number
  freeShippingFrom: number | null
}) {
  const { items, subtotal, updateQuantity, removeItem } = useCart()
  const [customer, setCustomer] = useState(emptyCustomer)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const shipping = calcShipping(subtotal, { shipping_price: shippingPrice, free_shipping_from: freeShippingFrom })
  const total = subtotal + shipping

  const field = (key: keyof typeof emptyCustomer) => ({
    id: key,
    value: customer[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCustomer((prev) => ({ ...prev, [key]: e.target.value })),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/tienda/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product_id, color, measurement, engraving, quantity }) => ({
            product_id,
            color,
            measurement,
            engraving,
            quantity,
          })),
          customer,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'No se ha podido iniciar el pago.')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se ha podido iniciar el pago.')
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <PawPrint className="h-12 w-12 text-primary/30 mx-auto" />
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Button asChild className="rounded-full">
          <Link href="/tienda">Ver productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
      {/* Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex gap-4 rounded-xl border border-border/60 p-4">
            <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-secondary/60 flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint className="h-8 w-8 text-primary/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{item.name}</p>
                <p className="font-semibold">{formatEuro(item.unit_price * item.quantity)}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{itemDetails(item)}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.key, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.key, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeItem(item.key)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Quitar
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="ml-auto max-w-xs space-y-1.5 pt-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Productos</span>
            <span>{formatEuro(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>{shipping > 0 ? formatEuro(shipping) : 'Gratis'}</span>
          </div>
          {freeShippingFrom !== null && shipping > 0 && (
            <p className="text-xs text-muted-foreground">
              Te faltan {formatEuro(freeShippingFrom - subtotal)} para el envío gratis.
            </p>
          )}
          <div className="flex justify-between text-lg font-bold pt-1.5 border-t">
            <span>Total</span>
            <span className="text-primary">{formatEuro(total)}</span>
          </div>
          <p className="text-xs text-muted-foreground text-right">IVA incluido</p>
        </div>
      </div>

      {/* Shipping form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-secondary/40 p-6 h-fit">
        <h2 className="font-display text-lg font-semibold">Datos de envío</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre y apellidos</Label>
          <Input required autoComplete="name" {...field('name')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input required type="email" autoComplete="email" {...field('email')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input type="tel" autoComplete="tel" {...field('phone')} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Dirección</Label>
          <Input required autoComplete="street-address" placeholder="Calle, número, piso y puerta" {...field('address')} />
        </div>
        <div className="grid grid-cols-[110px_1fr] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="postal_code">C. postal</Label>
            <Input required inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" {...field('postal_code')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Población</Label>
            <Input required autoComplete="address-level2" {...field('city')} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="province">Provincia</Label>
          <Input required autoComplete="address-level1" {...field('province')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea rows={2} placeholder="Algo que deba saber sobre el pedido o la entrega" {...field('notes')} />
        </div>

        <p className="text-xs text-muted-foreground">
          Envíos solo a España. Al ser productos hechos a medida, no admiten devolución salvo defecto de fabricación.
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
          Pagar {formatEuro(total)}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">Pago seguro con tarjeta, Apple Pay o Google Pay a través de Stripe.</p>
      </form>
    </div>
  )
}
