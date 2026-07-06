'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PawPrint, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <>
      {hasError && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Enlace inválido o expirado. Solicita uno nuevo.</span>
        </div>
      )}

      {sent ? (
        <div className="text-center py-4">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">¡Enlace enviado!</h3>
          <p className="text-muted-foreground text-sm">
            Hemos enviado un enlace mágico a{' '}
            <strong>{email}</strong>.
            Revisa tu bandeja de entrada y haz clic en el enlace para acceder.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => setSent(false)}
          >
            Volver
          </Button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email de administrador</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-xs">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar enlace mágico'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Te enviaremos un enlace de acceso por email. Sin contraseña.
          </p>
        </form>
      )}
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="bg-primary/10 rounded-full p-3">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Koto Education</CardTitle>
          <p className="text-muted-foreground text-sm">Panel de administración</p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-32 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
