import type { InvoiceItem } from '@/types'

export const ISSUER = {
  name: 'Carla Martínez Capellà',
  tradeName: 'Koto Education',
  nif: '46381407K',
  addressLines: ['C/ Arquímedes 11, 3º 2ª', '08224 Terrassa (Barcelona)'],
  phone: '+34 638 237 198',
  email: 'kotoeducation@gmail.com',
}

export const DEFAULT_VAT_RATE = 21

const round2 = (n: number) => Math.round(n * 100) / 100

export function lineTotal(item: InvoiceItem) {
  return round2(Number(item.quantity) * Number(item.unit_price))
}

export function calcTotals(items: InvoiceItem[], vatRate: number) {
  const subtotal = round2(items.reduce((s, i) => s + lineTotal(i), 0))
  const vatAmount = round2((subtotal * vatRate) / 100)
  return { subtotal, vatAmount, total: round2(subtotal + vatAmount) }
}

// For prices with IVA included: the total is what the client pays, so derive base and IVA from it
export function calcTotalsFromGross(grossTotal: number, vatRate: number) {
  const total = round2(grossTotal)
  const subtotal = round2(total / (1 + vatRate / 100))
  return { subtotal, vatAmount: round2(total - subtotal), total }
}

export function formatInvoiceNumber(year: number, seq: number) {
  return `${year}-${String(seq).padStart(3, '0')}`
}

export function formatEuro(n: number) {
  return Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

export function formatDate(dbDate: string) {
  const [y, m, d] = dbDate.split('-')
  return `${d}/${m}/${y}`
}
