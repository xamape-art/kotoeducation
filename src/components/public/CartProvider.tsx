'use client'

import { createContext, useContext, useSyncExternalStore } from 'react'
import type { OrderItem } from '@/types'

export type CartItem = OrderItem & { key: string; image: string | null }

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'key'>) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clear: () => void
}

const STORAGE_KEY = 'koto-cart'
const EMPTY: CartItem[] = []

// Cart lives in localStorage; this small store keeps every component in sync with it
let cache: CartItem[] | null = null
const listeners = new Set<() => void>()

function read(): CartItem[] {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    // Storage unavailable (private mode): the cart just won't persist
    cache = []
  }
  return cache!
}

function write(items: CartItem[]) {
  cache = items
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY)

  const value: CartContextValue = {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: Math.round(items.reduce((s, i) => s + i.unit_price * i.quantity, 0) * 100) / 100,
    addItem: (item) => write([...read(), { ...item, key: crypto.randomUUID() }]),
    updateQuantity: (key, quantity) =>
      write(read().map((i) => (i.key === key ? { ...i, quantity: Math.min(10, Math.max(1, quantity)) } : i))),
    removeItem: (key) => write(read().filter((i) => i.key !== key)),
    clear: () => write([]),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
