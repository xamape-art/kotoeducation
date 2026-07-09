'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Pencil, Tag, ToggleLeft, ToggleRight, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const categoryColors: Record<string, string> = {
  Paseos: 'bg-green-50 border-green-200 text-green-700',
  Visitas: 'bg-blue-50 border-blue-200 text-blue-700',
  Cuidado: 'bg-orange-50 border-orange-200 text-orange-700',
  Educación: 'bg-purple-50 border-purple-200 text-purple-700',
  Extras: 'bg-gray-50 border-gray-200 text-gray-700',
}

const CATEGORIES = ['Paseos', 'Visitas', 'Cuidado', 'Educación', 'Extras']

export default function TarifasPage() {
  const supabase = createClient()

  const [rates, setRates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Add dialog
  const [openAdd, setOpenAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [addPrice, setAddPrice] = useState('')
  const [addCategory, setAddCategory] = useState('Paseos')
  const [addSaving, setAddSaving] = useState(false)

  // Edit dialog
  const [editRate, setEditRate] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchRates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rates')
      .select('*')
      .order('category')
      .order('name')

    if (error) {
      console.error('Error fetching rates:', error)
    } else {
      setRates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRates()
  }, [])

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const resetAddForm = () => {
    setAddName('')
    setAddDesc('')
    setAddPrice('')
    setAddCategory('Paseos')
  }

  const openEditDialog = (rate: any) => {
    setEditRate(rate)
    setEditName(rate.name)
    setEditDesc(rate.description || '')
    setEditPrice(String(rate.price))
  }

  // ─── Create ──────────────────────────────────────────────────────────────────
  const handleAddRate = async () => {
    if (!addName || !addPrice) {
      alert('El nombre y el precio son obligatorios.')
      return
    }

    setAddSaving(true)
    try {
      const { data, error } = await supabase
        .from('rates')
        .insert([
          {
            name: addName,
            description: addDesc || null,
            price: Number(addPrice) || 0,
            category: addCategory,
            active: true,
          },
        ])
        .select()

      if (error) throw error
      if (data && data[0]) setRates((prev) => [...prev, data[0]])
      setOpenAdd(false)
      resetAddForm()
    } catch (err) {
      console.error('Error creating rate:', err)
      alert('Error al guardar la tarifa.')
    } finally {
      setAddSaving(false)
    }
  }

  // ─── Update ──────────────────────────────────────────────────────────────────
  const handleUpdateRate = async () => {
    if (!editName || !editPrice) {
      alert('El nombre y el precio son obligatorios.')
      return
    }

    setEditSaving(true)
    try {
      const { data, error } = await supabase
        .from('rates')
        .update({
          name: editName,
          description: editDesc || null,
          price: Number(editPrice) || 0,
        })
        .eq('id', editRate.id)
        .select()

      if (error) throw error
      if (data && data[0]) {
        setRates((prev) => prev.map((r) => (r.id === editRate.id ? data[0] : r)))
      }
      setEditRate(null)
    } catch (err) {
      console.error('Error updating rate:', err)
      alert('Error al actualizar la tarifa.')
    } finally {
      setEditSaving(false)
    }
  }

  // ─── Toggle active ────────────────────────────────────────────────────────────
  const toggleActive = async (rate: any) => {
    try {
      const { data, error } = await supabase
        .from('rates')
        .update({ active: !rate.active })
        .eq('id', rate.id)
        .select()

      if (error) throw error
      if (data && data[0]) {
        setRates((prev) => prev.map((r) => (r.id === rate.id ? data[0] : r)))
      }
    } catch (err) {
      console.error('Error toggling rate:', err)
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteRate = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarifa?')) return

    try {
      const { error } = await supabase.from('rates').delete().eq('id', id)
      if (error) throw error
      setRates((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error('Error deleting rate:', err)
      alert('Error al eliminar la tarifa.')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  const categories = [...new Set(rates.map((r) => r.category))]

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando tarifas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Tarifas</h1>
          <p className="text-muted-foreground text-sm">
            {rates.filter((r) => r.active).length} servicios activos
          </p>
        </div>
        <Dialog
          open={openAdd}
          onOpenChange={(o) => {
            setOpenAdd(o)
            if (!o) resetAddForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Nueva tarifa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nueva tarifa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input
                  placeholder="Ej: Paseo 30 min"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Descripción del servicio..."
                  rows={2}
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Precio (€) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="10"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={addCategory}
                    onValueChange={(val) => setAddCategory(val || 'Paseos')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenAdd(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddRate} disabled={addSaving}>
                  {addSaving ? (
                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />Guardando...</>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories sections */}
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {category}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rates
                .filter((r) => r.category === category)
                .map((rate) => (
                  <Card
                    key={rate.id}
                    className={cn(
                      'flex flex-col justify-between border border-border/60 shadow-sm hover:shadow-md transition-all rounded-xl',
                      !rate.active ? 'opacity-60 bg-muted/20' : ''
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm leading-snug">
                          {rate.name}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          <Badge
                            className={cn(
                              'text-[9px] py-0 px-1.5 font-normal',
                              categoryColors[rate.category]
                            )}
                            variant="outline"
                          >
                            {rate.category}
                          </Badge>
                          {!rate.active && (
                            <Badge
                              variant="outline"
                              className="text-[9px] py-0 px-1.5 border-red-200 text-red-500 bg-red-50/10"
                            >
                              Inactivo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col justify-between flex-1 gap-3">
                      {rate.description ? (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {rate.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Sin descripción
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t">
                        <span className="text-base font-bold text-primary">
                          {rate.price > 0 ? `${rate.price}€` : '0€'}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => openEditDialog(rate)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => toggleActive(rate)}
                          >
                            {rate.active ? (
                              <ToggleRight className="h-4 w-4 text-primary" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRate(rate.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}

        {rates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay tarifas registradas.</p>
            <p className="text-sm mt-1">Crea tu primera tarifa con el botón superior.</p>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog
        open={!!editRate}
        onOpenChange={(o) => !o && setEditRate(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar tarifa</DialogTitle>
          </DialogHeader>
          {editRate && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Precio (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditRate(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateRate} disabled={editSaving}>
                  {editSaving ? (
                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />Guardando...</>
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
