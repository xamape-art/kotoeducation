'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Phone, Mail, Dog, ChevronRight, Users } from 'lucide-react'
import Link from 'next/link'

const mockClients = [
  {
    id: '1',
    name: 'Xavier M.',
    email: 'xavier@email.com',
    phone: '+34 611 222 333',
    pets: [{ name: 'Koto', breed: 'Galgo español' }],
    lastAppointment: '02 Jul 2025',
    totalAppointments: 24,
  },
  {
    id: '2',
    name: 'Laura G.',
    email: 'laura@email.com',
    phone: '+34 622 333 444',
    pets: [{ name: 'Max', breed: 'Golden Retriever' }],
    lastAppointment: '05 Jul 2025',
    totalAppointments: 18,
  },
  {
    id: '3',
    name: 'Marc T.',
    email: 'marc@email.com',
    phone: '+34 633 444 555',
    pets: [{ name: 'Luna', breed: 'Galgo' }],
    lastAppointment: '04 Jul 2025',
    totalAppointments: 31,
  },
  {
    id: '4',
    name: 'Ana R.',
    email: 'ana@email.com',
    phone: '+34 644 555 666',
    pets: [{ name: 'Mochi', breed: 'Gato Siamés' }],
    lastAppointment: '01 Jul 2025',
    totalAppointments: 8,
  },
  {
    id: '5',
    name: 'Pedro L.',
    email: 'pedro@email.com',
    phone: '+34 655 666 777',
    pets: [{ name: 'Rocky', breed: 'Labrador' }, { name: 'Nala', breed: 'Mestiza' }],
    lastAppointment: '06 Jul 2025',
    totalAppointments: 12,
  },
]

export default function ClientesPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = mockClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.pets.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">{mockClients.length} clientes registrados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre *</Label>
                  <Input placeholder="Nombre completo" />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input placeholder="+34 600 000 000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="email@ejemplo.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input placeholder="Calle, barrio..." />
              </div>
              <div className="space-y-1.5">
                <Label>Notas</Label>
                <Textarea placeholder="Información relevante sobre el cliente..." rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={() => setOpen(false)}>Guardar cliente</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre, email o mascota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Client list */}
      <div className="space-y-3">
        {filtered.map((client) => (
          <Card key={client.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {client.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{client.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {client.totalAppointments} citas
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1">
                  <div className="flex gap-1 flex-wrap justify-end">
                    {client.pets.map((pet) => (
                      <Badge key={pet.name} variant="outline" className="text-xs gap-1">
                        <Dog className="h-3 w-3" />
                        {pet.name}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Última: {client.lastAppointment}</span>
                </div>

                <Button asChild variant="ghost" size="icon" className="shrink-0">
                  <Link href={`/admin/clientes/${client.id}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No se encontraron clientes</p>
          </div>
        )}
      </div>
    </div>
  )
}
