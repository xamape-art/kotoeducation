'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import InvoiceForm from '@/components/admin/InvoiceForm'
import { createClient } from '@/lib/supabase/client'
import type { Invoice } from '@/types'

export default function EditarFacturaPage() {
  const supabase = createClient()
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id as string)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Error fetching invoice:', error)
        if (data) setInvoice(data)
        else setNotFound(true)
      })
  }, [params.id])

  if (notFound) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <p>Factura no encontrada.</p>
        <Link href="/admin/facturas" className="text-primary underline text-sm">
          Volver a facturas
        </Link>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando factura...</p>
      </div>
    )
  }

  return <InvoiceForm invoice={invoice} />
}
