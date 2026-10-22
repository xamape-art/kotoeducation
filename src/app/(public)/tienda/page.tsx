import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { PawPrint, Scissors, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getShopAccess } from '@/lib/shop-server'
import { formatEuro } from '@/lib/invoice'
import type { Product } from '@/types'

export const metadata = {
  title: 'Tienda | Koto Education',
  description: 'Collares, correas y chapas identificativas hechos a mano en Terrassa, a la medida de tu perro.',
}

export default async function TiendaPage() {
  const { settings, canView } = await getShopAccess()
  if (!canView) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('active', true).order('sort_order')
  const products = (data || []) as Product[]

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {!settings.enabled && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Vista previa: la tienda está desactivada y solo tú la ves. Actívala desde el panel de administración.
        </div>
      )}

      <div className="text-center mb-12">
        <Badge className="mb-4">Tienda</Badge>
        <h1 className="text-4xl font-display font-bold mb-4">Hecho a mano, a su medida</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Collares, correas y chapas que hago yo misma en Terrassa para cada perro. Elige el color, dime la medida y lo
          preparo en cuanto haces el pedido.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-sm">
        <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4">
          <Scissors className="h-5 w-5 text-primary shrink-0" />
          <span>Cada pieza se hace por encargo</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4">
          <PawPrint className="h-5 w-5 text-primary shrink-0" />
          <span>A la medida exacta de tu perro</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          <span>
            {settings.free_shipping_from !== null
              ? `Envío gratis desde ${formatEuro(settings.free_shipping_from)}`
              : settings.shipping_price > 0
                ? `Envío por correo: ${formatEuro(settings.shipping_price)}`
                : 'Envío gratis por correo'}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Muy pronto tendrás aquí los primeros productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/tienda/${product.slug}`}
              className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-secondary/60 overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <PawPrint className="h-12 w-12 text-primary/30" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-display text-lg font-semibold">{product.name}</h2>
                {product.colors.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{product.colors.length} colores</p>
                )}
                <p className="text-primary font-semibold mt-2">{formatEuro(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
