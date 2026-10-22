import { createClient } from '@/lib/supabase/server'
import { isAdmin as isAdminUser } from '@/lib/admin'
import type { ShopSettings } from '@/types'

const defaultSettings: ShopSettings = { id: 1, enabled: false, shipping_price: 0, free_shipping_from: null }

// While the shop is disabled only the logged-in admin can see it (to test before launch)
export async function getShopAccess() {
  const supabase = await createClient()
  const [{ data: settings }, { data: auth }] = await Promise.all([
    supabase.from('shop_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.auth.getUser(),
  ])
  const shop: ShopSettings = settings || defaultSettings
  const isAdmin = isAdminUser(auth.user)
  return { settings: shop, isAdmin, canView: shop.enabled || isAdmin }
}
