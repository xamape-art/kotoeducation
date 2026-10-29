'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { alertDbError } from '@/lib/db-error'
import { CATEGORY_LABELS, categoryLabel, formatPrice } from '@/lib/service-categories'
import type { Service } from '@/types'

const defaultCategoryColor = 'bg-gray-50 border-gray-200 text-gray-700'

const categoryColors: Record<string, string> = {
  walk: 'bg-green-50 border-green-200 text-green-700',
  visit: 'bg-blue-50 border-blue-200 text-blue-700',
  care: 'bg-orange-50 border-orange-200 text-orange-700',
  training: 'bg-purple-50 border-purple-200 text-purple-700',
}

const NEW_CATEGORY = '__new__'

export default function TarifasPage() {
  const supabase = createClient()

  const [rates, setRates] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Add / edit dialog (editing = null means a new rate)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [category, setCategory] = useState('walk')
  const [newCategory, setNewCategory] = useState('')
  const [isExtra, setIsExtra] = useState(false)
  const [saving, setSaving] = useState(false)

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchRates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('category')
      .order('name')

    if (error) {
      alertDbError(error, 'cargar las tarifas')
    } else {
      setRates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRates()
  }, [])

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const openForm = (rate: Service | null) => {
    setEditing(rate)
    setName(rate?.name || '')
    setDesc(rate?.description || '')
    setPrice(rate ? String(rate.price) : '')
    setDuration(rate?.duration_minutes ? String(rate.duration_minutes) : '')
    setCategory(rate?.category || 'walk')
    setNewCategory('')
    setIsExtra(!!rate?.is_extra)
    setFormOpen(true)
  }

  // ─── Create / update ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim() || price === '') {
      alert('El nombre y el precio son obligatorios.')
      return
    }
    if (Number(price) < 0) {
      alert('El precio no puede ser negativo.')
      return
    }

    const finalCategory = category === NEW_CATEGORY ? newCategory.trim() : category
    if (!finalCategory) {
      alert('Escribe el nombre de la nueva categoría.')
      return
    }

    const payload = {
      name: name.trim(),
      description: desc.trim() || null,
      price: Number(price) || 0,
      duration_minutes: Number(duration) > 0 ? Math.round(Number(duration)) : null,
      category: finalCategory,
      is_extra: isExtra,
    }

    setSaving(true)
    try {
      if (editing) {
        const { data, error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', editing.id)
          .select()
          .single()
        if (error) throw error
        setRates((prev) => prev.map((r) => (r.id === editing.id ? data : r)))
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert([{ ...payload, active: true }])
          .select()
          .single()
        if (error) throw error
        setRates((prev) => [...prev, data])
      }
      setFormOpen(false)
    } catch (err) {
      alertDbError(err, 'guardar la tarifa')
    } finally {
      setSaving(false)
    }
  }

  // ─── Toggle active ────────────────────────────────────────────────────────────
  const toggleActive = async (rate: Service) => {
    const { data, error } = await supabase
      .from('services')
      .update({ active: !rate.active })
      .eq('id', rate.id)
      .select()
      .single()

    if (error) {
      alertDbError(error, 'cambiar el estado de la tarifa')
      return
    }
    setRates((prev) => prev.map((r) => (r.id === rate.id ? data : r)))
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteRate = async (rate: Service) => {
    if (!confirm(`¿Eliminar la tarifa "${rate.name}"?`)) return

    const { error } = await supabase.from('services').delete().eq('id', rate.id)
    if (error) {
      if (error.code === '23503') {
        alert(
          'Esta tarifa tiene citas en el calendario, así que no se puede eliminar. ' +
            'Desactívala con el interruptor para que deje de salir en la web.'
        )
      } else {
        alertDbError(error, 'eliminar')
      }
      return
    }
    setRates((prev) => prev.filter((r) => r.id !== rate.id))
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  const categories = [...new Set(rates.map((r) => r.category))]
  const categoryOptions = [...new Set([...Object.keys(CATEGORY_LABELS), ...categories])]
  const categoryItems = {
    ...Object.fromEntries(categoryOptions.map((c) => [c, categoryLabel(c)])),
    [NEW_CATEGORY]: '+ Nueva categoría...',
  }

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
            {rates.filter((r) => r.active).length} servicios activos · los activos se muestran en la web
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => openForm(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarifa
        </Button>
      </div>

      {/* Categories sections */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {categoryLabel(cat)}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rates
                .filter((r) => r.category === cat)
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
                              categoryColors[rate.category] ?? defaultCategoryColor
                            )}
                            variant="outline"
                          >
                            {categoryLabel(rate.category)}
                          </Badge>
                          {rate.is_extra && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-normal">
                              Extra
                            </Badge>
                          )}
                          {rate.duration_minutes && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-normal">
                              {rate.duration_minutes} min
                            </Badge>
                          )}
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
                          {rate.is_extra ? '+' : ''}
                          {formatPrice(rate.price)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title="Editar"
                            onClick={() => openForm(rate)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title={rate.active ? 'Desactivar' : 'Activar'}
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
                            title="Eliminar"
                            onClick={() => handleDeleteRate(rate)}
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

      {/* Add / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar tarifa' : 'Nueva tarifa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                placeholder="Ej: Paseo 30 min"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción del servicio..."
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  min="0"
                  step="5"
                  placeholder="Opcional"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                items={categoryItems}
                value={category}
                onValueChange={(val) => setCategory(val || 'walk')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryItems).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {category === NEW_CATEGORY && (
              <div className="space-y-1.5">
                <Label>Nombre de la categoría *</Label>
                <Input
                  placeholder="Ej: Peluquería"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
            )}
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 mt-0.5 accent-primary"
                checked={isExtra}
                onChange={(e) => setIsExtra(e.target.checked)}
              />
              <span>
                Es un extra o suplemento
                <span className="block text-xs text-muted-foreground">
                  En la web sale como &quot;+{price || '0'}€&quot; y no cuenta para el precio &quot;desde&quot;.
                </span>
              </span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
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
  )
}
