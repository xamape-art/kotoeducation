import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getShopAccess } from '@/lib/shop-server'
import ProductOrderForm from '@/components/public/ProductOrderForm'
import ProductGallery from '@/components/public/ProductGallery'
import type { Product } from '@/types'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { canView } = await getShopAccess()
  if (!canView) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('slug', slug).eq('active', true).maybeSingle()
  if (!data) notFound()
  const product = data as Product

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/tienda" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver a la tienda
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold">{product.name}</h1>
            {product.description && (
              <p className="text-muted-foreground mt-3 whitespace-pre-line">{product.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Hecho a mano por encargo. Lo preparo en unos {product.production_days} días y te lo envío por correo.
            </p>
          </div>
          <ProductOrderForm product={product} />
        </div>
      </div>
    </div>
  )
}
