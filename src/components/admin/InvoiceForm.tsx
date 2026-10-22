'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calcTotals, calcTotalsFromGross, formatEuro, formatInvoiceNumber, DEFAULT_VAT_RATE } from '@/lib/invoice'
import type { Client, Invoice, Service } from '@/types'

const nativeSelect =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

// Lines are edited as strings so the inputs can be empty while typing
type DraftLine = { description: string; quantity: string; price: string }

const emptyLine: DraftLine = { description: '', quantity: '1', price: '' }

const round2 = (n: number) => Math.round(n * 100) / 100
// Base prices derived from IVA-included prices keep extra decimals so totals add up
const round6 = (n: number) => Math.round(n * 1e6) / 1e6

export default function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const supabase = createClient()
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [saving, setSaving] = useState(false)

  const [clientId, setClientId] = useState(invoice?.client_id || '')
  const [clientName, setClientName] = useState(invoice?.client_name || '')
  const [clientNif, setClientNif] = useState(invoice?.client_nif || '')
  const [clientAddress, setClientAddress] = useState(invoice?.client_address || '')
  const [date, setDate] = useState(invoice?.date || new Date().toISOString().split('T')[0])
  const [vatRate, setVatRate] = useState(String(invoice?.vat_rate ?? DEFAULT_VAT_RATE))
  // Tarifas are public prices with IVA included, so the user types final prices by default
  const [pricesIncludeVat, setPricesIncludeVat] = useState(true)
  const [notes, setNotes] = useState(invoice?.notes || '')
  const [lines, setLines] = useState<DraftLine[]>(
    invoice
      ? invoice.items.map((i) => ({
          description: i.description,
          quantity: String(i.quantity),
          price: String(round2(i.unit_price * (1 + Number(invoice.vat_rate) / 100))),
        }))
      : [{ ...emptyLine }]
  )

  useEffect(() => {
    const load = async () => {
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('services').select('*').eq('active', true).order('name'),
      ])
      setClients(c || [])
      setServices(s || [])
    }
    load()
  }, [])

  const vat = Number(vatRate) || 0

  const filledLines = lines.filter((l) => l.description.trim())
  const items = filledLines.map((l) => {
    const price = Number(l.price) || 0
    return {
      description: l.description.trim(),
      quantity: Number(l.quantity) || 0,
      unit_price: pricesIncludeVat ? round6(price / (1 + vat / 100)) : price,
    }
  })
  const totals = pricesIncludeVat
    ? calcTotalsFromGross(
        filledLines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.price) || 0), 0),
        vat
      )
    : calcTotals(items, vat)

  const handleSelectClient = (id: string) => {
    setClientId(id)
    const client = clients.find((c) => c.id === id)
    if (client) {
      setClientName(client.name)
      setClientNif(client.nif || '')
      setClientAddress(client.address || '')
    }
  }

  const updateLine = (index: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  const addService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return
    const line = { description: service.name, quantity: '1', price: String(service.price) }
    setLines((prev) => {
      const blank = prev.findIndex((l) => !l.description && !l.price)
      return blank >= 0 ? prev.map((l, i) => (i === blank ? line : l)) : [...prev, line]
    })
  }

  const handleSave = async () => {
    if (!clientName.trim()) {
      alert('El nombre del cliente es obligatorio.')
      return
    }
    if (items.length === 0) {
      alert('Añade al menos un concepto.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        date,
        client_id: clientId || null,
        client_name: clientName.trim(),
        client_nif: clientNif.trim() || null,
        client_address: clientAddress.trim() || null,
        items,
        vat_rate: vat,
        subtotal: totals.subtotal,
        vat_amount: totals.vatAmount,
        total: totals.total,
        notes: notes.trim() || null,
      }

      // Remember the NIF on the client record for next time
      if (clientId && clientNif.trim()) {
        await supabase.from('clients').update({ nif: clientNif.trim() }).eq('id', clientId)
      }

      if (invoice) {
        const { error } = await supabase.from('invoices').update(payload).eq('id', invoice.id)
        if (error) throw error
        router.push(`/admin/facturas/${invoice.id}`)
      } else {
        const year = Number(date.slice(0, 4))
        const { data: last } = await supabase
          .from('invoices')
          .select('seq')
          .eq('year', year)
          .order('seq', { ascending: false })
          .limit(1)
        const seq = (last?.[0]?.seq || 0) + 1

        const { data, error } = await supabase
          .from('invoices')
          .insert([{ ...payload, year, seq, number: formatInvoiceNumber(year, seq) }])
          .select()
        if (error) throw error
        router.push(`/admin/facturas/${data[0].id}`)
      }
    } catch (err) {
      console.error('Error saving invoice:', err)
      alert('Error al guardar la factura.')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link href={invoice ? `/admin/facturas/${invoice.id}` : '/admin/facturas'}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {invoice ? `Editar factura ${invoice.number}` : 'Nueva factura'}
          </h1>
          {!invoice && (
            <p className="text-muted-foreground text-sm">El número se asigna automáticamente al guardar.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Seleccionar cliente</Label>
              <select className={nativeSelect} value={clientId} onChange={(e) => handleSelectClient(e.target.value)}>
                <option value="">— Escribir datos a mano —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>DNI / NIF</Label>
              <Input placeholder="Opcional" value={clientNif} onChange={(e) => setClientNif(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <Input placeholder="Opcional" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Invoice data */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold">Datos de la factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!!invoice} />
              </div>
              <div className="space-y-1.5">
                <Label>IVA (%)</Label>
                <Input type="number" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={pricesIncludeVat}
                onChange={(e) => setPricesIncludeVat(e.target.checked)}
              />
              Los precios que escribo ya incluyen IVA
            </label>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                placeholder="Ej. Forma de pago: transferencia a ES00 0000 ..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lines */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="font-display text-base font-semibold">Conceptos</CardTitle>
          <select
            className={`${nativeSelect} max-w-56`}
            value=""
            onChange={(e) => addService(e.target.value)}
          >
            <option value="">+ Añadir desde tarifas</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({Number(s.price).toFixed(2)}€)
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden sm:grid grid-cols-[1fr_80px_110px_90px_32px] gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Descripción</span>
            <span>Cant.</span>
            <span>Precio {pricesIncludeVat ? '(IVA incl.)' : '(sin IVA)'}</span>
            <span className="text-right">Importe</span>
            <span />
          </div>
          {lines.map((line, index) => (
            <div key={index} className="grid grid-cols-[1fr_32px] sm:grid-cols-[1fr_80px_110px_90px_32px] gap-2 items-center border-b sm:border-0 pb-3 sm:pb-0">
              <Input
                placeholder="Ej. Paseo 60 min (semana 12-16 oct)"
                value={line.description}
                onChange={(e) => updateLine(index, { description: e.target.value })}
                className="col-span-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10 sm:order-last"
                onClick={() => setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ ...emptyLine }]))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <div className="col-span-2 sm:col-span-1 sm:contents grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: e.target.value })}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={line.price}
                  onChange={(e) => updateLine(index, { price: e.target.value })}
                />
                <span className="text-sm font-medium text-right self-center">
                  {formatEuro((Number(line.quantity) || 0) * (Number(line.price) || 0))}
                </span>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setLines((prev) => [...prev, { ...emptyLine }])}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir línea
          </Button>

          {/* Totals */}
          <div className="ml-auto max-w-xs space-y-1.5 pt-4 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base imponible</span>
              <span>{formatEuro(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA ({vat}%)</span>
              <span>{formatEuro(totals.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-1.5 border-t">
              <span>Total</span>
              <span className="text-primary">{formatEuro(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={invoice ? `/admin/facturas/${invoice.id}` : '/admin/facturas'}>Cancelar</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          {invoice ? 'Guardar cambios' : 'Crear factura'}
        </Button>
      </div>
    </div>
  )
}
