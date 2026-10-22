import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ClearCart from '@/components/public/ClearCart'

export default async function GraciasPage({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) {
  const { pedido } = await searchParams
  const number = pedido && /^\d+$/.test(pedido) ? pedido : null

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
      <ClearCart />
      <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
      <h1 className="text-3xl font-display font-bold">¡Gracias por tu pedido!</h1>
      <p className="text-muted-foreground">
        {number && (
          <>
            Tu pedido <strong className="text-foreground">#{number}</strong> está confirmado.{' '}
          </>
        )}
        Te he enviado un email con el resumen. Empiezo a prepararlo a mano y te avisaré cuando salga hacia tu casa.
      </p>
      <Button asChild className="rounded-full">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
