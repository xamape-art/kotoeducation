'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, MessageCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { WHATSAPP_HREF } from '@/lib/contact'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/admin'
import { useCart } from '@/components/public/CartProvider'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/galeria', label: 'Galería' },
  { href: '/contacto', label: 'Contacto' },
]

function CartLink() {
  const { count } = useCart()
  return (
    <Link
      href="/tienda/carrito"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold leading-4 text-center">
          {count}
        </span>
      )}
      <span className="sr-only">Carrito</span>
    </Link>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const pathname = usePathname()

  // The shop is visible when enabled, or to the logged-in admin while testing
  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('shop_settings').select('enabled').eq('id', 1).maybeSingle(),
      supabase.auth.getUser(),
    ]).then(([{ data: settings }, { data: auth }]) => setShowShop(!!settings?.enabled || isAdmin(auth.user)))
  }, [])

  const links = showShop
    ? [...navLinks.slice(0, -1), { href: '/tienda', label: 'Tienda' }, navLinks[navLinks.length - 1]]
    : navLinks

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 overflow-hidden rounded-lg ring-1 ring-border/50 group-hover:ring-primary/30 transition-all">
            <Image
              src="/logo.png"
              alt="Koto Education"
              fill
              className="object-cover"
              sizes="44px"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-medium text-base text-foreground tracking-wide leading-none block mb-0.5">
              Koto Education
            </span>
            <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-light">
              Terrassa
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                  ? 'text-primary bg-secondary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA button */}
        <div className="hidden md:flex items-center gap-2">
          {showShop && <CartLink />}
          <Button asChild size="sm" className="rounded-full px-5">
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="flex items-center gap-1 md:hidden">
          {showShop && <CartLink />}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 mb-8">
                <div className="relative w-10 h-10 overflow-hidden rounded-lg ring-1 ring-border">
                  <Image src="/logo.png" alt="Koto Education" fill className="object-cover" sizes="40px" />
                </div>
                <div>
                  <span className="font-display font-medium text-[15px] text-foreground tracking-wide block mb-0.5">Koto Education</span>
                  <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-light">Terrassa</span>
                </div>
              </Link>
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      pathname === link.href
                        ? 'text-primary bg-secondary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 rounded-full">
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
