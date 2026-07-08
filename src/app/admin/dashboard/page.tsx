'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  MessageSquare,
  Euro,
  CheckCircle2,
  Phone,
  Mail,
  Loader2,
  Eye,
  Plus,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const statusColor: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  booked: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}

const reqStatusLabel: Record<string, string> = {
  new: 'Nueva',
  contacted: 'Contactado',
  booked: 'Convertido',
  closed: 'Cerrado',
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  // Contact requests
  const [requests, setRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [openRequestModal, setOpenRequestModal] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)

  // Stats
  const [loadingStats, setLoadingStats] = useState(true)
  const [totalClients, setTotalClients] = useState(0)
  const [newClientsThisMonth, setNewClientsThisMonth] = useState(0)
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0)
  const [prevMonthIncome, setPrevMonthIncome] = useState(0)
  const [revenueData, setRevenueData] = useState<{ month: string; ingresos: number }[]>([])

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // ─── Fetch Stats ────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() // 0-indexed
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      // 1. Total clients & new this month
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, created_at')

      const allClients = clientsData || []
      setTotalClients(allClients.length)

      const newThisMonth = allClients.filter((c) => {
        const d = new Date(c.created_at)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      }).length
      setNewClientsThisMonth(newThisMonth)

      // 2. Income data from 'income' table
      const { data: incomeData } = await supabase
        .from('income')
        .select('amount, date')
        .order('date', { ascending: true })

      const income = incomeData || []

      // Current month income
      const thisMonthInc = income
        .filter((i) => {
          const parts = i.date?.split('-')
          if (!parts || parts.length < 2) return false
          return parseInt(parts[0]) === currentYear && parseInt(parts[1]) - 1 === currentMonth
        })
        .reduce((sum, i) => sum + Number(i.amount), 0)
      setCurrentMonthIncome(thisMonthInc)

      // Previous month income
      const prevMonthInc = income
        .filter((i) => {
          const parts = i.date?.split('-')
          if (!parts || parts.length < 2) return false
          return parseInt(parts[0]) === prevMonthYear && parseInt(parts[1]) - 1 === prevMonth
        })
        .reduce((sum, i) => sum + Number(i.amount), 0)
      setPrevMonthIncome(prevMonthInc)

      // 3. Revenue chart — last 6 months
      const last6: { month: string; ingresos: number }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1)
        const y = d.getFullYear()
        const m = d.getMonth()
        const monthInc = income
          .filter((item) => {
            const parts = item.date?.split('-')
            if (!parts || parts.length < 2) return false
            return parseInt(parts[0]) === y && parseInt(parts[1]) - 1 === m
          })
          .reduce((sum, item) => sum + Number(item.amount), 0)
        last6.push({ month: MONTH_NAMES[m], ingresos: monthInc })
      }
      setRevenueData(last6)
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  // ─── Fetch Contact Requests ──────────────────────────────────────────────────
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRequests()
  }, [])

  // ─── Computed ────────────────────────────────────────────────────────────────
  const incomeChange = prevMonthIncome > 0
    ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100)
    : null

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleOpenRequest = (req: any) => {
    setSelectedRequest(req)
    setOpenRequestModal(true)
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status })
        .eq('id', selectedRequest.id)

      if (error) throw error
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status } : r))
      )
      setSelectedRequest({ ...selectedRequest, status })
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Error al actualizar el estado.')
    }
  }

  const handleCreateClientFromRequest = async () => {
    if (!selectedRequest) return
    try {
      setCreatingClient(true)

      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .insert([
          {
            name: selectedRequest.name,
            email: selectedRequest.email,
            phone: selectedRequest.phone || null,
            notes: selectedRequest.message || null,
          },
        ])
        .select()
        .single()

      if (clientErr) throw clientErr

      if (selectedRequest.pet_name && clientData) {
        const { error: petErr } = await supabase
          .from('pets')
          .insert([
            {
              client_id: clientData.id,
              name: selectedRequest.pet_name,
              breed: selectedRequest.pet_breed || null,
              weight_kg: selectedRequest.pet_weight ? Number(selectedRequest.pet_weight) : 0,
              age_years: selectedRequest.pet_age ? Math.floor(Number(selectedRequest.pet_age)) : 0,
              species: 'dog',
            },
          ])

        if (petErr) throw petErr
      }

      await supabase
        .from('contact_requests')
        .update({ status: 'booked' })
        .eq('id', selectedRequest.id)

      setOpenRequestModal(false)
      router.push(`/admin/clientes/${clientData.id}`)
    } catch (err) {
      console.error('Error creating client:', err)
      alert('Error al crear la ficha del cliente.')
    } finally {
      setCreatingClient(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return
    if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud de contacto?')) return

    try {
      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', selectedRequest.id)

      if (error) throw error

      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
      setOpenRequestModal(false)
    } catch (err) {
      console.error('Error deleting request:', err)
      alert('Error al eliminar la solicitud.')
    }
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
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />
            ) : (
              <>
                <div className="text-3xl font-bold">{currentMonthIncome.toFixed(0)}€</div>
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

        {/* Clientes activos */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Clientes activos</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            {loadingStats ? (
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

        {/* Solicitudes pendientes */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Solicitudes pendientes</span>
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            {loadingRequests ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary opacity-60" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {requests.filter((r) => r.status === 'new').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {requests.length} solicitudes recientes
                </p>
              </>
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
          {loadingStats ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip formatter={(v) => [`${v}€`, 'Ingresos']} />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Solicitudes de contacto & Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitudes de contacto */}
        <Card className="border border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <MessageSquare className="h-4 w-4" />
              Solicitudes de contacto
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              {requests.filter((r) => r.status === 'new').length} nuevas
            </Badge>
          </CardHeader>
          <CardContent className="flex-1">
            {loadingRequests ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary opacity-60" />
                <p className="text-xs">Cargando solicitudes...</p>
              </div>
            ) : requests.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No hay solicitudes de contacto.
              </p>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 text-xs p-3 rounded-xl border bg-muted/20"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{req.name}</p>
                        {req.created_at && (
                          <span className="text-[10px] text-muted-foreground shrink-0 font-normal">
                            {new Date(req.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                            })}{' '}
                            a las{' '}
                            {new Date(req.created_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {req.pet_name
                          ? `${req.pet_name} (${req.pet_breed || 'Raza no indicada'})`
                          : 'Sin mascota'}{' '}
                        · <span className="capitalize">{req.service_type}</span>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[req.status]}`}
                    >
                      {reqStatusLabel[req.status] || req.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 rounded-lg"
                      onClick={() => handleOpenRequest(req)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
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
            <p className="text-muted-foreground text-sm mb-4">
              Accesos directos para la gestión del día a día:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                variant="outline"
                className="justify-start h-11 border-primary/20 hover:bg-primary/[0.03] text-primary rounded-xl"
              >
                <Link href="/admin/calendario">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva cita
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-11 border-primary/20 hover:bg-primary/[0.03] text-primary rounded-xl"
              >
                <Link href="/admin/clientes">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo cliente
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-11 border-primary/20 hover:bg-primary/[0.03] text-primary rounded-xl col-span-2"
              >
                <Link href="/admin/contabilidad">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar ingreso o gasto
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal detalle solicitud */}
      <Dialog open={openRequestModal} onOpenChange={setOpenRequestModal}>
        <DialogContent className="sm:!max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la solicitud</DialogTitle>
            {selectedRequest?.created_at && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Recibida el{' '}
                {new Date(selectedRequest.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}{' '}
                a las{' '}
                {new Date(selectedRequest.created_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-2 text-sm">
              {/* Cliente */}
              <div className="border-b pb-3 space-y-2">
                <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Datos del Cliente
                </p>
                <p className="text-base font-semibold">{selectedRequest.name}</p>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${selectedRequest.email}`} className="hover:underline">
                      {selectedRequest.email}
                    </a>
                  </div>
                  {selectedRequest.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <a href={`tel:${selectedRequest.phone}`} className="hover:underline">
                        {selectedRequest.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Mascota y Servicio */}
              <div className="border-b pb-3 space-y-3">
                <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Mascota y Servicio
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-3 rounded-xl">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Mascota</span>
                    <span className="font-semibold text-sm">
                      {selectedRequest.pet_name || 'No indicado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Raza</span>
                    <span className="font-semibold text-sm">
                      {selectedRequest.pet_breed || 'No indicada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Peso</span>
                    <span className="font-semibold text-sm">
                      {selectedRequest.pet_weight
                        ? `${selectedRequest.pet_weight} kg`
                        : 'No indicado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Edad</span>
                    <span className="font-semibold text-sm">
                      {selectedRequest.pet_age
                        ? `${selectedRequest.pet_age} años`
                        : 'No indicada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Servicio</span>
                    <span className="font-semibold text-sm capitalize">
                      {selectedRequest.service_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Fecha preferida
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedRequest.preferred_date
                        ? new Date(selectedRequest.preferred_date).toLocaleDateString('es-ES')
                        : 'No indicada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mensaje */}
              <div className="space-y-1.5">
                <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Mensaje
                </p>
                <p className="text-muted-foreground bg-muted/20 p-3 rounded-xl italic">
                  &quot;{selectedRequest.message || 'Sin mensaje adicional.'}&quot;
                </p>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 pt-3 border-t">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Estado actual:</span>
                  <Badge
                    variant="outline"
                    className={`capitalize ${statusColor[selectedRequest.status]}`}
                  >
                    {reqStatusLabel[selectedRequest.status] || selectedRequest.status}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-3">
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenRequestModal(false)}
                    >
                      Cerrar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteRequest}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Eliminar
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {selectedRequest.status === 'new' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus('contacted')}
                      >
                        Marcar como contactado
                      </Button>
                    )}
                    {selectedRequest.status !== 'booked' && (
                      <Button
                        size="sm"
                        onClick={handleCreateClientFromRequest}
                        disabled={creatingClient}
                      >
                        {creatingClient ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Creando...
                          </>
                        ) : (
                          'Crear ficha de cliente'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
