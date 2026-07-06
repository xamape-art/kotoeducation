'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Plus, Euro, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

const mockIncome = [
  { id: '1', date: '06/07/2025', description: 'Paseo - Koto (Xavier M.)', amount: 10, method: 'cash' },
  { id: '2', date: '05/07/2025', description: 'Paseo - Max (Laura G.)', amount: 10, method: 'transfer' },
  { id: '3', date: '04/07/2025', description: 'Visita - Luna (Marc T.)', amount: 10, method: 'cash' },
  { id: '4', date: '03/07/2025', description: 'Paseo - Rocky (Pedro L.)', amount: 10, method: 'cash' },
  { id: '5', date: '02/07/2025', description: 'Cuidado 2 noches - Mochi (Ana R.)', amount: 70, method: 'transfer' },
  { id: '6', date: '01/07/2025', description: 'Paseo - Koto (Xavier M.)', amount: 10, method: 'cash' },
]

const mockExpenses = [
  { id: '1', date: '03/07/2025', description: 'Snacks para perros', amount: 12.50, category: 'Suministros' },
  { id: '2', date: '28/06/2025', description: 'Correa extensible', amount: 18, category: 'Equipo' },
  { id: '3', date: '20/06/2025', description: 'Transporte - junio', amount: 25, category: 'Transporte' },
  { id: '4', date: '15/06/2025', description: 'Curso educación canina', amount: 85, category: 'Formación' },
]

const monthlyData = [
  { month: 'Feb', ingresos: 180, gastos: 45 },
  { month: 'Mar', ingresos: 240, gastos: 60 },
  { month: 'Abr', ingresos: 210, gastos: 38 },
  { month: 'May', ingresos: 320, gastos: 95 },
  { month: 'Jun', ingresos: 290, gastos: 128 },
  { month: 'Jul', ingresos: 380, gastos: 55.5 },
]

const methodLabel: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
}

const methodColor: Record<string, string> = {
  cash: 'bg-green-100 text-green-700',
  transfer: 'bg-blue-100 text-blue-700',
  card: 'bg-purple-100 text-purple-700',
}

export default function ContabilidadPage() {
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)

  const totalIncome = mockIncome.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0)
  const profit = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contabilidad</h1>
          <p className="text-muted-foreground text-sm">Julio 2025</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Ingreso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Registrar ingreso</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Descripción *</Label>
                  <Input placeholder="Ej: Paseo - Koto" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Importe (€) *</Label>
                    <Input type="number" placeholder="10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fecha *</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Método de pago</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIncomeOpen(false)}>Cancelar</Button>
                  <Button onClick={() => setIncomeOpen(false)}>Guardar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Registrar gasto</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Descripción *</Label>
                  <Input placeholder="Ej: Correa nueva" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Importe (€) *</Label>
                    <Input type="number" placeholder="18" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fecha *</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transport">Transporte</SelectItem>
                      <SelectItem value="supplies">Suministros</SelectItem>
                      <SelectItem value="equipment">Equipo</SelectItem>
                      <SelectItem value="training">Formación</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setExpenseOpen(false)}>Cancelar</Button>
                  <Button onClick={() => setExpenseOpen(false)}>Guardar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ingresos (mes)</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{totalIncome.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Gastos (mes)</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-500">{totalExpenses.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Beneficio neto</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className={`text-3xl font-bold ${profit >= 0 ? 'text-primary' : 'text-red-500'}`}>
              {profit.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ingresos">
        <TabsList>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen anual</TabsTrigger>
        </TabsList>

        <TabsContent value="ingresos" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockIncome.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 text-sm">
                    <div className="text-muted-foreground w-24 shrink-0">{item.date}</div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.description}</p>
                    </div>
                    <Badge className={`text-xs ${methodColor[item.method]}`} variant="outline">
                      {methodLabel[item.method]}
                    </Badge>
                    <span className="font-semibold text-green-600 w-16 text-right">+{item.amount}€</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gastos" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockExpenses.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 text-sm">
                    <div className="text-muted-foreground w-24 shrink-0">{item.date}</div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    <span className="font-semibold text-red-500 w-16 text-right">-{item.amount}€</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumen" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ingresos vs Gastos (2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip formatter={(v) => [`${v}€`]} />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" name="Gastos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Annual totals */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {monthlyData.reduce((s, m) => s + m.ingresos, 0)}€
                  </p>
                  <p className="text-xs text-muted-foreground">Total ingresos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {monthlyData.reduce((s, m) => s + m.gastos, 0).toFixed(1)}€
                  </p>
                  <p className="text-xs text-muted-foreground">Total gastos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {(monthlyData.reduce((s, m) => s + m.ingresos, 0) - monthlyData.reduce((s, m) => s + m.gastos, 0)).toFixed(1)}€
                  </p>
                  <p className="text-xs text-muted-foreground">Beneficio neto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
