'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Euro,
  CheckCircle2,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { alertDbError } from '@/lib/db-error'
import { parseDbDate, toDbDate, todayDb } from '@/lib/dates'
import { categoryLabel, formatPrice } from '@/lib/service-categories'
import { STATUS_LABELS, STATUS_BADGE, PAYMENT_METHOD_LABELS as METHOD_LABELS } from '@/lib/appointments'
import type { Appointment, Client, Pet, Service } from '@/types'

const SERVICE_COLORS: Record<string, string> = {
  walk: 'border border-emerald-200 bg-emerald-100 text-emerald-900',
  visit: 'border border-sky-200 bg-sky-100 text-sky-900',
  care: 'border border-amber-200 bg-amber-100 text-amber-900',
  training: 'border border-violet-200 bg-violet-100 text-violet-900',
}
const DEFAULT_COLOR = 'border border-gray-200 bg-gray-100 text-gray-900'

type Apt = Appointment & {
  day: Date
  clients: Pick<Client, 'id' | 'name'> | null
  pets: Pick<Pet, 'id' | 'name'> | null
  services: Pick<Service, 'id' | 'name' | 'category'> | null
}

type ClientWithPets = Pick<Client, 'id' | 'name'> & { pets: Pick<Pet, 'id' | 'name'>[] }

const APT_SELECT = '*, clients(id, name), pets(id, name), services(id, name, category)'

const toApt = (row: any): Apt => ({ ...row, day: parseDbDate(row.date) })

export default function CalendarioPage() {
  const supabase = createClient()
  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDay, setSelectedDay] = useState<Date | null>(today)
  const [appointments, setAppointments] = useState<Apt[]>([])
  const [clientsList, setClientsList] = useState<ClientWithPets[]>([])
  const [services, setServices] = useState<Service[]>([])
  // Appointments that already have an income in Contabilidad
  const [paidAptIds, setPaidAptIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Add / edit form (editingId = null means a new appointment)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fClient, setFClient] = useState('')
  const [fPet, setFPet] = useState('')
  const [fService, setFService] = useState('')
  const [fDate, setFDate] = useState('')
  const [fTime, setFTime] = useState('')
  const [fDuration, setFDuration] = useState('30')
  const [fPrice, setFPrice] = useState('')
  const [fStatus, setFStatus] = useState('confirmed')
  const [fNotes, setFNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Register payment
  const [payApt, setPayApt] = useState<Apt | null>(null)
  const [payDate, setPayDate] = useState(todayDb())
  const [payMethod, setPayMethod] = useState('cash')
  const [paying, setPaying] = useState(false)

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true)
    const [apts, cls, svcs, inc] = await Promise.all([
      supabase.from('appointments').select(APT_SELECT).order('date').order('time'),
      supabase.from('clients').select('id, name, pets(id, name)').order('name'),
      supabase.from('services').select('*').order('category').order('name'),
      supabase.from('income').select('appointment_id').not('appointment_id', 'is', null),
    ])

    if (apts.error) alertDbError(apts.error, 'cargar las citas')
    setAppointments((apts.data || []).map(toApt))
    setClientsList((cls.data as ClientWithPets[]) || [])
    setServices(svcs.data || [])
    setPaidAptIds(new Set((inc.data || []).map((i) => i.appointment_id as string)))
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // ─── Calendar helpers ────────────────────────────────────────────────────────
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = (getDay(monthStart) + 6) % 7 // Monday-based

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(a.day, day))

  const selectedDayAppointments = selectedDay
    ? getAppointmentsForDay(selectedDay).sort((a, b) => a.time.localeCompare(b.time))
    : []
  const monthAppointments = appointments.filter(
    (a) => isSameMonth(a.day, currentMonth) && a.status !== 'cancelled'
  )
  const confirmedCount = monthAppointments.filter((a) => a.status === 'confirmed').length

  const selectedClientPets = clientsList.find((c) => c.id === fClient)?.pets || []
  // Inactive services stay selectable only if the appointment already uses them
  const serviceOptions = services.filter((s) => s.active || s.id === fService)

  const colorFor = (apt: Apt) =>
    (apt.services && SERVICE_COLORS[apt.services.category]) || DEFAULT_COLOR

  // ─── Form ────────────────────────────────────────────────────────────────────
  const openForm = (apt: Apt | null) => {
    setEditingId(apt?.id || null)
    setFClient(apt?.client_id || '')
    setFPet(apt?.pet_id || '')
    setFService(apt?.service_id || '')
    setFDate(apt?.date || (selectedDay ? toDbDate(selectedDay) : todayDb()))
    setFTime(apt?.time?.slice(0, 5) || '')
    setFDuration(String(apt?.duration_minutes || 30))
    setFPrice(apt ? String(apt.price) : '')
    setFStatus(apt?.status || 'confirmed')
    setFNotes(apt?.notes || '')
    setFormOpen(true)
  }

  const handleSelectClient = (id: string) => {
    setFClient(id)
    const pets = clientsList.find((c) => c.id === id)?.pets || []
    setFPet(pets.length === 1 ? pets[0].id : '')
  }

  const handleSelectService = (id: string) => {
    setFService(id)
    const service = services.find((s) => s.id === id)
    if (service) {
      setFPrice(String(service.price))
      if (service.duration_minutes) setFDuration(String(service.duration_minutes))
    }
  }

  const handleSave = async () => {
    if (!fClient || !fPet || !fService || !fDate || !fTime) {
      alert('Cliente, mascota, servicio, fecha y hora son obligatorios.')
      return
    }
    if (!(Number(fDuration) > 0)) {
      alert('La duración debe ser mayor que 0.')
      return
    }

    const payload = {
      client_id: fClient,
      pet_id: fPet,
      service_id: fService,
      date: fDate,
      time: fTime,
      duration_minutes: Math.round(Number(fDuration)),
      price: Number(fPrice) || 0,
      status: fStatus,
      notes: fNotes.trim() || null,
    }

    setSaving(true)
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('appointments')
          .update(payload)
          .eq('id', editingId)
          .select(APT_SELECT)
          .single()
        if (error) throw error
        setAppointments((prev) => prev.map((a) => (a.id === editingId ? toApt(data) : a)))
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert([payload])
          .select(APT_SELECT)
          .single()
        if (error) throw error
        setAppointments((prev) => [...prev, toApt(data)])
      }
      setSelectedDay(parseDbDate(fDate))
      setFormOpen(false)
    } catch (err) {
      alertDbError(err, 'guardar la cita')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (apt: Apt, status: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', apt.id)
      .select(APT_SELECT)
      .single()
    if (error) {
      alertDbError(error, 'actualizar la cita')
      return
    }
    setAppointments((prev) => prev.map((a) => (a.id === apt.id ? toApt(data) : a)))
  }

  // ─── Payment ─────────────────────────────────────────────────────────────────
  const openPay = (apt: Apt) => {
    setPayApt(apt)
    setPayDate(apt.date <= todayDb() ? apt.date : todayDb())
    setPayMethod('cash')
  }

  const handleRegisterPayment = async () => {
    if (!payApt) return
    setPaying(true)
    try {
      const description = [payApt.services?.name, payApt.pets?.name, payApt.clients?.name]
        .filter(Boolean)
        .join(' · ')
      const { error } = await supabase.from('income').insert([
        {
          date: payDate,
          description,
          amount: payApt.price,
          payment_method: payMethod,
          appointment_id: payApt.id,
        },
      ])
      if (error) throw error
      setPaidAptIds((prev) => new Set(prev).add(payApt.id))
      if (payApt.status !== 'completed') await setStatus(payApt, 'completed')
      setPayApt(null)
    } catch (err) {
      alertDbError(err, 'registrar el cobro')
    } finally {
      setPaying(false)
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (apt: Apt) => {
    const paidNote = paidAptIds.has(apt.id)
      ? '\n\nEl cobro registrado en Contabilidad se mantendrá.'
      : ''
    if (!confirm(`¿Eliminar esta cita?${paidNote}\n\nSi solo no se va a hacer, puedes marcarla como cancelada.`)) return

    const { error } = await supabase.from('appointments').delete().eq('id', apt.id)
    if (error) {
      alertDbError(error, 'eliminar')
      return
    }
    setAppointments((prev) => prev.filter((a) => a.id !== apt.id))
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  const clientItems = Object.fromEntries(clientsList.map((c) => [c.id, c.name]))
  const petItems = Object.fromEntries(selectedClientPets.map((p) => [p.id, p.name]))
  const serviceItems = Object.fromEntries(
    serviceOptions.map((s) => [s.id, `${s.name} (${formatPrice(s.price)})`])
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Calendario
          </h1>
          <p className="text-muted-foreground text-sm capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </p>
        </div>
        <Button onClick={() => openForm(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva cita
        </Button>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        {Object.entries(SERVICE_COLORS).map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${color}`} />
            {categoryLabel(cat)}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded ${DEFAULT_COLOR}`} />
          Otros
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/15 bg-primary/[0.04] shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Citas este mes
            </p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? '—' : monthAppointments.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Confirmadas
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {loading ? '—' : confirmedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Día seleccionado
            </p>
            <p className="mt-2 text-3xl font-bold">
              {selectedDay
                ? format(selectedDay, 'd MMM', { locale: es })
                : 'Sin selección'}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedDayAppointments.length} cita
              {selectedDayAppointments.length === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="font-display text-2xl capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex"
                  onClick={() => {
                    const now = new Date()
                    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                    setSelectedDay(now)
                  }}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
                  {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
                    <div
                      key={d}
                      className="rounded-md bg-muted/50 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {[...Array(startDow)].map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[64px] sm:min-h-[108px] rounded-xl bg-muted/20"
                    />
                  ))}
                  {days.map((day) => {
                    const dayApts = getAppointmentsForDay(day).sort((a, b) =>
                      a.time.localeCompare(b.time)
                    )
                    const isSelected = selectedDay && isSameDay(day, selectedDay)
                    const isToday = isSameDay(day, new Date())

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(day)}
                        className={`relative min-h-[64px] sm:min-h-[108px] rounded-xl border p-1 sm:p-2.5 text-left transition-all hover:border-border hover:bg-secondary/40 ${
                          isSelected
                            ? 'border-primary bg-primary/[0.08] ring-2 ring-primary/15 shadow-sm'
                            : 'border-border/60 bg-background'
                        }`}
                      >
                        <div className="mb-1 sm:mb-2 flex items-start justify-between gap-1">
                          <span
                            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-sm font-semibold ${
                              isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                            }`}
                          >
                            {format(day, 'd')}
                          </span>
                          {dayApts.length > 0 && (
                            <span className="rounded-full bg-muted px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                              {dayApts.length}
                            </span>
                          )}
                        </div>
                        <div className="hidden sm:block space-y-1.5">
                          {dayApts.slice(0, 3).map((apt) => (
                            <div
                              key={apt.id}
                              className={`rounded-md px-2 py-1 text-[11px] leading-tight ${colorFor(apt)} ${
                                apt.status === 'cancelled' ? 'opacity-50 line-through' : ''
                              }`}
                            >
                              <span className="block font-semibold">{apt.time.slice(0, 5)}</span>
                              <span className="block truncate">{apt.pets?.name}</span>
                            </div>
                          ))}
                          {dayApts.length > 3 && (
                            <div className="px-1 text-[11px] font-medium text-muted-foreground">
                              +{dayApts.length - 3} más
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Day detail panel */}
        <Card className="shadow-sm lg:sticky lg:top-24 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl capitalize">
              {selectedDay
                ? format(selectedDay, "EEEE d 'de' MMMM", { locale: es })
                : 'Selecciona un día'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayAppointments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium">Sin citas este día</p>
                <Button variant="link" size="sm" onClick={() => openForm(null)}>
                  Crear una cita
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayAppointments.map((apt) => (
                  <div key={apt.id} className="rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-sm">
                        {apt.time.slice(0, 5)}
                        <span className="text-muted-foreground font-normal"> · {apt.duration_minutes} min</span>
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium truncate ${colorFor(apt)}`}>
                        {apt.services?.name}
                      </span>
                    </div>
                    <p className="text-base font-semibold">{apt.pets?.name}</p>
                    <Link
                      href={`/admin/clientes/${apt.client_id}`}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {apt.clients?.name}
                    </Link>
                    {apt.notes && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{apt.notes}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-semibold">{formatPrice(apt.price)}</span>
                      <div className="flex gap-1">
                        {paidAptIds.has(apt.id) && (
                          <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">
                            Cobrada
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-xs ${STATUS_BADGE[apt.status] || ''}`}>
                          {STATUS_LABELS[apt.status] || apt.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1 mt-3 pt-2 border-t border-border/40">
                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => setStatus(apt, 'completed')}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Hecha
                        </Button>
                      )}
                      {!paidAptIds.has(apt.id) && apt.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-emerald-700"
                          onClick={() => openPay(apt)}
                        >
                          <Euro className="h-3 w-3 mr-1" />
                          Cobrar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => openForm(apt)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(apt)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar cita' : 'Nueva cita'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Client */}
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              {clientsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay clientes.{' '}
                  <Link href="/admin/clientes" className="text-primary underline">
                    Crea uno primero
                  </Link>
                  .
                </p>
              ) : (
                <Select items={clientItems} value={fClient} onValueChange={(val) => handleSelectClient(val || '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Pet */}
            {fClient && (
              <div className="space-y-1.5">
                <Label>Mascota *</Label>
                {selectedClientPets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Este cliente no tiene mascotas.{' '}
                    <Link href={`/admin/clientes/${fClient}`} className="text-primary underline">
                      Añade una en su ficha
                    </Link>
                    .
                  </p>
                ) : (
                  <Select items={petItems} value={fPet} onValueChange={(val) => setFPet(val || '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar mascota" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedClientPets.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Service */}
            <div className="space-y-1.5">
              <Label>Servicio *</Label>
              <Select items={serviceItems} value={fService} onValueChange={(val) => handleSelectService(val || '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{serviceItems[s.id]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha *</Label>
                <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Hora *</Label>
                <Input type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} />
              </div>
            </div>

            {/* Duration, price & status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Duración (min)</Label>
                <Input type="number" min="5" step="5" value={fDuration} onChange={(e) => setFDuration(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Precio (€)</Label>
                <Input type="number" min="0" step="0.5" value={fPrice} onChange={(e) => setFPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select items={STATUS_LABELS} value={fStatus} onValueChange={(val) => setFStatus(val || 'confirmed')}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                rows={2}
                placeholder="Ej. Recoger llaves en portería"
                value={fNotes}
                onChange={(e) => setFNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Guardando...
                  </>
                ) : editingId ? (
                  'Guardar cambios'
                ) : (
                  'Crear cita'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register payment dialog */}
      <Dialog open={!!payApt} onOpenChange={(o) => !o && setPayApt(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar cobro</DialogTitle>
          </DialogHeader>
          {payApt && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Se registrará un ingreso de {formatPrice(payApt.price)} en Contabilidad
                ({payApt.services?.name} · {payApt.pets?.name}).
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fecha de cobro</Label>
                  <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Método</Label>
                  <Select items={METHOD_LABELS} value={payMethod} onValueChange={(val) => setPayMethod(val || 'cash')}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(METHOD_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPayApt(null)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={handleRegisterPayment}
                  disabled={paying}
                >
                  {paying && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
