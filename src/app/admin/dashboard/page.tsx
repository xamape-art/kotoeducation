'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  Dog,
  MessageSquare,
  Euro,
  CheckCircle2,
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

const revenueData = [
  { month: 'Feb', ingresos: 180 },
  { month: 'Mar', ingresos: 240 },
  { month: 'Abr', ingresos: 210 },
  { month: 'May', ingresos: 320 },
  { month: 'Jun', ingresos: 290 },
  { month: 'Jul', ingresos: 380 },
]

const upcomingAppointments = [
  { id: '1', time: '09:00', pet: 'Koto', client: 'Xavier M.', service: 'Paseo', status: 'confirmed' },
  { id: '2', time: '11:30', pet: 'Max', client: 'Laura G.', service: 'Paseo', status: 'confirmed' },
  { id: '3', time: '15:00', pet: 'Luna', client: 'Marc T.', service: 'Visita', status: 'pending' },
  { id: '4', time: '17:00', pet: 'Rocky', client: 'Ana R.', service: 'Paseo', status: 'confirmed' },
]

const recentRequests = [
  { name: 'Carlos M.', pet: 'Beagle', service: 'Paseo', date: 'Hoy 14:23', status: 'new' },
  { name: 'Marta P.', pet: 'Gato (Siamés)', service: 'Visita', date: 'Ayer 18:45', status: 'contacted' },
]

const statusColor: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-gray-100 text-gray-700',
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground capitalize">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Citas hoy</span>
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">3 confirmadas · 1 pendiente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Ingresos del mes</span>
              <Euro className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">380€</div>
            <p className="text-xs text-green-600 mt-1">↑ +31% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Clientes activos</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">+2 nuevos este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Próxima cita</span>
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">09:00</div>
            <p className="text-xs text-muted-foreground mt-1">Paseo con Koto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <TrendingUp className="h-4 w-4" />
              Ingresos últimos 6 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(v) => [`${v}€`, 'Ingresos']} />
                <Bar dataKey="ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between font-display text-lg">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Citas de hoy
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/calendario">Ver todo</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 text-sm">
                  <div className="text-muted-foreground w-10 shrink-0">{apt.time}</div>
                  <Dog className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{apt.pet}</p>
                    <p className="text-muted-foreground text-xs">{apt.service} · {apt.client}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[apt.status]}`}>
                    {apt.status === 'confirmed' ? 'Conf.' : 'Pend.'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent contact requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between font-display text-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Solicitudes de contacto recientes
            </div>
            <Badge variant="secondary">{recentRequests.filter(r => r.status === 'new').length} nuevas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay solicitudes nuevas.</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req, i) => (
                <div key={i} className="flex items-center gap-4 text-sm p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{req.name}</p>
                    <p className="text-muted-foreground text-xs">{req.pet} · {req.service}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{req.date}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[req.status]}`}>
                    {req.status === 'new' ? 'Nueva' : 'Contactado'}
                  </span>
                  <Button size="sm" variant="outline">Ver</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CheckCircle2 className="h-4 w-4" />
            Acciones rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm">
              <Link href="/admin/calendario">+ Nueva cita</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/clientes">+ Nuevo cliente</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/contabilidad">+ Registrar ingreso</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
