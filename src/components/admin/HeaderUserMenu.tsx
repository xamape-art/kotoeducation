'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { KeyRound, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function HeaderUserMenu({ email }: { email: string }) {
  const supabase = createClient()
  const router = useRouter()

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const openPassword = () => {
    setPassword('')
    setConfirmPassword('')
    setMessage(null)
    setPasswordOpen(true)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 10) {
      setMessage({ ok: false, text: 'Usa al menos 10 caracteres.' })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ ok: false, text: 'Las contraseñas no coinciden.' })
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      setMessage({ ok: false, text: 'No se ha podido cambiar la contraseña. Prueba con otra distinta.' })
      return
    }
    setMessage({ ok: true, text: 'Contraseña cambiada.' })
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-xs hidden sm:inline">{email}</span>
      <span className="text-border hidden sm:inline">|</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={openPassword}
        className="h-8 px-2.5 rounded-lg gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <KeyRound className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Contraseña</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-lg gap-1.5 text-xs font-medium"
      >
        <LogOut className="h-3.5 w-3.5" />
        Salir
      </Button>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Repite la contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {message && (
              <p className={`text-xs font-medium ${message.ok ? 'text-emerald-700' : 'text-destructive'}`}>{message.text}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>
                Cerrar
              </Button>
              <Button type="submit" disabled={saving}>
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
