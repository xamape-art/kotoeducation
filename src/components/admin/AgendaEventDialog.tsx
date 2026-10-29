'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { alertDbError } from '@/lib/db-error'
import { EVENT_TYPE_LABELS } from '@/lib/agenda'
import type { AgendaEvent } from '@/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // null = new event
  event: AgendaEvent | null
  defaultDate: string
  onSaved: (event: AgendaEvent) => void
  onDeleted: (id: string) => void
}

export default function AgendaEventDialog({ open, onOpenChange, ...formProps }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{formProps.event ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
        </DialogHeader>
        {/* The content unmounts when closed, so the form starts fresh on every open */}
        <EventForm {...formProps} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EventForm({
  event,
  defaultDate,
  onSaved,
  onDeleted,
  onClose,
}: Omit<Props, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const supabase = createClient()

  const [title, setTitle] = useState(event?.title || '')
  const [type, setType] = useState<string>(event?.type || 'reminder')
  const [date, setDate] = useState(event?.date || defaultDate)
  const [time, setTime] = useState(event?.time?.slice(0, 5) || '')
  const [notes, setNotes] = useState(event?.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() || !date) {
      alert('El título y la fecha son obligatorios.')
      return
    }

    const payload = {
      title: title.trim(),
      type,
      date,
      time: time || null,
      notes: notes.trim() || null,
    }

    setSaving(true)
    try {
      const query = event
        ? supabase.from('agenda_events').update(payload).eq('id', event.id)
        : supabase.from('agenda_events').insert([payload])
      const { data, error } = await query.select().single()
      if (error) throw error
      onSaved(data)
      onClose()
    } catch (err) {
      alertDbError(err, 'guardar el evento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !confirm(`¿Eliminar "${event.title}"?`)) return
    const { error } = await supabase.from('agenda_events').delete().eq('id', event.id)
    if (error) {
      alertDbError(error, 'eliminar')
      return
    }
    onDeleted(event.id)
    onClose()
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Título *</Label>
        <Input
          placeholder="Ej. Reunión con la gestoría"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select items={EVENT_TYPE_LABELS} value={type} onValueChange={(val) => setType(val || 'reminder')}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Fecha *</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Hora</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-2">Sin hora = todo el día.</p>
      <div className="space-y-1.5">
        <Label>Notas</Label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex items-center justify-between gap-2 pt-2">
        {event ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Eliminar
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}
