'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/public/CartProvider'

// Empties the cart once the customer lands on the thank-you page after paying
export default function ClearCart() {
  const { clear } = useCart()
  useEffect(() => {
    clear()
  }, [])
  return null
}
