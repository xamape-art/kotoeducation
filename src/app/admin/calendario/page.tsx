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
import { Calendar } from '@/components/ui/calendar'
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
  walk: 'bg-green-200 text-green-800',
  visit: 'bg-blue-200 text-blue-800',
  care: 'bg-orange-200 text-orange-800',
  training: 'bg-purple-200 text-purple-800',
}

const SERVICE_ICONS = {
  walk: Dog,
  visit: Home,
  care: Heart,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {[...Array(startDow)].map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const dayApts = getAppointmentsForDay(day)
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                const isToday = isSameDay(day, new Date())

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`relative min-h-[60px] p-1.5 rounded-lg text-left transition-colors hover:bg-muted/60 ${
                      isSelected ? 'bg-primary/10 ring-1 ring-primary' : ''
                    } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
                  >
                    <span className={`text-xs font-medium block mb-1 ${
                      isToday ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]' : ''
                    }`}>
                      {format(day, 'd')}
                    </span>
                    <div className="space-y-0.5">
                      {dayApts.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-[10px] px-1 rounded truncate ${SERVICE_COLORS[apt.type]}`}
                        >
                          {apt.time} {apt.pet}
                        </div>
                      ))}
                      {dayApts.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">+{dayApts.length - 2} más</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day detail */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDay
                ? format(selectedDay, "EEEE d 'de' MMMM", { locale: es })
                : 'Selecciona un día'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayAppointments.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin citas este día</p>
            ) : (
              <div className="space-y-3">
                {selectedDayAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-sm">{apt.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${SERVICE_COLORS[apt.type]}`}>
                          {apt.service}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{apt.pet}</p>
                      <p className="text-xs text-muted-foreground">{apt.client}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold">{apt.price}€</span>
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
