'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                pathname === link.href
                  ? 'text-primary bg-secondary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA button */}
        <div className="hidden md:block">
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href="/contacto">Solicitar cita</Link>
          </Button>
        </div>

        {/* Mobile menu */}
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
              {navLinks.map((link) => (
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
