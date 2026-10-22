'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import InvoiceForm from '@/components/admin/InvoiceForm'
import { createClient } from '@/lib/supabase/client'
import type { Invoice } from '@/types'

export default function EditarFacturaPage() {
  const supabase = createClient()
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id as string)
      .single()
      .then(({ data }) => setInvoice(data))
  }, [params.id])

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
