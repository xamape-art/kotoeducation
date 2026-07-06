import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import HeaderUserMenu from '@/components/admin/HeaderUserMenu'
import MobileNav from '@/components/admin/MobileNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <header className="h-14 border-b bg-background px-6 flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            <span className="font-display text-base text-foreground">Panel de administración</span>
          </div>
          <HeaderUserMenu email={user.email || ''} />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
