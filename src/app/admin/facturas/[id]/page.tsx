'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Download, Edit, Trash2, CheckCircle2, Undo2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ISSUER, formatEuro, formatDate, lineTotal } from '@/lib/invoice'
import type { Invoice } from '@/types'

const methodLabel: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
}

export default function FacturaDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [paidOpen, setPaidOpen] = useState(false)
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [paidMethod, setPaidMethod] = useState('transfer')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('invoices').select('*').eq('id', invoiceId).single()
      if (error) console.error('Error fetching invoice:', error)
      setInvoice(data)
      setLoading(false)
    }
    load()
  }, [invoiceId])

  // Use the invoice number as the default PDF file name
  useEffect(() => {
    if (!invoice) return
    const previous = document.title
    document.title = `Factura ${invoice.number} - ${invoice.client_name}`
    return () => {
      document.title = previous
    }
  }, [invoice])

  const handleMarkPaid = async () => {
    if (!invoice) return
    setBusy(true)
    try {
      const { data: income, error: incErr } = await supabase
        .from('income')
        .insert([
          {
            date: paidDate,
            description: `Factura ${invoice.number} · ${invoice.client_name}`,
            amount: invoice.total,
            payment_method: paidMethod,
          },
        ])
        .select()
      if (incErr) throw incErr

      const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: paidDate, payment_method: paidMethod, income_id: income[0].id })
        .eq('id', invoice.id)
        .select()
      if (error) throw error
      setInvoice(data[0])
      setPaidOpen(false)
    } catch (err) {
      console.error('Error marking invoice as paid:', err)
      alert('Error al marcar la factura como cobrada.')
    } finally {
      setBusy(false)
    }
  }

  const handleMarkPending = async () => {
    if (!invoice) return
    if (!confirm('¿Marcar como pendiente? Se eliminará el ingreso asociado en Contabilidad.')) return
    setBusy(true)
    try {
      if (invoice.income_id) {
        const { error: incErr } = await supabase.from('income').delete().eq('id', invoice.income_id)
        if (incErr) throw incErr
      }
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'pending', paid_at: null, payment_method: null, income_id: null })
        .eq('id', invoice.id)
        .select()
      if (error) throw error
      setInvoice(data[0])
    } catch (err) {
      console.error('Error marking invoice as pending:', err)
      alert('Error al actualizar la factura.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return

    // Invoice numbers must stay correlative, so only the last one of the year can be removed
    const { data: last } = await supabase
      .from('invoices')
      .select('seq')
      .eq('year', invoice.year)
      .order('seq', { ascending: false })
      .limit(1)
    if (last?.[0] && last[0].seq !== invoice.seq) {
      alert(
        'Solo se puede eliminar la última factura del año para no dejar huecos en la numeración. ' +
          'Si esta factura es incorrecta, edítala o emite una factura rectificativa.'
      )
      return
    }
    if (!confirm(`¿Eliminar la factura ${invoice.number}?`)) return

    try {
      if (invoice.income_id) {
        await supabase.from('income').delete().eq('id', invoice.income_id)
      }
      const { error } = await supabase.from('invoices').delete().eq('id', invoice.id)
      if (error) throw error
      router.push('/admin/facturas')
    } catch (err) {
      console.error('Error deleting invoice:', err)
      alert('Error al eliminar la factura.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando factura...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <p>Factura no encontrada.</p>
        <Button asChild variant="link">
          <Link href="/admin/facturas">Volver a facturas</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Actions (not printed) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/admin/facturas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold tracking-tight">Factura {invoice.number}</h1>
          {invoice.status === 'paid' ? (
            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
              Cobrada {invoice.paid_at && formatDate(invoice.paid_at)}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
              Pendiente
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="rounded-xl" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-1" />
            Descargar PDF
          </Button>
          {invoice.status === 'pending' ? (
            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
              onClick={() => setPaidOpen(true)}
              disabled={busy}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Marcar cobrada
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="rounded-xl" onClick={handleMarkPending} disabled={busy}>
              <Undo2 className="h-4 w-4 mr-1" />
              Marcar pendiente
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="rounded-xl">
            <Link href={`/admin/facturas/${invoice.id}/editar`}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="bg-white text-neutral-900 rounded-xl border shadow-sm p-8 md:p-12 print:border-0 print:shadow-none print:rounded-none print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 overflow-hidden rounded-lg bg-[#F5EDE3]">
              <Image src="/logo.png" alt={ISSUER.tradeName} fill className="object-cover" sizes="56px" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">{ISSUER.tradeName}</p>
              <p className="text-xs text-neutral-500">Paseos y cuidado de mascotas</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-bold tracking-tight uppercase">Factura</p>
            <p className="text-sm mt-1">
              <span className="text-neutral-500">Nº </span>
              <span className="font-mono font-semibold">{invoice.number}</span>
            </p>
            <p className="text-sm">
              <span className="text-neutral-500">Fecha </span>
              {formatDate(invoice.date)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">Emisor</p>
            <p className="font-semibold">{ISSUER.name}</p>
            <p>NIF: {ISSUER.nif}</p>
            {ISSUER.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="text-neutral-500 mt-1">
              {ISSUER.phone} · {ISSUER.email}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">Cliente</p>
            <p className="font-semibold">{invoice.client_name}</p>
            {invoice.client_nif && <p>NIF: {invoice.client_nif}</p>}
            {invoice.client_address && <p className="whitespace-pre-line">{invoice.client_address}</p>}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-800 text-left text-[11px] uppercase tracking-wider">
              <th className="py-2 font-semibold">Concepto</th>
              <th className="py-2 font-semibold text-right w-16">Cant.</th>
              <th className="py-2 font-semibold text-right w-28">Precio</th>
              <th className="py-2 font-semibold text-right w-28">Importe</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-neutral-200">
                <td className="py-2.5 pr-2">{item.description}</td>
                <td className="py-2.5 text-right">{Number(item.quantity).toLocaleString('es-ES')}</td>
                <td className="py-2.5 text-right">{formatEuro(item.unit_price)}</td>
                <td className="py-2.5 text-right">{formatEuro(lineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1.5 pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Base imponible</span>
            <span>{formatEuro(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">IVA ({Number(invoice.vat_rate)}%)</span>
            <span>{formatEuro(invoice.vat_amount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-neutral-800">
            <span>Total</span>
            <span>{formatEuro(invoice.total)}</span>
          </div>
        </div>

        {(invoice.notes || invoice.status === 'paid') && (
          <div className="mt-10 pt-6 border-t border-neutral-200 text-sm text-neutral-600 space-y-1">
            {invoice.status === 'paid' && invoice.payment_method && (
              <p>
                Pagada el {invoice.paid_at && formatDate(invoice.paid_at)} mediante{' '}
                {methodLabel[invoice.payment_method].toLowerCase()}.
              </p>
            )}
            {invoice.notes && <p className="whitespace-pre-line">{invoice.notes}</p>}
          </div>
        )}
      </div>

      {/* Mark as paid dialog */}
      <Dialog open={paidOpen} onOpenChange={setPaidOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Marcar como cobrada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Se registrará un ingreso de {formatEuro(invoice.total)} en Contabilidad.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha de cobro</Label>
                <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Método</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                  value={paidMethod}
                  onChange={(e) => setPaidMethod(e.target.value)}
                >
                  <option value="transfer">Transferencia</option>
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPaidOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={handleMarkPaid} disabled={busy}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
