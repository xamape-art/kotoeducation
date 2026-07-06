import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-background px-6 flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            Panel de administración
          </div>
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
