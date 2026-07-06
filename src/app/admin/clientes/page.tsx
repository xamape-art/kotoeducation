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
import { Search, Plus, Phone, Mail, Dog, ChevronRight, Users, Trash2 } from 'lucide-react'
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
  const [clients, setClients] = useState(mockClients)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  // Form states for new client
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newNotes, setNewNotes] = useState('')

  const handleCreateClient = () => {
    if (!newName) {
      alert('El nombre es obligatorio.')
      return
    }

    const newClientObj = {
      id: String(clients.length + 1),
      name: newName,
      email: newEmail,
      phone: newPhone,
      address: newAddress,
      notes: newNotes,
      pets: [],
      lastAppointment: 'Sin citas',
      totalAppointments: 0,
    }

    setClients((prev) => [newClientObj, ...prev])
    setOpen(false)

    // Reset fields
    setNewName('')
    setNewPhone('')
    setNewEmail('')
    setNewAddress('')
    setNewNotes('')
  }

  const handleDeleteClient = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setClients((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.pets.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">{clients.length} clientes registrados</p>
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
                  <Input placeholder="Nombre completo" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input placeholder="+34 600 000 000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="email@ejemplo.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input placeholder="Calle, barrio..." value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Notas</Label>
                <Textarea placeholder="Información relevante sobre el cliente..." rows={3} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateClient}>Guardar cliente</Button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-all flex flex-col justify-between border border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {client.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-semibold font-display truncate max-w-[150px]">{client.name}</CardTitle>
                  <span className="text-[10px] text-muted-foreground">{client.totalAppointments} citas</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg" onClick={(e) => handleDeleteClient(client.id, e)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <Link href={`/admin/clientes/${client.id}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-border/40 pt-3 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {client.pets.map((pet) => (
                    <Badge key={pet.name} variant="outline" className="text-[10px] py-0.5 px-1.5 gap-1 border-primary/20 bg-primary/[0.02] text-primary">
                      <Dog className="h-2.5 w-2.5" />
                      {pet.name}
                    </Badge>
                  ))}
                  {client.pets.length === 0 && (
                    <span className="text-[11px] text-muted-foreground italic">Sin mascotas</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between">
                  <span>Última cita:</span>
                  <span className="font-medium text-foreground">{client.lastAppointment}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No se encontraron clientes</p>
          </div>
        )}
      </div>
    </div>
  )
}
