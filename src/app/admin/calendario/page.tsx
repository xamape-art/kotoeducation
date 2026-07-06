'use client'

import { useState } from 'react'
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
  Dog,
  Home,
  Heart,
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

const SERVICE_COLORS: Record<string, string> = {
  walk: 'border border-emerald-200 bg-emerald-100 text-emerald-900',
  visit: 'border border-sky-200 bg-sky-100 text-sky-900',
  care: 'border border-amber-200 bg-amber-100 text-amber-900',
  training: 'border border-violet-200 bg-violet-100 text-violet-900',
}

const mockAppointments = [
  { id: '1', date: new Date(2025, 6, 7), time: '09:00', client: 'Xavier M.', pet: 'Koto', service: 'Paseo', type: 'walk', price: 10, status: 'confirmed' },
  { id: '2', date: new Date(2025, 6, 7), time: '11:30', client: 'Laura G.', pet: 'Max', service: 'Paseo', type: 'walk', price: 10, status: 'confirmed' },
  { id: '3', date: new Date(2025, 6, 9), time: '15:00', client: 'Marc T.', pet: 'Luna', service: 'Visita', type: 'visit', price: 10, status: 'pending' },
  { id: '4', date: new Date(2025, 6, 10), time: '09:00', client: 'Xavier M.', pet: 'Koto', service: 'Paseo', type: 'walk', price: 10, status: 'confirmed' },
  { id: '5', date: new Date(2025, 6, 14), time: '10:00', client: 'Ana R.', pet: 'Mochi', service: 'Visita', type: 'visit', price: 10, status: 'confirmed' },
  { id: '6', date: new Date(2025, 6, 15), time: '08:00', client: 'Pedro L.', pet: 'Rocky', service: 'Cuidado', type: 'care', price: 35, status: 'confirmed' },
]

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6, 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date(2025, 6, 7))
  const [openDialog, setOpenDialog] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = (getDay(monthStart) + 6) % 7 // Monday-based

  const getAppointmentsForDay = (day: Date) =>
    mockAppointments.filter((a) => isSameDay(a.date, day))

  const selectedDayAppointments = selectedDay ? getAppointmentsForDay(selectedDay) : []
  const monthAppointments = mockAppointments.filter((a) => isSameMonth(a.date, currentMonth))
  const confirmedAppointments = monthAppointments.filter((a) => a.status === 'confirmed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted-foreground text-sm">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cliente *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Xavier M.</SelectItem>
                      <SelectItem value="2">Laura G.</SelectItem>
                      <SelectItem value="3">Marc T.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Mascota *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="koto">Koto</SelectItem>
                      <SelectItem value="max">Max</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Servicio *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Tipo de servicio" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk">Paseo de perros (10€)</SelectItem>
                    <SelectItem value="visit">Visita a domicilio (10€)</SelectItem>
                    <SelectItem value="care">Cuidado a domicilio (35€)</SelectItem>
                    <SelectItem value="training">Educación canina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fecha *</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label>Hora *</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Duración (min)</Label>
                  <Input type="number" placeholder="30" />
                </div>
                <div className="space-y-1.5">
                  <Label>Precio (€)</Label>
                  <Input type="number" placeholder="10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notas</Label>
                <Textarea placeholder="Notas sobre la cita..." rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                <Button onClick={() => setOpenDialog(false)}>Crear cita</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200" />Paseo</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200" />Visita</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-200" />Cuidado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-200" />Educación</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/15 bg-primary/[0.04] shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Citas este mes</p>
            <p className="mt-2 text-3xl font-bold">{monthAppointments.length}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Confirmadas</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">{confirmedAppointments}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Día seleccionado</p>
            <p className="mt-2 text-lg font-semibold">
              {selectedDay ? format(selectedDay, "d MMM", { locale: es }) : 'Sin selección'}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedDayAppointments.length} cita{selectedDayAppointments.length === 1 ? '' : 's'}
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
              <CardTitle className="text-lg capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex"
                  onClick={() => {
                    setCurrentMonth(new Date())
                    setSelectedDay(new Date())
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
                <div key={`empty-${i}`} className="min-h-[108px] rounded-xl bg-muted/20" />
              ))}
              {days.map((day) => {
                const dayApts = getAppointmentsForDay(day)
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                const isToday = isSameDay(day, new Date())

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`relative min-h-[108px] rounded-xl border p-2.5 text-left transition-all hover:border-border hover:bg-secondary/40 ${
                      isSelected ? 'border-primary bg-primary/8 ring-2 ring-primary/15 shadow-sm' : 'border-border/60 bg-background'
                    } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
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
                          className={`rounded-md px-2 py-1 text-[11px] leading-tight ${SERVICE_COLORS[apt.type]}`}
                        >
                          <span className="block font-semibold">{apt.time}</span>
                          <span className="block truncate">{apt.pet}</span>
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
          </CardContent>
        </Card>

        {/* Day detail */}
        <Card className="shadow-sm lg:sticky lg:top-24 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
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
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${SERVICE_COLORS[apt.type]}`}>
                          {apt.service}
                        </span>
                      </div>
                      <p className="text-base font-semibold">{apt.pet}</p>
                      <p className="text-sm text-muted-foreground">{apt.client}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-semibold">{apt.price}€</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${apt.status === 'confirmed' ? 'border-green-300 text-green-700' : 'border-yellow-300 text-yellow-700'}`}
                        >
                          {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
