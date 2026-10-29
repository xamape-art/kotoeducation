'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  Euro,
  CheckCircle2,
  Loader2,
  Plus,
  CalendarDays,
  FileText,
  Clock,
  Circle,
  BellRing,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { alertDbError } from '@/lib/db-error'
import { parseDbDate, toDbDate, todayDb } from '@/lib/dates'
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/agenda'
import AgendaEventDialog from '@/components/admin/AgendaEventDialog'
import type { AgendaEvent } from '@/types'
import { formatEuro, formatDate } from '@/lib/invoice'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/appointments'

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// The dashboard shows pending agenda items up to this many days ahead (and anything overdue)
const AGENDA_DAYS_AHEAD = 14

export default function DashboardPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [totalClients, setTotalClients] = useState(0)
  const [newClientsThisMonth, setNewClientsThisMonth] = useState(0)
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0)
  const [prevMonthIncome, setPrevMonthIncome] = useState(0)
  const [revenueData, setRevenueData] = useState<{ month: string; ingresos: number }[]>([])
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([])
  const [agenda, setAgenda] = useState<AgendaEvent[]>([])
  const [eventOpen, setEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null)

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() // 0-indexed
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const agendaUntil = new Date(currentYear, currentMonth, now.getDate() + AGENDA_DAYS_AHEAD)

      const [clientsRes, incomeRes, aptRes, invRes, agendaRes] = await Promise.all([
        supabase.from('clients').select('id, created_at'),
        supabase.from('income').select('amount, date').order('date', { ascending: true }),
        supabase
          .from('appointments')
          .select('id, date, time, status, price, client_id, clients(name), pets(name), services(name)')
          .gte('date', todayDb())
          .in('status', ['pending', 'confirmed'])
          .order('date')
          .order('time')
          .limit(8),
        supabase
          .from('invoices')
          .select('id, number, date, client_name, total')
          .eq('status', 'pending')
          .order('date'),
        supabase
          .from('agenda_events')
          .select('*')
          .eq('done', false)
          .lte('date', toDbDate(agendaUntil))
          .order('date')
          .order('time', { nullsFirst: true }),
      ])
      const firstError = [clientsRes, incomeRes, aptRes, invRes, agendaRes].find((r) => r.error)?.error
      if (firstError) alertDbError(firstError, 'cargar el dashboard')

      // 1. Total clients & new this month
      const allClients = clientsRes.data || []
      setTotalClients(allClients.length)
      setNewClientsThisMonth(
        allClients.filter((c) => {
          const d = new Date(c.created_at)
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth
        }).length
      )

      // 2. Income per month
      const income = incomeRes.data || []
      const monthTotal = (y: number, m: number) =>
        income
          .filter((i) => {
            const [iy, im] = (i.date || '').split('-').map(Number)
            return iy === y && im - 1 === m
          })
          .reduce((sum, i) => sum + Number(i.amount), 0)

      setCurrentMonthIncome(monthTotal(currentYear, currentMonth))
      setPrevMonthIncome(monthTotal(prevMonthYear, prevMonth))

      // 3. Revenue chart — last 6 months
      const last6: { month: string; ingresos: number }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1)
        last6.push({ month: MONTH_NAMES[d.getMonth()], ingresos: monthTotal(d.getFullYear(), d.getMonth()) })
      }
      setRevenueData(last6)

      setUpcoming(aptRes.data || [])
      setPendingInvoices(invRes.data || [])
      setAgenda(agendaRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ─── Computed ────────────────────────────────────────────────────────────────
  const incomeChange = prevMonthIncome > 0
    ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100)
    : null
  const totalPending = pendingInvoices.reduce((s, i) => s + Number(i.total), 0)
  const todayStr = todayDb()

  const markDone = async (ev: AgendaEvent) => {
    const { error } = await supabase
      .from('agenda_events')
      .update({ done: true, done_at: new Date().toISOString() })
      .eq('id', ev.id)
    if (error) {
      alertDbError(error, 'actualizar el evento')
      return
    }
    setAgenda((prev) => prev.filter((e) => e.id !== ev.id))
  }

  // Keep the list to pending items within the dashboard window
  const upsertAgenda = (ev: AgendaEvent) => {
    setAgenda((prev) => {
      const rest = prev.filter((e) => e.id !== ev.id)
      const limit = toDbDate(new Date(Date.now() + AGENDA_DAYS_AHEAD * 86400000))
      const list = !ev.done && ev.date <= limit ? [...rest, ev] : rest
      return list.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
    })
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground capitalize">{today}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ingresos del mes */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Ingresos del mes</span>
              <Euro className="h-4 w-4 text-primary" />
            </div>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />
            ) : (
              <>
                <div className="text-3xl font-bold">{formatEuro(currentMonthIncome)}</div>
                {incomeChange !== null ? (
                  <p className={`text-xs mt-1 ${incomeChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {incomeChange >= 0 ? '↑' : '↓'} {incomeChange >= 0 ? '+' : ''}{incomeChange}% vs mes anterior
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Sin datos del mes anterior</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Clientes</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />
            ) : (
              <>
                <div className="text-3xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {newClientsThisMonth > 0
                    ? `+${newClientsThisMonth} nuevos este mes`
                    : 'Sin altas este mes'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pendiente de cobro */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Facturas pendientes de cobro</span>
              <Clock className="h-4 w-4 text-amber-700" />
            </div>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />
            ) : (
              <>
                <div className="text-3xl font-bold text-amber-700">{formatEuro(totalPending)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingInvoices.length} factura{pendingInvoices.length === 1 ? '' : 's'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agenda y avisos */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <BellRing className="h-4 w-4" />
            Agenda y avisos
            <span className="text-xs font-normal text-muted-foreground">próximos {AGENDA_DAYS_AHEAD} días</span>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => {
              setEditingEvent(null)
              setEventOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Evento
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-60" />
            </div>
          ) : agenda.length === 0 ? (
            <p className="text-muted-foreground text-sm py-2 text-center">Nada pendiente en los próximos días.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {agenda.map((ev) => {
                const overdue = ev.date < todayStr
                return (
                  <div
                    key={ev.id}
                    className={`flex items-start gap-2 rounded-xl p-3 text-xs ${EVENT_TYPE_COLORS[ev.type]} ${
                      overdue ? 'ring-2 ring-red-400' : ''
                    }`}
                  >
                    <button className="mt-0.5 shrink-0" title="Marcar como hecho" onClick={() => markDone(ev)}>
                      <Circle className="h-4 w-4" />
                    </button>
                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() => {
                        setEditingEvent(ev)
                        setEventOpen(true)
                      }}
                    >
                      <p className="font-semibold text-sm">{ev.title}</p>
                      <p className={overdue ? 'text-red-700 font-semibold' : 'opacity-75'}>
                        {overdue ? 'Atrasado · ' : ''}
                        <span className="capitalize">
                          {parseDbDate(ev.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        {ev.time ? ` · ${ev.time.slice(0, 5)}` : ''} · {EVENT_TYPE_LABELS[ev.type]}
                      </p>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AgendaEventDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        event={editingEvent}
        defaultDate={todayStr}
        onSaved={upsertAgenda}
        onDeleted={(id) => setAgenda((prev) => prev.filter((e) => e.id !== id))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas citas */}
        <Card className="border border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <CalendarDays className="h-4 w-4" />
              Próximas citas
            </CardTitle>
            <Button asChild size="sm" variant="ghost" className="h-8">
              <Link href="/admin/calendario">Ver calendario</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-60" />
              </div>
            ) : upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No hay citas próximas.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 text-xs p-3 rounded-xl border bg-muted/20">
                    <div className="w-16 shrink-0 text-center">
                      <p className="font-semibold text-sm capitalize">
                        {parseDbDate(apt.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-muted-foreground">{apt.time?.slice(0, 5)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{apt.pets?.name} · {apt.services?.name}</p>
                      <Link href={`/admin/clientes/${apt.client_id}`} className="text-muted-foreground hover:underline">
                        {apt.clients?.name}
                      </Link>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[apt.status] || ''}`}>
                      {STATUS_LABELS[apt.status] || apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facturas pendientes */}
        <Card className="border border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <FileText className="h-4 w-4" />
              Facturas pendientes de cobro
            </CardTitle>
            <Button asChild size="sm" variant="ghost" className="h-8">
              <Link href="/admin/facturas">Ver facturas</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-60" />
              </div>
            ) : pendingInvoices.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Todo cobrado. 🎉</p>
            ) : (
              <div className="space-y-2">
                {pendingInvoices.slice(0, 8).map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/admin/facturas/${inv.id}`}
                    className="flex items-center gap-3 text-xs p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <span className="font-mono font-medium w-20 shrink-0">{inv.number}</span>
                    <span className="flex-1 min-w-0 truncate">{inv.client_name}</span>
                    <span className="text-muted-foreground hidden sm:block">{formatDate(inv.date)}</span>
                    <span className="font-semibold">{formatEuro(inv.total)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg text-emerald-700">
            <TrendingUp className="h-4 w-4 text-emerald-700" />
            Ingresos últimos 6 meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(v) => [formatEuro(Number(v)), 'Ingresos']} />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CheckCircle2 className="h-4 w-4" />
            Acciones rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/admin/calendario', label: 'Nueva cita' },
              { href: '/admin/clientes', label: 'Nuevo cliente' },
              { href: '/admin/facturas/nueva', label: 'Nueva factura' },
              { href: '/admin/contabilidad', label: 'Ingreso o gasto' },
            ].map((a) => (
              <Button
                key={a.href}
                asChild
                variant="outline"
                className="justify-start h-11 border-primary/20 hover:bg-primary/[0.03] text-primary rounded-xl"
              >
                <Link href={a.href}>
                  <Plus className="h-4 w-4 mr-2" />
                  {a.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
