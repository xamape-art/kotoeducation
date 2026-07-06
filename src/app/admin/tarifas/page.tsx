'use client'

import { useState } from 'react'
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
import { Plus, Pencil, Tag, ToggleLeft, ToggleRight } from 'lucide-react'

const mockRates = [
  { id: '1', name: 'Paseo 30 min', description: 'Paseo individual o en grupo (máx. 3) por el barrio', price: 10, category: 'Paseos', active: true },
  { id: '2', name: 'Paseo 60 min', description: 'Paseo extendido de una hora', price: 13, category: 'Paseos', active: true },
  { id: '3', name: 'Paseo individual', description: 'Paseo exclusivo para tu mascota', price: 15, category: 'Paseos', active: true },
  { id: '4', name: 'Visita a domicilio (30 min)', description: 'Visita, alimentación y compañía en tu hogar', price: 10, category: 'Visitas', active: true },
  { id: '5', name: 'Visita a domicilio (1 hora)', description: 'Visita extendida de una hora', price: 15, category: 'Visitas', active: true },
  { id: '6', name: 'Cuidado a domicilio (noche)', description: 'Pernoctación en tu hogar con paseos incluidos', price: 35, category: 'Cuidado', active: true },
  { id: '7', name: 'Cuidado a domicilio (día completo)', description: 'Jornada completa sin pernoctación', price: 20, category: 'Cuidado', active: true },
  { id: '8', name: 'Mascota adicional', description: 'Por cada mascota adicional en el mismo servicio', price: 10, category: 'Extras', active: true },
  { id: '9', name: 'Educación canina (sesión)', description: 'Sesión individual de adiestramiento — Próximamente', price: 0, category: 'Educación', active: false },
]

const categoryColors: Record<string, string> = {
  Paseos: 'bg-green-100 text-green-700',
  Visitas: 'bg-blue-100 text-blue-700',
  Cuidado: 'bg-orange-100 text-orange-700',
  Educación: 'bg-purple-100 text-purple-700',
  Extras: 'bg-gray-100 text-gray-700',
}

export default function TarifasPage() {
  const [rates, setRates] = useState(mockRates)
  const [editRate, setEditRate] = useState<(typeof mockRates)[0] | null>(null)
  const [openAdd, setOpenAdd] = useState(false)

  const toggleActive = (id: string) => {
    setRates((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  const categories = [...new Set(rates.map((r) => r.category))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Tarifas</h1>
          <p className="text-muted-foreground text-sm">{rates.filter(r => r.active).length} servicios activos</p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva tarifa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Nueva tarifa</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input placeholder="Ej: Paseo 30 min" />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea placeholder="Descripción del servicio..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Precio (€) *</Label>
                  <Input type="number" min="0" step="0.5" placeholder="10" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paseos">Paseos</SelectItem>
                      <SelectItem value="Visitas">Visitas</SelectItem>
                      <SelectItem value="Cuidado">Cuidado</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Extras">Extras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancelar</Button>
                <Button onClick={() => setOpenAdd(false)}>Guardar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-primary" />
            <h2 className="font-display text-xl font-semibold tracking-tight">{category}</h2>
          </div>
          <div className="space-y-2">
            {rates.filter((r) => r.category === category).map((rate) => (
              <Card key={rate.id} className={!rate.active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-medium">{rate.name}</p>
                        <Badge className={`text-xs ${categoryColors[rate.category]}`} variant="outline">
                          {rate.category}
                        </Badge>
                        {!rate.active && (
                          <Badge variant="outline" className="text-xs border-red-200 text-red-500">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      {rate.description && (
                        <p className="text-xs text-muted-foreground">{rate.description}</p>
                      )}
                    </div>

                    <div className="text-xl font-bold text-primary w-16 text-right shrink-0">
                      {rate.price > 0 ? `${rate.price}€` : '—'}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditRate(rate)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleActive(rate.id)}
                      >
                        {rate.active
                          ? <ToggleRight className="h-4 w-4 text-primary" />
                          : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Edit dialog */}
      <Dialog open={!!editRate} onOpenChange={(o) => !o && setEditRate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Editar tarifa</DialogTitle></DialogHeader>
          {editRate && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input defaultValue={editRate.name} />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea defaultValue={editRate.description} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Precio (€)</Label>
                <Input type="number" defaultValue={editRate.price} min="0" step="0.5" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditRate(null)}>Cancelar</Button>
                <Button onClick={() => setEditRate(null)}>Guardar cambios</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
