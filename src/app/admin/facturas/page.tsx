'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Clock, CheckCircle2, Loader2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatEuro, formatDate } from '@/lib/invoice'
import type { Invoice } from '@/types'

export default function FacturasPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('year', { ascending: false })
        .order('seq', { ascending: false })
      if (error) console.error('Error fetching invoices:', error)
      setInvoices(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const years = Array.from(new Set([new Date().getFullYear(), ...invoices.map((i) => i.year)])).sort((a, b) => b - a)
  const yearInvoices = invoices.filter((i) => i.year === year)

  const totalInvoiced = yearInvoices.reduce((s, i) => s + Number(i.total), 0)
  const totalVat = yearInvoices.reduce((s, i) => s + Number(i.vat_amount), 0)
  const totalPending = yearInvoices.filter((i) => i.status === 'pending').reduce((s, i) => s + Number(i.total), 0)

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando facturas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Facturas</h1>
          <div className="flex gap-1 mt-1">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                  y === year ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <Button asChild size="sm" className="rounded-xl">
          <Link href="/admin/facturas/nueva">
            <Plus className="h-4 w-4 mr-1" />
            Nueva factura
          </Link>
        </Button>
      </div>

      {/* Cards summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/10 bg-primary/[0.02] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Facturado ({year})</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">{formatEuro(totalInvoiced)}</div>
            <p className="text-xs text-muted-foreground mt-1">{yearInvoices.length} facturas</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pendiente de cobro</span>
              <Clock className="h-4 w-4 text-amber-700" />
            </div>
            <div className="text-3xl font-bold text-amber-700">{formatEuro(totalPending)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">IVA repercutido ({year})</span>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{formatEuro(totalVat)}</div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold">Facturas emitidas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {yearInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/admin/facturas/${inv.id}`}
                className="flex items-center gap-3 p-3.5 text-sm hover:bg-muted/20 transition-colors"
              >
                <span className="font-mono font-medium w-20 shrink-0">{inv.number}</span>
                <span className="text-muted-foreground text-xs w-20 shrink-0 hidden sm:block">{formatDate(inv.date)}</span>
                <span className="flex-1 min-w-0 truncate">{inv.client_name}</span>
                {inv.status === 'paid' ? (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal shrink-0 bg-emerald-50 border-emerald-200 text-emerald-700">
                    Cobrada
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal shrink-0 bg-amber-50 border-amber-200 text-amber-700">
                    Pendiente
                  </Badge>
                )}
                <span className="font-semibold w-20 text-right shrink-0">{formatEuro(inv.total)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
            {yearInvoices.length === 0 && (
              <p className="text-muted-foreground text-xs py-8 text-center">No hay facturas en {year}.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
