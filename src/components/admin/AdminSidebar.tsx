'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  Tag,
  Images,
  PawPrint,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/clientes', icon: Users, label: 'Clientes' },
  { href: '/admin/calendario', icon: CalendarDays, label: 'Calendario' },
  { href: '/admin/contabilidad', icon: Wallet, label: 'Contabilidad' },
  { href: '/admin/tarifas', icon: Tag, label: 'Tarifas' },
  { href: '/admin/galeria', icon: Images, label: 'Galería' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 font-bold text-lg px-6 py-5 border-b border-sidebar-border">
        <PawPrint className="h-6 w-6" />
        <span>Koto Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3 w-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
