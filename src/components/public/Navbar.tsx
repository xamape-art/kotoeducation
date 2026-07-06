'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/galeria', label: 'Galería' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <PawPrint className="h-6 w-6" />
          <span>Koto Education</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                pathname === link.href
                  ? 'text-primary bg-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA button */}
        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link href="/contacto">Solicitar cita</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex items-center gap-2 font-bold text-lg text-primary mb-8">
              <PawPrint className="h-6 w-6" />
              <span>Koto Education</span>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === link.href
                      ? 'text-primary bg-secondary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-4">
                <Link href="/contacto" onClick={() => setOpen(false)}>
                  Solicitar cita
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
