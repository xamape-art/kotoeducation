'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Addresses (clients.address, invoices.client_address) are stored as one text:
// "Calle...\nCP Población (Provincia)", the same format shop orders use for their invoices
export type AddressParts = { street: string; postalCode: string; city: string; province: string }

export const emptyAddress: AddressParts = { street: '', postalCode: '', city: '', province: '' }

export function parseAddress(value: string | null | undefined): AddressParts {
  const parts: AddressParts = { ...emptyAddress }
  if (!value) return parts
  const [first, ...rest] = value.split('\n')
  parts.street = first.trim()
  const second = rest.join(' ').trim()
  if (second) {
    const m = second.match(/^(\d{5})?\s*(.*?)\s*(?:\(([^)]*)\))?$/)
    parts.postalCode = m?.[1] || ''
    parts.city = m?.[2] || ''
    parts.province = m?.[3] || ''
  }
  return parts
}

export function formatAddress({ street, postalCode, city, province }: AddressParts): string | null {
  const place = [postalCode.trim(), city.trim()].filter(Boolean).join(' ')
  const second = [place, province.trim() && `(${province.trim()})`].filter(Boolean).join(' ')
  return [street.trim(), second].filter(Boolean).join('\n') || null
}

export default function AddressFields({
  value,
  onChange,
}: {
  value: AddressParts
  onChange: (value: AddressParts) => void
}) {
  const update = (patch: Partial<AddressParts>) => onChange({ ...value, ...patch })

  return (
    <>
      <div className="space-y-1.5">
        <Label>Dirección</Label>
        <Input
          placeholder="Calle, número, piso y puerta"
          value={value.street}
          onChange={(e) => update({ street: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-[110px_1fr] gap-3">
        <div className="space-y-1.5">
          <Label>Código postal</Label>
          <Input
            inputMode="numeric"
            maxLength={5}
            placeholder="08224"
            value={value.postalCode}
            onChange={(e) => update({ postalCode: e.target.value.replace(/\D/g, '') })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Población</Label>
          <Input placeholder="Terrassa" value={value.city} onChange={(e) => update({ city: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Provincia</Label>
        <Input placeholder="Barcelona" value={value.province} onChange={(e) => update({ province: e.target.value })} />
      </div>
    </>
  )
}
