import type { OrderItem, OrderStatus, ShopSettings } from '@/types'

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending_payment: 'Pago pendiente',
  paid: 'Pagado',
  in_production: 'En elaboración',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const orderStatusColor: Record<OrderStatus, string> = {
  pending_payment: 'bg-neutral-50 border-neutral-200 text-neutral-500',
  paid: 'bg-amber-50 border-amber-200 text-amber-700',
  in_production: 'bg-blue-50 border-blue-200 text-blue-700',
  shipped: 'bg-purple-50 border-purple-200 text-purple-700',
  delivered: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  cancelled: 'bg-red-50 border-red-200 text-red-700',
}

export function calcShipping(subtotal: number, settings: Pick<ShopSettings, 'shipping_price' | 'free_shipping_from'>) {
  if (subtotal <= 0) return 0
  if (settings.free_shipping_from !== null && subtotal >= Number(settings.free_shipping_from)) return 0
  return Number(settings.shipping_price)
}

// Customisation shown under the product name (cart, emails, admin)
export function itemDetails(item: Pick<OrderItem, 'color' | 'measurement' | 'engraving'>) {
  return [
    item.color && `Color: ${item.color}`,
    item.measurement && `Medida: ${item.measurement}`,
    item.engraving && `Grabado: "${item.engraving}"`,
  ]
    .filter(Boolean)
    .join(' · ')
}
