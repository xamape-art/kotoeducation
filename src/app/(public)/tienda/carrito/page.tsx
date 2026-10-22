import { notFound } from 'next/navigation'
import { getShopAccess } from '@/lib/shop-server'
import CartCheckout from '@/components/public/CartCheckout'

export const metadata = {
  title: 'Carrito | Koto Education',
}

export default async function CarritoPage() {
  const { settings, canView } = await getShopAccess()
  if (!canView) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">Tu carrito</h1>
      <CartCheckout shippingPrice={Number(settings.shipping_price)} freeShippingFrom={settings.free_shipping_from} />
    </div>
  )
}
