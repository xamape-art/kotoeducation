'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const SERVICE_COLORS: Record<string, string> = {
  walk: 'border border-emerald-200 bg-emerald-100 text-emerald-900',
  visit: 'border border-sky-200 bg-sky-100 text-sky-900',
  care: 'border border-amber-200 bg-amber-100 text-amber-900',
  training: 'border border-violet-200 bg-violet-100 text-violet-900',
}

const SERVICE_LABELS: Record<string, string> = {
  walk: 'Paseo',
  visit: 'Visita',
  care: 'Cuidado',
  training: 'Educación',
}

// Parse "YYYY-MM-DD" to local Date (avoids UTC offset shifting the day)
const parseDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function CalendarioPage() {
  const supabase = createClient()
  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDay, setSelectedDay] = useState<Date | null>(today)
  const [appointments, setAppointments] = useState<any[]>([])
  const [clientsList, setClientsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // New appointment form
  const [openDialog, setOpenDialog] = useState(false)
  const [newClientId, setNewClientId] = useState('')
  const [newClient, setNewClient] = useState('')
  const [newPet, setNewPet] = useState('')
  const [newService, setNewService] = useState('walk')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newPrice, setNewPrice] = useState('10')
  const [newStatus, setNewStatus] = useState('confirmed')
  const [saving, setSaving] = useState(false)

  // Edit appointment
  const [editingApt, setEditingApt] = useState<any>(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
    } else {
      setAppointments(
        (data || []).map((a) => ({ ...a, date: parseDate(a.date) }))
      )
    }
    setLoading(false)
  }

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name, pets(id, name)')
      .order('name')
    setClientsList(data || [])
  }

  useEffect(() => {
    fetchAppointments()
    fetchClients()
  }, [])

  // ─── Calendar helpers ────────────────────────────────────────────────────────
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = (getDay(monthStart) + 6) % 7 // Monday-based

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(a.date, day))

  const selectedDayAppointments = selectedDay
    ? getAppointmentsForDay(selectedDay)
    : []
  const monthAppointments = appointments.filter((a) =>
    isSameMonth(a.date, currentMonth)
  )
  const confirmedCount = monthAppointments.filter(
    (a) => a.status === 'confirmed'
  ).length

  const selectedClient = clientsList.find((c) => c.id === newClientId)
  const selectedClientPets: any[] = selectedClient?.pets || []

  // ─── Reset form ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setNewClientId('')
    setNewClient('')
    setNewPet('')
    setNewService('walk')
    setNewDate('')
    setNewTime('')
    setNewPrice('10')
    setNewStatus('confirmed')
  }

  // ─── Create ──────────────────────────────────────────────────────────────────
  const handleCreateAppointment = async () => {
    if (!newClient || !newPet || !newDate || !newTime) {
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        date: newDate,
        time: newTime,
        client: newClient,
        pet_name: newPet,
        service: SERVICE_LABELS[newService] || 'Paseo',
        type: newService,
        price: Number(newPrice) || 10,
        status: newStatus,
      }
      if (newClientId) payload.client_id = newClientId

      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setAppointments((prev) => [
          ...prev,
          { ...data[0], date: parseDate(data[0].date) },
        ])
      }

      setOpenDialog(false)
      resetForm()
    } catch (err) {
      console.error('Error creating appointment:', err)
      alert('Error al crear la cita.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Edit ────────────────────────────────────────────────────────────────────
  const handleOpenEdit = (apt: any) => {
    setEditingApt({
      ...apt,
      dateStr: format(apt.date, 'yyyy-MM-dd'),
      // Normalise pet field name
      pet_name: apt.pet_name || apt.pet || '',
    })
    setOpenEditDialog(true)
  }

  const handleUpdateAppointment = async () => {
    if (!editingApt.client || !editingApt.pet_name || !editingApt.time) {
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    setEditSaving(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          date: editingApt.dateStr,
          time: editingApt.time,
          client: editingApt.client,
          pet_name: editingApt.pet_name,
          service: editingApt.service,
          type: editingApt.type,
          price: Number(editingApt.price) || 10,
          status: editingApt.status,
        })
        .eq('id', editingApt.id)
        .select()

      if (error) throw error

      if (data && data[0]) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === editingApt.id
              ? { ...data[0], date: parseDate(data[0].date) }
              : a
          )
        )
      }

      setOpenEditDialog(false)
      setEditingApt(null)
    } catch (err) {
      console.error('Error updating appointment:', err)
      alert('Error al actualizar la cita.')
    } finally {
      setEditSaving(false)
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita?')) return

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error
      setAppointments((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error('Error deleting appointment:', err)
      alert('Error al eliminar la cita.')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Calendario
          </h1>
          <p className="text-muted-foreground text-sm">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </p>
        </div>

        {/* New appointment dialog */}
        <Dialog
          open={openDialog}
          onOpenChange={(o) => {
            setOpenDialog(o)
            if (!o) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva cita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva cita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Client */}
              <div className="space-y-1.5">
                <Label>Cliente *</Label>
                <Select
                  value={newClientId}
                  onValueChange={(val) => {
                    setNewClientId(val || '')
                    const c = clientsList.find((c) => c.id === val)
                    if (c) setNewClient(c.name)
                    setNewPet('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pet */}
              <div className="space-y-1.5">
                <Label>Mascota *</Label>
                {selectedClientPets.length > 0 ? (
                  <Select
                    value={newPet}
                    onValueChange={(val) => setNewPet(val || '')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mascota" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedClientPets.map((p: any) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Nombre de la mascota"
                    value={newPet}
                    onChange={(e) => setNewPet(e.target.value)}
                  />
                )}
              </div>

              {/* Service */}
              <div className="space-y-1.5">
                <Label>Servicio *</Label>
                <Select
                  value={newService}
                  onValueChange={(val) => setNewService(val || 'walk')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk">Paseo (10€)</SelectItem>
                    <SelectItem value="visit">Visita a domicilio (10€)</SelectItem>
                    <SelectItem value="care">Cuidado a domicilio (35€)</SelectItem>
                    <SelectItem value="training">Educación canina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Hora *</Label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Price & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Precio (€)</Label>
                  <Input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(val) => setNewStatus(val || 'confirmed')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAppointment} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Guardando...
                    </>
                  ) : (
                    'Crear cita'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-200" />Paseo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-200" />Visita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-200" />Cuidado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-200" />Educación
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
                    setCurrentMonth(
                      new Date(now.getFullYear(), now.getMonth(), 1)
                    )
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
                <div className="grid grid-cols-7 gap-2 mb-3">
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
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(startDow)].map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[108px] rounded-xl bg-muted/20"
                    />
                  ))}
                  {days.map((day) => {
                    const dayApts = getAppointmentsForDay(day)
                    const isSelected =
                      selectedDay && isSameDay(day, selectedDay)
                    const isToday = isSameDay(day, new Date())

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(day)}
                        className={`relative min-h-[108px] rounded-xl border p-2.5 text-left transition-all hover:border-border hover:bg-secondary/40 ${
                          isSelected
                            ? 'border-primary bg-primary/[0.08] ring-2 ring-primary/15 shadow-sm'
                            : 'border-border/60 bg-background'
                        } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                              isToday
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {format(day, 'd')}
                          </span>
                          {dayApts.length > 0 && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {dayApts.length}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {dayApts.slice(0, 3).map((apt) => (
                            <div
                              key={apt.id}
                              className={`rounded-md px-2 py-1 text-[11px] leading-tight ${
                                SERVICE_COLORS[apt.type] || SERVICE_COLORS.walk
                              }`}
                            >
                              <span className="block font-semibold">
                                {apt.time}
                              </span>
                              <span className="block truncate">
                                {apt.pet_name || apt.pet}
                              </span>
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
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecciona otra fecha o crea una nueva cita.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((apt) => (
                    <div key={apt.id} className="rounded-xl border p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm">{apt.time}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            SERVICE_COLORS[apt.type] || SERVICE_COLORS.walk
                          }`}
                        >
                          {apt.service}
                        </span>
                      </div>
                      <p className="text-base font-semibold">
                        {apt.pet_name || apt.pet}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apt.client}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-semibold">
                          {apt.price}€
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            apt.status === 'confirmed'
                              ? 'border-green-300 text-green-700'
                              : 'border-yellow-300 text-yellow-700'
                          }`}
                        >
                          {apt.status === 'confirmed'
                            ? 'Confirmada'
                            : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-border/40">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleOpenEdit(apt)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteAppointment(apt.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cita</DialogTitle>
          </DialogHeader>
          {editingApt && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cliente *</Label>
                  <Input
                    value={editingApt.client}
                    onChange={(e) =>
                      setEditingApt({ ...editingApt, client: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mascota *</Label>
                  <Input
                    value={editingApt.pet_name}
                    onChange={(e) =>
                      setEditingApt({
                        ...editingApt,
                        pet_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Servicio *</Label>
                <Select
                  value={editingApt.type}
                  onValueChange={(val) => {
                    if (!val) return
                    setEditingApt({
                      ...editingApt,
                      type: val,
                      service: SERVICE_LABELS[val] || 'Paseo',
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk">Paseo</SelectItem>
                    <SelectItem value="visit">Visita a domicilio</SelectItem>
                    <SelectItem value="care">Cuidado a domicilio</SelectItem>
                    <SelectItem value="training">Educación canina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={editingApt.dateStr}
                    onChange={(e) =>
                      setEditingApt({
                        ...editingApt,
                        dateStr: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Hora *</Label>
                  <Input
                    type="time"
                    value={editingApt.time}
                    onChange={(e) =>
                      setEditingApt({ ...editingApt, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Precio (€)</Label>
                  <Input
                    type="number"
                    value={editingApt.price}
                    onChange={(e) =>
                      setEditingApt({
                        ...editingApt,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select
                    value={editingApt.status}
                    onValueChange={(val) =>
                      setEditingApt({
                        ...editingApt,
                        status: val || 'confirmed',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateAppointment}
                  disabled={editSaving}
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
