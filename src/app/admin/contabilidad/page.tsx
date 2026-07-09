'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, TrendingUp, TrendingDown, Wallet, Edit, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const methodLabel: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
}

const methodColor: Record<string, string> = {
  cash: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  transfer: 'bg-blue-50 border-blue-200 text-blue-700',
  card: 'bg-purple-50 border-purple-200 text-purple-700',
}

// Helpers for date formatting
const formatDbToUiDate = (dbDate: string) => {
  if (!dbDate) return ''
  const parts = dbDate.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dbDate
}

const getYearAndMonth = (dateStr: string) => {
  if (!dateStr) return { year: 0, month: 0 }
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1, // 0-indexed month
    }
  }
  return { year: 0, month: 0 }
}

export default function ContabilidadPage() {
  const supabase = createClient()

  // Loading & Lists
  const [loading, setLoading] = useState(true)
  const [incomeList, setIncomeList] = useState<any[]>([])
  const [expenseList, setExpenseList] = useState<any[]>([])

  // Modal Open States
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)

  // Editing items tracker
  const [editingIncome, setEditingIncome] = useState<any>(null)
  const [editingExpense, setEditingExpense] = useState<any>(null)

  // Form states for income
  const [incDesc, setIncDesc] = useState('')
  const [incAmount, setIncAmount] = useState('')
  const [incMethod, setIncMethod] = useState('cash')

  // Form states for expense
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('Suministros')

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const { data: incData, error: incErr } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false })

      if (incErr) throw incErr

      const { data: expData, error: expErr } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      if (expErr) throw expErr

      setIncomeList(incData || [])
      setExpenseList(expData || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Current Month Calculations
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const currentMonthIncome = incomeList.filter((item) => {
    const { year, month } = getYearAndMonth(item.date)
    return year === currentYear && month === currentMonth
  })
  const currentMonthExpenses = expenseList.filter((item) => {
    const { year, month } = getYearAndMonth(item.date)
    return year === currentYear && month === currentMonth
  })

  const totalIncome = currentMonthIncome.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpenses = currentMonthExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const profit = totalIncome - totalExpenses

  // Annual Summary Calculations for the Chart (Jan to Dec)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthlyData = monthNames.map((name, index) => ({
    month: name,
    ingresos: 0,
    gastos: 0,
  }))

  incomeList.forEach((item) => {
    const { year, month } = getYearAndMonth(item.date)
    if (year === currentYear && month >= 0 && month < 12) {
      monthlyData[month].ingresos += Number(item.amount)
    }
  })

  expenseList.forEach((item) => {
    const { year, month } = getYearAndMonth(item.date)
    if (year === currentYear && month >= 0 && month < 12) {
      monthlyData[month].gastos += Number(item.amount)
    }
  })

  const activeMonthlyData = monthlyData.slice(0, Math.max(currentMonth + 1, 6))

  const totalAnnualIncome = monthlyData.reduce((s, m) => s + m.ingresos, 0)
  const totalAnnualExpenses = monthlyData.reduce((s, m) => s + m.gastos, 0)
  const annualProfit = totalAnnualIncome - totalAnnualExpenses

  // Open modals
  const handleOpenAddIncome = () => {
    setEditingIncome(null)
    setIncDesc('')
    setIncAmount('')
    setIncMethod('cash')
    setIncomeOpen(true)
  }

  const handleOpenEditIncome = (income: any) => {
    setEditingIncome(income)
    setIncDesc(income.description)
    setIncAmount(String(income.amount))
    setIncMethod(income.payment_method)
    setIncomeOpen(true)
  }

  const handleOpenAddExpense = () => {
    setEditingExpense(null)
    setExpDesc('')
    setExpAmount('')
    setExpCategory('Suministros')
    setExpenseOpen(true)
  }

  const handleOpenEditExpense = (expense: any) => {
    setEditingExpense(expense)
    setExpDesc(expense.description)
    setExpAmount(String(expense.amount))
    setExpCategory(expense.category)
    setExpenseOpen(true)
  }

  // Save Handlers
  const handleSaveIncome = async () => {
    if (!incDesc || !incAmount) {
      alert('La descripción y el importe son obligatorios.')
      return
    }

    try {
      const payload = {
        description: incDesc,
        amount: Number(incAmount) || 0,
        payment_method: incMethod,
        date: editingIncome ? editingIncome.date : new Date().toISOString().split('T')[0],
      }

      if (editingIncome) {
        const { data, error } = await supabase
          .from('income')
          .update(payload)
          .eq('id', editingIncome.id)
          .select()

        if (error) throw error
        if (data && data[0]) {
          setIncomeList((prev) => prev.map((i) => (i.id === editingIncome.id ? data[0] : i)))
        }
      } else {
        const { data, error } = await supabase
          .from('income')
          .insert([payload])
          .select()

        if (error) throw error
        if (data && data[0]) {
          setIncomeList((prev) => [data[0], ...prev])
        }
      }
      setIncomeOpen(false)
    } catch (err) {
      console.error('Error saving income:', err)
      alert('Error al guardar el ingreso.')
    }
  }

  const handleSaveExpense = async () => {
    if (!expDesc || !expAmount) {
      alert('La descripción y el importe son obligatorios.')
      return
    }

    try {
      const payload = {
        description: expDesc,
        amount: Number(expAmount) || 0,
        category: expCategory,
        date: editingExpense ? editingExpense.date : new Date().toISOString().split('T')[0],
      }

      if (editingExpense) {
        const { data, error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', editingExpense.id)
          .select()

        if (error) throw error
        if (data && data[0]) {
          setExpenseList((prev) => prev.map((e) => (e.id === editingExpense.id ? data[0] : e)))
        }
      } else {
        const { data, error } = await supabase
          .from('expenses')
          .insert([payload])
          .select()

        if (error) throw error
        if (data && data[0]) {
          setExpenseList((prev) => [data[0], ...prev])
        }
      }
      setExpenseOpen(false)
    } catch (err) {
      console.error('Error saving expense:', err)
      alert('Error al guardar el gasto.')
    }
  }

  // Delete Handlers
  const handleDeleteIncome = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
      try {
        const { error } = await supabase
          .from('income')
          .delete()
          .eq('id', id)

        if (error) throw error
        setIncomeList((prev) => prev.filter((i) => i.id !== id))
      } catch (err) {
        console.error('Error deleting income:', err)
        alert('Error al eliminar el ingreso.')
      }
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)

        if (error) throw error
        setExpenseList((prev) => prev.filter((e) => e.id !== id))
      } catch (err) {
        console.error('Error deleting expense:', err)
        alert('Error al eliminar el gasto.')
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando contabilidad...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Contabilidad</h1>
          <p className="text-muted-foreground text-sm capitalize">
            {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl" onClick={handleOpenAddIncome}>
            <Plus className="h-4 w-4 mr-1" />
            Ingreso
          </Button>

          <Button size="sm" variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl" onClick={handleOpenAddExpense}>
            <Plus className="h-4 w-4 mr-1" />
            Gasto
          </Button>
        </div>
      </div>

      {/* Cards summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/20 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ingresos (mes)</span>
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="text-3xl font-bold text-emerald-700">{totalIncome.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/[0.02] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Gastos (mes)</span>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-3xl font-bold text-destructive">{totalExpenses.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-primary/[0.02] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Beneficio neto</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className={`text-3xl font-bold ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {profit.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Side-by-Side: Ingresos vs Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Card */}
        <Card className="border border-border/60 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2 text-emerald-700">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-700" />
              Ingresos recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y max-h-[350px] overflow-y-auto">
              {incomeList.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3.5 text-xs group hover:bg-muted/10 transition-colors">
                  <div className="text-muted-foreground w-20 shrink-0">{formatDbToUiDate(item.date)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.description}</p>
                  </div>
                  <Badge className={`text-[10px] py-0 px-1.5 font-normal shrink-0 ${methodColor[item.payment_method]}`} variant="outline">
                    {methodLabel[item.payment_method]}
                  </Badge>
                  <span className="font-semibold text-emerald-700 w-16 text-right shrink-0">+{Number(item.amount).toFixed(2)}€</span>
                  
                  {/* Actions hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => handleOpenEditIncome(item)}>
                      <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteIncome(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {incomeList.length === 0 && (
                <p className="text-muted-foreground text-xs py-8 text-center">No hay ingresos registrados.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="border border-border/60 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2 text-destructive">
              <TrendingDown className="h-4.5 w-4.5" />
              Gastos recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y max-h-[350px] overflow-y-auto">
              {expenseList.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3.5 text-xs group hover:bg-muted/10 transition-colors">
                  <div className="text-muted-foreground w-20 shrink-0">{formatDbToUiDate(item.date)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal border-muted-foreground/20 text-muted-foreground shrink-0">{item.category}</Badge>
                  <span className="font-semibold text-destructive w-16 text-right shrink-0">-{Number(item.amount).toFixed(2)}€</span>
                  
                  {/* Actions hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => handleOpenEditExpense(item)}>
                      <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteExpense(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {expenseList.length === 0 && (
                <p className="text-muted-foreground text-xs py-8 text-center">No hay gastos registrados.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Annual Summary Chart */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-semibold">Resumen anual: Ingresos vs Gastos ({currentYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activeMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
              <Tooltip formatter={(v) => [`${v}€`]} />
              <Legend content={(props) => {
                const { payload } = props
                if (!payload) return null
                const sortedPayload = [...payload].sort((a, b) => {
                  if (a.value === 'Ingresos') return -1
                  if (b.value === 'Ingresos') return 1
                  return 0
                })
                return (
                  <div className="flex justify-center gap-4 text-[11px] mt-2">
                    {sortedPayload.map((entry: any, index: number) => (
                      <div key={`item-${index}`} className="flex items-center gap-1.5">
                        <span 
                          className="w-3 h-1.5 rounded-sm shrink-0" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className="text-muted-foreground font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )
              }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Annual totals footer */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t text-center">
            <div>
              <p className="text-xl font-bold text-emerald-700">
                {totalAnnualIncome.toFixed(2)}€
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Total ingresos ({currentYear})</p>
            </div>
            <div>
              <p className="text-xl font-bold text-destructive">
                {totalAnnualExpenses.toFixed(2)}€
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Total gastos ({currentYear})</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">
                {annualProfit.toFixed(2)}€
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Beneficio neto ({currentYear})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Dialog (Add/Edit) */}
      <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingIncome ? 'Editar ingreso' : 'Registrar ingreso'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Descripción *</Label>
              <Input placeholder="Ej. Paseo de Koto" value={incDesc} onChange={(e) => setIncDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Importe (€) *</Label>
                <Input type="number" placeholder="0" value={incAmount} onChange={(e) => setIncAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Método</Label>
                <Select value={incMethod} onValueChange={(val) => setIncMethod(val || 'cash')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIncomeOpen(false)}>Cancelar</Button>
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={handleSaveIncome}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog (Add/Edit) */}
      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Editar gasto' : 'Registrar gasto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Descripción *</Label>
              <Input placeholder="Ej. Comida para perros" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Importe (€) *</Label>
                <Input type="number" placeholder="0.00" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={expCategory} onValueChange={(val) => setExpCategory(val || 'Suministros')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Suministros">Suministros</SelectItem>
                    <SelectItem value="Equipo">Equipo</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Formación">Formación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setExpenseOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleSaveExpense}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
