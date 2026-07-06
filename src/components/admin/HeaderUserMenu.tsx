'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeaderUserMenu({ email }: { email: string }) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-xs hidden sm:inline">{email}</span>
      <span className="text-border hidden sm:inline">|</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-lg gap-1.5 text-xs font-medium"
      >
        <LogOut className="h-3.5 w-3.5" />
        Salir
      </Button>
    </div>
  )
}
