'use client'

/**
 * «Hay una versión nueva».
 *
 * Quien tiene el panel abierto se queda con la versión que cargó. Next ya
 * recarga solo al cambiar de pantalla tras un despliegue, pero quien sigue en
 * la misma (a medias con una factura, por ejemplo) no se entera de nada.
 *
 * Cada compilación lleva su sello (next.config.ts) y /api/version devuelve el
 * del servidor. Se mira al volver a la pestaña y cada diez minutos.
 *
 * No recarga solo: podría pillarte escribiendo. Avisa, y se puede posponer.
 */

import { useEffect, useRef, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CADA = 10 * 60 * 1000
const POSPUESTO = 30 * 60 * 1000
const SELLO = process.env.NEXT_PUBLIC_BUILD_STAMP

type Motivo = 'nueva' | 'rota'

export default function AvisoVersion() {
  const [motivo, setMotivo] = useState<Motivo | null>(null)
  // Ref y no estado: el intervalo tiene que leer el valor de ahora
  const dormidoHasta = useRef(0)

  useEffect(() => {
    // En desarrollo no hay versiones que comparar
    if (process.env.NODE_ENV !== 'production' || !SELLO || SELLO === 'dev') return

    let vivo = true

    const mirar = async () => {
      if (!vivo || document.hidden || Date.now() < dormidoHasta.current) return
      try {
        const r = await fetch('/api/version', { cache: 'no-store' })
        if (!r.ok) return
        const { stamp } = await r.json()
        if (vivo && stamp && stamp !== SELLO) setMotivo((m) => m ?? 'nueva')
      } catch {
        // Sin red: no es asunto de este aviso
      }
    }

    // Un trozo de código que ya no existe en el servidor: la pestaña se ha quedado vieja
    const alFallar = (e: ErrorEvent | PromiseRejectionEvent) => {
      const err = 'reason' in e ? e.reason : e.error
      if (err?.name === 'ChunkLoadError' || /Loading chunk|Failed to fetch dynamically imported module/i.test(String(err?.message))) {
        setMotivo('rota')
      }
    }
    window.addEventListener('error', alFallar)
    window.addEventListener('unhandledrejection', alFallar)

    const alVolver = () => {
      if (!document.hidden) void mirar()
    }
    document.addEventListener('visibilitychange', alVolver)

    const t = setInterval(mirar, CADA)
    void mirar()

    return () => {
      vivo = false
      clearInterval(t)
      window.removeEventListener('error', alFallar)
      window.removeEventListener('unhandledrejection', alFallar)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [])

  if (!motivo) return null

  return (
    <div
      role="status"
      className="print:hidden fixed z-[100] bottom-20 md:bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 w-[calc(100%-2rem)] md:w-auto md:max-w-sm flex items-start gap-3 rounded-2xl border bg-background px-4 py-3 shadow-2xl"
    >
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
        <RefreshCw className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {motivo === 'rota' ? 'Esta pantalla se ha quedado desactualizada' : 'Hay una versión nueva'}
        </p>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5">
          {motivo === 'rota'
            ? 'Se ha publicado una actualización mientras la tenías abierta. Recarga y vuelve a intentarlo.'
            : 'Recarga cuando termines lo que estés haciendo. Guarda antes lo que tengas a medias.'}
        </p>
        <Button size="sm" className="mt-2" onClick={() => window.location.reload()}>
          Recargar
        </Button>
      </div>
      {motivo === 'nueva' && (
        <button
          onClick={() => {
            dormidoHasta.current = Date.now() + POSPUESTO
            setMotivo(null)
          }}
          aria-label="Ahora no"
          title="Ahora no"
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
