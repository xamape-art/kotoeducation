'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatEuro } from '@/lib/invoice'
import { useCart } from '@/components/public/CartProvider'
import type { Product } from '@/types'

export default function ProductOrderForm({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [color, setColor] = useState<string | null>(null)
  const [measurement, setMeasurement] = useState('')
  const [engraving, setEngraving] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')

  const handleAdd = () => {
    if (product.colors.length > 0 && !color) return setError('Elige un color.')
    if (product.measurement_label && !measurement.trim()) return setError(`Indica: ${product.measurement_label.toLowerCase()}.`)
    if (product.engraving_label && !engraving.trim()) return setError(`Indica: ${product.engraving_label.toLowerCase()}.`)
    setError('')

    addItem({
      product_id: product.id,
      name: product.name,
      color,
      measurement: measurement.trim() || null,
      engraving: engraving.trim() || null,
      quantity,
      unit_price: Number(product.price),
      image: product.images[0] || null,
    })
    setMeasurement('')
    setEngraving('')
    setQuantity(1)
    toast.success(`${product.name} añadido al carrito`, {
      action: { label: 'Ver carrito', onClick: () => (window.location.href = '/tienda/carrito') },
    })
  }

  return (
    <div className="space-y-5">
      <p className="text-2xl font-semibold text-primary">{formatEuro(product.price)}</p>

      {product.colors.length > 0 && (
        <div className="space-y-2">
          <Label>Color {color && <span className="font-normal text-muted-foreground">· {color}</span>}</Label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-sm transition-colors',
                  c === color ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.measurement_label && (
        <div className="space-y-1.5">
          <Label htmlFor="measurement">{product.measurement_label}</Label>
          <Input
            id="measurement"
            inputMode="decimal"
            placeholder="Ej. 35"
            value={measurement}
            onChange={(e) => setMeasurement(e.target.value)}
            className="max-w-40"
          />
          <p className="text-xs text-muted-foreground">Mídelo con una cinta métrica. Si tienes dudas, escríbeme por WhatsApp.</p>
        </div>
      )}

      {product.engraving_label && (
        <div className="space-y-1.5">
          <Label htmlFor="engraving">{product.engraving_label}</Label>
          <Input
            id="engraving"
            maxLength={80}
            placeholder="Ej. Koto · 600 000 000"
            value={engraving}
            onChange={(e) => setEngraving(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Cantidad</Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center tabular-nums">{quantity}</span>
          <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity((q) => Math.min(10, q + 1))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button size="lg" className="rounded-full px-6" onClick={handleAdd}>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Añadir al carrito
        </Button>
        <Button asChild size="lg" variant="ghost" className="rounded-full">
          <Link href="/tienda/carrito">Ver carrito</Link>
        </Button>
      </div>
    </div>
  )
}
