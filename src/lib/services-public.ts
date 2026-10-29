import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/types'

// Active services from the admin "Tarifas" page, cheapest first
export async function getPublicServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('price')
    .order('name')

  if (error) console.error('Error fetching services:', error)
  return (data as Service[]) || []
}

export function formatPrice(price: number) {
  return `${Number(price).toLocaleString('es-ES', { maximumFractionDigits: 2 })}€`
}

// Headline price for a category: null when nothing has a price yet (price 0 = no price)
export function categoryPrice(services: Service[], category: string) {
  const prices = services
    .filter((s) => s.category === category && Number(s.price) > 0)
    .map((s) => Number(s.price))
  if (prices.length === 0) return null
  return { price: formatPrice(Math.min(...prices)), from: new Set(prices).size > 1 }
}
