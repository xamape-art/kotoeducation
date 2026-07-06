'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email no válido'),
  phone: z.string().optional(),
  petName: z.string().min(1, 'El nombre de la mascota es obligatorio'),
  petBreed: z.string().optional(),
  petWeight: z.string().optional(),
  petAge: z.string().optional(),
  serviceType: z.string().min(1, 'Selecciona un servicio'),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('¡Mensaje enviado! Te contestaré lo antes posible 🐾')
        reset()
      } else {
        toast.error('Error al enviar. Inténtalo de nuevo o escríbeme por WhatsApp.')
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos personales */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Tus datos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" placeholder="Tu nombre" {...register('name')} />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" placeholder="+34 600 000 000" {...register('phone')} />
          </div>
        </div>
      </div>

      {/* Datos de la mascota */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Tu mascota</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="petName">Nombre *</Label>
            <Input id="petName" placeholder="Nombre de tu mascota" {...register('petName')} />
            {errors.petName && (
              <p className="text-destructive text-xs">{errors.petName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="petBreed">Raza</Label>
            <Input id="petBreed" placeholder="Ej: Labrador, Galgo..." {...register('petBreed')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="petWeight">Peso (kg)</Label>
            <Input id="petWeight" type="number" min="0" step="0.5" placeholder="Ej: 18" {...register('petWeight')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="petAge">Edad (años)</Label>
            <Input id="petAge" type="number" min="0" step="0.5" placeholder="Ej: 4" {...register('petAge')} />
          </div>
        </div>
      </div>

      {/* Servicio y fecha */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Servicio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Servicio solicitado *</Label>
            <Select onValueChange={(v) => setValue('serviceType', v as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paseo">Paseo de perros (10€)</SelectItem>
                <SelectItem value="visita">Visita a domicilio (10€)</SelectItem>
                <SelectItem value="cuidado">Cuidado a domicilio (35€/noche)</SelectItem>
                <SelectItem value="educacion">Educación canina</SelectItem>
                <SelectItem value="otro">Otro / Consulta</SelectItem>
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-destructive text-xs">{errors.serviceType.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preferredDate">Fecha preferida</Label>
            <Input id="preferredDate" type="date" {...register('preferredDate')} />
          </div>
        </div>
      </div>

      {/* Mensaje */}
      <div className="space-y-1.5">
        <Label htmlFor="message">Mensaje (opcional)</Label>
        <Textarea
          id="message"
          placeholder="Cuéntame más sobre tu mascota, sus necesidades especiales, horarios..."
          rows={4}
          {...register('message')}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Enviar solicitud
          </>
        )}
      </Button>
    </form>
  )
}
