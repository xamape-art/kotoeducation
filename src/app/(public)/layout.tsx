import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { CartProvider } from '@/components/public/CartProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  )
}
